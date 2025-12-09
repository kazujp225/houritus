/**
 * ZettAI 破産手続支援SaaS - 案件管理API
 *
 * アクセス制御：
 * - LAWYER: 全案件閲覧可能
 * - STAFF: 担当案件のみ
 * - CLIENT: 自分の案件のみ
 * - TECH_SUPPORT: 案件内容アクセス不可
 */

import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getUserSession, getIpAddress, getUserAgent } from '@/lib/auth/session';
import { canViewCase, hasPermission } from '@/lib/auth/permissions';
import { logAction, AuditAction, AuditResult } from '@/lib/audit/logger';
import { Role, Permission } from '@/types/auth';
import { z } from 'zod';

// 案件一覧取得
export async function GET(req: NextRequest) {
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

    // TECH_SUPPORTは案件内容にアクセス不可
    if (user.role === Role.TECH_SUPPORT) {
      return NextResponse.json(
        { error: '案件へのアクセス権限がありません' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // ロールに応じたフィルタ条件
    let where: Record<string, unknown> = {
      tenantId: user.tenantId,
    };

    if (user.role === Role.STAFF) {
      // 事務職員は担当案件のみ
      where = {
        ...where,
        OR: [
          { staffId: user.id },
          { lawyerId: user.id },
        ],
      };
    } else if (user.role === Role.CLIENT) {
      // 依頼者は自分の案件のみ
      where = {
        ...where,
        clientId: user.id,
      };
    }

    if (status) {
      where.status = status;
    }

    const [cases, total] = await Promise.all([
      prisma.case.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lawyer: {
            select: {
              id: true,
              name: true,
            },
          },
          staff: {
            select: {
              id: true,
              name: true,
            },
          },
          clientProfile: {
            select: {
              fullName: true,
              totalDebt: true,
              creditorCount: true,
            },
          },
          _count: {
            select: {
              drafts: {
                where: { status: 'PENDING' },
              },
              documents: true,
            },
          },
        },
      }),
      prisma.case.count({ where }),
    ]);

    // Define case type for mapping
    interface CaseWithRelations {
      id: string;
      caseNumber: string;
      caseType: string;
      status: string;
      conflictCheckStatus: string;
      client: { id: string; name: string; email: string } | null;
      lawyer: { id: string; name: string } | null;
      staff: { id: string; name: string } | null;
      clientProfile: { fullName: string; totalDebt: bigint | null; creditorCount: number | null } | null;
      _count: { drafts: number; documents: number };
      createdAt: Date;
      updatedAt: Date;
    }

    return NextResponse.json({
      cases: (cases as CaseWithRelations[]).map((c: CaseWithRelations) => ({
        id: c.id,
        caseNumber: c.caseNumber,
        caseType: c.caseType,
        status: c.status,
        conflictCheckStatus: c.conflictCheckStatus,
        client: c.client,
        lawyer: c.lawyer,
        staff: c.staff,
        clientProfile: c.clientProfile ? {
          fullName: c.clientProfile.fullName,
          totalDebt: c.clientProfile.totalDebt?.toString(),
          creditorCount: c.clientProfile.creditorCount,
        } : null,
        pendingDrafts: c._count.drafts,
        documentsCount: c._count.documents,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { error: '内部エラーが発生しました' },
      { status: 500 }
    );
  }
}

// 案件作成スキーマ
const createCaseSchema = z.object({
  clientEmail: z.string().email(),
  clientName: z.string().min(1),
  caseType: z.enum(['BANKRUPTCY', 'CIVIL_REHAB', 'VOLUNTARY_ARRANGEMENT']).default('BANKRUPTCY'),
  clientProfile: z.object({
    fullName: z.string().min(1),
    fullNameKana: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    totalDebt: z.number().optional(),
    creditorCount: z.number().optional(),
  }).optional(),
});

// 案件作成
export async function POST(req: NextRequest) {
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

    // 案件作成権限チェック
    if (!hasPermission(user, Permission.CASE_CREATE)) {
      return NextResponse.json(
        { error: '案件作成権限がありません' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = createCaseSchema.parse(body);

    // クライアントユーザーを取得または作成
    let client = await prisma.user.findFirst({
      where: {
        tenantId: user.tenantId,
        email: validatedData.clientEmail,
        role: Role.CLIENT,
      },
    });

    if (!client) {
      // 新規クライアントユーザーを作成
      client = await prisma.user.create({
        data: {
          tenantId: user.tenantId,
          email: validatedData.clientEmail,
          name: validatedData.clientName,
          role: Role.CLIENT,
          passwordHash: '', // 後でパスワード設定
          status: 'ACTIVE',
        },
      });
    }

    // 案件番号を生成
    const year = new Date().getFullYear();
    const count = await prisma.case.count({
      where: {
        tenantId: user.tenantId,
        createdAt: {
          gte: new Date(`${year}-01-01`),
        },
      },
    });
    const caseNumber = `${year}-${String(count + 1).padStart(4, '0')}`;

    // 案件を作成
    const newCase = await prisma.case.create({
      data: {
        tenantId: user.tenantId,
        caseNumber,
        clientId: client.id,
        lawyerId: user.role === Role.LAWYER ? user.id : undefined,
        staffId: user.role === Role.STAFF ? user.id : undefined,
        caseType: validatedData.caseType,
        status: 'INQUIRY',
        conflictCheckStatus: 'PENDING',
        ...(validatedData.clientProfile && {
          clientProfile: {
            create: {
              fullName: validatedData.clientProfile.fullName,
              fullNameKana: validatedData.clientProfile.fullNameKana,
              phone: validatedData.clientProfile.phone,
              address: validatedData.clientProfile.address,
              totalDebt: validatedData.clientProfile.totalDebt
                ? BigInt(validatedData.clientProfile.totalDebt)
                : undefined,
              creditorCount: validatedData.clientProfile.creditorCount,
            },
          },
        }),
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        clientProfile: true,
      },
    });

    // 監査ログ
    await logAction(user, AuditAction.CASE_CREATE, 'case', AuditResult.SUCCESS, {
      resourceId: newCase.id,
      caseId: newCase.id,
      ipAddress,
      userAgent,
      details: {
        caseNumber: newCase.caseNumber,
        caseType: newCase.caseType,
        clientId: client.id,
      },
    });

    return NextResponse.json({
      success: true,
      case: {
        id: newCase.id,
        caseNumber: newCase.caseNumber,
        caseType: newCase.caseType,
        status: newCase.status,
        client: newCase.client,
      },
    }, { status: 201 });

  } catch (error) {
    console.error('Create case error:', error);

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
