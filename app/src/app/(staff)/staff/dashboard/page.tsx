/**
 * 事務職員ダッシュボード
 *
 * 事務職員が担当案件の状況を確認し、タスクを管理する
 *
 * 重要：
 * - 事務職員は事務連絡のみ送信可能
 * - 法的判断を含む内容は弁護士確認が必要
 * - 対外送信（債権者・裁判所）は不可
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';

interface TaskItem {
  id: string;
  type: 'DOCUMENT_CHECK' | 'REMINDER' | 'CLIENT_RESPONSE' | 'DATA_ENTRY';
  title: string;
  caseNumber: string;
  clientName: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  dueDate: string | null;
  status: 'pending' | 'in_progress' | 'completed';
}

interface CaseSummary {
  id: string;
  caseNumber: string;
  clientName: string;
  status: string;
  missingDocuments: number;
  unreadMessages: number;
  lastActivity: string;
}

interface Stats {
  totalCases: number;
  pendingTasks: number;
  overdueReminders: number;
  newDocuments: number;
}

const taskTypeLabels: Record<string, string> = {
  DOCUMENT_CHECK: '資料確認',
  REMINDER: 'リマインド送信',
  CLIENT_RESPONSE: '依頼者対応',
  DATA_ENTRY: 'データ入力',
};

const priorityStyles: Record<string, { bg: string; text: string }> = {
  HIGH: { bg: 'bg-red-100', text: 'text-red-700' },
  MEDIUM: { bg: 'bg-amber-100', text: 'text-amber-700' },
  LOW: { bg: 'bg-gray-100', text: 'text-gray-700' },
};

const statusLabels: Record<string, string> = {
  DOCUMENT_COLLECTING: '資料収集中',
  DRAFTING: '申立準備中',
  RETAINED: '受任済',
  FILED: '申立済',
};

export default function StaffDashboardPage() {
  const [stats, setStats] = useState<Stats>({ totalCases: 0, pendingTasks: 0, overdueReminders: 0, newDocuments: 0 });
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [cases, setCases] = useState<CaseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // TODO: 実際のAPIから取得
      // モックデータ
      setStats({
        totalCases: 25,
        pendingTasks: 8,
        overdueReminders: 3,
        newDocuments: 5,
      });

      setTasks([
        {
          id: 't1',
          type: 'DOCUMENT_CHECK',
          title: '給与明細の確認',
          caseNumber: '2024-0001',
          clientName: '山田 太郎',
          priority: 'HIGH',
          dueDate: new Date().toISOString(),
          status: 'pending',
        },
        {
          id: 't2',
          type: 'REMINDER',
          title: '源泉徴収票の提出リマインド',
          caseNumber: '2024-0002',
          clientName: '佐藤 花子',
          priority: 'HIGH',
          dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
        {
          id: 't3',
          type: 'CLIENT_RESPONSE',
          title: '面談日程の調整',
          caseNumber: '2024-0005',
          clientName: '高橋 美咲',
          priority: 'MEDIUM',
          dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
        {
          id: 't4',
          type: 'DATA_ENTRY',
          title: '債権者一覧の入力',
          caseNumber: '2024-0003',
          clientName: '鈴木 次郎',
          priority: 'MEDIUM',
          dueDate: null,
          status: 'in_progress',
        },
        {
          id: 't5',
          type: 'DOCUMENT_CHECK',
          title: '通帳コピーの確認',
          caseNumber: '2024-0004',
          clientName: '田中 三郎',
          priority: 'LOW',
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
        },
      ]);

      setCases([
        {
          id: 'case-1',
          caseNumber: '2024-0001',
          clientName: '山田 太郎',
          status: 'DOCUMENT_COLLECTING',
          missingDocuments: 2,
          unreadMessages: 1,
          lastActivity: new Date().toISOString(),
        },
        {
          id: 'case-2',
          caseNumber: '2024-0002',
          clientName: '佐藤 花子',
          status: 'DRAFTING',
          missingDocuments: 1,
          unreadMessages: 0,
          lastActivity: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: 'case-3',
          caseNumber: '2024-0003',
          clientName: '鈴木 次郎',
          status: 'RETAINED',
          missingDocuments: 5,
          unreadMessages: 2,
          lastActivity: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = (dueDate: string | null) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="田中 花子"
        userRole="STAFF"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">事務職員ダッシュボード</h1>
          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
          </p>
        </div>

        {/* 統計カード */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">担当案件</div>
            <div className="mt-1 text-2xl font-bold text-gray-900">{stats.totalCases}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">未完了タスク</div>
            <div className="mt-1 text-2xl font-bold text-amber-600">{stats.pendingTasks}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">期限超過リマインド</div>
            <div className="mt-1 text-2xl font-bold text-red-600">{stats.overdueReminders}</div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <div className="text-sm text-gray-500">新着資料</div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{stats.newDocuments}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* タスク一覧 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">タスク一覧</h2>
              <Link href="/staff/tasks" className="text-sm text-blue-600 hover:text-blue-800">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {tasks.slice(0, 5).map(task => (
                <div
                  key={task.id}
                  className={`px-6 py-4 hover:bg-gray-50 ${
                    task.status === 'in_progress' ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          priorityStyles[task.priority].bg
                        } ${priorityStyles[task.priority].text}`}>
                          {taskTypeLabels[task.type]}
                        </span>
                        {isOverdue(task.dueDate) && (
                          <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded text-xs font-medium">
                            期限超過
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 text-sm font-medium text-gray-900">{task.title}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {task.clientName} ({task.caseNumber})
                      </p>
                    </div>
                    {task.dueDate && (
                      <span className={`text-xs ${
                        isOverdue(task.dueDate) ? 'text-red-600' : 'text-gray-400'
                      }`}>
                        {new Date(task.dueDate).toLocaleDateString('ja-JP')}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 案件一覧 */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">要対応案件</h2>
              <Link href="/staff/cases" className="text-sm text-blue-600 hover:text-blue-800">
                すべて見る →
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {cases.map(caseItem => (
                <Link
                  key={caseItem.id}
                  href={`/staff/cases/${caseItem.id}`}
                  className="block px-6 py-4 hover:bg-gray-50"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">{caseItem.clientName}</span>
                        <span className="text-xs text-gray-400">{caseItem.caseNumber}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {statusLabels[caseItem.status] || caseItem.status}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {caseItem.missingDocuments > 0 && (
                        <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                          未提出 {caseItem.missingDocuments}
                        </span>
                      )}
                      {caseItem.unreadMessages > 0 && (
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">
                          未読 {caseItem.unreadMessages}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* クイックアクション */}
        <div className="mt-6 bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/staff/reminders"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg className="h-8 w-8 text-amber-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="text-sm text-gray-700">リマインド管理</span>
            </Link>
            <Link
              href="/staff/documents"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg className="h-8 w-8 text-blue-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="text-sm text-gray-700">資料確認</span>
            </Link>
            <Link
              href="/staff/messages"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg className="h-8 w-8 text-green-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-sm text-gray-700">依頼者対応</span>
            </Link>
            <Link
              href="/staff/calendar"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <svg className="h-8 w-8 text-purple-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm text-gray-700">スケジュール</span>
            </Link>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex">
            <svg className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-amber-800">
              <p className="font-medium">事務職員の権限について</p>
              <ul className="mt-1 list-disc list-inside text-amber-700">
                <li>依頼者への事務連絡（資料提出リマインド、日程調整など）は直接送信可能です</li>
                <li>法的判断を含む内容は、弁護士の確認が必要です</li>
                <li>債権者・裁判所への送信は弁護士のみ可能です</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
