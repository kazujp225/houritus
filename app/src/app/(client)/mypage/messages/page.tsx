/**
 * メッセージ一覧画面（依頼者用）
 *
 * 依頼者が弁護士からのメッセージを確認する
 *
 * 重要：
 * - 依頼者には弁護士承認後の回答のみ表示
 * - AIが生成した内部用ドラフトは非表示
 * - 免責表示を常時表示
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface Message {
  id: string;
  subject: string;
  body: string;
  senderName: string;
  senderRole: string;
  messageType: string;
  createdAt: string;
  isRead: boolean;
}

const messageTypeLabels: Record<string, string> = {
  LEGAL_RESPONSE: '弁護士からの回答',
  ADMIN_NOTICE: '事務連絡',
  REMINDER: 'リマインド',
  SYSTEM: 'システム通知',
};

export default function MessagesPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch('/api/messages');
      // const data = await response.json();

      // モックデータ
      setMessages([
        {
          id: 'msg-1',
          subject: '追加のご質問があります',
          body: `山田様

資料を確認しました。
追加で以下の点についてお伺いしたいことがございます。

1. 通帳のコピーについて、2022年4月〜6月の部分が不鮮明です。再度コピーをお願いできますでしょうか。

2. クレジットカードの利用明細について、楽天カードの明細がまだ届いておりません。お手元にございましたらご提出をお願いいたします。

ご不明な点がございましたら、お気軽にお問い合わせください。

柳田法律事務所
弁護士 柳田 一郎`,
          senderName: '柳田 一郎',
          senderRole: 'LAWYER',
          messageType: 'LEGAL_RESPONSE',
          createdAt: new Date().toISOString(),
          isRead: false,
        },
        {
          id: 'msg-2',
          subject: '資料受領のご連絡',
          body: `山田様

通帳のコピーを受領いたしました。
ありがとうございます。

内容を確認の上、追加でご連絡させていただく場合がございます。
引き続きよろしくお願いいたします。

柳田法律事務所
弁護士 柳田 一郎`,
          senderName: '柳田 一郎',
          senderRole: 'LAWYER',
          messageType: 'ADMIN_NOTICE',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
        },
        {
          id: 'msg-3',
          subject: '受任のご連絡',
          body: `山田様

この度は柳田法律事務所にご相談いただき、誠にありがとうございます。

利益相反の確認が完了し、正式に山田様の案件を受任させていただくこととなりました。

今後の手続きの流れについては、追ってご連絡いたします。
ご不明な点がございましたら、お気軽にお問い合わせください。

柳田法律事務所
弁護士 柳田 一郎`,
          senderName: '柳田 一郎',
          senderRole: 'LAWYER',
          messageType: 'LEGAL_RESPONSE',
          createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
        },
        {
          id: 'msg-4',
          subject: '【リマインド】給与明細のご提出について',
          body: `山田様

給与明細（直近3ヶ月分）のご提出をお願いしておりましたが、
まだお手元に届いておりません。

お忙しいところ恐れ入りますが、ご確認の上ご提出をお願いいたします。

柳田法律事務所`,
          senderName: '田中 花子',
          senderRole: 'STAFF',
          messageType: 'REMINDER',
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          isRead: true,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (messageId: string) => {
    // TODO: 実際のAPIを呼び出し
    setMessages(prev =>
      prev.map(m => (m.id === messageId ? { ...m, isRead: true } : m))
    );
  };

  const filteredMessages = filter === 'unread'
    ? messages.filter(m => !m.isRead)
    : messages;

  const unreadCount = messages.filter(m => !m.isRead).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="山田 太郎"
        userRole="CLIENT"
        showPoweredBy
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <li className="text-gray-900 font-medium">メッセージ</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">メッセージ</h1>
            {unreadCount > 0 && (
              <p className="mt-1 text-sm text-gray-500">
                未読メッセージが {unreadCount} 件あります
              </p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              すべて
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1.5 text-sm rounded-lg ${
                filter === 'unread'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              未読のみ
            </button>
          </div>
        </div>

        {/* メッセージ一覧 */}
        <div className="bg-white rounded-lg shadow">
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4">読み込み中...</p>
            </div>
          ) : filteredMessages.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="mt-4">
                {filter === 'unread' ? '未読メッセージはありません' : 'メッセージはありません'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredMessages.map(message => (
                <Link
                  key={message.id}
                  href={`/mypage/messages/${message.id}`}
                  onClick={() => markAsRead(message.id)}
                  className={`block px-6 py-4 hover:bg-gray-50 transition-colors ${
                    !message.isRead ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="flex items-start">
                    {!message.isRead && (
                      <span className="flex-shrink-0 w-2 h-2 mt-2 mr-3 bg-blue-600 rounded-full" />
                    )}
                    <div className={`flex-1 min-w-0 ${message.isRead ? 'ml-5' : ''}`}>
                      <div className="flex items-center justify-between">
                        <p className={`text-sm truncate ${
                          message.isRead ? 'text-gray-600' : 'font-medium text-gray-900'
                        }`}>
                          {message.subject}
                        </p>
                        <span className="ml-2 text-xs text-gray-500 whitespace-nowrap">
                          {new Date(message.createdAt).toLocaleDateString('ja-JP')}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {message.senderName}
                        </span>
                        <span className="text-xs px-1.5 py-0.5 bg-gray-100 text-gray-600 rounded">
                          {messageTypeLabels[message.messageType] || message.messageType}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                        {message.body.split('\n')[0]}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
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
