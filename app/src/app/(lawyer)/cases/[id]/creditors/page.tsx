/**
 * 債権者一覧管理画面
 *
 * 案件に紐づく債権者の情報を管理
 * - 債権者情報の追加・編集
 * - 債権額の管理
 * - 受任通知・債権調査票の送付状況
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Creditor {
  id: string;
  name: string;
  type: 'consumer_finance' | 'bank' | 'credit_card' | 'other';
  claimAmount: number;
  recalculatedAmount?: number;
  address: string;
  phone?: string;
  fax?: string;
  contactPerson?: string;
  acceptanceNoticeStatus: 'pending' | 'sent' | 'delivered' | 'returned';
  acceptanceNoticeSentAt?: Date;
  creditReportStatus: 'pending' | 'requested' | 'received';
  creditReportReceivedAt?: Date;
  notes?: string;
}

export default function CreditorsPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'sent'>('all');

  // モックデータ
  const [creditors] = useState<Creditor[]>([
    {
      id: '1',
      name: 'アコム株式会社',
      type: 'consumer_finance',
      claimAmount: 500000,
      recalculatedAmount: 420000,
      address: '東京都千代田区丸の内2-1-1',
      phone: '03-1234-5678',
      fax: '03-1234-5679',
      acceptanceNoticeStatus: 'delivered',
      acceptanceNoticeSentAt: new Date('2024-12-01'),
      creditReportStatus: 'received',
      creditReportReceivedAt: new Date('2024-12-05'),
    },
    {
      id: '2',
      name: 'プロミス株式会社',
      type: 'consumer_finance',
      claimAmount: 800000,
      recalculatedAmount: 750000,
      address: '東京都千代田区永田町2-11-1',
      phone: '03-2345-6789',
      acceptanceNoticeStatus: 'sent',
      acceptanceNoticeSentAt: new Date('2024-12-03'),
      creditReportStatus: 'requested',
    },
    {
      id: '3',
      name: '三井住友カード株式会社',
      type: 'credit_card',
      claimAmount: 450000,
      address: '東京都港区海岸1-2-3',
      phone: '03-3456-7890',
      acceptanceNoticeStatus: 'pending',
      creditReportStatus: 'pending',
    },
    {
      id: '4',
      name: '楽天カード株式会社',
      type: 'credit_card',
      claimAmount: 200000,
      address: '東京都世田谷区玉川1-14-1',
      acceptanceNoticeStatus: 'pending',
      creditReportStatus: 'pending',
    },
    {
      id: '5',
      name: '三菱UFJ銀行',
      type: 'bank',
      claimAmount: 1500000,
      address: '東京都千代田区丸の内2-7-1',
      acceptanceNoticeStatus: 'pending',
      creditReportStatus: 'pending',
      notes: 'カードローン',
    },
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getTypeLabel = (type: Creditor['type']) => {
    switch (type) {
      case 'consumer_finance':
        return '消費者金融';
      case 'bank':
        return '銀行';
      case 'credit_card':
        return 'クレジットカード';
      case 'other':
        return 'その他';
    }
  };

  const getStatusBadge = (status: string, type: 'notice' | 'report') => {
    if (type === 'notice') {
      switch (status) {
        case 'pending':
          return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">未送信</span>;
        case 'sent':
          return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">送信済</span>;
        case 'delivered':
          return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">到達</span>;
        case 'returned':
          return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded">返送</span>;
      }
    } else {
      switch (status) {
        case 'pending':
          return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded">未依頼</span>;
        case 'requested':
          return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs rounded">依頼中</span>;
        case 'received':
          return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded">受領済</span>;
      }
    }
  };

  const filteredCreditors = creditors.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'pending') return c.acceptanceNoticeStatus === 'pending';
    if (filter === 'sent') return c.acceptanceNoticeStatus !== 'pending';
    return true;
  });

  const totalClaimAmount = creditors.reduce((sum, c) => sum + c.claimAmount, 0);
  const totalRecalculated = creditors.reduce((sum, c) => sum + (c.recalculatedAmount || c.claimAmount), 0);
  const pendingNoticeCount = creditors.filter(c => c.acceptanceNoticeStatus === 'pending').length;
  const pendingReportCount = creditors.filter(c => c.creditReportStatus !== 'received').length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/cases/${caseId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 案件詳細
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">債権者一覧</h1>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              + 債権者を追加
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* サマリーカード */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">債権者数</p>
            <p className="text-2xl font-bold text-gray-900">{creditors.length}社</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">債権総額（申告）</p>
            <p className="text-2xl font-bold text-gray-900">{formatCurrency(totalClaimAmount)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">債権総額（引き直し後）</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalRecalculated)}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">要対応</p>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-bold text-amber-600">{pendingNoticeCount + pendingReportCount}</span>
              <span className="text-sm text-gray-500">件</span>
            </div>
          </div>
        </div>

        {/* フィルター & アクション */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">フィルター:</span>
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'すべて' },
                  { value: 'pending', label: '未送信' },
                  { value: 'sent', label: '送信済' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as 'all' | 'pending' | 'sent')}
                    className={`px-3 py-1 text-sm rounded-full ${
                      filter === f.value
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Link
                href={`/cases/${caseId}/acceptance-notice`}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                受任通知を送信
              </Link>
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                CSVエクスポート
              </button>
            </div>
          </div>

          {/* テーブル */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-6 py-3">債権者</th>
                  <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">種別</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">債権額</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">引き直し後</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">受任通知</th>
                  <th className="text-center text-xs font-medium text-gray-500 uppercase px-4 py-3">債権調査</th>
                  <th className="text-right text-xs font-medium text-gray-500 uppercase px-4 py-3">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCreditors.map(creditor => (
                  <tr key={creditor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-medium text-gray-900">{creditor.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">{creditor.address}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600">{getTypeLabel(creditor.type)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className="text-sm text-gray-900">{formatCurrency(creditor.claimAmount)}</span>
                    </td>
                    <td className="px-4 py-4 text-right">
                      {creditor.recalculatedAmount ? (
                        <span className="text-sm font-medium text-blue-600">
                          {formatCurrency(creditor.recalculatedAmount)}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(creditor.acceptanceNoticeStatus, 'notice')}
                    </td>
                    <td className="px-4 py-4 text-center">
                      {getStatusBadge(creditor.creditReportStatus, 'report')}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <button
                        onClick={() => setShowEditModal(creditor.id)}
                        className="text-sm text-blue-600 hover:text-blue-800"
                      >
                        編集
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 備考 */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            <strong>引き直し計算について</strong><br />
            利息制限法に基づく引き直し計算は、各債権者から取引履歴を取得後に行います。
            計算結果は弁護士の確認後に更新されます。
          </p>
        </div>
      </main>

      {/* 追加モーダル */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">債権者を追加</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  債権者名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="株式会社○○"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">種別</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="consumer_finance">消費者金融</option>
                  <option value="credit_card">クレジットカード</option>
                  <option value="bank">銀行</option>
                  <option value="other">その他</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  債権額（申告） <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="500000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  住所 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  placeholder="東京都千代田区..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="03-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">FAX</label>
                  <input
                    type="tel"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="03-1234-5679"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="カードローン、ショッピングなど"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  追加
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 編集モーダル（簡易版） */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">債権者を編集</h3>
            <p className="text-sm text-gray-500 mb-6">
              債権者ID: {showEditModal}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowEditModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                閉じる
              </button>
              <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
