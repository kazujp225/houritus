/**
 * 利益相反チェック画面（弁護士専用）
 *
 * 弁護士が新規案件の利益相反をチェックし、受任可否を判断する
 *
 * 重要：
 * - 利益相反チェックは弁護士のみが実行可能
 * - 受任可否の最終判断は弁護士が行う
 * - 自動照合結果は参考情報として表示
 */

'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';

interface ConflictCheckData {
  caseId: string;
  caseNumber: string;
  clientName: string;
  creditorNames: string[];
  autoCheckResults: {
    hasConflicts: boolean;
    potentialConflicts: Array<{
      type: 'client_duplicate' | 'creditor_match' | 'similar_name';
      caseId: string;
      caseNumber: string;
      matchedName: string;
      details: string;
    }>;
  };
}

export default function ConflictCheckPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const [data, setData] = useState<ConflictCheckData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [decision, setDecision] = useState<'APPROVED' | 'REJECTED' | null>(null);
  const [reason, setReason] = useState('');
  const [confirmChecked, setConfirmChecked] = useState(false);

  useEffect(() => {
    fetchConflictCheckData();
  }, [caseId]);

  const fetchConflictCheckData = async () => {
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/cases/${caseId}/conflict-check`);
      // const result = await response.json();

      // モックデータ
      setData({
        caseId,
        caseNumber: '2024-0003',
        clientName: '鈴木 次郎',
        creditorNames: ['アコム株式会社', 'プロミス株式会社', '楽天カード'],
        autoCheckResults: {
          hasConflicts: true,
          potentialConflicts: [
            {
              type: 'creditor_match',
              caseId: 'case-1',
              caseNumber: '2024-0001',
              matchedName: 'アコム株式会社',
              details: '同じ債権者「アコム株式会社」が他案件に存在します',
            },
          ],
        },
      });
    } catch (error) {
      console.error('Failed to fetch conflict check data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!decision) {
      alert('判断を選択してください');
      return;
    }

    if (!reason.trim()) {
      alert('理由を入力してください');
      return;
    }

    if (!confirmChecked) {
      alert('確認チェックボックスにチェックを入れてください');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/conflict-check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          decision,
          reason,
        }),
      });

      if (response.ok) {
        router.push(`/cases/${caseId}`);
      } else {
        const error = await response.json();
        alert(error.error || '送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to submit conflict check:', error);
      alert('送信に失敗しました');
    } finally {
      setSubmitting(false);
    }
  };

  const conflictTypeLabels: Record<string, { label: string; severity: 'high' | 'medium' | 'low' }> = {
    client_duplicate: { label: '依頼者重複', severity: 'high' },
    creditor_match: { label: '債権者一致', severity: 'medium' },
    similar_name: { label: '類似名称', severity: 'low' },
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

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">データが見つかりません</p>
          <Link href="/cases" className="mt-4 text-blue-600 hover:text-blue-800">
            案件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/dashboard" className="text-gray-500 hover:text-gray-700">
                ダッシュボード
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/cases" className="text-gray-500 hover:text-gray-700">
                案件一覧
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/cases/${caseId}`} className="text-gray-500 hover:text-gray-700">
                {data.caseNumber}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">利益相反チェック</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            利益相反チェック
          </h1>
          <p className="text-sm text-gray-500">
            案件番号: {data.caseNumber} | 依頼者: {data.clientName}
          </p>
        </div>

        {/* 案件情報 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">案件情報</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">依頼者名</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.clientName}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">債権者数</dt>
                <dd className="mt-1 text-sm text-gray-900">{data.creditorNames.length}社</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">債権者一覧</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <ul className="list-disc list-inside space-y-1">
                    {data.creditorNames.map((name, index) => (
                      <li key={index}>{name}</li>
                    ))}
                  </ul>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 自動照合結果 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">自動照合結果</h2>
          </div>
          <div className="px-6 py-4">
            {data.autoCheckResults.hasConflicts ? (
              <div>
                <div className="flex items-center mb-4">
                  <svg className="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-amber-700 font-medium">
                    確認が必要な項目があります
                  </span>
                </div>
                <div className="space-y-3">
                  {data.autoCheckResults.potentialConflicts.map((conflict, index) => {
                    const typeInfo = conflictTypeLabels[conflict.type] || { label: conflict.type, severity: 'low' };
                    const severityColors = {
                      high: 'bg-red-50 border-red-200 text-red-800',
                      medium: 'bg-amber-50 border-amber-200 text-amber-800',
                      low: 'bg-blue-50 border-blue-200 text-blue-800',
                    };

                    return (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 ${severityColors[typeInfo.severity]}`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-medium">{typeInfo.label}</div>
                            <p className="mt-1 text-sm">{conflict.details}</p>
                            <p className="mt-2 text-xs">
                              関連案件: {conflict.caseNumber}
                            </p>
                          </div>
                          <Link
                            href={`/cases/${conflict.caseId}`}
                            className="text-sm underline hover:no-underline"
                            target="_blank"
                          >
                            案件を確認
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex items-center text-green-700">
                <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>自動照合では利益相反は検出されませんでした</span>
              </div>
            )}
            <p className="mt-4 text-xs text-gray-500">
              ※ 自動照合結果は参考情報です。最終的な判断は弁護士が行ってください。
            </p>
          </div>
        </div>

        {/* 判断フォーム */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">弁護士による判断</h2>
          </div>
          <div className="px-6 py-4 space-y-6">
            {/* 判断選択 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                受任可否の判断 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDecision('APPROVED')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    decision === 'APPROVED'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="font-medium">受任可</div>
                  <p className="mt-1 text-xs text-gray-500">利益相反なし</p>
                </button>
                <button
                  type="button"
                  onClick={() => setDecision('REJECTED')}
                  className={`p-4 border-2 rounded-lg text-center transition-colors ${
                    decision === 'REJECTED'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <svg className="h-8 w-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="font-medium">受任不可</div>
                  <p className="mt-1 text-xs text-gray-500">利益相反あり</p>
                </button>
              </div>
            </div>

            {/* 理由 */}
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                判断理由 <span className="text-red-500">*</span>
              </label>
              <textarea
                id="reason"
                rows={4}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="判断理由を入力してください..."
              />
            </div>

            {/* 確認チェックボックス */}
            <div className="bg-gray-50 rounded-lg p-4">
              <label className="flex items-start">
                <input
                  type="checkbox"
                  checked={confirmChecked}
                  onChange={(e) => setConfirmChecked(e.target.checked)}
                  className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-3 text-sm text-gray-700">
                  弁護士として、上記の自動照合結果を確認し、利益相反の有無について責任を持って判断しました。
                </span>
              </label>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <Link
              href={`/cases/${caseId}`}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              キャンセル
            </Link>
            <button
              type="submit"
              disabled={submitting || !decision || !reason.trim() || !confirmChecked}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? '送信中...' : '判断を確定'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
