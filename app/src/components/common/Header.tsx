/**
 * 共通ヘッダーコンポーネント
 *
 * 通知機能・ユーザーメニュー付き
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success';
  createdAt: Date;
  read: boolean;
  link?: string;
}

interface HeaderProps {
  tenantName?: string;
  userName?: string;
  userRole?: string;
  showPoweredBy?: boolean;
  notifications?: Notification[];
  unreadCount?: number;
}

export function Header({
  tenantName = '柳田法律事務所',
  userName,
  userRole,
  showPoweredBy = false,
  notifications = [],
  unreadCount = 0,
}: HeaderProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notificationRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // モック通知データ
  const mockNotifications: Notification[] = notifications.length > 0 ? notifications : [
    {
      id: '1',
      title: '新しい資料がアップロードされました',
      message: '田中一郎様が給与明細をアップロードしました',
      type: 'info',
      createdAt: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
      link: '/cases/case-001',
    },
    {
      id: '2',
      title: '承認待ちのドラフトがあります',
      message: '受任通知のドラフトが作成されました',
      type: 'warning',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
      read: false,
      link: '/cases/case-001/drafts/1/review',
    },
    {
      id: '3',
      title: '利益相反チェック完了',
      message: '佐藤花子様の案件の利益相反チェックが完了しました',
      type: 'success',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
      read: true,
    },
  ];

  const actualUnreadCount = unreadCount || mockNotifications.filter(n => !n.read).length;

  const roleLabels: Record<string, string> = {
    LAWYER: '弁護士',
    STAFF: '事務職員',
    CLIENT: '依頼者',
    ADMIN: '管理者',
    TECH_SUPPORT: '技術サポート',
  };

  const getDashboardLink = () => {
    switch (userRole) {
      case 'LAWYER':
        return '/dashboard';
      case 'STAFF':
        return '/staff/dashboard';
      case 'CLIENT':
        return '/mypage';
      default:
        return '/';
    }
  };

  // クリック外で閉じる
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins}分前`;
    if (diffHours < 24) return `${diffHours}時間前`;
    return `${diffDays}日前`;
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'warning':
        return (
          <div className="bg-amber-100 rounded-full p-1.5">
            <svg className="h-3 w-3 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="bg-green-100 rounded-full p-1.5">
            <svg className="h-3 w-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-blue-100 rounded-full p-1.5">
            <svg className="h-3 w-3 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* ロゴ・事務所名 */}
          <div className="flex items-center">
            <Link href={getDashboardLink()} className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">Y</span>
                </div>
              </div>
              <div className="ml-3">
                <h1 className="text-lg font-semibold text-gray-900">
                  {tenantName}
                </h1>
                {showPoweredBy && (
                  <p className="text-xs text-gray-500">
                    Powered by ZettAI（システム提供）
                  </p>
                )}
              </div>
            </Link>
          </div>

          {/* ユーザー情報 */}
          {userName && (
            <div className="flex items-center space-x-4">
              {/* 通知ベル */}
              <div ref={notificationRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowNotifications(!showNotifications);
                    setShowUserMenu(false);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-500 relative"
                >
                  <span className="sr-only">通知を見る</span>
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                  {actualUnreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex items-center justify-center h-4 w-4 text-xs font-bold text-white bg-red-500 rounded-full">
                      {actualUnreadCount > 9 ? '9+' : actualUnreadCount}
                    </span>
                  )}
                </button>

                {/* 通知ドロップダウン */}
                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="flex items-center justify-between">
                        <h3 className="text-sm font-medium text-gray-900">通知</h3>
                        {actualUnreadCount > 0 && (
                          <button className="text-xs text-blue-600 hover:text-blue-800">
                            すべて既読にする
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      {mockNotifications.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 text-sm">
                          通知はありません
                        </div>
                      ) : (
                        mockNotifications.map(notification => (
                          <Link
                            key={notification.id}
                            href={notification.link || '#'}
                            onClick={() => setShowNotifications(false)}
                            className={`block px-4 py-3 hover:bg-gray-50 ${
                              !notification.read ? 'bg-blue-50' : ''
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              {getNotificationIcon(notification.type)}
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm ${!notification.read ? 'font-medium text-gray-900' : 'text-gray-600'}`}>
                                  {notification.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {notification.message}
                                </p>
                                <p className="text-xs text-gray-400 mt-1">
                                  {formatTimeAgo(notification.createdAt)}
                                </p>
                              </div>
                              {!notification.read && (
                                <span className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full" />
                              )}
                            </div>
                          </Link>
                        ))
                      )}
                    </div>
                    <div className="px-4 py-3 border-t border-gray-100">
                      <Link
                        href="/notifications"
                        onClick={() => setShowNotifications(false)}
                        className="block text-center text-sm text-blue-600 hover:text-blue-800"
                      >
                        すべての通知を見る
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* ユーザードロップダウン */}
              <div ref={userMenuRef} className="relative">
                <button
                  type="button"
                  onClick={() => {
                    setShowUserMenu(!showUserMenu);
                    setShowNotifications(false);
                  }}
                  className="flex items-center space-x-2 text-sm text-gray-700 hover:text-gray-900"
                >
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-gray-600 font-medium">
                      {userName.charAt(0)}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {userName}
                    </p>
                    {userRole && (
                      <p className="text-xs text-gray-500">
                        {roleLabels[userRole] || userRole}
                      </p>
                    )}
                  </div>
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* ユーザーメニュードロップダウン */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <Link
                        href={getDashboardLink()}
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        ダッシュボード
                      </Link>
                      {userRole === 'LAWYER' && (
                        <>
                          <Link
                            href="/cases"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            案件一覧
                          </Link>
                          <Link
                            href="/audit-logs"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            監査ログ
                          </Link>
                        </>
                      )}
                      {userRole === 'STAFF' && (
                        <>
                          <Link
                            href="/staff/cases"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            案件一覧
                          </Link>
                          <Link
                            href="/staff/reminders"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            リマインド管理
                          </Link>
                        </>
                      )}
                      {userRole === 'CLIENT' && (
                        <>
                          <Link
                            href="/mypage/upload"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            資料アップロード
                          </Link>
                          <Link
                            href="/mypage/messages"
                            onClick={() => setShowUserMenu(false)}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            メッセージ
                          </Link>
                        </>
                      )}
                      <div className="border-t border-gray-100 my-1" />
                      <Link
                        href="/login"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        ログアウト
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
