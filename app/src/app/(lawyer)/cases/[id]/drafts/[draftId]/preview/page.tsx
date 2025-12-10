/**
 * 書類プレビュー画面（L-006）
 *
 * 生成書類のプレビュー表示を行う
 *
 * 重要：
 * - 弁護士のみがアクセス可能
 * - 印刷・PDF出力機能を提供
 * - レビュー・承認画面への導線を確保
 */

'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';

interface Draft {
  id: string;
  draftType: string;
  status: string;
  version: number;
  content: string;
  metadata: {
    createdAt: string;
    updatedAt: string;
    generatedBy: string;
  };
  case: {
    id: string;
    caseNumber: string;
    clientName: string;
    caseType: string;
  };
}

const draftTypeLabels: Record<string, string> = {
  RETENTION_NOTICE: '受任通知書',
  PETITION: '破産申立書',
  STATEMENT: '陳述書',
  CREDITOR_LIST: '債権者一覧表',
  ASSET_LIST: '財産目録',
  INCOME_EXPENSE: '家計収支表',
  RESPONSE: '回答書',
  COURT_RESPONSE: '裁判所への回答書',
};

const statusLabels: Record<string, { label: string; color: string }> = {
  PENDING: { label: '要レビュー', color: 'bg-amber-100 text-amber-800' },
  APPROVED: { label: '承認済', color: 'bg-green-100 text-green-800' },
  MODIFIED: { label: '修正承認', color: 'bg-blue-100 text-blue-800' },
  REJECTED: { label: '差戻し', color: 'bg-red-100 text-red-800' },
};

