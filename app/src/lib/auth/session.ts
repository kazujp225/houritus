/**
 * ZettAI 破産手続支援SaaS - セッション管理
 *
 * NextAuth.jsを使用した認証セッション管理
 */

import { getServerSession } from 'next-auth';
import { NextRequest } from 'next/server';
import { Role, Permission, UserSession, AuthorizationError, RolePermissions } from '@/types/auth';

// NextAuthの設定（後で完全な設定を追加）
export const authOptions = {
  providers: [],
  callbacks: {},
};

/**
 * リクエストからユーザーセッションを取得
 * 開発用のモックセッションも含む
 */
export async function getUserSession(req?: NextRequest): Promise<UserSession | null> {
  // 開発環境用のモックセッション（本番では削除）
  if (process.env.NODE_ENV === 'development') {
    const mockRole = (process.env.MOCK_USER_ROLE as Role) || Role.LAWYER;
    return {
      id: 'mock-user-id',
      tenantId: 'mock-tenant-id',
      email: 'mock@example.com',
      name: 'Mock User',
      role: mockRole,
      lawyerNumber: mockRole === Role.LAWYER ? '12345' : undefined,
      permissions: RolePermissions[mockRole],
    };
  }

  // 本番環境ではNextAuthセッションを使用
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }

  // セッションからUserSessionを構築
  const user = session.user as {
    id: string;
    tenantId: string;
    email: string;
    name: string;
    role: Role;
    lawyerNumber?: string;
  };

  return {
    id: user.id,
    tenantId: user.tenantId,
    email: user.email,
    name: user.name,
    role: user.role,
    lawyerNumber: user.lawyerNumber,
    permissions: RolePermissions[user.role],
  };
}

/**
 * 認証が必要なAPIルートのラッパー
 */
export async function withAuth<T>(
  handler: (user: UserSession) => Promise<T>
): Promise<T> {
  const user = await getUserSession();
  if (!user) {
    throw new AuthorizationError('認証が必要です');
  }
  return handler(user);
}

/**
 * 特定の権限が必要なAPIルートのラッパー
 */
export async function withPermission<T>(
  permission: Permission,
  handler: (user: UserSession) => Promise<T>
): Promise<T> {
  const user = await getUserSession();
  if (!user) {
    throw new AuthorizationError('認証が必要です');
  }
  if (!user.permissions.includes(permission)) {
    throw new AuthorizationError(
      `権限がありません: ${permission}`,
      permission,
      user.role
    );
  }
  return handler(user);
}

/**
 * 弁護士ロールが必要なAPIルートのラッパー
 */
export async function withLawyer<T>(
  handler: (user: UserSession) => Promise<T>
): Promise<T> {
  const user = await getUserSession();
  if (!user) {
    throw new AuthorizationError('認証が必要です');
  }
  if (user.role !== Role.LAWYER) {
    throw new AuthorizationError(
      'この操作は弁護士のみが実行できます',
      undefined,
      user.role
    );
  }
  return handler(user);
}

/**
 * リクエストからIPアドレスを取得
 */
export function getIpAddress(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return req.headers.get('x-real-ip') || 'unknown';
}

/**
 * リクエストからUser-Agentを取得
 */
export function getUserAgent(req: NextRequest): string {
  return req.headers.get('user-agent') || 'unknown';
}
