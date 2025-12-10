/**
 * 案件詳細画面（弁護士用）
 *
 * 弁護士が案件の全情報を確認し、各種アクションを実行する
 *
 * 重要：
 * - AIドラフトは弁護士用レビュー画面のみに表示
 * - 法的判断は弁護士が最終決定
 * - 対外送信は弁護士のみ実行可能
 */

'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';

interface CaseDetail {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  conflictCheckStatus: string;
  conflictCheckAt: string | null;
  conflictCheckReason: string | null;
  retentionStartedAt: string | null;
  filedAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
  };
  lawyer: {
    id: string;
    name: string;
  } | null;
  staff: {
    id: string;
    name: string;
  } | null;
  clientProfile: {
    fullName: string;
    fullNameKana: string | null;
    phone: string | null;
    address: string | null;
    totalDebt: string | null;
    creditorCount: number | null;
    occupation: string | null;
    monthlyIncome: number | null;
  } | null;
  creditors: Array<{
    id: string;
    name: string;
    debtAmount: string | null;
    debtType: string | null;
    noticeSentAt: string | null;
  }>;
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    uploadedAt: string;
    verifiedAt: string | null;
  }>;
  drafts: Array<{
    id: string;
    draftType: string;
    status: string;
    version: number;
    createdAt: string;
    flags: { items: Array<{ type: string; message: string }> } | null;
  }>;
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

const draftTypeLabels: Record<string, string> = {
  RETENTION_NOTICE: '受任通知',
  PETITION: '申立書',
  STATEMENT: '陳述書',
  CREDITOR_LIST: '債権者一覧表',
  ASSET_LIST: '財産目録',
  INCOME_EXPENSE: '家計収支表',
  RESPONSE: '依頼者への回答',
  COURT_RESPONSE: '裁判所への回答',
};

const draftStatusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '要レビュー', color: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: '承認済', color: 'bg-green-100 text-green-800' },
  MODIFIED: { label: '修正承認', color: 'bg-blue-100 text-blue-800' },
  REJECTED: { label: '差戻し', color: 'bg-red-100 text-red-800' },
};

const documentTypeLabels: Record<string, string> = {
  ID_DOCUMENT: '本人確認書類',
  BANK_STATEMENT: '銀行明細',
  PASSBOOK: '通帳',
  PAY_SLIP: '給与明細',
  TAX_CERTIFICATE: '源泉徴収票',
  CREDIT_CARD_STATEMENT: 'クレジットカード明細',
  LOAN_CONTRACT: 'ローン契約書',
  REAL_ESTATE_CERT: '不動産登記簿',
  VEHICLE_CERT: '車検証',
  INSURANCE_POLICY: '保険証券',
  OTHER: 'その他',
};

