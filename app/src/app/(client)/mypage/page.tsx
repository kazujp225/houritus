/**
 * 依頼者マイページ
 *
 * 依頼者が自分の案件状況を確認し、次のアクションを把握する
 *
 * 重要：
 * - 依頼者画面に「法的判断」を出さない
 * - AIが生成した内部用ドラフトは非表示
 * - 弁護士承認後の回答のみ表示
 * - 免責表示を常時表示
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface CaseInfo {
  id: string;
  caseNumber: string;
  caseType: string;
  status: string;
  lawyer: {
    name: string;
  } | null;
  pendingDocuments: string[];
  unreadMessages: number;
}

interface Message {
  id: string;
  subject: string;
  body: string;
  senderName: string;
  createdAt: string;
  isRead: boolean;
}

export default function ClientMyPage() {
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: 実際のAPIから取得
    // モックデータ
    setCaseInfo({
      id: 'case-1',
      caseNumber: '2024-0001',
      caseType: 'BANKRUPTCY',
      status: 'DOCUMENT_COLLECTING',
      lawyer: {
        name: '柳田 一郎',
      },
      pendingDocuments: ['給与明細（直近3ヶ月分）', '源泉徴収票'],
      unreadMessages: 2,
    });

    setMessages([
      {
        id: 'msg-1',
        subject: '追加のご質問があります',
        body: '山田様\n\n資料を確認しました。追加で以下の点についてお伺いしたいことがございます...',
        senderName: '柳田 一郎',
        createdAt: new Date().toISOString(),
        isRead: false,
      },
      {
        id: 'msg-2',
        subject: '資料受領のご連絡',
        body: '山田様\n\n通帳のコピーを受領いたしました。ありがとうございます...',
        senderName: '柳田 一郎',
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        isRead: true,
      },
    ]);

    setLoading(false);
  }, []);

  const statusSteps = [
    { key: 'INQUIRY', label: '受付' },
    { key: 'CONSULTATION', label: '相談' },
    { key: 'RETAINED', label: '受任' },
    { key: 'DOCUMENT_COLLECTING', label: '資料収集' },
    { key: 'DRAFTING', label: '申立準備' },
    { key: 'FILED', label: '申立済' },
  ];

  const getCurrentStep = (status: string) => {
    const stepIndex = statusSteps.findIndex((s) => s.key === status);
    return stepIndex >= 0 ? stepIndex : 0;
  };

  const caseTypeLabels: Record<string, string> = {
    BANKRUPTCY: '自己破産',
    CIVIL_REHAB: '個人再生',
    VOLUNTARY_ARRANGEMENT: '任意整理',
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
        userName="山田 太郎"
        userRole="CLIENT"
        showPoweredBy
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 免責表示（常時表示） */}
        <DisclaimerBanner variant="compact" className="mb-6" />

        {/* ウェルカムセクション */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h1 className="text-xl font-bold text-gray-900 mb-2">
            山田 太郎 様
          </h1>
          {caseInfo?.lawyer && (
            <p className="text-sm text-gray-600">
              担当弁護士：{caseInfo.lawyer.name}
            </p>
          )}
        </div>

        {/* 進捗ステータス */}
        {caseInfo && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              現在のステータス
            </h2>
            <div className="relative">
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                <div
                  style={{
                    width: `${((getCurrentStep(caseInfo.status) + 1) / statusSteps.length) * 100}%`,
                  }}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-blue-600 transition-all duration-500"
                />
              </div>
              <div className="flex justify-between text-xs">
                {statusSteps.map((step, index) => {
                  const isActive = index <= getCurrentStep(caseInfo.status);
                  const isCurrent = step.key === caseInfo.status;
                  return (
                    <div
                      key={step.key}
                      className={`text-center ${
                        isActive ? 'text-blue-600' : 'text-gray-400'
                      } ${isCurrent ? 'font-bold' : ''}`}
                    >
                      <div
                        className={`w-4 h-4 mx-auto mb-1 rounded-full ${
                          isActive ? 'bg-blue-600' : 'bg-gray-300'
                        } ${isCurrent ? 'ring-2 ring-blue-300' : ''}`}
                      />
                      {step.label}
                    </div>
                  );
                })}
              </div>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              手続種別：{caseTypeLabels[caseInfo.caseType]}
            </p>
          </div>
        )}

        {/* 要対応事項 */}
        {caseInfo && caseInfo.pendingDocuments.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-6 w-6 text-amber-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-amber-800">
                  未提出の書類があります
                </h3>
                <ul className="mt-2 text-sm text-amber-700 list-disc list-inside">
                  {caseInfo.pendingDocuments.map((doc, index) => (
                    <li key={index}>{doc}</li>
                  ))}
                </ul>
                <Link
                  href="/mypage/upload"
                  className="mt-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-amber-600 hover:bg-amber-700"
                >
                  資料をアップロード
                </Link>
              </div>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* メッセージ */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                メッセージ
                {caseInfo && caseInfo.unreadMessages > 0 && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    {caseInfo.unreadMessages}件
                  </span>
                )}
              </h2>
              <Link
                href="/mypage/messages"
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                すべて見る
              </Link>
            </div>
            <div className="divide-y divide-gray-200">
              {messages.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  メッセージはありません
                </div>
              ) : (
                messages.slice(0, 3).map((msg) => (
                  <Link
                    key={msg.id}
                    href={`/mypage/messages/${msg.id}`}
                    className="block px-6 py-4 hover:bg-gray-50"
                  >
                    <div className="flex items-start">
                      {!msg.isRead && (
                        <span className="flex-shrink-0 w-2 h-2 mt-2 mr-2 bg-blue-600 rounded-full" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p
                          className={`text-sm ${
                            msg.isRead
                              ? 'text-gray-600'
                              : 'font-medium text-gray-900'
                          } truncate`}
                        >
                          {msg.subject}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {msg.senderName} ・{' '}
                          {new Date(msg.createdAt).toLocaleDateString('ja-JP')}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>

          {/* クイックアクション */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                クイックアクション
              </h2>
            </div>
            <div className="p-6 space-y-3">
              <Link
                href="/mypage/upload"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-blue-100 rounded-lg p-2">
                  <svg
                    className="h-5 w-5 text-blue-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    資料をアップロード
                  </p>
                  <p className="text-xs text-gray-500">
                    必要書類を提出する
                  </p>
                </div>
              </Link>

              <Link
                href="/mypage/progress"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-green-100 rounded-lg p-2">
                  <svg
                    className="h-5 w-5 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    進捗を確認
                  </p>
                  <p className="text-xs text-gray-500">
                    手続きの進捗状況を見る
                  </p>
                </div>
              </Link>

              <Link
                href="/mypage/documents"
                className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex-shrink-0 bg-purple-100 rounded-lg p-2">
                  <svg
                    className="h-5 w-5 text-purple-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">
                    提出済み資料
                  </p>
                  <p className="text-xs text-gray-500">
                    アップロード済みの書類を確認
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>

        {/* フッター注記 */}
        <div className="mt-8 text-center text-xs text-gray-500">
          <p>
            ご不明な点がございましたら、担当弁護士までお問い合わせください。
          </p>
          <p className="mt-1">
            柳田法律事務所 | Powered by ZettAI（システム提供）
          </p>
        </div>
      </main>
    </div>
  );
}
