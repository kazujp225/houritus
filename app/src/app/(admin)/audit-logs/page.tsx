/**
 * 監査ログ閲覧画面（管理者・弁護士用）
 *
 * 全操作の監査ログを閲覧する
 *
 * 重要：
 * - 全操作を記録、改ざん防止
 * - 誰が、いつ、どの案件を、どう操作したかを全保存
 * - オート承認検知のためのアラート表示
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string | null;
  userName: string | null;
  role: string | null;
  action: string;
  resourceType: string;
  resourceId: string | null;
  caseId: string | null;
  caseNumber: string | null;
  ipAddress: string;
  result: string;
  details: Record<string, unknown> | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface QuickApprovalAlert {
  userId: string;
  userName: string;
  count: number;
}

const actionLabels: Record<string, { label: string; color: string }> = {
  AUTH_LOGIN: { label: 'ログイン', color: 'bg-green-100 text-green-800' },
  AUTH_LOGOUT: { label: 'ログアウト', color: 'bg-gray-100 text-gray-800' },
  AUTH_MFA_VERIFY: { label: 'MFA認証', color: 'bg-blue-100 text-blue-800' },
  AUTH_LOGIN_FAILED: { label: 'ログイン失敗', color: 'bg-red-100 text-red-800' },
  CASE_VIEW: { label: '案件閲覧', color: 'bg-gray-100 text-gray-800' },
  CASE_CREATE: { label: '案件作成', color: 'bg-blue-100 text-blue-800' },
  CASE_UPDATE: { label: '案件更新', color: 'bg-blue-100 text-blue-800' },
  CASE_CONFLICT_CHECK: { label: '利益相反チェック', color: 'bg-purple-100 text-purple-800' },
  CASE_RETAIN: { label: '受任', color: 'bg-green-100 text-green-800' },
  DRAFT_VIEW: { label: 'ドラフト閲覧', color: 'bg-gray-100 text-gray-800' },
  DRAFT_APPROVE: { label: 'ドラフト承認', color: 'bg-green-100 text-green-800' },
  DRAFT_MODIFY: { label: 'ドラフト修正', color: 'bg-blue-100 text-blue-800' },
  DRAFT_REJECT: { label: 'ドラフト差戻し', color: 'bg-red-100 text-red-800' },
  SEND_EXECUTE: { label: '対外送信', color: 'bg-amber-100 text-amber-800' },
  DOCUMENT_UPLOAD: { label: '書類アップロード', color: 'bg-blue-100 text-blue-800' },
  DOCUMENT_DOWNLOAD: { label: '書類ダウンロード', color: 'bg-gray-100 text-gray-800' },
  DOCUMENT_DELETE: { label: '書類削除', color: 'bg-red-100 text-red-800' },
  MESSAGE_SEND: { label: 'メッセージ送信', color: 'bg-blue-100 text-blue-800' },
  USER_CREATE: { label: 'ユーザー作成', color: 'bg-green-100 text-green-800' },
  USER_UPDATE: { label: 'ユーザー更新', color: 'bg-blue-100 text-blue-800' },
  USER_DELETE: { label: 'ユーザー削除', color: 'bg-red-100 text-red-800' },
  PERMISSION_DENIED: { label: '権限拒否', color: 'bg-red-100 text-red-800' },
};

const resultLabels: Record<string, { label: string; color: string }> = {
  SUCCESS: { label: '成功', color: 'text-green-600' },
  FAILURE: { label: '失敗', color: 'text-red-600' },
  DENIED: { label: '拒否', color: 'text-amber-600' },
};

const roleLabels: Record<string, string> = {
  LAWYER: '弁護士',
  STAFF: '事務職員',
  CLIENT: '依頼者',
  TECH_SUPPORT: '技術サポート',
  ADMIN: '管理者',
};

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [userFilter, setUserFilter] = useState('');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '',
    end: '',
  });
  const [quickApprovalAlerts, setQuickApprovalAlerts] = useState<QuickApprovalAlert[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  useEffect(() => {
    fetchLogs();
    fetchQuickApprovalAlerts();
  }, [pagination.page, actionFilter, userFilter, dateRange]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/audit-logs?page=${pagination.page}&action=${actionFilter}&user=${userFilter}`);
      // const data = await response.json();

      // モックデータ
      const mockLogs: AuditLog[] = [
        {
          id: '1',
          timestamp: new Date().toISOString(),
          userId: 'u1',
          userName: '柳田 一郎',
          role: 'LAWYER',
          action: 'DRAFT_APPROVE',
          resourceType: 'draft',
          resourceId: 'd1',
          caseId: 'c1',
          caseNumber: '2024-0001',
          ipAddress: '192.168.1.100',
          result: 'SUCCESS',
          details: { reviewTimeSeconds: 45, flagsAcknowledged: true },
        },
        {
          id: '2',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          userId: 'u1',
          userName: '柳田 一郎',
          role: 'LAWYER',
          action: 'SEND_EXECUTE',
          resourceType: 'external_send',
          resourceId: 's1',
          caseId: 'c1',
          caseNumber: '2024-0001',
          ipAddress: '192.168.1.100',
          result: 'SUCCESS',
          details: { sendType: 'RETENTION_NOTICE', recipientName: 'アコム株式会社' },
        },
        {
          id: '3',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          userId: 'u2',
          userName: '田中 花子',
          role: 'STAFF',
          action: 'SEND_EXECUTE',
          resourceType: 'external_send',
          resourceId: null,
          caseId: 'c1',
          caseNumber: '2024-0001',
          ipAddress: '192.168.1.101',
          result: 'DENIED',
          details: { attemptedAction: 'send:RETENTION_NOTICE' },
        },
        {
          id: '4',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          userId: 'u3',
          userName: '山田 太郎',
          role: 'CLIENT',
          action: 'DOCUMENT_UPLOAD',
          resourceType: 'document',
          resourceId: 'doc1',
          caseId: 'c1',
          caseNumber: '2024-0001',
          ipAddress: '203.0.113.50',
          result: 'SUCCESS',
          details: { documentType: 'PASSBOOK', fileName: '通帳_みずほ銀行.pdf' },
        },
        {
          id: '5',
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
          userId: 'u1',
          userName: '柳田 一郎',
          role: 'LAWYER',
          action: 'CASE_CONFLICT_CHECK',
          resourceType: 'case',
          resourceId: 'c2',
          caseId: 'c2',
          caseNumber: '2024-0003',
          ipAddress: '192.168.1.100',
          result: 'SUCCESS',
          details: { decision: 'APPROVED', reason: '利益相反なし' },
        },
        {
          id: '6',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          userId: 'u1',
          userName: '柳田 一郎',
          role: 'LAWYER',
          action: 'AUTH_LOGIN',
          resourceType: 'auth',
          resourceId: null,
          caseId: null,
          caseNumber: null,
          ipAddress: '192.168.1.100',
          result: 'SUCCESS',
          details: { mfaUsed: true },
        },
      ];

      setLogs(mockLogs);
      setPagination(prev => ({ ...prev, total: 100, totalPages: 2 }));
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuickApprovalAlerts = async () => {
    // TODO: 実際のAPIから取得
    // const response = await fetch('/api/audit-logs/quick-approvals');
    // const data = await response.json();

    // モックデータ（アラートなし）
    setQuickApprovalAlerts([]);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">監査ログ</h1>
          <p className="mt-1 text-sm text-gray-500">
            システム内の全操作記録を確認できます
          </p>
        </div>

        {/* オート承認アラート */}
        {quickApprovalAlerts.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  オート承認の疑いがあります
                </h3>
                <div className="mt-2 text-sm text-red-700">
                  <ul className="list-disc list-inside space-y-1">
                    {quickApprovalAlerts.map(alert => (
                      <li key={alert.userId}>
                        {alert.userName}: 過去24時間で {alert.count} 件の高速承認（5秒以内）
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">アクション</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">すべて</option>
                {Object.entries(actionLabels).map(([key, { label }]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ユーザー</label>
              <input
                type="text"
                value={userFilter}
                onChange={(e) => setUserFilter(e.target.value)}
                placeholder="ユーザー名で検索..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">開始日</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">終了日</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* ログテーブル */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">読み込み中...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">日時</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ユーザー</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">アクション</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">案件</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">結果</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">IP</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">詳細</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {logs.map(log => {
                    const actionStyle = actionLabels[log.action] || { label: log.action, color: 'bg-gray-100 text-gray-800' };
                    const resultStyle = resultLabels[log.result] || { label: log.result, color: 'text-gray-600' };

                    return (
                      <tr key={log.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {formatTimestamp(log.timestamp)}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.userName || '-'}</div>
                          <div className="text-xs text-gray-500">{log.role ? roleLabels[log.role] : '-'}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionStyle.color}`}>
                            {actionStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {log.caseNumber ? (
                            <Link href={`/cases/${log.caseId}`} className="text-blue-600 hover:text-blue-800">
                              {log.caseNumber}
                            </Link>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`text-sm font-medium ${resultStyle.color}`}>
                            {resultStyle.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {log.ipAddress}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-right">
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="text-sm text-blue-600 hover:text-blue-800"
                          >
                            詳細
                          </button>
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
            <div className="bg-white px-4 py-3 border-t border-gray-200">
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

        {/* 詳細モーダル */}
        {selectedLog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">監査ログ詳細</h3>
                <button
                  onClick={() => setSelectedLog(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">日時</dt>
                      <dd className="mt-1 text-sm text-gray-900">{formatTimestamp(selectedLog.timestamp)}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">アクション</dt>
                      <dd className="mt-1">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${actionLabels[selectedLog.action]?.color || 'bg-gray-100 text-gray-800'}`}>
                          {actionLabels[selectedLog.action]?.label || selectedLog.action}
                        </span>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ユーザー</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedLog.userName || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">ロール</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedLog.role ? roleLabels[selectedLog.role] : '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">リソース種別</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedLog.resourceType}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">リソースID</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono text-xs">{selectedLog.resourceId || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">案件番号</dt>
                      <dd className="mt-1 text-sm text-gray-900">{selectedLog.caseNumber || '-'}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">IPアドレス</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-mono">{selectedLog.ipAddress}</dd>
                    </div>
                  </div>
                  {selectedLog.details && Object.keys(selectedLog.details).length > 0 && (
                    <div>
                      <dt className="text-sm font-medium text-gray-500 mb-2">詳細情報</dt>
                      <dd className="bg-gray-50 rounded-lg p-3">
                        <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                          {JSON.stringify(selectedLog.details, null, 2)}
                        </pre>
                      </dd>
                    </div>
                  )}
                </dl>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
