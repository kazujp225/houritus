/**
 * ZettAI 破産手続支援SaaS - 監査ログシステム
 *
 * 監査ログ要件：
 * - 全操作を記録、改ざん防止
 * - 誰が、いつ、どの案件を、どう操作したかを全保存
 * - AI案と最終版の差分もログ化
 * - オート承認検知のためのアラート
 */

import prisma from '@/lib/prisma';
import { Role, UserSession } from '@/types/auth';

// 監査アクション
export const AuditAction = {
  AUTH_LOGIN: 'AUTH_LOGIN',
  AUTH_LOGOUT: 'AUTH_LOGOUT',
  AUTH_MFA_VERIFY: 'AUTH_MFA_VERIFY',
  AUTH_LOGIN_FAILED: 'AUTH_LOGIN_FAILED',
  CASE_VIEW: 'CASE_VIEW',
  CASE_CREATE: 'CASE_CREATE',
  CASE_UPDATE: 'CASE_UPDATE',
  CASE_CONFLICT_CHECK: 'CASE_CONFLICT_CHECK',
  CASE_RETAIN: 'CASE_RETAIN',
  DRAFT_VIEW: 'DRAFT_VIEW',
  DRAFT_APPROVE: 'DRAFT_APPROVE',
  DRAFT_MODIFY: 'DRAFT_MODIFY',
  DRAFT_REJECT: 'DRAFT_REJECT',
  SEND_EXECUTE: 'SEND_EXECUTE',
  DOCUMENT_UPLOAD: 'DOCUMENT_UPLOAD',
  DOCUMENT_DOWNLOAD: 'DOCUMENT_DOWNLOAD',
  DOCUMENT_DELETE: 'DOCUMENT_DELETE',
  MESSAGE_SEND: 'MESSAGE_SEND',
  USER_CREATE: 'USER_CREATE',
  USER_UPDATE: 'USER_UPDATE',
  USER_DELETE: 'USER_DELETE',
  PERMISSION_DENIED: 'PERMISSION_DENIED',
} as const;

export type AuditAction = typeof AuditAction[keyof typeof AuditAction];

// 監査結果
export const AuditResult = {
  SUCCESS: 'SUCCESS',
  FAILURE: 'FAILURE',
  DENIED: 'DENIED',
} as const;

export type AuditResult = typeof AuditResult[keyof typeof AuditResult];

// 監査ログ入力型
export interface AuditLogInput {
  tenantId: string;
  userId?: string;
  role?: Role;
  action: AuditAction;
  resourceType: string;
  resourceId?: string;
  caseId?: string;
  ipAddress: string;
  userAgent?: string;
  result: AuditResult;
  details?: Record<string, unknown>;
}

// ドラフト承認の詳細
export interface DraftApprovalDetails {
  draftType: string;
  draftVersion: number;
  reviewTimeSeconds: number;
  hasModification: boolean;
  modificationSummary?: string;
  flagsCount: number;
  flagsAcknowledged: boolean;
}

// 送信実行の詳細
export interface SendExecutionDetails {
  sendType: string;
  recipientType: string;
  recipientName: string;
  sendMethod: string;
  confirmationChecked: boolean;
  draftId?: string;
}

/**
 * 監査ログを記録
 */
export async function createAuditLog(input: AuditLogInput): Promise<void> {
  try {
    await prisma.auditLog.create({
      data: {
        tenantId: input.tenantId,
        userId: input.userId,
        role: input.role,
        action: input.action,
        resourceType: input.resourceType,
        resourceId: input.resourceId,
        caseId: input.caseId,
        ipAddress: input.ipAddress,
        userAgent: input.userAgent,
        result: input.result,
        details: input.details,
      },
    });
  } catch (error) {
    // 監査ログの記録失敗は致命的ではないが、ログに残す
    console.error('Failed to create audit log:', error);
  }
}

/**
 * ユーザーセッションから監査ログを記録
 */
export async function logAction(
  user: UserSession,
  action: AuditAction,
  resourceType: string,
  result: AuditResult,
  options?: {
    resourceId?: string;
    caseId?: string;
    ipAddress?: string;
    userAgent?: string;
    details?: Record<string, unknown>;
  }
): Promise<void> {
  await createAuditLog({
    tenantId: user.tenantId,
    userId: user.id,
    role: user.role,
    action,
    resourceType,
    resourceId: options?.resourceId,
    caseId: options?.caseId,
    ipAddress: options?.ipAddress || 'unknown',
    userAgent: options?.userAgent,
    result,
    details: options?.details,
  });
}

/**
 * ドラフト承認のログを記録
 */
export async function logDraftApproval(
  user: UserSession,
  draftId: string,
  caseId: string,
  details: DraftApprovalDetails,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAction(user, AuditAction.DRAFT_APPROVE, 'draft', AuditResult.SUCCESS, {
    resourceId: draftId,
    caseId,
    ipAddress,
    userAgent,
    details: details as unknown as Record<string, unknown>,
  });
}

/**
 * 送信実行のログを記録
 */
