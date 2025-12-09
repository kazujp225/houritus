/**
 * 進捗確認画面（依頼者用）
 *
 * 手続の進捗状況を確認する
 *
 * 重要：
 * - 依頼者には公開可能な情報のみ表示
 * - 法的判断に関わる内部情報は非表示
 * - 免責表示を常時表示
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface ProgressStep {
  id: string;
  name: string;
  description: string;
  status: 'completed' | 'current' | 'upcoming';
  completedAt?: string;
  estimatedDate?: string;
}

interface Timeline {
  id: string;
  date: string;
  title: string;
  description: string;
  type: 'milestone' | 'document' | 'message';
}

interface CaseProgress {
  caseNumber: string;
  caseType: string;
  lawyerName: string;
  currentStep: string;
  steps: ProgressStep[];
  timeline: Timeline[];
  pendingActions: string[];
}

const caseTypeLabels: Record<string, string> = {
  BANKRUPTCY: '自己破産',
  CIVIL_REHAB: '個人再生',
  VOLUNTARY_ARRANGEMENT: '任意整理',
};

export default function ProgressPage() {
  const [progress, setProgress] = useState<CaseProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, []);

  const fetchProgress = async () => {
    try {
      // TODO: 実際のAPIから取得
      // モックデータ
      setProgress({
        caseNumber: '2024-0001',
        caseType: 'BANKRUPTCY',
        lawyerName: '柳田 一郎',
        currentStep: 'DOCUMENT_COLLECTING',
        steps: [
          {
            id: 'inquiry',
            name: '相談受付',
            description: 'ご相談内容を受け付けました',
            status: 'completed',
            completedAt: '2024-12-01',
          },
          {
            id: 'consultation',
            name: '面談・受任',
            description: '弁護士との面談を行い、正式に受任しました',
            status: 'completed',
            completedAt: '2024-12-05',
          },
          {
            id: 'document_collecting',
            name: '資料収集',
            description: '申立てに必要な書類を収集しています',
            status: 'current',
          },
          {
            id: 'creditor_notice',
            name: '債権者への通知',
            description: '各債権者へ受任通知を送付します',
            status: 'upcoming',
            estimatedDate: '資料収集完了後',
          },
          {
            id: 'filing_prep',
            name: '申立書作成',
            description: '裁判所への申立書類を作成します',
            status: 'upcoming',
          },
          {
            id: 'filing',
            name: '申立て',
            description: '裁判所へ破産申立てを行います',
            status: 'upcoming',
          },
          {
            id: 'proceeding',
            name: '手続進行',
            description: '裁判所での手続を進めます',
            status: 'upcoming',
          },
          {
            id: 'discharge',
            name: '免責決定',
            description: '免責の決定を受けます',
            status: 'upcoming',
          },
        ],
        timeline: [
          {
            id: 't1',
            date: '2024-12-09',
            title: '追加質問をお送りしました',
            description: '通帳コピーの追加提出をお願いしています',
            type: 'message',
          },
          {
            id: 't2',
            date: '2024-12-08',
            title: '資料を受領しました',
            description: '給与明細3ヶ月分を受領しました',
            type: 'document',
          },
          {
            id: 't3',
            date: '2024-12-05',
            title: '正式に受任しました',
            description: '委任契約を締結しました',
            type: 'milestone',
          },
          {
            id: 't4',
            date: '2024-12-03',
            title: '面談を実施しました',
            description: '弁護士との初回面談を行いました',
            type: 'milestone',
          },
          {
            id: 't5',
            date: '2024-12-01',
            title: 'ご相談を受け付けました',
            description: 'オンライン相談からご連絡いただきました',
            type: 'milestone',
          },
        ],
        pendingActions: [
          '通帳コピー（2022年4月〜6月分）の再提出',
          '楽天カードの利用明細の提出',
        ],
      });
    } catch (error) {
      console.error('Failed to fetch progress:', error);
    } finally {
      setLoading(false);
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

  if (!progress) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">進捗情報が見つかりません</p>
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
        {/* 免責表示 */}
        <DisclaimerBanner variant="compact" className="mb-6" />

        {/* パンくずリスト */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/mypage" className="text-gray-500 hover:text-gray-700">
                マイページ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">進捗確認</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">進捗確認</h1>
          <p className="mt-1 text-sm text-gray-500">
            {caseTypeLabels[progress.caseType]} | 担当：{progress.lawyerName}弁護士
          </p>
        </div>

        {/* 要対応事項 */}
        {progress.pendingActions.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h3 className="text-sm font-medium text-amber-800">お願い事項があります</h3>
                <ul className="mt-2 text-sm text-amber-700 space-y-1">
                  {progress.pendingActions.map((action, index) => (
                    <li key={index}>・{action}</li>
                  ))}
                </ul>
                <Link
                  href="/mypage/upload"
                  className="inline-flex items-center mt-3 text-sm font-medium text-amber-800 hover:text-amber-900"
                >
                  資料をアップロード
                  <svg className="ml-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* 進捗ステップ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">手続の流れ</h2>
          </div>
          <div className="px-6 py-6">
            <div className="relative">
              {progress.steps.map((step, index) => (
                <div key={step.id} className="relative pb-8 last:pb-0">
                  {/* 縦線 */}
                  {index < progress.steps.length - 1 && (
                    <div className={`absolute left-4 top-8 w-0.5 h-full ${
                      step.status === 'completed' ? 'bg-green-300' : 'bg-gray-200'
                    }`} />
                  )}

                  <div className="flex items-start">
                    {/* アイコン */}
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.status === 'completed'
                        ? 'bg-green-500'
                        : step.status === 'current'
                        ? 'bg-blue-500'
                        : 'bg-gray-200'
                    }`}>
                      {step.status === 'completed' ? (
                        <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : step.status === 'current' ? (
                        <div className="w-3 h-3 bg-white rounded-full" />
                      ) : (
                        <div className="w-3 h-3 bg-gray-400 rounded-full" />
                      )}
                    </div>

                    {/* コンテンツ */}
                    <div className="ml-4 flex-1">
                      <div className="flex items-center">
                        <h3 className={`text-sm font-medium ${
                          step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-900'
                        }`}>
                          {step.name}
                        </h3>
                        {step.status === 'current' && (
                          <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                            進行中
                          </span>
                        )}
                      </div>
                      <p className={`mt-1 text-sm ${
                        step.status === 'upcoming' ? 'text-gray-400' : 'text-gray-500'
                      }`}>
                        {step.description}
                      </p>
                      {step.completedAt && (
                        <p className="mt-1 text-xs text-gray-400">
                          完了：{new Date(step.completedAt).toLocaleDateString('ja-JP')}
                        </p>
                      )}
                      {step.estimatedDate && (
                        <p className="mt-1 text-xs text-gray-400">
                          予定：{step.estimatedDate}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* タイムライン */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">履歴</h2>
          </div>
          <div className="px-6 py-4">
            <div className="space-y-4">
              {progress.timeline.map(item => (
                <div key={item.id} className="flex items-start">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                    item.type === 'milestone'
                      ? 'bg-green-100'
                      : item.type === 'document'
                      ? 'bg-blue-100'
                      : 'bg-gray-100'
                  }`}>
                    {item.type === 'milestone' ? (
                      <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    ) : item.type === 'document' ? (
                      <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    ) : (
                      <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    )}
                  </div>
                  <div className="ml-4">
                    <div className="flex items-center">
                      <span className="text-xs text-gray-400">
                        {new Date(item.date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-gray-900">{item.title}</h4>
                    <p className="text-sm text-gray-500">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 戻るリンク */}
        <div className="mt-6">
          <Link
            href="/mypage"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← マイページに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
