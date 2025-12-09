/**
 * 委任契約画面
 *
 * 依頼者との委任契約を管理・締結する
 *
 * 重要（非弁対策）：
 * - 契約主体は弁護士法人
 * - 契約書の承認・送信は弁護士のみ
 * - ZettAIはシステム提供者として記載
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface ContractData {
  clientName: string;
  clientAddress: string;
  scope: string[];
  fees: {
    type: string;
    amount: number;
    description: string;
  }[];
  paymentMethod: string;
  createdAt: Date;
  status: 'draft' | 'pending_client' | 'signed' | 'cancelled';
  signedAt?: Date;
}

export default function ContractPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [activeTab, setActiveTab] = useState<'create' | 'preview' | 'history'>('create');
  const [sending, setSending] = useState(false);
  const [confirmSend, setConfirmSend] = useState(false);

  // モックデータ
  const [contractData] = useState<ContractData>({
    clientName: '田中 一郎',
    clientAddress: '東京都新宿区西新宿1-1-1',
    scope: ['自己破産申立手続の代理', '債権者への受任通知発送', '裁判所への書類提出'],
    fees: [
      { type: '着手金', amount: 330000, description: '契約締結時' },
      { type: '報酬金', amount: 220000, description: '免責許可決定時' },
      { type: '実費', amount: 30000, description: '印紙代・郵便代等' },
    ],
    paymentMethod: '分割払い（月額55,000円×6回）',
    createdAt: new Date(),
    status: 'draft',
  });

  const [checkedItems, setCheckedItems] = useState({
    contentReviewed: false,
    feeExplained: false,
    clientConsent: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);

  const handleSendContract = async () => {
    if (!allChecked) return;
    setSending(true);

    try {
      // TODO: 実際のAPIを呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('委任契約書を依頼者に送信しました。');
      router.push(`/cases/${caseId}`);
    } catch (error) {
      console.error('Failed to send:', error);
      alert('送信に失敗しました。');
    } finally {
      setSending(false);
      setConfirmSend(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ja-JP', {
      style: 'currency',
      currency: 'JPY',
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/cases/${caseId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 案件詳細
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">委任契約</h1>
            </div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                案件ID: {caseId}
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'create', label: '契約書作成' },
                { id: 'preview', label: 'プレビュー' },
                { id: 'history', label: '契約履歴' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'create' | 'preview' | 'history')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {activeTab === 'create' && (
          <div className="grid grid-cols-3 gap-6">
            {/* 契約内容 */}
            <div className="col-span-2 space-y-6">
              {/* 依頼者情報 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">依頼者情報</h2>
                <dl className="space-y-3">
                  <div className="flex">
                    <dt className="w-32 text-sm text-gray-500">氏名</dt>
                    <dd className="flex-1 text-sm text-gray-900">{contractData.clientName}</dd>
                  </div>
                  <div className="flex">
                    <dt className="w-32 text-sm text-gray-500">住所</dt>
                    <dd className="flex-1 text-sm text-gray-900">{contractData.clientAddress}</dd>
                  </div>
                </dl>
              </div>

              {/* 委任範囲 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">委任事項</h2>
                <ul className="space-y-2">
                  {contractData.scope.map((item, i) => (
                    <li key={i} className="flex items-start">
                      <svg className="h-5 w-5 text-green-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-sm text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* 報酬 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">弁護士報酬</h2>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left text-sm font-medium text-gray-500 pb-2">項目</th>
                      <th className="text-right text-sm font-medium text-gray-500 pb-2">金額</th>
                      <th className="text-left text-sm font-medium text-gray-500 pb-2 pl-4">備考</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {contractData.fees.map((fee, i) => (
                      <tr key={i}>
                        <td className="py-3 text-sm text-gray-900">{fee.type}</td>
                        <td className="py-3 text-sm text-gray-900 text-right">{formatCurrency(fee.amount)}</td>
                        <td className="py-3 text-sm text-gray-500 pl-4">{fee.description}</td>
                      </tr>
                    ))}
                    <tr className="bg-gray-50">
                      <td className="py-3 text-sm font-medium text-gray-900">合計</td>
                      <td className="py-3 text-sm font-bold text-gray-900 text-right">
                        {formatCurrency(contractData.fees.reduce((sum, f) => sum + f.amount, 0))}
                      </td>
                      <td className="py-3 text-sm text-gray-500 pl-4">（税込）</td>
                    </tr>
                  </tbody>
                </table>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex">
                    <span className="w-32 text-sm text-gray-500">支払方法</span>
                    <span className="flex-1 text-sm text-gray-900">{contractData.paymentMethod}</span>
                  </div>
                </div>
              </div>

              {/* 契約条項 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">契約条項（抜粋）</h2>
                <div className="prose prose-sm text-gray-600 max-w-none">
                  <p><strong>第1条（委任事項）</strong></p>
                  <p>委任者は、受任者に対し、上記委任事項に関する法律事務を委任し、受任者はこれを受任する。</p>

                  <p className="mt-4"><strong>第2条（報酬）</strong></p>
                  <p>委任者は、受任者に対し、上記報酬表に定める弁護士報酬を支払う。</p>

                  <p className="mt-4"><strong>第3条（実費）</strong></p>
                  <p>委任事務処理に必要な実費（印紙代、郵便代、交通費等）は、委任者の負担とする。</p>

                  <p className="mt-4"><strong>第4条（秘密保持）</strong></p>
                  <p>受任者は、委任事務に関して知り得た委任者の秘密を正当な理由なく第三者に漏らさない。</p>

                  <p className="mt-4 text-xs text-gray-400">
                    ※ 完全な契約書はプレビュータブでご確認ください
                  </p>
                </div>
              </div>
            </div>

            {/* サイドバー */}
            <div className="space-y-6">
              {/* ステータス */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">契約ステータス</h3>
                <div className="flex items-center">
                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                    ドラフト
                  </span>
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
                      契約内容を確認しました
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={checkedItems.feeExplained}
                      onChange={e => setCheckedItems({ ...checkedItems, feeExplained: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded mt-0.5"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      報酬について説明済みです
                    </span>
                  </label>
                  <label className="flex items-start">
                    <input
                      type="checkbox"
                      checked={checkedItems.clientConsent}
                      onChange={e => setCheckedItems({ ...checkedItems, clientConsent: e.target.checked })}
                      className="h-4 w-4 text-blue-600 rounded mt-0.5"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      依頼者の同意を得ています
                    </span>
                  </label>
                </div>

                <button
                  onClick={() => setConfirmSend(true)}
                  disabled={!allChecked}
                  className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  契約書を送信
                </button>

                <p className="mt-3 text-xs text-gray-500">
                  送信は弁護士のみ実行可能です
                </p>
              </div>

              {/* 関連操作 */}
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">関連操作</h3>
                <div className="space-y-2">
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    契約書をダウンロード
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">
                    テンプレートを編集
                  </button>
                  <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">
                    契約を破棄
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'preview' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-8 max-w-3xl mx-auto">
              {/* 契約書プレビュー */}
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900">委任契約書</h1>
              </div>

              <div className="prose prose-sm max-w-none">
                <p className="text-center mb-8">
                  {contractData.clientName}（以下「委任者」という。）と弁護士法人柳田法律事務所（以下「受任者」という。）とは、
                  次のとおり委任契約を締結する。
                </p>

                <h3>第1条（委任事項）</h3>
                <p>委任者は、受任者に対し、下記の法律事務を委任し、受任者はこれを受任する。</p>
                <ul>
                  {contractData.scope.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>

                <h3>第2条（弁護士報酬）</h3>
                <p>委任者は、受任者に対し、次の弁護士報酬を支払う。</p>
                <table className="w-full border-collapse border border-gray-300 my-4">
                  <tbody>
                    {contractData.fees.map((fee, i) => (
                      <tr key={i}>
                        <td className="border border-gray-300 px-4 py-2">{fee.type}</td>
                        <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(fee.amount)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <h3>第3条（支払方法）</h3>
                <p>{contractData.paymentMethod}</p>

                <h3>第4条（実費）</h3>
                <p>
                  委任事務処理に必要な実費（印紙代、郵便代、交通費、コピー代等）は、委任者の負担とし、
                  受任者は委任者に対し随時請求することができる。
                </p>

                <h3>第5条（報告義務）</h3>
                <p>
                  受任者は、委任者に対し、委任事務の処理状況について、適宜報告するものとする。
                </p>

                <h3>第6条（秘密保持）</h3>
                <p>
                  受任者は、委任事務に関して知り得た委任者の秘密を、正当な理由なく第三者に漏らさないものとする。
                </p>

                <h3>第7条（契約の解除）</h3>
                <p>
                  委任者及び受任者は、いつでも本契約を解除することができる。ただし、解除の時期が相手方に不利な時期であるときは、
                  やむを得ない事由がある場合を除き、相手方の損害を賠償しなければならない。
                </p>

                <h3>第8条（AIシステムの利用）</h3>
                <p>
                  委任者は、受任者が委任事務の処理において、書類作成支援等のためにAIシステム（ZettAI）を利用することに同意する。
                  ただし、法的判断及び最終的な意思決定は受任者が行うものとする。
                </p>

                <div className="mt-12 text-center">
                  <p>以上、本契約成立の証として、本書を2通作成し、各自記名押印のうえ、各1通を保有する。</p>

                  <p className="mt-8">令和　　年　　月　　日</p>

                  <div className="mt-8 flex justify-between">
                    <div className="text-left">
                      <p>【委任者】</p>
                      <p className="mt-4">住所：{contractData.clientAddress}</p>
                      <p className="mt-2">氏名：{contractData.clientName}　　　　印</p>
                    </div>
                    <div className="text-left">
                      <p>【受任者】</p>
                      <p className="mt-4">住所：東京都中央区○○1-2-3</p>
                      <p className="mt-2">弁護士法人柳田法律事務所</p>
                      <p className="mt-2">代表弁護士　柳田　太郎　　　印</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">契約履歴</h2>
            <div className="text-center py-12 text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="mt-4">まだ契約履歴がありません</p>
            </div>
          </div>
        )}
      </main>

      {/* 送信確認モーダル */}
      {confirmSend && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">委任契約書の送信</h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>確認事項</strong><br />
                この操作により、{contractData.clientName}様に委任契約書が送信されます。
                送信後は取り消しできません。
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>送信ゲート</strong><br />
                弁護士として契約書の内容に責任を持ち送信します。
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmSend(false)}
                disabled={sending}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={handleSendContract}
                disabled={sending}
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