export default function DraftPreviewPage({
  params,
}: {
  params: Promise<{ id: string; draftId: string }>;
}) {
  const { id: caseId, draftId } = use(params);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    fetchDraft();
  }, [caseId, draftId]);

  const fetchDraft = async () => {
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/cases/${caseId}/drafts/${draftId}`);
      // const data = await response.json();

      // モックデータ
      setDraft({
        id: draftId,
        draftType: 'RETENTION_NOTICE',
        status: 'APPROVED',
        version: 1,
        content: `受任通知書

令和6年12月10日

株式会社A金融 御中

〒100-0001
東京都千代田区○○1-2-3
弁護士法人 柳田法律事務所
弁護士 柳田 一郎
TEL: 03-XXXX-XXXX
FAX: 03-XXXX-XXXX

　当職は、下記の者より債務整理の委任を受けましたので、ご通知申し上げます。

記

氏名：山田 太郎
生年月日：昭和○年○月○日
住所：東京都渋谷区○○○

　つきましては、今後の本件に関するご連絡は、全て当職宛てにお願いいたします。
　また、本人への直接の連絡や取立て行為は、ご遠慮くださいますようお願いいたします。

　なお、債務の詳細については、追ってご連絡いたします。

　貴社におかれましては、下記の書類をご送付くださいますよう、お願い申し上げます。

1. 取引履歴（契約当初から現在まで）
2. 契約書の写し
3. 債権残高証明書

以上`,
        metadata: {
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          generatedBy: 'AI',
        },
        case: {
          id: caseId,
          caseNumber: '2024-0001',
          clientName: '山田 太郎',
          caseType: 'BANKRUPTCY',
        },
      });
    } catch (error) {
      console.error('Failed to fetch draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 25, 200));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 25, 50));
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

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">書類が見つかりません</p>
          <Link
            href={`/cases/${caseId}`}
            className="mt-4 text-blue-600 hover:text-blue-800"
          >
            案件詳細に戻る
          </Link>
        </div>
      </div>
    );
  }

  const statusStyle = statusLabels[draft.status] || {
    label: draft.status,
    color: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー（印刷時は非表示） */}
      <div className="print:hidden">
        <Header
          tenantName="柳田法律事務所"
          userName="柳田 一郎"
          userRole="LAWYER"
        />
      </div>

      {/* ツールバー（印刷時は非表示） */}
      <div className="print:hidden bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center justify-between">
            {/* 左側：パンくず・タイトル */}
            <div className="flex items-center space-x-4">
              <Link
                href={`/cases/${caseId}/drafts/${draftId}/review`}
                className="text-gray-500 hover:text-gray-700 flex items-center"
              >
                <svg
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                レビュー画面に戻る
              </Link>
              <div className="border-l border-gray-300 h-6"></div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  {draftTypeLabels[draft.draftType] || draft.draftType}
                </h1>
                <p className="text-xs text-gray-500">
                  {draft.case.clientName} 様 | {draft.case.caseNumber}
                </p>
              </div>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${statusStyle.color}`}
              >
                {statusStyle.label}
              </span>
            </div>

            {/* 右側：アクションボタン */}
            <div className="flex items-center space-x-3">
              {/* ズームコントロール */}
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg px-2 py-1">
                <button
                  onClick={handleZoomOut}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="縮小"
                >
                  <svg
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="text-sm text-gray-600 w-12 text-center">
                  {zoom}%
                </span>
                <button
                  onClick={handleZoomIn}
                  className="p-1 hover:bg-gray-200 rounded"
                  title="拡大"
                >
                  <svg
                    className="h-4 w-4 text-gray-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>

              {/* 印刷ボタン */}
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                  />
                </svg>
                印刷
              </button>

              {/* PDF出力ボタン */}
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                <svg
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                PDF出力
              </button>

              {/* 承認済みの場合は送信確認へ */}
              {draft.status === 'APPROVED' && (
                <Link
                  href={`/cases/${caseId}/send-confirm`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  送信準備へ
                </Link>
              )}

              {/* 未承認の場合はレビューへ */}
              {draft.status === 'PENDING' && (
                <Link
                  href={`/cases/${caseId}/drafts/${draftId}/review`}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700"
                >
                  レビューへ
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* メタ情報（印刷時は非表示） */}
      <div className="print:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <dt className="text-gray-500">書類種別</dt>
              <dd className="font-medium text-gray-900">
                {draftTypeLabels[draft.draftType]}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">バージョン</dt>
              <dd className="font-medium text-gray-900">v{draft.version}</dd>
            </div>
            <div>
              <dt className="text-gray-500">作成日時</dt>
              <dd className="font-medium text-gray-900">
                {new Date(draft.metadata.createdAt).toLocaleString('ja-JP')}
              </dd>
            </div>
            <div>
              <dt className="text-gray-500">生成元</dt>
              <dd className="font-medium text-gray-900">
                {draft.metadata.generatedBy === 'AI' ? 'AI生成' : '手動作成'}
              </dd>
            </div>
          </div>
        </div>
      </div>

      {/* プレビューエリア */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 print:p-0 print:max-w-none">
        <div
          className="bg-white shadow-lg mx-auto print:shadow-none"
          style={{
            width: `${(210 * zoom) / 100}mm`,
            minHeight: `${(297 * zoom) / 100}mm`,
            padding: `${(20 * zoom) / 100}mm`,
            transformOrigin: 'top center',
          }}
        >
          {/* 書類内容 */}
          <div
            className="print:text-base"
            style={{
              fontSize: `${(14 * zoom) / 100}px`,
              lineHeight: '1.8',
            }}
          >
            <pre
              className="whitespace-pre-wrap font-sans"
              style={{ fontFamily: '"Noto Sans JP", sans-serif' }}
            >
              {draft.content}
            </pre>
          </div>
        </div>
      </div>

      {/* AI生成表示（印刷時は非表示） */}
      {draft.metadata.generatedBy === 'AI' && (
        <div className="print:hidden max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center">
              <svg
                className="h-5 w-5 text-blue-400 mr-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <p className="text-sm text-blue-800">
                この書類はAIによって生成されました。弁護士による確認・承認が必要です。
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 印刷用スタイル */}
      <style jsx global>{`
        @media print {
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          @page {
            size: A4;
            margin: 20mm;
          }
        }
      `}</style>
    </div>
  );
}
