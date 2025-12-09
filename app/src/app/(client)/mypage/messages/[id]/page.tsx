/**
 * メッセージ詳細画面（依頼者用）
 *
 * 依頼者が弁護士からのメッセージを閲覧する
 *
 * 重要：
 * - 依頼者には弁護士承認後の回答のみ表示
 * - AIが生成した内部用ドラフトは非表示
 * - 免責表示を常時表示
 */

'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface MessageDetail {
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

export default function MessageDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: messageId } = use(params);
  const [message, setMessage] = useState<MessageDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessage();
    markAsRead();
  }, [messageId]);

  const fetchMessage = async () => {
    try {
      // TODO: 実際のAPIから取得
      // const response = await fetch(`/api/messages/${messageId}`);
      // const data = await response.json();

      // モックデータ
      const mockMessages: Record<string, MessageDetail> = {
        'msg-1': {
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
          isRead: true,
        },
        'msg-2': {
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
      };

      setMessage(mockMessages[messageId] || mockMessages['msg-1']);
    } catch (error) {
      console.error('Failed to fetch message:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    // TODO: 実際のAPIを呼び出し
    // await fetch(`/api/messages/${messageId}/read`, { method: 'POST' });
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

  if (!message) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">メッセージが見つかりません</p>
          <Link href="/mypage/messages" className="mt-4 text-blue-600 hover:text-blue-800">
            メッセージ一覧に戻る
          </Link>
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
            <li>
              <Link href="/mypage/messages" className="text-gray-500 hover:text-gray-700">
                メッセージ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium truncate max-w-[200px]">
              {message.subject}
            </li>
          </ol>
        </nav>

        {/* メッセージ詳細 */}
        <div className="bg-white rounded-lg shadow">
          {/* ヘッダー */}
          <div className="px-6 py-4 border-b border-gray-200">
            <h1 className="text-xl font-bold text-gray-900">{message.subject}</h1>
            <div className="mt-2 flex items-center space-x-3 text-sm text-gray-500">
              <span>{message.senderName}</span>
              <span>・</span>
              <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                {messageTypeLabels[message.messageType] || message.messageType}
              </span>
              <span>・</span>
              <span>
                {new Date(message.createdAt).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* 本文 */}
          <div className="px-6 py-6">
            <div className="prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-gray-900 bg-transparent p-0 m-0">
                {message.body}
              </pre>
            </div>
          </div>
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex items-center justify-between">
          <Link
            href="/mypage/messages"
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            ← メッセージ一覧に戻る
          </Link>
        </div>

        {/* 注意書き */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-500">
            ※ このメッセージは担当弁護士が確認・承認した内容です。
            ご不明な点がございましたら、担当弁護士までお問い合わせください。
          </p>
        </div>
      </main>
    </div>
  );
}
