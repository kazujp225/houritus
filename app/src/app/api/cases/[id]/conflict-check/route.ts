/**
 * ZettAI 破産手続支援SaaS - 利益相反チェックAPI
 *
 * 利益相反チェックは弁護士のみが実行可能
 * 受任可否の最終判断は弁護士が行う
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession, getIpAddress, getUserAgent } from '@/lib/auth/session';
import { requireLawyer, canPerformConflictCheck } from '@/lib/auth/permissions';
import { logAction, AuditAction, AuditResult, logPermissionDenied } from '@/lib/audit/logger';
import { z } from 'zod';

// 利益相反チェック結果スキーマ
const conflictCheckSchema = z.object({
  decision: z.enum(['APPROVED', 'REJECTED']),
  reason: z.string().min(1, '理由は必須です'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;
  const ipAddress = getIpAddress(req);
  const userAgent = getUserAgent(req);

  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 弁護士ロールチェック
    try {
      requireLawyer(user);
    } catch {
      await logPermissionDenied(
        user,
        'conflict:check',
        'case',
        ipAddress,
        userAgent,
        caseId,
        caseId
      );
      return NextResponse.json(
        { error: '利益相反チェックは弁護士のみが実行できます' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = conflictCheckSchema.parse(body);

    // 案件を取得
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        clientProfile: {
          select: {
            fullName: true,
          },
        },
        creditors: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: '案件が見つかりません' },
        { status: 404 }
      );
    }

    // テナントチェック
    if (caseData.tenantId !== user.tenantId) {
      await logPermissionDenied(
        user,
        'conflict:check',
        'case',
        ipAddress,
        userAgent,
        caseId,
        caseId
      );
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // 既にチェック済みの場合
    if (caseData.conflictCheckStatus !== 'PENDING' && caseData.conflictCheckStatus !== 'CHECKING') {
      return NextResponse.json(
        { error: '利益相反チェックは既に完了しています' },
        { status: 400 }
      );
    }

    // 案件を更新
    const updatedCase = await prisma.case.update({
      where: { id: caseId },
      data: {
        conflictCheckStatus: validatedData.decision,
        conflictCheckAt: new Date(),
        conflictCheckById: user.id,
        conflictCheckReason: validatedData.reason,
        // 受任可の場合はステータスを更新
        ...(validatedData.decision === 'APPROVED' && {
          status: 'CONSULTATION',
        }),
        // 受任不可の場合はステータスをREJECTEDに
        ...(validatedData.decision === 'REJECTED' && {
          status: 'REJECTED',
        }),
      },
    });

    // 監査ログ
    await logAction(user, AuditAction.CASE_CONFLICT_CHECK, 'case', AuditResult.SUCCESS, {
      resourceId: caseId,
      caseId,
      ipAddress,
      userAgent,
      details: {
        decision: validatedData.decision,
        reason: validatedData.reason,
        clientName: caseData.clientProfile?.fullName,
        creditorNames: (caseData.creditors || []).map((c: { name: string }) => c.name),
      },
    });

    return NextResponse.json({
      success: true,
      case: {
        id: updatedCase.id,
        conflictCheckStatus: updatedCase.conflictCheckStatus,
        conflictCheckAt: updatedCase.conflictCheckAt,
        status: updatedCase.status,
      },
      message: validatedData.decision === 'APPROVED'
        ? '受任可と判断しました'
        : '受任不可と判断しました',
    });

  } catch (error) {
    console.error('Conflict check error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'リクエストデータが不正です', details: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    );
  }
}

/**
 * 利益相反の自動照合（既存案件との照合）
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: caseId } = await params;

  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 弁護士ロールチェック
    try {
      requireLawyer(user);
    } catch {
      return NextResponse.json(
        { error: '利益相反チェックは弁護士のみが実行できます' },
        { status: 403 }
      );
    }

    // 案件を取得
    const caseData = await prisma.case.findUnique({
      where: { id: caseId },
      include: {
        clientProfile: {
          select: {
            fullName: true,
            fullNameKana: true,
          },
        },
        creditors: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!caseData) {
      return NextResponse.json(
        { error: '案件が見つかりません' },
        { status: 404 }
      );
    }

    // テナントチェック
    if (caseData.tenantId !== user.tenantId) {
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    const clientName = caseData.clientProfile?.fullName || '';
    const creditorNames = (caseData.creditors || []).map((c: { name: string }) => c.name);

    // 既存案件との照合
    const potentialConflicts: Array<{
      type: 'client_duplicate' | 'creditor_match' | 'similar_name';
      caseId: string;
      caseNumber: string;
      matchedName: string;
      details: string;
    }> = [];

    // 同名のクライアントがいるか
    if (clientName) {
      const duplicateClients = await prisma.case.findMany({
        where: {
          tenantId: user.tenantId,
          id: { not: caseId },
          clientProfile: {
            fullName: clientName,
          },
        },
        select: {
          id: true,
          caseNumber: true,
          clientProfile: {
            select: {
              fullName: true,
            },
          },
        },
      });

      for (const c of duplicateClients) {
        potentialConflicts.push({
          type: 'client_duplicate',
          caseId: c.id,
          caseNumber: c.caseNumber,
          matchedName: c.clientProfile?.fullName || '',
          details: '同名のクライアントが既存案件に存在します',
        });
      }
    }

    // 債権者が他案件の相手方として登録されているか
    for (const creditorName of creditorNames) {
      const matchingCases = await prisma.case.findMany({
        where: {
          tenantId: user.tenantId,
          id: { not: caseId },
          creditors: {
            some: {
              name: creditorName,
            },
          },
        },
        select: {
          id: true,
          caseNumber: true,
        },
        take: 5,
      });

      for (const c of matchingCases) {
        potentialConflicts.push({
          type: 'creditor_match',
          caseId: c.id,
          caseNumber: c.caseNumber,
          matchedName: creditorName,
          details: `同じ債権者「${creditorName}」が他案件に存在します`,
        });
      }
    }

    return NextResponse.json({
      caseId,
      clientName,
      creditorNames,
      autoCheckResults: {
        hasConflicts: potentialConflicts.length > 0,
        potentialConflicts,
      },
      message: potentialConflicts.length > 0
        ? '要確認項目があります。弁護士による判断が必要です。'
        : '自動照合では利益相反は検出されませんでした。',
    });

  } catch (error) {
    console.error('Conflict check auto-scan error:', error);
    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    );
  }
}
