/**
 * 資料確認画面（事務職員用）
 *
 * 依頼者から提出された資料の確認・管理を行う
 *
 * 重要（非弁対策）：
 * - 事務職員は資料の確認・整理のみ
 * - 法的判断は弁護士が行う
 * - 不備がある場合の指摘は事務連絡として行う
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface Document {
  id: string;
  name: string;
  category: 'id' | 'income' | 'debt' | 'asset' | 'expense' | 'other';
  uploadedAt: Date;
  status: 'pending' | 'confirmed' | 'incomplete' | 'rejected';
  fileType: string;
  fileSize: number;
  notes?: string;
  confirmedBy?: string;
  confirmedAt?: Date;
}

interface RequiredDocument {
  id: string;
  name: string;
  category: Document['category'];
  description: string;
  required: boolean;
  submitted: boolean;
}

export default function StaffDocumentsPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [activeTab, setActiveTab] = useState<'uploaded' | 'required'>('uploaded');
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'incomplete'>('all');

  // モックデータ: アップロード済み資料
  const [documents] = useState<Document[]>([
    {
      id: '1',
      name: '運転免許証.jpg',
      category: 'id',
      uploadedAt: new Date('2024-12-05T10:30:00'),
      status: 'confirmed',
      fileType: 'image/jpeg',
      fileSize: 1024000,
      confirmedBy: '山田事務員',
      confirmedAt: new Date('2024-12-05T14:00:00'),
    },
    {
      id: '2',
      name: '給与明細_11月.pdf',
      category: 'income',
      uploadedAt: new Date('2024-12-06T09:15:00'),
      status: 'confirmed',
      fileType: 'application/pdf',
      fileSize: 512000,
      confirmedBy: '山田事務員',
      confirmedAt: new Date('2024-12-06T11:00:00'),
    },
    {
      id: '3',
      name: 'アコム利用明細.pdf',
      category: 'debt',
      uploadedAt: new Date('2024-12-07T14:20:00'),
      status: 'pending',
      fileType: 'application/pdf',
      fileSize: 256000,
    },
    {
      id: '4',
      name: '住民票.pdf',
      category: 'id',
      uploadedAt: new Date('2024-12-08T16:45:00'),
      status: 'incomplete',
      fileType: 'application/pdf',
      fileSize: 128000,
      notes: '3ヶ月以内のものが必要です（現在の住民票は6ヶ月前のもの）',
    },
    {
      id: '5',
      name: '通帳コピー.pdf',
      category: 'asset',
      uploadedAt: new Date('2024-12-08T17:00:00'),
      status: 'incomplete',
      fileType: 'application/pdf',
      fileSize: 768000,
      notes: '全ページのコピーが必要です（1ページ目のみ）',
    },
  ]);

  // モックデータ: 必要書類リスト
  const requiredDocuments: RequiredDocument[] = [
    { id: 'r1', name: '本人確認書類（運転免許証等）', category: 'id', description: '有効期限内のもの', required: true, submitted: true },
    { id: 'r2', name: '住民票', category: 'id', description: '3ヶ月以内に取得したもの', required: true, submitted: true },
    { id: 'r3', name: '給与明細（直近3ヶ月分）', category: 'income', description: '勤務先発行のもの', required: true, submitted: false },
    { id: 'r4', name: '源泉徴収票', category: 'income', description: '直近年度のもの', required: true, submitted: false },
    { id: 'r5', name: '預金通帳コピー', category: 'asset', description: '全ページ・過去2年分', required: true, submitted: true },
    { id: 'r6', name: '債権者からの督促状・明細', category: 'debt', description: '手元にあるもの全て', required: false, submitted: true },
    { id: 'r7', name: '保険証券', category: 'asset', description: '生命保険・損害保険等', required: false, submitted: false },
    { id: 'r8', name: '家賃の領収書・契約書', category: 'expense', description: '賃貸の場合', required: false, submitted: false },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getCategoryLabel = (category: Document['category']) => {
    switch (category) {
      case 'id':
        return '本人確認';
      case 'income':
        return '収入関係';
      case 'debt':
        return '債務関係';
      case 'asset':
        return '資産関係';
      case 'expense':
        return '支出関係';
      case 'other':
        return 'その他';
    }
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">確認待ち</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">確認済み</span>;
      case 'incomplete':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">不備あり</span>;
      case 'rejected':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">差し戻し</span>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'pending') return doc.status === 'pending';
    if (filter === 'incomplete') return doc.status === 'incomplete';
    return true;
  });

  const pendingCount = documents.filter(d => d.status === 'pending').length;
  const incompleteCount = documents.filter(d => d.status === 'incomplete').length;
  const submittedRequiredCount = requiredDocuments.filter(d => d.required && d.submitted).length;
  const totalRequiredCount = requiredDocuments.filter(d => d.required).length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/staff/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                ← ダッシュボード
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">資料確認</h1>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                案件ID: {caseId}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded">事務職員</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 権限注意 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>事務職員の権限</strong>：資料の確認・不備の指摘（事務連絡）のみ可能です。
            法的判断や依頼者への法的回答は弁護士が行います。
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">アップロード済み</p>
            <p className="text-2xl font-bold text-gray-900">{documents.length}件</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">確認待ち</p>
            <p className="text-2xl font-bold text-yellow-600">{pendingCount}件</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">不備あり</p>
            <p className="text-2xl font-bold text-red-600">{incompleteCount}件</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">必須書類</p>
            <p className="text-2xl font-bold text-gray-900">
              {submittedRequiredCount}/{totalRequiredCount}
            </p>
          </div>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'uploaded'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                アップロード済み資料
              </button>
              <button
                onClick={() => setActiveTab('required')}
                className={`px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === 'required'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                必要書類チェックリスト
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'uploaded' && (
          <div className="grid grid-cols-3 gap-6">
            {/* 資料一覧 */}
            <div className="col-span-2">
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                  <h2 className="font-medium text-gray-900">アップロード済み資料</h2>
                  <div className="flex space-x-2">
                    {[
                      { value: 'all', label: 'すべて' },
                      { value: 'pending', label: '確認待ち' },
                      { value: 'incomplete', label: '不備あり' },
                    ].map(f => (
                      <button
                        key={f.value}
                        onClick={() => setFilter(f.value as 'all' | 'pending' | 'incomplete')}
                        className={`px-3 py-1 text-xs rounded-full ${
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

                <div className="divide-y divide-gray-100">
                  {filteredDocuments.map(doc => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoc(doc)}
                      className={`px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                        selectedDoc?.id === doc.id ? 'bg-blue-50' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="flex-shrink-0">
                            <svg className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{doc.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-xs text-gray-500">{getCategoryLabel(doc.category)}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                              <span className="text-xs text-gray-400">|</span>
                              <span className="text-xs text-gray-500">
                                {doc.uploadedAt.toLocaleDateString('ja-JP')}
                              </span>
                            </div>
                          </div>
                        </div>
                        {getStatusBadge(doc.status)}
                      </div>
                      {doc.notes && (
                        <div className="mt-2 ml-11 text-sm text-red-600">
                          {doc.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 詳細・操作パネル */}
            <div className="space-y-6">
              {selectedDoc ? (
                <>
                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">資料詳細</h3>
                    <dl className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <dt className="text-gray-500">ファイル名</dt>
                        <dd className="text-gray-900">{selectedDoc.name}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">カテゴリ</dt>
                        <dd className="text-gray-900">{getCategoryLabel(selectedDoc.category)}</dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">アップロード日時</dt>
                        <dd className="text-gray-900">
                          {selectedDoc.uploadedAt.toLocaleString('ja-JP')}
                        </dd>
                      </div>
                      <div className="flex justify-between">
                        <dt className="text-gray-500">ステータス</dt>
                        <dd>{getStatusBadge(selectedDoc.status)}</dd>
                      </div>
                      {selectedDoc.confirmedBy && (
                        <div className="flex justify-between">
                          <dt className="text-gray-500">確認者</dt>
                          <dd className="text-gray-900">{selectedDoc.confirmedBy}</dd>
                        </div>
                      )}
                    </dl>
                  </div>

                  <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">操作</h3>
                    <div className="space-y-2">
                      <button className="w-full px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700">
                        確認済みにする
                      </button>
                      <button className="w-full px-4 py-2 text-sm font-medium text-white bg-amber-600 rounded-lg hover:bg-amber-700">
                        不備ありにする
                      </button>
                      <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        プレビュー
                      </button>
                      <button className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
                        ダウンロード
                      </button>
                    </div>

                    {selectedDoc.status === 'incomplete' && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          不備の内容（事務連絡として依頼者に通知）
                        </label>
                        <textarea
                          rows={3}
                          defaultValue={selectedDoc.notes || ''}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                          placeholder="不備の内容を記載..."
                        />
                        <button className="mt-2 w-full px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100">
                          再提出を依頼（事務連絡）
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
                  <svg className="mx-auto h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="mt-4">資料を選択してください</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'required' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="font-medium text-gray-900">必要書類チェックリスト</h2>
            </div>

            <div className="divide-y divide-gray-100">
              {requiredDocuments.map(doc => (
                <div key={doc.id} className="px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                      doc.submitted ? 'bg-green-100' : 'bg-gray-100'
                    }`}>
                      {doc.submitted ? (
                        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        {doc.required && (
                          <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">必須</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mt-0.5">{doc.description}</p>
                    </div>
                  </div>
                  <span className={`text-sm ${doc.submitted ? 'text-green-600' : 'text-gray-400'}`}>
                    {doc.submitted ? '提出済み' : '未提出'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
