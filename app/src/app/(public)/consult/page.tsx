/**
 * 相談受付チャット
 *
 * 依頼者からの初回問い合わせを受け付け、基本情報を収集する
 *
 * 重要（非弁対策）：
 * - 免責表示を常時表示
 * - 「あなたは破産が最適」等の個別判断は出さない
 * - 一般的な制度説明に限定
 * - 受任を保証しない旨を明記
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface CollectedInfo {
  totalDebt?: string;
  creditorCount?: string;
  monthlyIncome?: string;
  employment?: string;
  hasAssets?: boolean;
  reason?: string;
}

// 非弁対策：AIの回答は一般的な制度説明に限定
const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: `はじめまして。柳田法律事務所の相談受付チャットです。

借金のお悩みについてお聞かせください。一般的な債務整理の制度についてご案内いたします。

まずは、借入れの総額はおおよそいくらぐらいでしょうか？`,
  timestamp: new Date(),
};

// 非弁対策：個別判断を出さない一般的な回答テンプレート
const GENERAL_RESPONSES: Record<string, string> = {
  debt_high: `ご状況をお聞かせいただきありがとうございます。

一般的なご案内として、債務整理にはいくつかの方法があります：

1. **任意整理** - 債権者と直接交渉し、返済条件を見直す方法
2. **個人再生** - 裁判所を通じて債務を大幅に減額する方法
3. **自己破産** - 裁判所を通じて債務を免除してもらう方法

どの方法が適切かは、収入状況や資産状況、借入れの経緯など様々な要素を考慮して弁護士が判断いたします。

次にお伺いしたいのですが、借入先はおおよそ何社ぐらいありますか？`,

  creditors: `承知いたしました。

借入先が複数ある場合、それぞれの債権者への対応が必要になります。

続いて、現在のお仕事や月々の収入についてお聞かせいただけますか？（おおよその金額で構いません）`,

  income: `ご回答ありがとうございます。

収入状況は、どの債務整理の方法を選択するかの重要な判断材料となります。

最後に、借金をすることになった主な理由を教えていただけますか？
（例：生活費の補填、事業資金、医療費、ギャンブルなど）`,

  reason: `ご状況を詳しくお聞かせいただきありがとうございます。

いただいた情報をもとに、弁護士がお話を伺います。
具体的な法的判断やアドバイスは、弁護士との面談時に行います。

**次のステップ：無料相談のご予約**

以下のボタンから、弁護士との無料相談をご予約いただけます。
面談では、より詳しいご状況をお伺いした上で、最適な解決方法についてご説明いたします。`,
};

export default function ConsultPage() {
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(0);
  const [collectedInfo, setCollectedInfo] = useState<CollectedInfo>({});
  const [showReservation, setShowReservation] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    // 収集した情報を更新
    const newInfo = { ...collectedInfo };
    switch (step) {
      case 0:
        newInfo.totalDebt = input;
        break;
      case 1:
        newInfo.creditorCount = input;
        break;
      case 2:
        newInfo.monthlyIncome = input;
        break;
      case 3:
        newInfo.reason = input;
        break;
    }
    setCollectedInfo(newInfo);

    // 非弁対策：一般的な回答のみを返す
    await new Promise(resolve => setTimeout(resolve, 1000));

    let responseKey = '';
    switch (step) {
      case 0:
        responseKey = 'debt_high';
        break;
      case 1:
        responseKey = 'creditors';
        break;
      case 2:
        responseKey = 'income';
        break;
      case 3:
        responseKey = 'reason';
        setShowReservation(true);
        break;
    }

    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: GENERAL_RESPONSES[responseKey] || 'ありがとうございます。',
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setStep(prev => prev + 1);
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="ml-2 text-lg font-bold text-gray-900">柳田法律事務所</span>
            </div>
            <span className="text-sm text-gray-500">オンライン相談</span>
          </div>
        </div>
      </header>

      {/* 免責表示（常時表示） */}
      <DisclaimerBanner variant="detailed" className="max-w-3xl mx-auto mt-4 px-4" />

      {/* チャットエリア */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow h-full flex flex-col" style={{ minHeight: '500px' }}>
          {/* メッセージ一覧 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content.split('\n').map((line, i) => {
                      // マークダウンの太字を処理
                      const parts = line.split(/(\*\*[^*]+\*\*)/);
                      return (
                        <React.Fragment key={i}>
                          {parts.map((part, j) => {
                            if (part.startsWith('**') && part.endsWith('**')) {
                              return <strong key={j}>{part.slice(2, -2)}</strong>;
                            }
                            return part;
                          })}
                          {i < message.content.split('\n').length - 1 && <br />}
                        </React.Fragment>
                      );
                    })}
                  </div>
                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-blue-200' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg px-4 py-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            {/* 予約ボタン */}
            {showReservation && (
              <div className="flex justify-center py-4">
                <Link
                  href="/consult/reservation"
                  className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
                >
                  <svg className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  無料相談を予約する
                </Link>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* 入力エリア */}
          {!showReservation && (
            <form onSubmit={handleSubmit} className="border-t border-gray-200 p-4">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder="メッセージを入力..."
                  disabled={loading}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  送信
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">
            Powered by ZettAI（システム提供）
          </p>
          <p className="mt-1 text-xs text-gray-400">
            法律サービスの提供主体は柳田法律事務所です
          </p>
        </div>
      </footer>
    </div>
  );
}
