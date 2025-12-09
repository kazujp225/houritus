/**
 * 申立書ドラフト作成画面
 *
 * 破産申立書一式のAIドラフト生成・確認・編集
 *
 * 重要（非弁対策）：
 * - AIドラフトは弁護士確認必須
 * - 弁護士承認後に裁判所提出
 * - 送信ゲートで最終確認
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';

interface FilingDocument {
  id: string;
  name: string;
  type: 'main' | 'attachment' | 'schedule';
  status: 'not_started' | 'ai_draft' | 'reviewing' | 'approved' | 'submitted';
  aiGenerated: boolean;
  lastEditedAt?: Date;
  approvedBy?: string;
  approvedAt?: Date;
}

export default function FilingPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.id as string;

  const [generating, setGenerating] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<FilingDocument | null>(null);
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // モックデータ: 申立書類一式
  const [documents, setDocuments] = useState<FilingDocument[]>([
    {
      id: '1',
      name: '破産申立書',
      type: 'main',
      status: 'approved',
      aiGenerated: true,
      lastEditedAt: new Date('2024-12-08T10:00:00'),
      approvedBy: '柳田弁護士',
      approvedAt: new Date('2024-12-08T14:00:00'),
    },
    {
      id: '2',
      name: '陳述書',
      type: 'main',
      status: 'reviewing',
      aiGenerated: true,
      lastEditedAt: new Date('2024-12-08T11:30:00'),
    },
    {
      id: '3',
      name: '債権者一覧表',
      type: 'schedule',
      status: 'ai_draft',
      aiGenerated: true,
      lastEditedAt: new Date('2024-12-08T09:00:00'),
    },
    {
      id: '4',
      name: '財産目録',
      type: 'schedule',
      status: 'ai_draft',
      aiGenerated: true,
      lastEditedAt: new Date('2024-12-08T09:00:00'),
    },
    {
      id: '5',
      name: '家計収支表',
      type: 'schedule',
      status: 'not_started',
      aiGenerated: false,
    },
    {
      id: '6',
      name: '住民票',
      type: 'attachment',
      status: 'approved',
      aiGenerated: false,
      approvedBy: '柳田弁護士',
      approvedAt: new Date('2024-12-07T16:00:00'),
    },
    {
      id: '7',
      name: '戸籍謄本',
      type: 'attachment',
      status: 'not_started',
      aiGenerated: false,
    },
  ]);

  const handleGenerateAll = async () => {
    setGenerating(true);
    // TODO: 実際のAI APIを呼び出し
    await new Promise(resolve => setTimeout(resolve, 3000));
    setDocuments(prev =>
      prev.map(doc => {
        if (doc.status === 'not_started' && doc.type !== 'attachment') {
          return {
            ...doc,
            status: 'ai_draft' as const,
            aiGenerated: true,
            lastEditedAt: new Date(),
          };
        }
        return doc;
      })
    );
    setGenerating(false);
    alert('AIドラフトを生成しました（デモ）');
  };

  const getStatusBadge = (status: FilingDocument['status']) => {
    switch (status) {
      case 'not_started':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">未作成</span>;
      case 'ai_draft':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">AIドラフト</span>;
      case 'reviewing':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">確認中</span>;
      case 'approved':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">承認済</span>;
      case 'submitted':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">提出済</span>;
    }
  };

  const getTypeLabel = (type: FilingDocument['type']) => {
    switch (type) {
      case 'main':
        return '本体書類';
      case 'schedule':
        return '添付別紙';
      case 'attachment':
        return '添付書類';
    }
  };

  const mainDocs = documents.filter(d => d.type === 'main');
  const scheduleDocs = documents.filter(d => d.type === 'schedule');
  const attachmentDocs = documents.filter(d => d.type === 'attachment');

  const approvedCount = documents.filter(d => d.status === 'approved').length;
  const totalCount = documents.length;
  const allApproved = documents.every(d => d.status === 'approved' || d.status === 'submitted');

  const [checkedItems, setCheckedItems] = useState({
    allReviewed: false,
    lawyerApproved: false,
    readyToSubmit: false,
  });

  const allChecked = Object.values(checkedItems).every(Boolean);

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
              <h1 className="text-lg font-bold text-gray-900">申立書作成</h1>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handleGenerateAll}
                disabled={generating}
                className="px-4 py-2 text-sm font-medium text-purple-600 bg-purple-50 rounded-lg hover:bg-purple-100 disabled:opacity-50"
              >
                {generating ? 'AI生成中...' : 'AIで一括ドラフト生成'}
              </button>
              <button
                onClick={() => router.push(`/cases/${caseId}/filing/preview`)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                全体プレビュー
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* AIドラフト注意 */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-purple-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-purple-800">
                <strong>AIドラフトについて</strong><br />
                AIが生成したドラフトは必ず弁護士が内容を確認し、承認してから裁判所に提出してください。
                AIは補助ツールであり、最終的な法的判断と責任は弁護士が負います。
              </p>
            </div>
          </div>
        </div>

        {/* 進捗サマリー */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">申立準備状況</h2>
              <p className="text-sm text-gray-500 mt-1">
                {approvedCount}/{totalCount} 書類が承認済み
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="w-48 bg-gray-200 rounded-full h-2">
                <div
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(approvedCount / totalCount) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium text-gray-700">
                {Math.round((approvedCount / totalCount) * 100)}%
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* 書類一覧 */}
          <div className="col-span-2 space-y-6">
            {/* 本体書類 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">本体書類</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {mainDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.aiGenerated && (
                          <span className="text-xs text-purple-600">AI生成</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(doc.status)}
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 添付別紙 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">添付別紙</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {scheduleDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.aiGenerated && (
                          <span className="text-xs text-purple-600">AI生成</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(doc.status)}
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 添付書類 */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="font-medium text-gray-900">添付書類</h3>
              </div>
              <div className="divide-y divide-gray-100">
                {attachmentDocs.map(doc => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc)}
                    className={`px-6 py-4 flex items-center justify-between hover:bg-gray-50 cursor-pointer ${
                      selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                      </svg>
                      <p className="font-medium text-gray-900">{doc.name}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(doc.status)}
                      <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* サイドバー */}
          <div className="space-y-6">
            {/* 選択中の書類 */}
            {selectedDoc ? (
              <div className="bg-white rounded-lg shadow p-6">
                <h3 className="font-medium text-gray-900 mb-4">{selectedDoc.name}</h3>
                <dl className="space-y-3 text-sm mb-4">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">種別</dt>
                    <dd className="text-gray-900">{getTypeLabel(selectedDoc.type)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">ステータス</dt>
                    <dd>{getStatusBadge(selectedDoc.status)}</dd>
                  </div>
                  {selectedDoc.lastEditedAt && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">最終更新</dt>
                      <dd className="text-gray-900">
                        {selectedDoc.lastEditedAt.toLocaleString('ja-JP')}
                      </dd>
                    </div>
                  )}
                  {selectedDoc.approvedBy && (
                    <div className="flex justify-between">
                      <dt className="text-gray-500">承認者</dt>
                      <dd className="text-gray-900">{selectedDoc.approvedBy}</dd>
                    </div>
                  )}
                </dl>

                <div className="space-y-2">
                  <button
                    onClick={() => router.push(`/cases/${caseId}/drafts/${selectedDoc.id}/review`)}
                    className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                  >
                    確認・編集
                  </button>
                  {selectedDoc.status === 'ai_draft' && (
                    <button className="w-full px-4 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100">
                      承認する
                    </button>
                  )}
                  <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                    プレビュー
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                <p>書類を選択してください</p>
              </div>
            )}

            {/* 申立提出 */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-medium text-gray-900 mb-4">裁判所への申立</h3>

              {!allApproved && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4">
                  <p className="text-sm text-amber-800">
                    すべての書類を承認してから申立を行ってください
                  </p>
                </div>
              )}

              <div className="space-y-3 mb-4">
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedItems.allReviewed}
                    onChange={e => setCheckedItems({ ...checkedItems, allReviewed: e.target.checked })}
                    disabled={!allApproved}
                    className="h-4 w-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    すべての書類を確認しました
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedItems.lawyerApproved}
                    onChange={e => setCheckedItems({ ...checkedItems, lawyerApproved: e.target.checked })}
                    disabled={!allApproved}
                    className="h-4 w-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    弁護士として内容を承認します
                  </span>
                </label>
                <label className="flex items-start">
                  <input
                    type="checkbox"
                    checked={checkedItems.readyToSubmit}
                    onChange={e => setCheckedItems({ ...checkedItems, readyToSubmit: e.target.checked })}
                    disabled={!allApproved}
                    className="h-4 w-4 text-blue-600 rounded mt-0.5"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    申立準備が完了しています
                  </span>
                </label>
              </div>

              <button
                onClick={() => setShowSubmitConfirm(true)}
                disabled={!allChecked || !allApproved}
                className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                裁判所に申立書を提出
              </button>

              <p className="mt-3 text-xs text-gray-500 text-center">
                送信は弁護士のみ実行可能です
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 申立確認モーダル */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">申立書の提出</h3>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-amber-800">
                <strong>送信ゲート確認</strong><br />
                東京地方裁判所に破産申立書一式を提出します。
                この操作は取り消しできません。
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-800">
                <strong>弁護士確認</strong><br />
                弁護士として申立書の内容に責任を持ち、提出を実行します。
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                キャンセル
              </button>
              <button
                onClick={() => {
                  alert('申立書を提出しました（デモ）');
                  setShowSubmitConfirm(false);
                  router.push(`/cases/${caseId}`);
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700"
              >
                提出する
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
