/**
 * ZettAI 破産手続支援SaaS - 認証・認可型定義
 *
 * 非弁リスク回避の5原則に基づく権限設計：
 * 1. 法律サービス提供主体は弁護士法人
 * 2. AIは補助ツールに徹する
 * 3. 対外送信は弁護士のみ
 * 4. 個別判断は弁護士が行う
 * 5. 課金は案件連動しない
 */

// ロール定義
export const Role = {
  LAWYER: 'LAWYER',           // 弁護士：法的判断・承認・対外送信
  STAFF: 'STAFF',             // 事務職員：依頼者対応・資料管理（事務連絡のみ）
  CLIENT: 'CLIENT',           // 依頼者：自分の案件の閲覧・資料提出
  TECH_SUPPORT: 'TECH_SUPPORT', // ZettAI技術サポート：システム保守（案件内容アクセス不可）
  ADMIN: 'ADMIN',             // システム管理者：ユーザー管理・設定
} as const;

export type Role = typeof Role[keyof typeof Role];

// 権限定義
export const Permission = {
  // 案件関連
  CASE_VIEW_ALL: 'case:view:all',
  CASE_VIEW_ASSIGNED: 'case:view:assigned',
  CASE_VIEW_OWN: 'case:view:own',
  CASE_CREATE: 'case:create',
  CASE_UPDATE: 'case:update',

  // 利益相反チェック
  CONFLICT_CHECK: 'conflict:check',

  // ドラフト関連（弁護士専用）
  DRAFT_VIEW: 'draft:view',
  DRAFT_APPROVE: 'draft:approve',
  DRAFT_MODIFY: 'draft:modify',
  DRAFT_REJECT: 'draft:reject',

  // 送信関連（送信ゲート）
  SEND_LEGAL_RESPONSE: 'send:legal_response',       // 法的回答（依頼者向け）- 弁護士のみ
  SEND_CREDITOR_NOTICE: 'send:creditor_notice',     // 受任通知（債権者向け）- 弁護士のみ
  SEND_COURT_DOCUMENT: 'send:court_document',       // 申立書・補正書面（裁判所向け）- 弁護士のみ
  SEND_ADMIN_MESSAGE: 'send:admin_message',         // 事務連絡 - 弁護士・事務職員

  // 書類関連
  DOCUMENT_UPLOAD: 'document:upload',
  DOCUMENT_VIEW: 'document:view',
  DOCUMENT_DELETE: 'document:delete',

  // メッセージ関連
  MESSAGE_SEND: 'message:send',
  MESSAGE_VIEW: 'message:view',

  // 監査ログ
  AUDIT_LOG_VIEW: 'audit:view',

  // 管理
  USER_MANAGE: 'user:manage',
  SYSTEM_CONFIG: 'system:config',
} as const;

export type Permission = typeof Permission[keyof typeof Permission];

// ロールごとの権限マッピング
export const RolePermissions: Record<Role, Permission[]> = {
  [Role.LAWYER]: [
    Permission.CASE_VIEW_ALL,
    Permission.CASE_CREATE,
    Permission.CASE_UPDATE,
    Permission.CONFLICT_CHECK,
    Permission.DRAFT_VIEW,
    Permission.DRAFT_APPROVE,
    Permission.DRAFT_MODIFY,
    Permission.DRAFT_REJECT,
    Permission.SEND_LEGAL_RESPONSE,
    Permission.SEND_CREDITOR_NOTICE,
    Permission.SEND_COURT_DOCUMENT,
    Permission.SEND_ADMIN_MESSAGE,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VIEW,
    Permission.DOCUMENT_DELETE,
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_VIEW,
    Permission.AUDIT_LOG_VIEW,
  ],
  [Role.STAFF]: [
    Permission.CASE_VIEW_ASSIGNED,
    Permission.CASE_CREATE,
    Permission.SEND_ADMIN_MESSAGE,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VIEW,
    Permission.MESSAGE_SEND,
    Permission.MESSAGE_VIEW,
  ],
  [Role.CLIENT]: [
    Permission.CASE_VIEW_OWN,
    Permission.DOCUMENT_UPLOAD,
    Permission.DOCUMENT_VIEW,
    Permission.MESSAGE_VIEW,
  ],
  [Role.TECH_SUPPORT]: [
    Permission.SYSTEM_CONFIG,
    // AUDIT_LOG_VIEW は障害時のみ動的付与
  ],
  [Role.ADMIN]: [
    Permission.CASE_VIEW_ALL,
    Permission.AUDIT_LOG_VIEW,
    Permission.USER_MANAGE,
    Permission.SYSTEM_CONFIG,
  ],
};

// 送信種別の定義
export const SendType = {
  RETENTION_NOTICE: 'RETENTION_NOTICE',   // 受任通知
  PETITION: 'PETITION',                   // 申立書
  SUPPLEMENTARY: 'SUPPLEMENTARY',         // 補正書面
  COURT_RESPONSE: 'COURT_RESPONSE',       // 裁判所への回答
  CLIENT_RESPONSE: 'CLIENT_RESPONSE',     // 依頼者への回答
} as const;

export type SendType = typeof SendType[keyof typeof SendType];

// 送信先種別
export const RecipientType = {
  CLIENT: 'CLIENT',       // 依頼者
  CREDITOR: 'CREDITOR',   // 債権者
  COURT: 'COURT',         // 裁判所
} as const;

export type RecipientType = typeof RecipientType[keyof typeof RecipientType];

// メッセージ種別
export const MessageType = {
  LEGAL_RESPONSE: 'LEGAL_RESPONSE',   // 法的回答（LAWYER only）
  ADMIN_NOTICE: 'ADMIN_NOTICE',       // 事務連絡（LAWYER, STAFF）
  REMINDER: 'REMINDER',               // リマインド（LAWYER, STAFF）
  SYSTEM: 'SYSTEM',                   // システム通知
} as const;

export type MessageType = typeof MessageType[keyof typeof MessageType];

// ユーザーセッション型
export interface UserSession {
  id: string;
  tenantId: string;
  email: string;
  name: string;
  role: Role;
  lawyerNumber?: string;
  permissions: Permission[];
}

// 認証エラー
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public readonly requiredPermission?: Permission,
    public readonly userRole?: Role
  ) {
    super(message);
    this.name = 'AuthorizationError';
  }
}
