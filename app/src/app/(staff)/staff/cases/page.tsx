/**
 * 事務職員用案件一覧画面
 *
 * 事務職員が担当案件を確認し、タスクを管理する
 *
 * 重要（非弁対策）：
 * - 事務職員は事務連絡のみ送信可能
 * - 法的判断を含む操作は不可
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Case {
  id: string;
  caseNumber: string;
  clientName: string;
  status: string;
  lawyerName: string;
  pendingDocuments: number;
  unreadMessages: number;
  lastActivity: Date;
  nextAction?: string;
}

export default function StaffCasesPage() {
  const [filter, setFilter] = useState<'all' | 'action_required' | 'my_tasks'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // モックデータ
  const cases: Case[] = [
    {
      id: 'case-001',
      caseNumber: '2024-0001',
      clientName: '田中 一郎',
      status: 'DOCUMENT_COLLECTING',
      lawyerName: '柳田 太郎',
      pendingDocuments: 3,
      unreadMessages: 2,
      lastActivity: new Date('2024-12-09T10:30:00'),
      nextAction: '住民票の再提出依頼',
    },
    {
      id: 'case-002',
      caseNumber: '2024-0002',
      clientName: '佐藤 花子',
      status: 'DOCUMENT_COLLECTING',
      lawyerName: '柳田 太郎',
      pendingDocuments: 1,
      unreadMessages: 0,
      lastActivity: new Date('2024-12-08T15:00:00'),
      nextAction: '給与明細の確認',
    },
    {
      id: 'case-003',
      caseNumber: '2024-0003',
      clientName: '鈴木 太郎',
      status: 'DRAFTING',
      lawyerName: '柳田 太郎',
      pendingDocuments: 0,
      unreadMessages: 1,
      lastActivity: new Date('2024-12-09T09:00:00'),
    },
    {
      id: 'case-004',
      caseNumber: '2024-0004',
      clientName: '高橋 美咲',
      status: 'RETAINED',
      lawyerName: '柳田 太郎',
      pendingDocuments: 5,
      unreadMessages: 0,
      lastActivity: new Date('2024-12-07T14:00:00'),
      nextAction: '必要書類の案内',
    },
    {
      id: 'case-005',
      caseNumber: '2024-0005',
      clientName: '山本 健二',
      status: 'FILED',
      lawyerName: '柳田 太郎',
      pendingDocuments: 0,
      unreadMessages: 0,
      lastActivity: new Date('2024-12-06T11:00:00'),
    },
  ];

  const statusLabels: Record<string, { label: string; color: string }> = {
    INQUIRY: { label: '問い合わせ', color: 'bg-gray-100 text-gray-700' },
    CONSULTATION: { label: '相談中', color: 'bg-blue-100 text-blue-700' },
    RETAINED: { label: '受任済', color: 'bg-green-100 text-green-700' },
    DOCUMENT_COLLECTING: { label: '資料収集中', color: 'bg-purple-100 text-purple-700' },
    DRAFTING: { label: '申立準備中', color: 'bg-indigo-100 text-indigo-700' },
    FILED: { label: '申立済', color: 'bg-cyan-100 text-cyan-700' },
    PROCEEDING: { label: '手続進行中', color: 'bg-teal-100 text-teal-700' },
    DISCHARGED: { label: '免責決定', color: 'bg-green-100 text-green-700' },
    CLOSED: { label: '終了', color: 'bg-gray-100 text-gray-700' },
  };

  const filteredCases = cases.filter(c => {
    if (filter === 'action_required') {
      return c.pendingDocuments > 0 || c.unreadMessages > 0 || c.nextAction;
    }
    if (filter === 'my_tasks') {
      return c.nextAction;
    }
    return true;
  }).filter(c => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.clientName.toLowerCase().includes(query) ||
      c.caseNumber.toLowerCase().includes(query)
    );
  });

  const actionRequiredCount = cases.filter(c => c.pendingDocuments > 0 || c.unreadMessages > 0 || c.nextAction).length;
  const myTasksCount = cases.filter(c => c.nextAction).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/staff/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                ← ダッシュボード
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">案件一覧</h1>
            </div>
            <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
              事務職員
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 権限注意 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>事務職員の権限</strong>：資料確認・事務連絡のみ可能です。
            法的判断や法的アドバイスに関する操作は弁護士が行います。
          </p>
        </div>

        {/* 検索・フィルター */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 flex flex-wrap items-center gap-4">
            {/* 検索 */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <input
                  type="text"
                  placeholder="依頼者名・案件番号で検索..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>

            {/* フィルター */}
            <div className="flex space-x-2">
              <button
                onClick={() => setFilter('all')}
                className={`px-4 py-2 text-sm rounded-lg ${
                  filter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                すべて ({cases.length})
              </button>
              <button
                onClick={() => setFilter('action_required')}
                className={`px-4 py-2 text-sm rounded-lg ${
                  filter === 'action_required'
                    ? 'bg-amber-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                要対応 ({actionRequiredCount})
              </button>
              <button
                onClick={() => setFilter('my_tasks')}
                className={`px-4 py-2 text-sm rounded-lg ${
                  filter === 'my_tasks'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                マイタスク ({myTasksCount})
              </button>
            </div>
          </div>
        </div>

        {/* 案件一覧 */}
        <div className="bg-white rounded-lg shadow">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">案件</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">担当弁護士</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">ステータス</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">未提出</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">未読</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">次のアクション</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-6 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCases.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                      該当する案件がありません
                    </td>
                  </tr>
                ) : (
                  filteredCases.map(c => {
                    const status = statusLabels[c.status] || { label: c.status, color: 'bg-gray-100 text-gray-700' };
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{c.clientName}</p>
                            <p className="text-xs text-gray-500">{c.caseNumber}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="text-sm text-gray-600">{c.lawyerName}</span>
                        </td>
                        <td className="px-4 py-4">
                          <span className={`px-2 py-0.5 text-xs font-medium rounded ${status.color}`}>
                            {status.label}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-center">
                          {c.pendingDocuments > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                              {c.pendingDocuments}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {c.unreadMessages > 0 ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
                              {c.unreadMessages}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-4 py-4">
                          {c.nextAction ? (
                            <span className="text-sm text-purple-600">{c.nextAction}</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex justify-end space-x-2">
                            <Link
                              href={`/staff/cases/${c.id}/documents`}
                              className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                            >
                              資料確認
                            </Link>
                            <Link
                              href={`/staff/cases/${c.id}/communication`}
                              className="px-3 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded hover:bg-gray-200"
                            >
                              連絡
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ページネーション */}
        <div className="mt-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            {filteredCases.length}件の案件を表示
          </p>
          <div className="flex space-x-2">
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
            >
              前へ
            </button>
            <button
              disabled
              className="px-4 py-2 text-sm font-medium text-gray-400 bg-gray-100 rounded-lg cursor-not-allowed"
            >
              次へ
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
