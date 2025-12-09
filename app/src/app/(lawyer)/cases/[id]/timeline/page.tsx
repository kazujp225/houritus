/**
 * 案件タイムライン・履歴画面
 *
 * 案件に関するすべての操作履歴を時系列で表示
 *
 * 重要：
 * - 監査ログとして機能
 * - 弁護士の承認履歴を記録
 * - 送信ゲート通過の記録
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface TimelineEvent {
  id: string;
  type: 'status_change' | 'document' | 'message' | 'approval' | 'send' | 'system';
  title: string;
  description?: string;
  actor: {
    name: string;
    role: 'LAWYER' | 'STAFF' | 'CLIENT' | 'SYSTEM';
  };
  timestamp: Date;
  metadata?: Record<string, string>;
}

export default function CaseTimelinePage() {
  const params = useParams();
  const caseId = params.id as string;

  const [filter, setFilter] = useState<'all' | 'approval' | 'document' | 'message' | 'send'>('all');

  // モックデータ
  const events: TimelineEvent[] = [
    {
      id: '1',
      type: 'send',
      title: '受任通知を送信',
      description: 'アコム株式会社、プロミス株式会社への受任通知を送信',
      actor: { name: '柳田 太郎', role: 'LAWYER' },
      timestamp: new Date('2024-12-09T15:30:00'),
      metadata: { creditorCount: '2', sendMethod: 'FAX' },
    },
    {
      id: '2',
      type: 'approval',
      title: '受任通知ドラフトを承認',
      description: 'AIドラフトを確認し承認',
      actor: { name: '柳田 太郎', role: 'LAWYER' },
      timestamp: new Date('2024-12-09T15:00:00'),
    },
    {
      id: '3',
      type: 'system',
      title: '受任通知ドラフトを生成',
      description: 'AIが受任通知のドラフトを自動生成',
      actor: { name: 'システム', role: 'SYSTEM' },
      timestamp: new Date('2024-12-09T14:30:00'),
    },
    {
      id: '4',
      type: 'document',
      title: '資料を確認済みに変更',
      description: '給与明細（11月）の確認を完了',
      actor: { name: '山田 事務員', role: 'STAFF' },
      timestamp: new Date('2024-12-09T11:00:00'),
    },
    {
      id: '5',
      type: 'document',
      title: '資料がアップロードされました',
      description: '給与明細（11月）をアップロード',
      actor: { name: '田中 一郎', role: 'CLIENT' },
      timestamp: new Date('2024-12-09T10:30:00'),
    },
    {
      id: '6',
      type: 'message',
      title: '依頼者にメッセージを送信',
      description: '資料提出のリマインドを送信',
      actor: { name: '山田 事務員', role: 'STAFF' },
      timestamp: new Date('2024-12-08T16:00:00'),
    },
    {
      id: '7',
      type: 'approval',
      title: '委任契約書を送信',
      description: '依頼者に委任契約書を送信',
      actor: { name: '柳田 太郎', role: 'LAWYER' },
      timestamp: new Date('2024-12-08T14:00:00'),
    },
    {
      id: '8',
      type: 'status_change',
      title: 'ステータスを「受任済」に変更',
      actor: { name: '柳田 太郎', role: 'LAWYER' },
      timestamp: new Date('2024-12-08T13:30:00'),
    },
    {
      id: '9',
      type: 'approval',
      title: '利益相反チェック完了：受任可',
      description: '既存案件との利益相反なし',
      actor: { name: '柳田 太郎', role: 'LAWYER' },
      timestamp: new Date('2024-12-07T11:00:00'),
    },
    {
      id: '10',
      type: 'status_change',
      title: '案件を作成',
      actor: { name: '柳田 太郎', role: 'LAWYER' },
      timestamp: new Date('2024-12-07T10:00:00'),
    },
  ];

  const getEventIcon = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'status_change':
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'document':
        return (
          <div className="bg-purple-100 rounded-full p-2">
            <svg className="h-4 w-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'message':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
        );
      case 'approval':
        return (
          <div className="bg-amber-100 rounded-full p-2">
            <svg className="h-4 w-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'send':
        return (
          <div className="bg-red-100 rounded-full p-2">
            <svg className="h-4 w-4 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </div>
        );
      case 'system':
        return (
          <div className="bg-gray-100 rounded-full p-2">
            <svg className="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        );
    }
  };

  const getRoleBadge = (role: TimelineEvent['actor']['role']) => {
    switch (role) {
      case 'LAWYER':
        return <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded">弁護士</span>;
      case 'STAFF':
        return <span className="px-1.5 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">事務職員</span>;
      case 'CLIENT':
        return <span className="px-1.5 py-0.5 bg-green-100 text-green-700 text-xs rounded">依頼者</span>;
      case 'SYSTEM':
        return <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs rounded">システム</span>;
    }
  };

  const filteredEvents = events.filter(e => {
    if (filter === 'all') return true;
    if (filter === 'approval') return e.type === 'approval';
    if (filter === 'document') return e.type === 'document';
    if (filter === 'message') return e.type === 'message';
    if (filter === 'send') return e.type === 'send';
    return true;
  });

  // 日付でグループ化
  const groupedEvents = filteredEvents.reduce((acc, event) => {
    const dateKey = event.timestamp.toLocaleDateString('ja-JP');
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(event);
    return acc;
  }, {} as Record<string, TimelineEvent[]>);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href={`/cases/${caseId}`}
                className="text-gray-500 hover:text-gray-700"
              >
                ← 案件詳細
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">案件履歴</h1>
            </div>
            <Link
              href="/audit-logs"
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              監査ログを見る →
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* フィルター */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'すべて' },
              { value: 'approval', label: '承認' },
              { value: 'send', label: '送信' },
              { value: 'document', label: '資料' },
              { value: 'message', label: 'メッセージ' },
            ].map(f => (
              <button
                key={f.value}
                onClick={() => setFilter(f.value as 'all' | 'approval' | 'document' | 'message' | 'send')}
                className={`px-4 py-2 text-sm rounded-lg ${
                  filter === f.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* タイムライン */}
        <div className="bg-white rounded-lg shadow">
          {Object.entries(groupedEvents).map(([date, dayEvents], dateIndex) => (
            <div key={date}>
              {/* 日付ヘッダー */}
              <div className={`px-6 py-3 bg-gray-50 ${dateIndex > 0 ? 'border-t border-gray-200' : ''}`}>
                <h2 className="text-sm font-medium text-gray-700">{date}</h2>
              </div>

              {/* イベント */}
              <div className="relative">
                {dayEvents.map((event, eventIndex) => (
                  <div
                    key={event.id}
                    className={`px-6 py-4 flex ${eventIndex < dayEvents.length - 1 ? 'border-b border-gray-100' : ''}`}
                  >
                    {/* アイコン */}
                    <div className="flex-shrink-0">
                      {getEventIcon(event.type)}
                    </div>

                    {/* コンテンツ */}
                    <div className="ml-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-gray-900">{event.title}</p>
                        <span className="text-xs text-gray-500">
                          {event.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      )}
                      <div className="mt-2 flex items-center space-x-2">
                        {getRoleBadge(event.actor.role)}
                        <span className="text-xs text-gray-500">{event.actor.name}</span>
                      </div>
                      {event.metadata && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {Object.entries(event.metadata).map(([key, value]) => (
                            <span key={key} className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">
                              {key}: {value}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {filteredEvents.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              該当する履歴がありません
            </div>
          )}
        </div>

        {/* 凡例 */}
        <div className="mt-6 bg-white rounded-lg shadow p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">アイコンの凡例</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              {getEventIcon('status_change')}
              <span className="text-gray-600">ステータス変更</span>
            </div>
            <div className="flex items-center space-x-2">
              {getEventIcon('approval')}
              <span className="text-gray-600">承認</span>
            </div>
            <div className="flex items-center space-x-2">
              {getEventIcon('send')}
              <span className="text-gray-600">対外送信</span>
            </div>
            <div className="flex items-center space-x-2">
              {getEventIcon('document')}
              <span className="text-gray-600">資料</span>
            </div>
            <div className="flex items-center space-x-2">
              {getEventIcon('message')}
              <span className="text-gray-600">メッセージ</span>
            </div>
            <div className="flex items-center space-x-2">
              {getEventIcon('system')}
              <span className="text-gray-600">システム</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
