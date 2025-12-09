/**
 * 受任通知作成画面
 *
 * 債権者への受任通知を作成・送信する
 *
 * 重要（非弁対策）：
 * - 受任通知の送信は弁護士のみ
 * - AIドラフトは弁護士確認後に送信
 * - 送信ゲートで二重チェック
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface Creditor {
  id: string;
  name: string;
  address: string;
  claimAmount: number;
  noticeStatus: 'pending' | 'sent' | 'delivered' | 'returned';
  sentAt?: Date;
}

interface NoticeTemplate {
  subject: string;
  body: string;
}

export default function AcceptanceNoticePage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [selectedCreditors, setSelectedCreditors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [sending, setSending] = useState(false);
  const [generating, setGenerating] = useState(false);

  // モックデータ: 債権者一覧
  const [creditors] = useState<Creditor[]>([
    { id: '1', name: 'アコム株式会社', address: '東京都千代田区丸の内2-1-1', claimAmount: 500000, noticeStatus: 'pending' },
    { id: '2', name: 'プロミス株式会社', address: '東京都千代田区永田町2-11-1', claimAmount: 800000, noticeStatus: 'pending' },
    { id: '3', name: '株式会社レイク', address: '東京都新宿区西新宿1-25-1', claimAmount: 300000, noticeStatus: 'sent', sentAt: new Date('2024-12-01') },
    { id: '4', name: '三井住友カード株式会社', address: '東京都港区海岸1-2-3', claimAmount: 450000, noticeStatus: 'delivered', sentAt: new Date('2024-11-28') },
    { id: '5', name: '楽天カード株式会社', address: '東京都世田谷区玉川1-14-1', claimAmount: 200000, noticeStatus: 'pending' },
  ]);

  // AIドラフトテンプレート
  const [noticeTemplate, setNoticeTemplate] = useState<NoticeTemplate>({
    subject: '受任通知書',
    body: `　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　令和　年　月　日

[債権者名]　御中
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　弁護士法人柳田法律事務所
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　代表弁護士　柳田　太郎
　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　電話 03-XXXX-XXXX

　　　　　　　　　　　　受任通知書

　当職は、下記債務者より委任を受け、債務整理手続の代理人に就任いたしましたので、ご通知申し上げます。

　　　　　　　　　　　　　　　記

１．債務者
　　住所：東京都新宿区西新宿1-1-1
　　氏名：田中　一郎

２．通知事項
　⑴ 今後、本件に関するご連絡は、全て当職宛にお願いいたします。
　⑵ 債務者本人及びその家族への直接の連絡、督促等はお控えください。
　⑶ 債務者の給与その他の財産に対する強制執行はお控えください。

３．債権届出のお願い
　貴社の債務者に対する債権額につきまして、利息制限法に基づく引き直し計算後の
　残債務額をご回答くださいますようお願い申し上げます。

　なお、本通知は自己破産申立を予定してのご連絡であり、今後の手続きについては
　改めてご連絡いたします。

　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　　以上`,
  });

  const [checkedItems, setCheckedItems] = useState({
    contentReviewed: false,
    creditorConfirmed: false,
    lawyerResponsibility: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);
  const pendingCreditors = creditors.filter(c => c.noticeStatus === 'pending');
  const sentCreditors = creditors.filter(c => c.noticeStatus !== 'pending');

  const handleSelectAll = () => {
    if (selectedCreditors.length === pendingCreditors.length) {
      setSelectedCreditors([]);
    } else {
      setSelectedCreditors(pendingCreditors.map(c => c.id));
    }
  };

  const handleSelectCreditor = (id: string) => {
    setSelectedCreditors(prev =>
      prev.includes(id) ? prev.filter(cid => cid !== id) : [...prev, id]
    );
  };

  const handleGenerateDraft = async () => {
    setGenerating(true);
    // TODO: 実際のAI APIを呼び出し
    await new Promise(resolve => setTimeout(resolve, 2000));
    setGenerating(false);
    alert('AIドラフトを生成しました（デモ）');
  };

  const handleSendNotices = async () => {
    if (!allChecked || selectedCreditors.length === 0) return;
    setSending(true);

    try {
      // TODO: 実際のAPIを呼び出し
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 監査ログ記録（実際はAPIで処理）
      console.log('Audit log: Acceptance notices sent', {
        caseId,
        creditorIds: selectedCreditors,
        timestamp: new Date().toISOString(),
        action: 'SEND_ACCEPTANCE_NOTICE',
      });

      alert(`${selectedCreditors.length}件の受任通知を送信しました。`);
      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error('Failed to send:', error);
      alert('送信に失敗しました。');
    } finally {
      setSending(false);
      setShowSendConfirm(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  const getStatusBadge = (status: Creditor['noticeStatus']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">未送信</span>;
      case 'sent':
        return <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">送信済</span>;
      case 'delivered':
        return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">到達確認</span>;
      case 'returned':
        return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded">返送</span>;
    }
  };

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
              <h1 className="text-lg font-bold text-gray-900">受任通知</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGenerateDraft}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 disabled:opacity-50"
              >
                {generating ? 'AI生成中...' : 'AIでドラフト生成'}
              </button>
              <button
                onClick={() => setShowPreview(true)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                プレビュー
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-3 gap-6">
          {/* 債権者一覧 */}
          <div className="col-span-2 space-y-6">
            {/* 未送信の債権者 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-medium text-gray-900">未送信の債権者</h2>
                <button
                  onClick={handleSelectAll}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  {selectedCreditors.length === pendingCreditors.length ? '選択解除' : 'すべて選択'}
                </button>
              </div>

              {pendingCreditors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  すべての債権者に受任通知を送信済みです
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {pendingCreditors.map(creditor => (
                    <div
                      key={creditor.id}
                      className={`px-6 py-4 flex items-center hover:bg-gray-50 cursor-pointer ${
                        selectedCreditors.includes(creditor.id) ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => handleSelectCreditor(creditor.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedCreditors.includes(creditor.id)}
                        onChange={() => {}}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                      <div className="ml-4 flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{creditor.name}</span>
                          {getStatusBadge(creditor.noticeStatus)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{creditor.address}</p>
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(creditor.claimAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 送信済み債権者 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">送信済み</h2>
              </div>

              {sentCreditors.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  まだ送信済みの債権者がいません
                </div>
              ) : (
                <div className="divide-y divide-gray-100">
                  {sentCreditors.map(creditor => (
                    <div key={creditor.id} className="px-6 py-4 flex items-center">
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-gray-900">{creditor.name}</span>
                          {getStatusBadge(creditor.noticeStatus)}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          送信日: {creditor.sentAt?.toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <span className="text-sm font-medium text-gray-900">
                          {formatCurrency(creditor.claimAmount)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 選択中のサマリー */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">選択中の債権者</h3>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">件数</span>
                  <span className="font-medium text-gray-900">{selectedCreditors.length}件</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">合計債権額</span>
                  <span className="font-medium text-gray-900">
                    {formatCurrency(
                      creditors
                        .filter(c => selectedCreditors.includes(c.id))
                        .reduce((sum, c) => sum + c.claimAmount, 0)
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* 送信前確認 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">送信前確認</h3>
              <div className="space-y-3">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedItems.contentReviewed}
                    onChange={e => setCheckedItems({ ...checkedItems, contentReviewed: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    通知内容を確認しました
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedItems.creditorConfirmed}
                    onChange={e => setCheckedItems({ ...checkedItems, creditorConfirmed: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    債権者情報を確認しました
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedItems.lawyerResponsibility}
                    onChange={e => setCheckedItems({ ...checkedItems, lawyerResponsibility: e.target.checked })}
                    className="h-4 w-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    弁護士として責任を持ちます
                  </span>
                </label>
              </div>

              <button
                onClick={() => setShowSendConfirm(true)}
                disabled={!allChecked || selectedCreditors.length === 0}
                className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                受任通知を送信（{selectedCreditors.length}件）
              </button>

              <p className="mt-3 text-xs text-gray-500">
                送信は弁護士のみ実行可能です
              </p>
            </div>

            {/* 送信方法 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">送信方法</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="method" value="fax" defaultChecked className="h-4 w-4 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">FAX</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="method" value="mail" className="h-4 w-4 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">郵送（書留）</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="method" value="email" className="h-4 w-4 text-blue-600" />
                  <span className="ml-2 text-sm text-gray-700">メール</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* プレビューモーダル */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">受任通知プレビュー</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="bg-gray-50 rounded-lg p-6 mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>AIドラフト</strong> - 弁護士確認後に送信されます
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-8 font-mono text-sm whitespace-pre-wrap">
                {noticeTemplate.body}
              </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowPreview(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                編集に戻る
              </button>
              <button
                onClick={() => {
                  setShowPreview(false);
                  setShowSendConfirm(true);
                }}
                disabled={selectedCreditors.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                送信に進む
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 送信確認モーダル */}
      {showSendConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">受任通知の送信</h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>送信ゲート確認</strong><br />
                {selectedCreditors.length}件の債権者に受任通知を送信します。
                この操作は取り消しできません。
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-blue-800">
                <strong>弁護士確認</strong><br />
                弁護士として通知内容に責任を持ち、送信を実行します。
              </p>
            </div>

            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-900 mb-2">送信先:</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                {creditors
                  .filter(c => selectedCreditors.includes(c.id))
                  .map(c => (
                    <li key={c.id}>・{c.name}</li>
                  ))}
              </ul>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSendConfirm(false)}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSendNotices}
                disabled={sending || !allChecked}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {sending ? '送信中...' : '送信する'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