export async function logSendExecution(
  user: UserSession,
  sendId: string,
  caseId: string,
  details: SendExecutionDetails,
  ipAddress: string,
  userAgent?: string
): Promise<void> {
  await logAction(user, AuditAction.SEND_EXECUTE, 'external_send', AuditResult.SUCCESS, {
    resourceId: sendId,
    caseId,
    ipAddress,
    userAgent,
    details: details as unknown as Record<string, unknown>,
  });
}

/**
 * 権限拒否のログを記録
 */
export async function logPermissionDenied(
  user: UserSession,
  attemptedAction: string,
  resourceType: string,
  ipAddress: string,
  userAgent?: string,
  resourceId?: string,
  caseId?: string
): Promise<void> {
  await logAction(user, AuditAction.PERMISSION_DENIED, resourceType, AuditResult.DENIED, {
    resourceId,
    caseId,
    ipAddress,
    userAgent,
    details: { attemptedAction },
  });
}

/**
 * オート承認検知（5秒以内の承認）
 */
export async function detectQuickApprovals(
  tenantId: string,
  thresholdSeconds: number = 5,
  lookbackHours: number = 24
): Promise<Array<{ userId: string; count: number }>> {
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: 'DRAFT_APPROVE',
      timestamp: { gte: since },
      result: 'SUCCESS',
    },
    select: {
      userId: true,
      details: true,
    },
  });

  // ユーザーごとにカウント
  const userCounts: Record<string, number> = {};

  for (const log of logs) {
    const details = log.details as Record<string, unknown> | null;
    if (details && typeof details.reviewTimeSeconds === 'number') {
      if (details.reviewTimeSeconds < thresholdSeconds && log.userId) {
        userCounts[log.userId] = (userCounts[log.userId] || 0) + 1;
      }
    }
  }

  return Object.entries(userCounts)
    .filter(([, count]) => count > 3) // 3件以上の高速承認
    .map(([userId, count]) => ({ userId, count }));
}

/**
 * 大量承認検知（1分以内に10件以上）
 */
export async function detectBulkApprovals(
  tenantId: string,
  thresholdCount: number = 10,
  windowMinutes: number = 1,
  lookbackHours: number = 24
): Promise<Array<{ userId: string; minute: Date; count: number }>> {
  const since = new Date(Date.now() - lookbackHours * 60 * 60 * 1000);

  const logs = await prisma.auditLog.findMany({
    where: {
      tenantId,
      action: 'DRAFT_APPROVE',
      timestamp: { gte: since },
      result: 'SUCCESS',
    },
    select: {
      userId: true,
      timestamp: true,
    },
    orderBy: { timestamp: 'asc' },
  });

  const results: Array<{ userId: string; minute: Date; count: number }> = [];
  const userMinuteCounts: Record<string, Record<string, number>> = {};

  for (const log of logs) {
    if (!log.userId) continue;

    // 分単位でグループ化
    const minuteKey = new Date(
      Math.floor(log.timestamp.getTime() / (windowMinutes * 60 * 1000)) * (windowMinutes * 60 * 1000)
    ).toISOString();

    if (!userMinuteCounts[log.userId]) {
      userMinuteCounts[log.userId] = {};
    }
    userMinuteCounts[log.userId][minuteKey] = (userMinuteCounts[log.userId][minuteKey] || 0) + 1;
  }

  for (const [userId, minuteCounts] of Object.entries(userMinuteCounts)) {
    for (const [minuteKey, count] of Object.entries(minuteCounts)) {
      if (count >= thresholdCount) {
        results.push({
          userId,
          minute: new Date(minuteKey),
          count,
        });
      }
    }
  }

  return results;
}

/**
 * 監査ログの取得（管理者・弁護士用）
 */
export async function getAuditLogs(
  tenantId: string,
  options?: {
    userId?: string;
    action?: AuditAction;
    caseId?: string;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
    offset?: number;
  }
): Promise<{
  logs: Array<{
    id: string;
    timestamp: Date;
    userId: string | null;
    role: Role | null;
    action: string;
    resourceType: string;
    resourceId: string | null;
    caseId: string | null;
    ipAddress: string;
    result: string;
    details: unknown;
  }>;
  total: number;
}> {
  const where = {
    tenantId,
    ...(options?.userId && { userId: options.userId }),
    ...(options?.action && { action: options.action }),
    ...(options?.caseId && { caseId: options.caseId }),
    ...(options?.startDate || options?.endDate
      ? {
          timestamp: {
            ...(options?.startDate && { gte: options.startDate }),
            ...(options?.endDate && { lte: options.endDate }),
          },
        }
      : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: options?.limit || 100,
      skip: options?.offset || 0,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return {
    logs: logs.map((log: {
      id: string;
      timestamp: Date;
      userId: string | null;
      role: string | null;
      action: string;
      resourceType: string;
      resourceId: string | null;
      caseId: string | null;
      ipAddress: string;
      result: string;
      details: unknown;
    }) => ({
      id: log.id,
      timestamp: log.timestamp,
      userId: log.userId,
      role: log.role as Role | null,
      action: log.action,
      resourceType: log.resourceType,
      resourceId: log.resourceId,
      caseId: log.caseId,
      ipAddress: log.ipAddress,
      result: log.result,
      details: log.details,
    })),
    total,
  };
}
