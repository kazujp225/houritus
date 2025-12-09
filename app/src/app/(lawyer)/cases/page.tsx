/**
 * 案件一覧画面（弁護士用）
 *
 * 弁護士が担当する全案件を一覧で確認し、フィルタリング・検索する
 */

'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';

interface CaseSummary {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  conflictCheckStatus: string;
  client: {
    id: string;
    name: string;
  };
  clientProfile: {
    fullName: string;
    totalDebt: string | null;
    creditorCount: number | null;
  } | null;
  lawyer: {
    id: string;
    name: string;
  } | null;
  pendingDrafts: number;
  documentsCount: number;
  createdAt: string;
  updatedAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const caseTypeLabels: Record<string, string> = {
  BANKRUPTCY: '自己破産',
  CIVIL_REHAB: '個人再生',
  VOLUNTARY_ARRANGEMENT: '任意整理',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  INQUIRY: { label: '問い合わせ', color: 'bg-gray-100 text-gray-800' },
  CONFLICT_CHECKING: { label: '利益相反チェック中', color: 'bg-yellow-100 text-yellow-800' },
  CONSULTATION: { label: '相談中', color: 'bg-blue-100 text-blue-800' },
  RETAINED: { label: '受任済', color: 'bg-green-100 text-green-800' },
  DOCUMENT_COLLECTING: { label: '資料収集中', color: 'bg-purple-100 text-purple-800' },
  DRAFTING: { label: '申立準備中', color: 'bg-indigo-100 text-indigo-800' },
  FILED: { label: '申立済', color: 'bg-cyan-100 text-cyan-800' },
  PROCEEDING: { label: '手続進行中', color: 'bg-teal-100 text-teal-800' },
  DISCHARGED: { label: '免責決定', color: 'bg-green-100 text-green-800' },
  CLOSED: { label: '終了', color: 'bg-gray-100 text-gray-800' },
  REJECTED: { label: '受任不可', color: 'bg-red-100 text-red-800' },
};

const conflictStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '未チェック', color: 'bg-yellow-100 text-yellow-800' },
  CHECKING: { label: 'チェック中', color: 'bg-blue-100 text-blue-800' },
  APPROVED: { label: '受任可', color: 'bg-green-100 text-green-800' },
  REJECTED: { label: '受任不可', color: 'bg-red-100 text-red-800' },
};

function CaseListContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || '');
  const [typeFilter, setTypeFilter] = useState<string>(searchParams.get('type') || '');

  useEffect(() => {
    fetchCases();
  }, [statusFilter, typeFilter, pagination.page]);

  const fetchCases = async () => {
    setLoading(true);
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/cases?status=${statusFilter}&type=${typeFilter}&page=${pagination.page}`);
      // const data = await response.json();

      // モックデータ
      const mockCases: CaseSummary[] = [
        {
          id: 'case-1',
          caseNumber: '2024-0001',
          caseType: 'BANKRUPTCY',
          status: 'DOCUMENT_COLLECTING',
          conflictCheckStatus: 'APPROVED',
          client: { id: 'c1', name: '山田 太郎' },
          clientProfile: { fullName: '山田 太郎', totalDebt: '5000000', creditorCount: 5 },
          lawyer: { id: 'l1', name: '柳田 一郎' },
          pendingDrafts: 2,
          documentsCount: 5,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'case-2',
          caseNumber: '2024-0002',
          caseType: 'CIVIL_REHAB',
          status: 'DRAFTING',
          conflictCheckStatus: 'APPROVED',
          client: { id: 'c2', name: '佐藤 花子' },
          clientProfile: { fullName: '佐藤 花子', totalDebt: '8000000', creditorCount: 8 },
          lawyer: { id: 'l1', name: '柳田 一郎' },
          pendingDrafts: 1,
          documentsCount: 12,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'case-3',
          caseNumber: '2024-0003',
          caseType: 'BANKRUPTCY',
          status: 'INQUIRY',
          conflictCheckStatus: 'PENDING',
          client: { id: 'c3', name: '鈴木 次郎' },
          clientProfile: { fullName: '鈴木 次郎', totalDebt: '3000000', creditorCount: 3 },
          lawyer: null,
          pendingDrafts: 0,
          documentsCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'case-4',
          caseNumber: '2024-0004',
          caseType: 'VOLUNTARY_ARRANGEMENT',
          status: 'RETAINED',
          conflictCheckStatus: 'APPROVED',
          client: { id: 'c4', name: '田中 三郎' },
          clientProfile: { fullName: '田中 三郎', totalDebt: '2500000', creditorCount: 4 },
          lawyer: { id: 'l1', name: '柳田 一郎' },
          pendingDrafts: 0,
          documentsCount: 3,
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'case-5',
          caseNumber: '2024-0005',
          caseType: 'BANKRUPTCY',
          status: 'FILED',
          conflictCheckStatus: 'APPROVED',
          client: { id: 'c5', name: '高橋 美咲' },
          clientProfile: { fullName: '高橋 美咲', totalDebt: '6500000', creditorCount: 7 },
          lawyer: { id: 'l1', name: '柳田 一郎' },
          pendingDrafts: 0,
          documentsCount: 15,
          createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ];

      // フィルタリング
      let filtered = mockCases;
      if (statusFilter) {
        filtered = filtered.filter(c => c.status === statusFilter);
      }
      if (typeFilter) {
        filtered = filtered.filter(c => c.caseType === typeFilter);
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(c =>
          c.caseNumber.toLowerCase().includes(query) ||
          c.clientProfile?.fullName.toLowerCase().includes(query) ||
          c.client.name.toLowerCase().includes(query)
        );
      }

      setCases(filtered);
      setPagination({
        page: 1,
        limit: 20,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / 20),
      });
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(parseInt(amount));
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCases();
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">案件一覧</h1>
          <p className="mt-1 text-sm text-gray-500">
            全 {pagination.total} 件の案件
          </p>
        </div>
        <button
          onClick={() => router.push('/cases/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
        >
          <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          新規案件登録
        </button>
      </div>

      {/* 検索・フィルター */}
      <div className="bg-white rounded-lg shadow mb-6 p-4">
        <form onSubmit={handleSearch} className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label htmlFor="search" className="sr-only">検索</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="案件番号、依頼者名で検索..."
              />
            </div>
          </div>

          <div className="w-48">
            <label htmlFor="status" className="sr-only">ステータス</label>
            <select
              id="status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全てのステータス</option>
              {Object.entries(statusLabels).map(([key, { label }]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <div className="w-48">
            <label htmlFor="type" className="sr-only">手続種別</label>
            <select
              id="type"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="block w-full py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">全ての種別</option>
              {Object.entries(caseTypeLabels).map(([key, label]) => (
                <option key={key} value={key}>{label}</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            検索
          </button>
        </form>
      </div>

      {/* 案件テーブル */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">読み込み中...</p>
          </div>
        ) : cases.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4">該当する案件がありません</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    案件
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    種別
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ステータス
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利益相反
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    債務総額
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    要対応
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    更新日
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {cases.map((caseItem) => {
                  const statusStyle = statusLabels[caseItem.status] || { label: caseItem.status, color: 'bg-gray-100 text-gray-800' };
                  const conflictStyle = conflictStatusLabels[caseItem.conflictCheckStatus] || { label: caseItem.conflictCheckStatus, color: 'bg-gray-100 text-gray-800' };

                  return (
                    <tr key={caseItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link href={`/cases/${caseItem.id}`} className="block">
                          <div className="text-sm font-medium text-gray-900 hover:text-blue-600">
                            {caseItem.clientProfile?.fullName || caseItem.client.name}
                          </div>
                          <div className="text-xs text-gray-500">{caseItem.caseNumber}</div>
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {caseTypeLabels[caseItem.caseType]}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
                          {statusStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${conflictStyle.color}`}>
                          {conflictStyle.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(caseItem.clientProfile?.totalDebt || null)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {caseItem.pendingDrafts > 0 && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                            要確認 {caseItem.pendingDrafts}
                          </span>
                        )}
                        {caseItem.conflictCheckStatus === 'PENDING' && (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 ml-1">
                            要チェック
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(caseItem.updatedAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Link
                          href={`/cases/${caseItem.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          詳細
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* ページネーション */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                {pagination.total} 件中 {((pagination.page - 1) * pagination.limit) + 1} -
                {Math.min(pagination.page * pagination.limit, pagination.total)} 件を表示
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page - 1 }))}
                  disabled={pagination.page === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  前へ
                </button>
                <button
                  onClick={() => setPagination(p => ({ ...p, page: p.page + 1 }))}
                  disabled={pagination.page === pagination.totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  次へ
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

function LoadingFallback() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="p-8 text-center text-gray-500">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4">読み込み中...</p>
      </div>
    </main>
  );
}

export default function CaseListPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />
      <Suspense fallback={<LoadingFallback />}>
        <CaseListContent />
      </Suspense>
    </div>
  );
}
