/**
 * ZettAI 破産手続支援SaaS - 対外送信API（送信ゲート）
 *
 * 重要（絶対ルール）：
 * - 以下の送信は弁護士アカウントのみが実行可能
 *   - 依頼者への法的回答
 *   - 債権者への受任通知
 *   - 裁判所への申立書・補正書面
 * - 事務職員・ZettAIからは物理的に送信不可能な設計
 * - 確認チェックボックスの状態を記録
 * - 送信内容のスナップショットを保存
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession, getIpAddress, getUserAgent } from '@/lib/auth/session';
import { requireLawyer, requireSendPermission, canSend } from '@/lib/auth/permissions';
import { logSendExecution, logPermissionDenied } from '@/lib/audit/logger';
import { SendType, RecipientType } from '@/types/auth';
import { z } from 'zod';

// リクエストスキーマ
const sendSchema = z.object({
  caseId: z.string().uuid(),
  sendType: z.enum(['RETENTION_NOTICE', 'PETITION', 'SUPPLEMENTARY', 'COURT_RESPONSE', 'CLIENT_RESPONSE']),
  recipientType: z.enum(['CLIENT', 'CREDITOR', 'COURT']),
  recipientName: z.string().min(1),
  recipientAddress: z.string().optional(),
  draftId: z.string().uuid().optional(),
  content: z.string().min(1),
  sendMethod: z.enum(['EMAIL', 'POSTAL', 'CERTIFIED_MAIL', 'FAX', 'PORTAL']),
  confirmationChecked: z.boolean(),
});

export async function POST(req: NextRequest) {
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

    // リクエストボディのパース
    const body = await req.json();
    const validatedData = sendSchema.parse(body);

    // =========================================
    // 送信ゲート：弁護士ロールチェック（最重要）
    // =========================================
    try {
      requireLawyer(user);
      requireSendPermission(user, validatedData.sendType as SendType);
    } catch (error) {
      await logPermissionDenied(
        user,
        `send:${validatedData.sendType}`,
        'external_send',
        ipAddress,
        userAgent,
        undefined,
        validatedData.caseId
      );
      return NextResponse.json(
        {
          error: '送信権限がありません。対外送信は弁護士のみが実行できます。',
          code: 'SEND_GATE_BLOCKED',
        },
        { status: 403 }
      );
    }

    // 確認チェックボックスの検証
    if (!validatedData.confirmationChecked) {
      return NextResponse.json(
        {
          error: '送信前の確認チェックが必要です',
          code: 'CONFIRMATION_REQUIRED',
        },
        { status: 400 }
      );
    }

    // 案件を取得
    const caseData = await prisma.case.findUnique({
      where: { id: validatedData.caseId },
      select: {
        id: true,
        tenantId: true,
        status: true,
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
        `send:${validatedData.sendType}`,
        'external_send',
        ipAddress,
        userAgent,
        undefined,
        validatedData.caseId
      );
      return NextResponse.json(
        { error: 'アクセス権限がありません' },
        { status: 403 }
      );
    }

    // ドラフトIDが指定されている場合、ドラフトが承認済みか確認
    if (validatedData.draftId) {
      const draft = await prisma.draft.findUnique({
        where: { id: validatedData.draftId },
        select: { status: true },
      });

      if (!draft) {
        return NextResponse.json(
          { error: 'ドラフトが見つかりません' },
          { status: 404 }
        );
      }

      if (draft.status !== 'APPROVED' && draft.status !== 'MODIFIED') {
        return NextResponse.json(
          { error: '承認されていないドラフトは送信できません' },
          { status: 400 }
        );
      }
    }

    // 送信記録を作成
    const externalSend = await prisma.externalSend.create({
      data: {
        caseId: validatedData.caseId,
        sendType: validatedData.sendType,
        recipientType: validatedData.recipientType,
        recipientName: validatedData.recipientName,
        recipientAddress: validatedData.recipientAddress,
        draftId: validatedData.draftId,
        contentSnapshot: validatedData.content, // 送信内容のスナップショットを保存
        sendMethod: validatedData.sendMethod,
        sentById: user.id,
        sentAt: new Date(),
        confirmationChecked: validatedData.confirmationChecked,
      },
    });

    // 監査ログを記録
    await logSendExecution(
      user,
      externalSend.id,
      validatedData.caseId,
      {
        sendType: validatedData.sendType,
        recipientType: validatedData.recipientType,
        recipientName: validatedData.recipientName,
        sendMethod: validatedData.sendMethod,
        confirmationChecked: validatedData.confirmationChecked,
        draftId: validatedData.draftId,
      },
      ipAddress,
      userAgent
    );

    // 債権者への受任通知の場合、債権者テーブルを更新
    if (validatedData.sendType === 'RETENTION_NOTICE' && validatedData.recipientType === 'CREDITOR') {
      await prisma.creditor.updateMany({
        where: {
          caseId: validatedData.caseId,
          name: validatedData.recipientName,
        },
        data: {
          noticeSentAt: new Date(),
          noticeSentById: user.id,
        },
      });
    }

    return NextResponse.json({
      success: true,
      send: {
        id: externalSend.id,
        sentAt: externalSend.sentAt,
        sendType: externalSend.sendType,
        recipientName: externalSend.recipientName,
      },
      message: '送信が完了しました',
    });

  } catch (error) {
    console.error('Send execution error:', error);

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
 * 送信履歴を取得（弁護士・管理者用）
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json(
        { error: '認証が必要です' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const caseId = searchParams.get('caseId');

    const where = {
      case: {
        tenantId: user.tenantId,
      },
      ...(caseId && { caseId }),
    };

    const sends = await prisma.externalSend.findMany({
      where,
      orderBy: { sentAt: 'desc' },
      take: 100,
      include: {
        sentBy: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        case: {
          select: {
            caseNumber: true,
          },
        },
      },
    });

    // Define send type for mapping
    interface SendWithRelations {
      id: string;
      sendType: string;
      recipientType: string;
      recipientName: string;
      sendMethod: string;
      sentAt: Date;
      case: { caseNumber: string };
      sentBy: { id: string; name: string; role: string };
    }

    return NextResponse.json({
      sends: (sends as SendWithRelations[]).map((send: SendWithRelations) => ({
        id: send.id,
        caseNumber: send.case.caseNumber,
        sendType: send.sendType,
        recipientType: send.recipientType,
        recipientName: send.recipientName,
        sendMethod: send.sendMethod,
        sentAt: send.sentAt,
        sentBy: {
          id: send.sentBy.id,
          name: send.sentBy.name,
          role: send.sentBy.role,
        },
      })),
    });

  } catch (error) {
    console.error('Get sends error:', error);
    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    );
  }
}
