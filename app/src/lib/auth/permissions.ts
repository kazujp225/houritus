/**
 * ZettAI 破産手続支援SaaS - 権限チェックシステム
 *
 * 送信ゲート（絶対ルール）：
 * 以下の送信は弁護士アカウントのみが実行可能
 * - 依頼者への法的回答
 * - 債権者への受任通知
 * - 裁判所への申立書・補正書面
 *
 * 事務職員・ZettAIからは物理的に送信不可能な設計
 */

import {
  Role,
  Permission,
  RolePermissions,
  SendType,
  RecipientType,
  MessageType,
  UserSession,
  AuthorizationError,
} from '@/types/auth';

/**
 * ユーザーが特定の権限を持っているかチェック
 */
export function hasPermission(user: UserSession, permission: Permission): boolean {
  return user.permissions.includes(permission);
}

/**
 * ユーザーが複数の権限を全て持っているかチェック
 */
export function hasAllPermissions(user: UserSession, permissions: Permission[]): boolean {
  return permissions.every(p => user.permissions.includes(p));
}

/**
 * ユーザーが複数の権限のいずれかを持っているかチェック
 */
export function hasAnyPermission(user: UserSession, permissions: Permission[]): boolean {
  return permissions.some(p => user.permissions.includes(p));
}

/**
 * ロールから権限リストを取得
 */
export function getPermissionsForRole(role: Role): Permission[] {
  return RolePermissions[role] || [];
}

/**
 * 送信ゲートのチェック（最重要）
 *
 * 弁護士ロールのみが法的送信を実行可能
 * これは非弁リスク回避の核心部分
 */
export function canSend(user: UserSession, sendType: SendType): boolean {
  // 法的送信は弁護士のみ
  if (
    sendType === SendType.CLIENT_RESPONSE ||
    sendType === SendType.RETENTION_NOTICE ||
    sendType === SendType.PETITION ||
    sendType === SendType.SUPPLEMENTARY ||
    sendType === SendType.COURT_RESPONSE
  ) {
    return user.role === Role.LAWYER;
  }

  return false;
}

/**
 * 送信先種別に基づく送信権限チェック
 */
export function canSendToRecipient(user: UserSession, recipientType: RecipientType): boolean {
  switch (recipientType) {
    case RecipientType.CLIENT:
      // 依頼者への法的回答は弁護士のみ
      // 事務連絡は弁護士・事務職員が可能
      return user.role === Role.LAWYER || user.role === Role.STAFF;

    case RecipientType.CREDITOR:
      // 債権者への送信は弁護士のみ
      return user.role === Role.LAWYER;

    case RecipientType.COURT:
      // 裁判所への送信は弁護士のみ
      return user.role === Role.LAWYER;

    default:
      return false;
  }
}

/**
 * メッセージ種別に基づく送信権限チェック
 */
export function canSendMessageType(user: UserSession, messageType: MessageType): boolean {
  switch (messageType) {
    case MessageType.LEGAL_RESPONSE:
      // 法的回答は弁護士のみ
      return user.role === Role.LAWYER;

    case MessageType.ADMIN_NOTICE:
    case MessageType.REMINDER:
      // 事務連絡・リマインドは弁護士・事務職員
      return user.role === Role.LAWYER || user.role === Role.STAFF;

    case MessageType.SYSTEM:
      // システム通知は内部処理のみ
      return false;

    default:
      return false;
  }
}

/**
 * AIドラフトの閲覧権限チェック
 *
 * 重要：AIドラフトは弁護士用レビュー画面のみに表示
 * 依頼者には弁護士承認後の回答のみ表示
 */
export function canViewDraft(user: UserSession): boolean {
  return user.role === Role.LAWYER;
}

/**
 * AIドラフトの承認権限チェック
 */
export function canApproveDraft(user: UserSession): boolean {
  return user.role === Role.LAWYER;
}

/**
 * 利益相反チェックの実行権限
 */
export function canPerformConflictCheck(user: UserSession): boolean {
  return user.role === Role.LAWYER;
}

/**
 * 案件閲覧権限のチェック
 */
export function canViewCase(
  user: UserSession,
  caseData: { clientId: string; lawyerId?: string; staffId?: string }
): boolean {
  // 弁護士とADMINは全案件閲覧可能
  if (user.role === Role.LAWYER || user.role === Role.ADMIN) {
    return true;
  }

  // 事務職員は担当案件のみ
  if (user.role === Role.STAFF) {
    return caseData.staffId === user.id || caseData.lawyerId === user.id;
  }

  // 依頼者は自分の案件のみ
  if (user.role === Role.CLIENT) {
    return caseData.clientId === user.id;
  }

  // TECH_SUPPORTは案件内容にアクセス不可
  return false;
}

/**
 * 権限チェックを実行し、権限がない場合は例外をスロー
 */
export function requirePermission(user: UserSession, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new AuthorizationError(
      `権限がありません: ${permission}`,
      permission,
      user.role
    );
  }
}

/**
 * 弁護士ロールを要求
 */
export function requireLawyer(user: UserSession): void {
  if (user.role !== Role.LAWYER) {
    throw new AuthorizationError(
      'この操作は弁護士のみが実行できます',
      undefined,
      user.role
    );
  }
}

/**
 * 送信権限を要求（送信ゲート）
 */
export function requireSendPermission(user: UserSession, sendType: SendType): void {
  if (!canSend(user, sendType)) {
    throw new AuthorizationError(
      `送信権限がありません。この送信は弁護士のみが実行できます。`,
      undefined,
      user.role
    );
  }
}
