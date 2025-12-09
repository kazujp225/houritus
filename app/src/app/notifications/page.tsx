/**
 * 通知一覧画面
 *
 * すべての通知を一覧で表示・管理
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  category: 'document' | 'approval' | 'message' | 'system' | 'deadline';
  createdAt: Date;
  read: boolean;
  link?: string;
  caseNumber?: string;
}

export default function NotificationsPage() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // モックデータ
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '新しい資料がアップロードされました',
      message: '田中一郎様が給与明細をアップロードしました',
      type: 'info',
      category: 'document',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      link: '/cases/case-001',
      caseNumber: '2024-0001',
    },
    {
      id: '2',
      title: '承認待ちのドラフトがあります',
      message: '受任通知のドラフトが作成されました。確認をお願いします。',
      type: 'warning',
      category: 'approval',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      link: '/cases/case-001/drafts/1/review',
      caseNumber: '2024-0001',
    },
    {
      id: '3',
      title: '利益相反チェック完了',
      message: '佐藤花子様の案件の利益相反チェックが完了しました',
      type: 'success',
      category: 'system',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
      link: '/cases/case-002',
      caseNumber: '2024-0002',
    },
    {
      id: '4',
      title: '期限が近づいています',
      message: '鈴木太郎様の申立書提出期限まであと3日です',
      type: 'warning',
      category: 'deadline',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2),
      read: false,
      link: '/cases/case-003',
      caseNumber: '2024-0003',
    },
    {
      id: '5',
      title: '依頼者からのメッセージ',
      message: '高橋美咲様から新しいメッセージがあります',
      type: 'info',
      category: 'message',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
      read: true,
      link: '/cases/case-004/messages',
      caseNumber: '2024-0004',
    },
    {
      id: '6',
      title: 'システムメンテナンスのお知らせ',
      message: '12月15日 02:00-04:00にシステムメンテナンスを実施します',
      type: 'info',
      category: 'system',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5),
      read: true,
    },
  ]);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    if (diffDays < 7) return `${diffDays}日前`;
    return date.toLocaleDateString('ja-JP');
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return (
          <div className="bg-amber-100 rounded-full p-2">
            <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="bg-green-100 rounded-full p-2">
            <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="bg-red-100 rounded-full p-2">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 rounded-full p-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getCategoryLabel = (category: Notification['category']) => {
    switch (category) {
      case 'document':
        return { label: '資料', color: 'bg-purple-100 text-purple-700' };
      case 'approval':
        return { label: '承認', color: 'bg-amber-100 text-amber-700' };
      case 'message':
        return { label: 'メッセージ', color: 'bg-green-100 text-green-700' };
      case 'deadline':
        return { label: '期限', color: 'bg-red-100 text-red-700' };
      case 'system':
        return { label: 'システム', color: 'bg-gray-100 text-gray-700' };
      default:
        return { label: 'その他', color: 'bg-gray-100 text-gray-700' };
    }
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const filteredNotifications = notifications
    .filter(n => {
      if (filter === 'unread') return !n.read;
      if (filter === 'read') return n.read;
      return true;
    })
    .filter(n => {
      if (categoryFilter === 'all') return true;
      return n.category === categoryFilter;
    });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">通知一覧</h1>
              <p className="mt-1 text-sm text-gray-600">
                {unreadCount > 0 ? `${unreadCount}件の未読通知があります` : 'すべての通知を確認済みです'}
              </p>
            </div>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100"
              >
                すべて既読にする
              </button>
            )}
          </div>
        </div>

        {/* フィルター */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              {/* 既読・未読フィルター */}
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: 'すべて' },
                  { value: 'unread', label: '未読' },
                  { value: 'read', label: '既読' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setFilter(f.value as 'all' | 'unread' | 'read')}
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

              <div className="h-6 w-px bg-gray-300" />

              {/* カテゴリフィルター */}
              <div className="flex space-x-2">
                {[
                  { value: 'all', label: '全カテゴリ' },
                  { value: 'approval', label: '承認' },
                  { value: 'document', label: '資料' },
                  { value: 'message', label: 'メッセージ' },
                  { value: 'deadline', label: '期限' },
                  { value: 'system', label: 'システム' },
                ].map(f => (
                  <button
                    key={f.value}
                    onClick={() => setCategoryFilter(f.value)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      categoryFilter === f.value
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 通知一覧 */}
          <div className="divide-y divide-gray-100">
            {filteredNotifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                該当する通知がありません
              </div>
            ) : (
              filteredNotifications.map(notification => {
                const categoryStyle = getCategoryLabel(notification.category);

                const content = (
                  <div className="flex items-start space-x-4">
                    {getNotificationIcon(notification.type)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <p className={`text-sm ${!notification.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700'}`}>
                          {notification.title}
                        </p>
                        <span className={`px-1.5 py-0.5 text-xs rounded ${categoryStyle.color}`}>
                          {categoryStyle.label}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                      <div className="mt-2 flex items-center space-x-3 text-xs text-gray-500">
                        <span>{formatTimeAgo(notification.createdAt)}</span>
                        {notification.caseNumber && (
                          <>
                            <span>|</span>
                            <span>案件: {notification.caseNumber}</span>
                          </>
                        )}
                      </div>
                    </div>
                    {!notification.read && (
                      <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full mt-2" />
                    )}
                  </div>
                );

                const className = `block px-6 py-4 hover:bg-gray-50 cursor-pointer ${
                  !notification.read ? 'bg-blue-50' : ''
                }`;

                return notification.link ? (
                  <Link
                    key={notification.id}
                    href={notification.link}
                    onClick={() => markAsRead(notification.id)}
                    className={className}
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className={className}
                  >
                    {content}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* ダッシュボードに戻る */}
        <div className="text-center">
          <Link
            href="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← ダッシュボードに戻る
          </Link>
        </div>
      </main>
    </div>
  );
}
