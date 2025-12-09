/**
 * 弁護士ダッシュボード
 *
 * 弁護士が担当案件の状況を一覧で把握し、要対応案件を確認する
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
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
    totalDebt?: string;
    creditorCount?: number;
  } | null;
  pendingDrafts: number;
  documentsCount: number;
  updatedAt: string;
}

interface DashboardStats {
  pendingApproval: number;
  inProgress: number;
  dueTodayCount: number;
  totalCases: number;
}

export default function LawyerDashboard() {
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    pendingApproval: 0,
    inProgress: 0,
    dueTodayCount: 0,
    totalCases: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      const response = await fetch('/api/cases?limit=20');
      const data = await response.json();
      setCases(data.cases || []);

      // 統計を計算
      const pendingApproval = (data.cases || []).filter(
        (c: CaseSummary) => c.pendingDrafts > 0
      ).length;
      const inProgress = (data.cases || []).filter(
        (c: CaseSummary) =>
          c.status !== 'CLOSED' && c.status !== 'REJECTED' && c.status !== 'DISCHARGED'
      ).length;

      setStats({
        pendingApproval,
        inProgress,
        dueTodayCount: 0, // TODO: 本日期限の計算
        totalCases: data.pagination?.total || 0,
      });
    } catch (error) {
      console.error('Failed to fetch cases:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const pendingConflictCases = cases.filter(
    (c) => c.conflictCheckStatus === 'PENDING'
  );
  const pendingApprovalCases = cases.filter((c) => c.pendingDrafts > 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          弁護士ダッシュボード
        </h1>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-amber-100 rounded-lg p-3">
                <svg
                  className="h-6 w-6 text-amber-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">要承認</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.pendingApproval}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">進行中</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.inProgress}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-red-100 rounded-lg p-3">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">本日期限</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.dueTodayCount}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">全案件</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalCases}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/cases/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
            >
              <div className="bg-blue-100 rounded-full p-3 mb-2">
                <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">新規案件登録</span>
            </Link>

            <Link
              href="/cases"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-purple-50 hover:border-purple-300 transition-colors"
            >
              <div className="bg-purple-100 rounded-full p-3 mb-2">
                <svg className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">案件一覧</span>
            </Link>

            <Link
              href="/audit-logs"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-green-50 hover:border-green-300 transition-colors"
            >
              <div className="bg-green-100 rounded-full p-3 mb-2">
                <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">監査ログ</span>
            </Link>

            <Link
              href="/notifications"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-amber-50 hover:border-amber-300 transition-colors"
            >
              <div className="bg-amber-100 rounded-full p-3 mb-2">
                <svg className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <span className="text-sm font-medium text-gray-900">通知一覧</span>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 要承認案件 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                要承認案件
              </h2>
              <Link
                href="/cases?filter=pending_approval"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">読み込み中...</div>
              ) : pendingApprovalCases.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  要承認の案件はありません
                </div>
              ) : (
                pendingApprovalCases.slice(0, 5).map((c) => (
                  <Link
                    key={c.id}
                    href={`/cases/${c.id}`}
                    className="block px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {c.clientProfile?.fullName || c.client.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {c.caseNumber} | {caseTypeLabels[c.caseType]}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          要確認 {c.pendingDrafts}件
                        </span>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* 利益相反チェック待ち */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                利益相反チェック待ち
              </h2>
              <Link
                href="/cases?filter=conflict_check"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-6 text-center text-gray-500">読み込み中...</div>
              ) : pendingConflictCases.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  チェック待ちの案件はありません
                </div>
              ) : (
                pendingConflictCases.slice(0, 5).map((c) => (
                  <div
                    key={c.id}
                    className="px-6 py-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {c.clientProfile?.fullName || c.client.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        案件番号: {c.caseNumber}
                      </p>
                    </div>
                    <Link
                      href={`/cases/${c.id}/conflict-check`}
                      className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50"
                    >
                      利益相反チェック
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* 最近の案件一覧 */}
        <div className="mt-6 bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              最近の案件
            </h2>
          </div>
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
                    更新日時
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    アクション
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      読み込み中...
                    </td>
                  </tr>
                ) : cases.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                      案件がありません
                    </td>
                  </tr>
                ) : (
                  cases.map((c) => {
                    const statusStyle = statusLabels[c.status] || {
                      label: c.status,
                      color: 'bg-gray-100 text-gray-800',
                    };
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {c.clientProfile?.fullName || c.client.name}
                          </div>
                          <div className="text-xs text-gray-500">
                            {c.caseNumber}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {caseTypeLabels[c.caseType]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}
                          >
                            {statusStyle.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(c.updatedAt).toLocaleDateString('ja-JP')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/cases/${c.id}`}
                            className="text-blue-600 hover:text-blue-900"
                          >
                            詳細
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
