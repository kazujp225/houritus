/**
 * 送信確認画面（送信ゲート）
 *
 * 対外送信前の最終確認を行う
 *
 * 重要（送信ゲート）：
 * - このボタンは弁護士ロールのみクリック可能
 * - 事務職員・AIプロセスからは物理的にアクセス不可
 * - 送信実行時に監査ログを記録
 */

'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';

interface SendContent {
  id: string;
  type: 'RETENTION_NOTICE' | 'FILING' | 'RESPONSE' | 'OTHER';
  recipient: {
    name: string;
    type: 'CREDITOR' | 'COURT' | 'CLIENT';
  };
  method: 'MAIL' | 'CERTIFIED_MAIL' | 'EMAIL' | 'FAX';
  subject: string;
  preview: string;
  draftId: string;
  approvedAt: string;
}

interface CaseInfo {
  id: string;
  caseNumber: string;
  clientName: string;
}

const typeLabels: Record<string, string> = {
  RETENTION_NOTICE: '受任通知',
  FILING: '申立書',
  RESPONSE: '回答書',
  OTHER: 'その他',
};

const methodLabels: Record<string, string> = {
  MAIL: '郵送',
  CERTIFIED_MAIL: '内容証明郵便',
  EMAIL: '電子メール',
  FAX: 'FAX',
};

const recipientTypeLabels: Record<string, string> = {
  CREDITOR: '債権者',
  COURT: '裁判所',
  CLIENT: '依頼者',
};

export default function SendConfirmPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const router = useRouter();
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [sendContent, setSendContent] = useState<SendContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [responsibilityChecked, setResponsibilityChecked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    fetchData();
  }, [caseId]);

  const fetchData = async () => {
    try {
      // TODO: 実際のAPIから取得
      // モックデータ
      setCaseInfo({
        id: caseId,
        caseNumber: '2024-0001',
        clientName: '山田 太郎',
      });

      setSendContent({
        id: 'send-1',
        type: 'RETENTION_NOTICE',
        recipient: {
          name: '株式会社A金融',
          type: 'CREDITOR',
        },
        method: 'CERTIFIED_MAIL',
        subject: '受任通知書',
        preview: `受任通知書

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

つきましては、今後の本件に関するご連絡は、全て当職宛てにお願いいたします。
また、本人への直接の連絡や取立て行為は、ご遠慮くださいますようお願いいたします。

なお、債務の詳細については、追ってご連絡いたします。

以上`,
        draftId: 'draft-1',
        approvedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    if (!confirmChecked || !responsibilityChecked) return;

    setSending(true);
    try {
      // TODO: 実際の送信APIを呼び出し
      // 送信ゲート：弁護士のみが実行可能
      const response = await fetch('/api/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId,
          sendContentId: sendContent?.id,
          sendMethod: sendContent?.method,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || '送信に失敗しました');
      }

      setSent(true);
    } catch (error) {
      console.error('Failed to send:', error);
      alert(error instanceof Error ? error.message : '送信に失敗しました');
    } finally {
      setSending(false);
    }
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

  if (!caseInfo || !sendContent) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">データが見つかりません</p>
          <Link href={`/cases/${caseId}`} className="mt-4 text-blue-600 hover:text-blue-800">
            案件詳細に戻る
          </Link>
        </div>
      </div>
    );
  }

  // 送信完了画面
  if (sent) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header
          tenantName="柳田法律事務所"
          userName="柳田 一郎"
          userRole="LAWYER"
        />
        <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">送信が完了しました</h1>
            <p className="text-gray-600 mb-6">
              {sendContent.recipient.name}への{typeLabels[sendContent.type]}を送信しました。
            </p>
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <dl className="space-y-2 text-sm">
                <div className="flex">
                  <dt className="w-24 text-gray-500">送信日時</dt>
                  <dd className="text-gray-900">{new Date().toLocaleString('ja-JP')}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500">送信方法</dt>
                  <dd className="text-gray-900">{methodLabels[sendContent.method]}</dd>
                </div>
                <div className="flex">
                  <dt className="w-24 text-gray-500">担当弁護士</dt>
                  <dd className="text-gray-900">柳田 一郎</dd>
                </div>
              </dl>
            </div>
            <div className="flex justify-center space-x-4">
              <Link
                href={`/cases/${caseId}`}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
              >
                案件詳細へ戻る
              </Link>
            </div>
          </div>
        </main>
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

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/cases" className="text-gray-500 hover:text-gray-700">
                案件一覧
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/cases/${caseId}`} className="text-gray-500 hover:text-gray-700">
                {caseInfo.clientName}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">送信確認</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">送信確認</h1>
          <p className="mt-1 text-sm text-gray-500">
            案件：{caseInfo.clientName} 様 | {caseInfo.caseNumber}
          </p>
        </div>

        {/* 送信ゲート警告 */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">
                送信ゲート：この操作は弁護士のみが実行可能です
              </p>
              <p className="mt-1 text-sm text-red-700">
                対外送信は取り消しができません。内容を十分に確認してから実行してください。
              </p>
            </div>
          </div>
        </div>

        {/* 送信内容の確認 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">送信内容の最終確認</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="space-y-4">
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">送信先</dt>
                <dd className="text-sm text-gray-900">
                  {sendContent.recipient.name}
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
                    {recipientTypeLabels[sendContent.recipient.type]}
                  </span>
                </dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">種別</dt>
                <dd className="text-sm text-gray-900">{typeLabels[sendContent.type]}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">送信方法</dt>
                <dd className="text-sm text-gray-900">{methodLabels[sendContent.method]}</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">承認日時</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(sendContent.approvedAt).toLocaleString('ja-JP')}
                </dd>
              </div>
            </dl>

            <div className="mt-4">
              <button
                onClick={() => setShowPreview(!showPreview)}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                {showPreview ? '内容を非表示' : '内容をプレビュー'}
              </button>
            </div>

            {showPreview && (
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                  {sendContent.preview}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 送信者情報 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">送信者情報</h2>
          </div>
          <div className="px-6 py-4">
            <dl className="space-y-4">
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">送信元</dt>
                <dd className="text-sm text-gray-900">弁護士法人 柳田法律事務所</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">担当弁護士</dt>
                <dd className="text-sm text-gray-900">柳田 一郎</dd>
              </div>
              <div className="flex">
                <dt className="w-32 text-sm font-medium text-gray-500">送信予定日時</dt>
                <dd className="text-sm text-gray-900">{new Date().toLocaleString('ja-JP')}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* 確認チェックボックス */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
          <p className="text-sm font-medium text-amber-800 mb-4">
            この操作は取り消せません。内容を確認の上、送信してください。
          </p>
          <div className="space-y-3">
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={confirmChecked}
                onChange={e => setConfirmChecked(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                送信内容を確認しました
              </span>
            </label>
            <label className="flex items-start">
              <input
                type="checkbox"
                checked={responsibilityChecked}
                onChange={e => setResponsibilityChecked(e.target.checked)}
                className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">
                弁護士として責任を持って送信します
              </span>
            </label>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="flex items-center justify-between">
          <Link
            href={`/cases/${caseId}/drafts/${sendContent.draftId}/review`}
            className="text-gray-600 hover:text-gray-900 text-sm"
          >
            ← レビュー画面に戻る
          </Link>
          <div className="flex space-x-3">
            <button
              onClick={() => router.push(`/cases/${caseId}`)}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
            >
              キャンセル
            </button>
            <button
              onClick={handleSend}
              disabled={!confirmChecked || !responsibilityChecked || sending}
              className="px-6 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {sending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  送信中...
                </span>
              ) : (
                '送信を実行'
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