export default function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const [caseData, setCaseData] = useState<CaseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'creditors' | 'documents' | 'drafts'>('overview');

  useEffect(() => {
    fetchCaseDetail();
  }, [caseId]);

  const fetchCaseDetail = async () => {
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/cases/${caseId}`);
      // const data = await response.json();

      // モックデータ
      setCaseData({
        id: caseId,
        caseNumber: '2024-0001',
        caseType: 'BANKRUPTCY',
        status: 'DOCUMENT_COLLECTING',
        conflictCheckStatus: 'APPROVED',
        conflictCheckAt: new Date().toISOString(),
        conflictCheckReason: '利益相反なし',
        retentionStartedAt: new Date().toISOString(),
        filedAt: null,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        client: {
          id: 'client-1',
          name: '山田 太郎',
          email: 'yamada@example.com',
        },
        lawyer: {
          id: 'lawyer-1',
          name: '柳田 一郎',
        },
        staff: {
          id: 'staff-1',
          name: '田中 花子',
        },
        clientProfile: {
          fullName: '山田 太郎',
          fullNameKana: 'ヤマダ タロウ',
          phone: '090-1234-5678',
          address: '東京都渋谷区...',
          totalDebt: '5000000',
          creditorCount: 5,
          occupation: '会社員',
          monthlyIncome: 250000,
        },
        creditors: [
          { id: 'c1', name: 'アコム株式会社', debtAmount: '1500000', debtType: 'CONSUMER_FINANCE', noticeSentAt: null },
          { id: 'c2', name: 'プロミス株式会社', debtAmount: '1200000', debtType: 'CONSUMER_FINANCE', noticeSentAt: new Date().toISOString() },
          { id: 'c3', name: '三井住友カード', debtAmount: '800000', debtType: 'CREDIT_CARD', noticeSentAt: new Date().toISOString() },
          { id: 'c4', name: '楽天カード', debtAmount: '500000', debtType: 'CREDIT_CARD', noticeSentAt: null },
          { id: 'c5', name: 'オリコ', debtAmount: '1000000', debtType: 'LOAN', noticeSentAt: null },
        ],
        documents: [
          { id: 'd1', documentType: 'ID_DOCUMENT', fileName: '運転免許証.pdf', uploadedAt: new Date().toISOString(), verifiedAt: new Date().toISOString() },
          { id: 'd2', documentType: 'PASSBOOK', fileName: '通帳_みずほ銀行.pdf', uploadedAt: new Date().toISOString(), verifiedAt: null },
          { id: 'd3', documentType: 'PAY_SLIP', fileName: '給与明細_11月.pdf', uploadedAt: new Date().toISOString(), verifiedAt: null },
        ],
        drafts: [
          { id: 'dr1', draftType: 'RETENTION_NOTICE', status: 'APPROVED', version: 1, createdAt: new Date().toISOString(), flags: null },
          { id: 'dr2', draftType: 'CREDITOR_LIST', status: 'PENDING', version: 1, createdAt: new Date().toISOString(), flags: { items: [{ type: 'NEED_VERIFICATION', message: '債務額の確認が必要です' }] } },
        ],
      });
    } catch (error) {
      console.error('Failed to fetch case:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: string | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('ja-JP', { style: 'currency', currency: 'JPY' }).format(parseInt(amount));
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

  if (!caseData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">案件が見つかりません</p>
          <Link href="/cases" className="mt-4 text-blue-600 hover:text-blue-800">
            案件一覧に戻る
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle = statusLabels[caseData.status] || { label: caseData.status, color: 'bg-gray-100 text-gray-800' };
  const conflictStyle = conflictStatusLabels[caseData.conflictCheckStatus] || { label: caseData.conflictCheckStatus, color: 'bg-gray-100 text-gray-800' };
  const pendingDrafts = caseData.drafts.filter(d => d.status === 'PENDING');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <li className="text-gray-900 font-medium">{caseData.caseNumber}</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-3">
                  <h1 className="text-2xl font-bold text-gray-900">
                    {caseData.clientProfile?.fullName || caseData.client.name}
                  </h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyle.color}`}>
                    {statusStyle.label}
                  </span>
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  案件番号: {caseData.caseNumber} | {caseTypeLabels[caseData.caseType]}
                </p>
              </div>
              <div className="flex items-center space-x-3">
                {caseData.conflictCheckStatus === 'PENDING' && (
                  <Link
                    href={`/cases/${caseId}/conflict-check`}
                    className="inline-flex items-center px-4 py-2 border border-amber-300 text-sm font-medium rounded-lg text-amber-700 bg-amber-50 hover:bg-amber-100"
                  >
                    利益相反チェック
                  </Link>
                )}
                {pendingDrafts.length > 0 && (
                  <Link
                    href={`/cases/${caseId}/drafts/${pendingDrafts[0].id}/review`}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                  >
                    ドラフトをレビュー ({pendingDrafts.length})
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* 要確認フラグ */}
          {pendingDrafts.some(d => d.flags?.items?.length) && (
            <div className="px-6 py-3 bg-amber-50 border-b border-amber-200">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-amber-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span className="text-sm font-medium text-amber-800">
                  要確認事項があります
                </span>
              </div>
              <div className="mt-2 space-y-1">
                {pendingDrafts.flatMap(d =>
                  d.flags?.items?.map((flag, i) => (
                    <div key={`${d.id}-${i}`} className="flex items-center text-sm">
                      <span className="bg-amber-200 text-amber-800 px-2 py-0.5 rounded text-xs font-medium mr-2">
                        {flag.type}
                      </span>
                      <span className="text-amber-700">{flag.message}</span>
                    </div>
                  )) || []
                )}
              </div>
            </div>
          )}
        </div>

        {/* タブナビゲーション */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: '概要' },
              { key: 'creditors', label: `債権者 (${caseData.creditors.length})` },
              { key: 'documents', label: `書類 (${caseData.documents.length})` },
              { key: 'drafts', label: `ドラフト (${caseData.drafts.length})` },
            ].map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* タブコンテンツ */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 依頼者情報 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">依頼者情報</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">氏名</dt>
                    <dd className="text-sm font-medium text-gray-900">{caseData.clientProfile?.fullName}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">フリガナ</dt>
                    <dd className="text-sm text-gray-900">{caseData.clientProfile?.fullNameKana || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">電話番号</dt>
                    <dd className="text-sm text-gray-900">{caseData.clientProfile?.phone || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">メール</dt>
                    <dd className="text-sm text-gray-900">{caseData.client.email}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">住所</dt>
                    <dd className="text-sm text-gray-900">{caseData.clientProfile?.address || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">職業</dt>
                    <dd className="text-sm text-gray-900">{caseData.clientProfile?.occupation || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">月収</dt>
                    <dd className="text-sm text-gray-900">
                      {caseData.clientProfile?.monthlyIncome
                        ? `${caseData.clientProfile.monthlyIncome.toLocaleString()}円`
                        : '-'}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 債務情報 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">債務概要</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">総債務額</dt>
                    <dd className="text-sm font-medium text-gray-900">
                      {formatCurrency(caseData.clientProfile?.totalDebt || null)}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">債権者数</dt>
                    <dd className="text-sm text-gray-900">{caseData.clientProfile?.creditorCount || caseData.creditors.length}社</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">受任通知送付済</dt>
                    <dd className="text-sm text-gray-900">
                      {caseData.creditors.filter(c => c.noticeSentAt).length} / {caseData.creditors.length}社
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 案件進捗 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">案件進捗</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">利益相反チェック</dt>
                    <dd>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${conflictStyle.color}`}>
                        {conflictStyle.label}
                      </span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">受任日</dt>
                    <dd className="text-sm text-gray-900">
                      {caseData.retentionStartedAt
                        ? new Date(caseData.retentionStartedAt).toLocaleDateString('ja-JP')
                        : '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">申立日</dt>
                    <dd className="text-sm text-gray-900">
                      {caseData.filedAt
                        ? new Date(caseData.filedAt).toLocaleDateString('ja-JP')
                        : '-'}
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">案件登録日</dt>
                    <dd className="text-sm text-gray-900">
                      {new Date(caseData.createdAt).toLocaleDateString('ja-JP')}
                    </dd>
                  </div>
                </dl>
              </div>
            </div>

            {/* 担当者 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">担当者</h2>
              </div>
              <div className="px-6 py-4">
                <dl className="space-y-3">
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">担当弁護士</dt>
                    <dd className="text-sm font-medium text-gray-900">{caseData.lawyer?.name || '-'}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-sm text-gray-500">担当事務</dt>
                    <dd className="text-sm text-gray-900">{caseData.staff?.name || '-'}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'creditors' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">債権者一覧</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                + 債権者を追加
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">債権者名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">債務種別</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">債務額</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">受任通知</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">アクション</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {caseData.creditors.map(creditor => (
                    <tr key={creditor.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {creditor.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {creditor.debtType || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                        {formatCurrency(creditor.debtAmount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {creditor.noticeSentAt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            送付済
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            未送付
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {!creditor.noticeSentAt && (
                          <button className="text-blue-600 hover:text-blue-900">
                            受任通知送付
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'documents' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">提出書類</h2>
              <button className="text-sm text-blue-600 hover:text-blue-800">
                書類の確認を依頼
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">種別</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ファイル名</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">アップロード日</th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">確認状態</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">アクション</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {caseData.documents.map(doc => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {documentTypeLabels[doc.documentType] || doc.documentType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {doc.fileName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {doc.verifiedAt ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            確認済
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                            未確認
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">表示</button>
                        {!doc.verifiedAt && (
                          <button className="text-green-600 hover:text-green-900">確認済みにする</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'drafts' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">AIドラフト（弁護士専用）</h2>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700">
                新規ドラフト生成
              </button>
            </div>
            <div className="divide-y divide-gray-200">
              {caseData.drafts.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  ドラフトはありません
                </div>
              ) : (
                caseData.drafts.map(draft => {
                  const draftStatus = draftStatusLabels[draft.status] || { label: draft.status, color: 'bg-gray-100 text-gray-800' };
                  return (
                    <div key={draft.id} className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-900">
                              {draftTypeLabels[draft.draftType] || draft.draftType}
                            </span>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${draftStatus.color}`}>
                              {draftStatus.label}
                            </span>
                            {draft.flags?.items?.length && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                                要確認 {draft.flags.items.length}件
                              </span>
                            )}
                          </div>
                          <p className="mt-1 text-xs text-gray-500">
                            バージョン {draft.version} | {new Date(draft.createdAt).toLocaleDateString('ja-JP')}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Link
                            href={`/cases/${caseId}/drafts/${draft.id}/preview`}
                            className="text-sm text-gray-600 hover:text-gray-800"
                          >
                            プレビュー
                          </Link>
                          {draft.status === 'PENDING' ? (
                            <Link
                              href={`/cases/${caseId}/drafts/${draft.id}/review`}
                              className="inline-flex items-center px-3 py-1.5 border border-blue-300 text-sm font-medium rounded text-blue-700 bg-white hover:bg-blue-50"
                            >
                              レビュー
                            </Link>
                          ) : (
                            <Link
                              href={`/cases/${caseId}/drafts/${draft.id}`}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              詳細を見る
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
