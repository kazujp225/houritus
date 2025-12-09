/**
 * Prisma Client - プレースホルダー型定義
 *
 * 実運用時は `npx prisma generate` で生成された @prisma/client を使用
 * 開発中はこの型定義でTypeScriptの型チェックを通す
 */

// ========================================
// Enumの型定義
// ========================================

export type Role = 'LAWYER' | 'STAFF' | 'CLIENT' | 'TECH_SUPPORT' | 'ADMIN';
export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'TERMINATED';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'DELETED';
export type CaseType = 'BANKRUPTCY' | 'CIVIL_REHAB' | 'VOLUNTARY_ARRANGEMENT';
export type CaseStatus = 'INQUIRY' | 'CONFLICT_CHECKING' | 'CONSULTATION' | 'RETAINED' |
  'DOCUMENT_COLLECTING' | 'DRAFTING' | 'FILED' | 'PROCEEDING' | 'DISCHARGED' | 'CLOSED' | 'REJECTED';
export type ConflictCheckStatus = 'PENDING' | 'CHECKING' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'ID_DOCUMENT' | 'BANK_STATEMENT' | 'PASSBOOK' | 'PAY_SLIP' |
  'TAX_CERTIFICATE' | 'CREDIT_CARD_STATEMENT' | 'LOAN_CONTRACT' | 'REAL_ESTATE_CERT' |
  'VEHICLE_CERT' | 'INSURANCE_POLICY' | 'OTHER';
export type OcrStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
export type DraftType = 'RETENTION_NOTICE' | 'PETITION' | 'STATEMENT' | 'CREDITOR_LIST' |
  'ASSET_LIST' | 'INCOME_EXPENSE' | 'RESPONSE' | 'COURT_RESPONSE';
export type DraftStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'MODIFIED';
export type MessageType = 'LEGAL_RESPONSE' | 'ADMIN_NOTICE' | 'REMINDER' | 'SYSTEM';
export type SendType = 'RETENTION_NOTICE' | 'PETITION' | 'SUPPLEMENTARY' | 'COURT_RESPONSE' | 'CLIENT_RESPONSE';
export type RecipientType = 'CLIENT' | 'CREDITOR' | 'COURT';
export type SendMethod = 'EMAIL' | 'POSTAL' | 'CERTIFIED_MAIL' | 'FAX' | 'PORTAL';
export type AuditAction = 'AUTH_LOGIN' | 'AUTH_LOGOUT' | 'AUTH_MFA_VERIFY' | 'AUTH_LOGIN_FAILED' |
  'CASE_VIEW' | 'CASE_CREATE' | 'CASE_UPDATE' | 'CASE_CONFLICT_CHECK' | 'CASE_RETAIN' |
  'DRAFT_VIEW' | 'DRAFT_APPROVE' | 'DRAFT_MODIFY' | 'DRAFT_REJECT' | 'SEND_EXECUTE' |
  'DOCUMENT_UPLOAD' | 'DOCUMENT_DOWNLOAD' | 'DOCUMENT_DELETE' | 'MESSAGE_SEND' |
  'USER_CREATE' | 'USER_UPDATE' | 'USER_DELETE' | 'PERMISSION_DENIED';
export type AuditResult = 'SUCCESS' | 'FAILURE' | 'DENIED';

// ========================================
// モデルの型定義
// ========================================

export interface Tenant {
  id: string;
  name: string;
  corporateNumber: string | null;
  address: string;
  phone: string;
  email: string;
  domain: string;
  plan: string;
  status: TenantStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  tenantId: string;
  role: Role;
  email: string;
  passwordHash: string;
  name: string;
  lawyerNumber: string | null;
  phone: string | null;
  mfaEnabled: boolean;
  mfaSecret: string | null;
  status: UserStatus;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  tenantId: string;
  caseNumber: string;
  clientId: string;
  lawyerId: string | null;
  staffId: string | null;
  caseType: CaseType;
  status: CaseStatus;
  conflictCheckStatus: ConflictCheckStatus;
  conflictCheckAt: Date | null;
  conflictCheckById: string | null;
  conflictCheckReason: string | null;
  retentionStartedAt: Date | null;
  filedAt: Date | null;
  dischargedAt: Date | null;
  closedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  client?: User;
  lawyer?: User | null;
  staff?: User | null;
  clientProfile?: ClientProfile | null;
  creditors?: Creditor[];
  _count?: { drafts: number; documents: number };
}

