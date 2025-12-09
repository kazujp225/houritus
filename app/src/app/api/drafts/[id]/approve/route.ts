/**
 * ZettAI 破産手続支援SaaS - ドラフト承認API
 *
 * 重要：
 * - ドラフト承認は弁護士のみが実行可能
 * - 承認時間を記録してオート承認を検知
 * - AIドラフトは弁護士用レビュー画面のみに表示
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession, getIpAddress, getUserAgent } from '@/lib/auth/session';
import { requireLawyer, canApproveDraft } from '@/lib/auth/permissions';
import { logDraftApproval, AuditAction, AuditResult, logAction, logPermissionDenied } from '@/lib/audit/logger';
import { z } from 'zod';

// リクエストスキーマ
const approveSchema = z.object({
  action: z.enum(['approve', 'modify', 'reject']),
  finalContent: z.string().optional(),
  comment: z.string().optional(),
  reviewStartTime: z.number(), // レビュー開始時刻（ミリ秒）
  flagsAcknowledged: z.boolean().default(false),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: draftId } = await params;
  const ipAddress = getIpAddress(req);
  const userAgent = getUserAgent(req);

  try {
    // 認証チェック
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    // 弁護士ロールチェック（送信ゲート）
    try {
      requireLawyer(user);
    } catch {
      await logPermissionDenied(
        user,
        'draft:approve',
        'draft',
        ipAddress,
        userAgent,
        draftId
      );
      return NextResponse.json(
        { error: 'ドラフトの承認は弁護士のみが実行できます' },
        { status: 403 }
      );
    }

    // リクエストボディのパース
    const body = await req.json();
    const validatedData = approveSchema.parse(body);

    // ドラフトを取得
    const draft = await prisma.draft.findUnique({
      where: { id: draftId },
      include: {
        case: {
          select: {
            id: true,
            tenantId: true,
            clientId: true,
            lawyerId: true,
          },
        },
      },
    });

    if (!draft) {
      return NextResponse.json(
        { error: 'ドラフトが見つかりません' },
        { status: 404 }
      );
    }

    // テナントチェック
    if (!draft.case || draft.case.tenantId !== user.tenantId) {
      await logPermissionDenied(
        user,
        'draft:approve',
        'draft',
        ipAddress,
        userAgent,
        draftId,
        draft.case?.id
      );
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // 既に承認済みの場合
    if (draft.status !== 'PENDING') {
      return NextResponse.json(
        { error: 'このドラフトは既に処理されています' },
        { status: 400 }
      );
    }

    // レビュー時間を計算
    const reviewTimeSeconds = Math.floor((Date.now() - validatedData.reviewStartTime) / 1000);

    // フラグの数を取得
    const flags = draft.flags as { items?: unknown[] } | null;
    const flagsCount = flags?.items?.length || 0;

    // ステータスを決定
    let newStatus: 'APPROVED' | 'MODIFIED' | 'REJECTED';
    switch (validatedData.action) {
      case 'approve':
        newStatus = 'APPROVED';
        break;
      case 'modify':
        newStatus = 'MODIFIED';
        break;
      case 'reject':
        newStatus = 'REJECTED';
        break;
    }

    // ドラフトを更新
    const updatedDraft = await prisma.draft.update({
      where: { id: draftId },
      data: {
        status: newStatus,
        reviewedById: user.id,
        reviewedAt: new Date(),
        reviewComment: validatedData.comment,
        finalContent: validatedData.action === 'modify'
          ? validatedData.finalContent
          : validatedData.action === 'approve'
          ? draft.content
          : null,
      },
    });

    // 監査ログを記録
    await logDraftApproval(
      user,
      draftId,
      draft.case!.id,
      {
        draftType: draft.draftType,
        draftVersion: draft.version,
        reviewTimeSeconds,
        hasModification: validatedData.action === 'modify',
        modificationSummary: validatedData.action === 'modify' ? 'ドラフトを修正して承認' : undefined,
        flagsCount,
        flagsAcknowledged: validatedData.flagsAcknowledged,
      },
      ipAddress,
      userAgent
    );

    // レビュー時間が短すぎる場合の警告ログ
    if (reviewTimeSeconds < 5) {
      console.warn(
        `[AUDIT WARNING] Quick approval detected: user=${user.id}, draft=${draftId}, reviewTime=${reviewTimeSeconds}s`
      );
    }

    return NextResponse.json({
      success: true,
      draft: {
        id: updatedDraft.id,
        status: updatedDraft.status,
        reviewedAt: updatedDraft.reviewedAt,
      },
    });

  } catch (error) {
    console.error('Draft approval error:', error);

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
