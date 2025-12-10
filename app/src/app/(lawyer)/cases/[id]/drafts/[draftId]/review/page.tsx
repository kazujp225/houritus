/**
 * ドラフトレビュー画面（弁護士専用）
 *
 * 弁護士がAIドラフトをレビューし、承認・修正・差戻しを行う
 *
 * 重要：
 * - AIドラフトは弁護士用レビュー画面のみに表示
 * - 依頼者には弁護士承認後の回答のみ表示
 * - レビュー時間を記録（オート承認検知のため）
 * - 要確認フラグは「次のアクション」形式で表示
 */

'use client';

import React, { useEffect, useState, use, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { FlagDisplay } from '@/components/common/FlagDisplay';
import { DraftReviewPanel } from '@/components/lawyer/DraftReviewPanel';

interface DraftDetail {
  id: string;
  caseId: string;
  caseNumber: string;
  clientName: string;
  draftType: string;
  version: number;
  content: string;
  aiModel: string;
  status: string;
  createdAt: string;
  flags: {
    items: Array<{
      type: string;
      message: string;
      acknowledged?: boolean;
    }>;
  } | null;
  clientInput: {
    question?: string;
    context?: string;
    documents?: string[];
  } | null;
  referenceInfo: {
    title: string;
    content: string;
  }[] | null;
}

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

export default function DraftReviewPage({
  params,
}: {
  params: Promise<{ id: string; draftId: string }>;
}) {
  const { id: caseId, draftId } = use(params);
  const router = useRouter();
  const [draft, setDraft] = useState<DraftDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [action, setAction] = useState<'approve' | 'modify' | 'reject' | null>(null);
  const [comment, setComment] = useState('');
  const [finalContent, setFinalContent] = useState('');
  const [flagsAcknowledged, setFlagsAcknowledged] = useState(false);
  const reviewStartTime = useRef(Date.now());

  useEffect(() => {
    reviewStartTime.current = Date.now();
    fetchDraft();
  }, [draftId]);

  const fetchDraft = async () => {
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/drafts/${draftId}`);
      // const data = await response.json();

      // モックデータ
      const mockDraft: DraftDetail = {
        id: draftId,
        caseId,
        caseNumber: '2024-0001',
        clientName: '山田 太郎',
        draftType: 'CREDITOR_LIST',
        version: 1,
        content: `# 債権者一覧表

## 申立人
氏名：山田 太郎
住所：東京都渋谷区○○町1-2-3

## 債権者

### 1. アコム株式会社
- 債権額：1,500,000円
- 債権の発生原因：消費者金融からの借入
- 契約日：2020年4月1日
- 最終取引日：2024年9月15日

### 2. プロミス株式会社
- 債権額：1,200,000円
- 債権の発生原因：消費者金融からの借入
- 契約日：2019年8月1日
- 最終取引日：2024年10月1日

### 3. 三井住友カード株式会社
- 債権額：800,000円
- 債権の発生原因：クレジットカードキャッシング
- 契約日：2018年3月15日
- 最終取引日：2024年11月1日

### 4. 楽天カード株式会社
- 債権額：500,000円
- 債権の発生原因：クレジットカードキャッシング
- 契約日：2021年1月1日
- 最終取引日：2024年10月15日

### 5. 株式会社オリエントコーポレーション
- 債権額：1,000,000円
- 債権の発生原因：カードローン
- 契約日：2022年6月1日
- 最終取引日：2024年9月30日

## 債権総額
合計：5,000,000円

作成日：${new Date().toLocaleDateString('ja-JP')}
作成：AI自動生成（要弁護士確認）`,
        aiModel: 'claude-3-opus',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        flags: {
          items: [
            {
              type: 'NEED_VERIFICATION',
              message: '債務額の確認が必要です - 通帳のコピーと照合してください',
            },
            {
              type: 'NEED_ADDITIONAL_INFO',
              message: '利息・遅延損害金の詳細が不明です',
            },
          ],
        },
        clientInput: {
          question: '債権者一覧表を作成してください',
          context: '提出された書類をもとに作成',
          documents: ['通帳_みずほ銀行.pdf', 'クレジットカード明細.pdf'],
        },
        referenceInfo: [
          {
            title: '破産規則15条',
            content: '債権者一覧表には、債権者の氏名又は名称、住所、債権の額及び原因を記載しなければならない。',
          },
        ],
      };

      setDraft(mockDraft);
      setFinalContent(mockDraft.content);
    } catch (error) {
      console.error('Failed to fetch draft:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!action) {
      alert('アクションを選択してください');
      return;
    }

    if (draft?.flags?.items?.length && !flagsAcknowledged) {
      alert('要確認事項を確認してチェックを入れてください');
      return;
    }

    if (action === 'modify' && !finalContent.trim()) {
      alert('修正内容を入力してください');
      return;
    }

    if (action === 'reject' && !comment.trim()) {
      alert('差戻し理由を入力してください');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch(`/api/drafts/${draftId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          comment,
          finalContent: action === 'modify' ? finalContent : undefined,
          flagsAcknowledged,
          reviewStartTime: reviewStartTime.current,
        }),
      });

      if (response.ok) {
        router.push(`/cases/${caseId}`);
      } else {
        const error = await response.json();
        alert(error.error || '送信に失敗しました');
      }
    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('送信に失敗しました');
    } finally {
      setSubmitting(false);
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

  if (!draft) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">ドラフトが見つかりません</p>
          <Link href={`/cases/${caseId}`} className="mt-4 text-blue-600 hover:text-blue-800">
            案件詳細に戻る
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
              <Link href={`/cases/${caseId}`} className="text-gray-500 hover:text-gray-700">
                {draft.caseNumber}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">ドラフトレビュー</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {draftTypeLabels[draft.draftType] || draft.draftType} - レビュー
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                {draft.clientName} | {draft.caseNumber} | バージョン {draft.version}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href={`/cases/${caseId}/drafts/${draftId}/preview`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                書類プレビュー
              </Link>
              <div className="text-right text-sm text-gray-500">
                <div>AI Model: {draft.aiModel}</div>
                <div>生成日時: {new Date(draft.createdAt).toLocaleString('ja-JP')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* 要確認フラグ */}
        {draft.flags?.items && draft.flags.items.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-center mb-3">
              <svg className="h-5 w-5 text-amber-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="font-medium text-amber-800">要確認事項 ({draft.flags.items.length}件)</span>
            </div>
            <div className="space-y-2">
              {draft.flags.items.map((flag, index) => (
                <div
                  key={index}
                  className="bg-amber-100 border border-amber-300 rounded-lg p-2"
                >
                  <div className="flex items-center">
                    <span className="text-xs font-medium text-amber-800 bg-amber-200 px-2 py-0.5 rounded mr-2">
                      {flag.type}
                    </span>
                    <span className="text-sm text-amber-800">{flag.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* メインコンテンツ */}
          <div className="lg:col-span-2 space-y-6">
            {/* 依頼者入力 */}
            {draft.clientInput && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">依頼者からの入力</h2>
                </div>
                <div className="px-6 py-4">
                  {draft.clientInput.question && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">依頼内容</div>
                      <div className="text-sm text-gray-900">{draft.clientInput.question}</div>
                    </div>
                  )}
                  {draft.clientInput.context && (
                    <div className="mb-4">
                      <div className="text-sm font-medium text-gray-500 mb-1">背景情報</div>
                      <div className="text-sm text-gray-900">{draft.clientInput.context}</div>
                    </div>
                  )}
                  {draft.clientInput.documents && draft.clientInput.documents.length > 0 && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-1">参照書類</div>
                      <ul className="text-sm text-gray-900 list-disc list-inside">
                        {draft.clientInput.documents.map((doc, i) => (
                          <li key={i}>{doc}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* AIドラフト */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">AIドラフト</h2>
                <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                  弁護士専用表示
                </span>
              </div>
              <div className="px-6 py-4">
                {action === 'modify' ? (
                  <textarea
                    value={finalContent}
                    onChange={(e) => setFinalContent(e.target.value)}
                    rows={20}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                ) : (
                  <div className="prose prose-sm max-w-none">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-gray-900 bg-gray-50 p-4 rounded-lg">
                      {draft.content}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 参考情報 */}
            {draft.referenceInfo && draft.referenceInfo.length > 0 && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-semibold text-gray-900">参考情報</h2>
                  <p className="text-xs text-gray-500 mt-1">弁護士専用表示</p>
                </div>
                <div className="px-6 py-4 space-y-4">
                  {draft.referenceInfo.map((ref, index) => (
                    <div key={index} className="text-sm">
                      <div className="font-medium text-gray-700 mb-1">{ref.title}</div>
                      <div className="text-gray-600 text-xs">{ref.content}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* アクション */}
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">レビューアクション</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* アクション選択 */}
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setAction('approve')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                      action === 'approve'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${action === 'approve' ? 'text-green-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className={`font-medium ${action === 'approve' ? 'text-green-700' : 'text-gray-700'}`}>
                        承認
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-7">このまま承認する</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction('modify')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                      action === 'modify'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${action === 'modify' ? 'text-blue-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      <span className={`font-medium ${action === 'modify' ? 'text-blue-700' : 'text-gray-700'}`}>
                        修正して承認
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-7">内容を修正してから承認</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAction('reject')}
                    className={`w-full p-3 border-2 rounded-lg text-left transition-colors ${
                      action === 'reject'
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center">
                      <svg className={`h-5 w-5 mr-2 ${action === 'reject' ? 'text-red-600' : 'text-gray-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className={`font-medium ${action === 'reject' ? 'text-red-700' : 'text-gray-700'}`}>
                        差戻し
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500 ml-7">再生成を依頼</p>
                  </button>
                </div>

                {/* コメント */}
                <div>
                  <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-1">
                    コメント {action === 'reject' && <span className="text-red-500">*</span>}
                  </label>
                  <textarea
                    id="comment"
                    rows={3}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder={action === 'reject' ? '差戻し理由を入力...' : 'コメント（任意）'}
                  />
                </div>

                {/* フラグ確認 */}
                {draft.flags?.items && draft.flags.items.length > 0 && (
                  <div className="bg-gray-50 rounded-lg p-3">
                    <label className="flex items-start">
                      <input
                        type="checkbox"
                        checked={flagsAcknowledged}
                        onChange={(e) => setFlagsAcknowledged(e.target.checked)}
                        className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">
                        要確認事項 ({draft.flags.items.length}件) を確認しました
                      </span>
                    </label>
                  </div>
                )}

                {/* 送信ボタン */}
                <button
                  type="submit"
                  disabled={submitting || !action || (draft.flags?.items && draft.flags.items.length > 0 && !flagsAcknowledged)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? '送信中...' : 'レビューを確定'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