export interface ClientProfile {
  id: string;
  caseId: string;
  fullName: string;
  fullNameKana: string | null;
  birthDate: Date | null;
  address: string | null;
  phone: string | null;
  occupation: string | null;
  employer: string | null;
  monthlyIncome: number | null;
  familySize: number | null;
  totalDebt: bigint | null;
  creditorCount: number | null;
  hasRealEstate: boolean | null;
  hasVehicle: boolean | null;
  hasInsurance: boolean | null;
  bankruptcyReason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Creditor {
  id: string;
  caseId: string;
  name: string;
  address: string | null;
  debtAmount: bigint | null;
  debtType: string | null;
  contractDate: Date | null;
  lastPaymentDate: Date | null;
  noticeSentAt: Date | null;
  noticeSentById: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  caseId: string;
  documentType: DocumentType;
  fileName: string;
  filePath: string;
  fileSize: bigint;
  mimeType: string;
  uploadedById: string;
  ocrStatus: OcrStatus | null;
  ocrResult: unknown;
  verifiedById: string | null;
  verifiedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Draft {
  id: string;
  caseId: string;
  draftType: DraftType;
  version: number;
  content: string;
  aiModel: string;
  aiPromptHash: string | null;
  flags: unknown;
  status: DraftStatus;
  reviewedById: string | null;
  reviewedAt: Date | null;
  reviewComment: string | null;
  finalContent: string | null;
  createdAt: Date;
  updatedAt: Date;
  // Relations
  case?: Case;
}

export interface Message {
  id: string;
  caseId: string;
  senderId: string;
  recipientId: string;
  messageType: MessageType;
  subject: string | null;
  body: string;
  draftId: string | null;
  isRead: boolean;
  readAt: Date | null;
  createdAt: Date;
}

export interface ExternalSend {
  id: string;
  caseId: string;
  sendType: SendType;
  recipientType: RecipientType;
  recipientName: string;
  recipientAddress: string | null;
  draftId: string | null;
  contentSnapshot: string;
  sendMethod: SendMethod;
  sentById: string;
  sentAt: Date;
  confirmationChecked: boolean;
  createdAt: Date;
  // Relations
  case?: { caseNumber: string };
  sentBy?: { id: string; name: string; role: Role };
}

export interface AuditLog {
  id: string;
  tenantId: string;
  timestamp: Date;
  userId: string | null;
  role: Role | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  caseId: string | null;
  ipAddress: string;
  userAgent: string | null;
  result: string;
  details: unknown;
  createdAt: Date;
}

// ========================================
// Prisma Client型定義
// ========================================

interface PrismaClientType {
  auditLog: {
    create: (args: { data: Record<string, unknown> }) => Promise<AuditLog>;
    findMany: (args?: Record<string, unknown>) => Promise<AuditLog[]>;
    count: (args?: Record<string, unknown>) => Promise<number>;
  };
  case: {
    findUnique: (args: Record<string, unknown>) => Promise<Case | null>;
    findMany: (args?: Record<string, unknown>) => Promise<Case[]>;
    count: (args?: Record<string, unknown>) => Promise<number>;
    create: (args: Record<string, unknown>) => Promise<Case>;
    update: (args: Record<string, unknown>) => Promise<Case>;
  };
  draft: {
    findUnique: (args: Record<string, unknown>) => Promise<Draft | null>;
    update: (args: Record<string, unknown>) => Promise<Draft>;
  };
  externalSend: {
    create: (args: Record<string, unknown>) => Promise<ExternalSend>;
    findMany: (args?: Record<string, unknown>) => Promise<ExternalSend[]>;
  };
  creditor: {
    updateMany: (args: Record<string, unknown>) => Promise<{ count: number }>;
  };
  user: {
    findFirst: (args: Record<string, unknown>) => Promise<User | null>;
    create: (args: Record<string, unknown>) => Promise<User>;
  };
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientType | undefined;
};

// Placeholder - replace with actual PrismaClient after running `npx prisma generate`
const createPrismaClient = (): PrismaClientType => {
  // This will be replaced with actual PrismaClient
  console.warn('Using placeholder Prisma client. Run `npx prisma generate` to generate the actual client.');
  return {} as PrismaClientType;
};

export const prisma: PrismaClientType =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

export default prisma;
