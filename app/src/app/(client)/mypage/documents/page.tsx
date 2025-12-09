/**
 * 提出済み書類一覧画面（依頼者用）
 *
 * 依頼者が提出した書類の確認状況を表示
 *
 * 重要：
 * - 依頼者画面に「法的判断」を出さない
 * - 弁護士確認後のステータスのみ表示
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface Document {
  id: string;
  name: string;
  category: string;
  uploadedAt: Date;
  status: 'checking' | 'confirmed' | 'resubmit_required';
  fileSize: number;
  note?: string;
}

export default function ClientDocumentsPage() {
  const [filter, setFilter] = useState<'all' | 'checking' | 'confirmed' | 'resubmit'>('all');

  // モックデータ
  const documents: Document[] = [
    {
      id: '1',
      name: '運転免許証.jpg',
      category: '本人確認書類',
      uploadedAt: new Date('2024-12-05T10:30:00'),
      status: 'confirmed',
      fileSize: 1024000,
    },
    {
      id: '2',
      name: '給与明細_11月.pdf',
      category: '収入関係書類',
      uploadedAt: new Date('2024-12-06T09:15:00'),
      status: 'confirmed',
      fileSize: 512000,
    },
    {
      id: '3',
      name: '給与明細_10月.pdf',
      category: '収入関係書類',
      uploadedAt: new Date('2024-12-06T09:16:00'),
      status: 'confirmed',
      fileSize: 480000,
    },
    {
      id: '4',
      name: 'アコム利用明細.pdf',
      category: '債務関係書類',
      uploadedAt: new Date('2024-12-07T14:20:00'),
      status: 'checking',
      fileSize: 256000,
    },
    {
      id: '5',
      name: '住民票.pdf',
      category: '本人確認書類',
      uploadedAt: new Date('2024-12-08T16:45:00'),
      status: 'resubmit_required',
      fileSize: 128000,
      note: '3ヶ月以内に取得したものをご提出ください。現在のものは発行日が6ヶ月以上前のため再提出をお願いいたします。',
    },
    {
      id: '6',
      name: '通帳コピー_A銀行.pdf',
      category: '資産関係書類',
      uploadedAt: new Date('2024-12-08T17:00:00'),
      status: 'resubmit_required',
      fileSize: 768000,
      note: '全ページのコピーが必要です。現在のものは1ページ目のみのため、最初から最後までの全ページを再提出してください。',
    },
  ];

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusBadge = (status: Document['status']) => {
    switch (status) {
      case 'checking':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">確認中</span>;
      case 'confirmed':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">確認済み</span>;
      case 'resubmit_required':
        return <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-medium rounded">再提出</span>;
    }
  };

  const filteredDocuments = documents.filter(doc => {
    if (filter === 'all') return true;
    if (filter === 'checking') return doc.status === 'checking';
    if (filter === 'confirmed') return doc.status === 'confirmed';
    if (filter === 'resubmit') return doc.status === 'resubmit_required';
    return true;
  });

  const resubmitCount = documents.filter(d => d.status === 'resubmit_required').length;
  const checkingCount = documents.filter(d => d.status === 'checking').length;
  const confirmedCount = documents.filter(d => d.status === 'confirmed').length;

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

        {/* パンくず */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/mypage" className="text-gray-500 hover:text-gray-700">
                マイページ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">提出済み書類</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">提出済み書類</h1>
              <p className="mt-1 text-sm text-gray-600">
                アップロードした書類の確認状況をご覧いただけます
              </p>
            </div>
            <Link
              href="/mypage/upload"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
            >
              書類を追加
            </Link>
          </div>
        </div>

        {/* 再提出が必要な書類 */}
        {resubmitCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <svg className="h-5 w-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  再提出が必要な書類があります（{resubmitCount}件）
                </h3>
                <p className="mt-1 text-sm text-red-700">
                  下記の書類の再提出をお願いいたします。詳細は各書類のメモをご確認ください。
                </p>
              </div>
            </div>
          </div>
        )}

        {/* サマリー */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{confirmedCount}</p>
            <p className="text-sm text-gray-500">確認済み</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{checkingCount}</p>
            <p className="text-sm text-gray-500">確認中</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4 text-center">
            <p className="text-2xl font-bold text-red-600">{resubmitCount}</p>
            <p className="text-sm text-gray-500">要再提出</p>
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-3 border-b border-gray-200">
            <div className="flex space-x-2">
              {[
                { value: 'all', label: 'すべて' },
                { value: 'checking', label: '確認中' },
                { value: 'confirmed', label: '確認済み' },
                { value: 'resubmit', label: '要再提出' },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value as 'all' | 'checking' | 'confirmed' | 'resubmit')}
                  className={`px-3 py-1 text-sm rounded-full ${
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

          {/* 書類一覧 */}
          <div className="divide-y divide-gray-100">
            {filteredDocuments.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                該当する書類がありません
              </div>
            ) : (
              filteredDocuments.map(doc => (
                <div key={doc.id} className="px-6 py-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      <div className="flex-shrink-0 mt-1">
                        <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{doc.name}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="text-xs text-gray-500">{doc.category}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">{formatFileSize(doc.fileSize)}</span>
                          <span className="text-xs text-gray-400">|</span>
                          <span className="text-xs text-gray-500">
                            {doc.uploadedAt.toLocaleDateString('ja-JP')} 提出
                          </span>
                        </div>
                        {doc.note && (
                          <div className="mt-2 p-2 bg-red-50 rounded text-sm text-red-700">
                            <strong>担当者からのメモ：</strong><br />
                            {doc.note}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(doc.status)}
                      {doc.status === 'resubmit_required' && (
                        <Link
                          href="/mypage/upload"
                          className="px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100"
                        >
                          再提出
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* 注意事項 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">ご確認ください</h3>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>書類の確認には数日お時間をいただく場合がございます</li>
            <li>再提出が必要な場合は、メモの内容をご確認の上再度アップロードしてください</li>
            <li>ご不明な点は担当弁護士にお問い合わせください</li>
          </ul>
        </div>

        {/* マイページに戻る */}
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
