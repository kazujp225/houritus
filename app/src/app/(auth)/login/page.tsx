/**
 * ログイン画面
 *
 * ユーザー認証を行う
 *
 * 重要：
 * - ロールに応じて適切なダッシュボードにリダイレクト
 * - MFA対応
 * - ログイン試行の監査ログ記録
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [showMfa, setShowMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!showMfa) {
        // 通常ログイン
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'ログインに失敗しました');
          return;
        }

        if (data.requireMfa) {
          setShowMfa(true);
          return;
        }

        // ログイン成功：ロールに応じてリダイレクト
        redirectByRole(data.user.role);
      } else {
        // MFA認証
        const response = await fetch('/api/auth/mfa-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, mfaCode }),
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.error || 'MFA認証に失敗しました');
          return;
        }

        redirectByRole(data.user.role);
      }
    } catch (err) {
      setError('通信エラーが発生しました');
    } finally {
      setLoading(false);
    }
  };

  const redirectByRole = (role: string) => {
    switch (role) {
      case 'LAWYER':
      case 'ADMIN':
        router.push('/dashboard');
        break;
      case 'STAFF':
        router.push('/dashboard');
        break;
      case 'CLIENT':
        router.push('/mypage');
        break;
      case 'TECH_SUPPORT':
        router.push('/admin');
        break;
      default:
        router.push('/');
    }
  };

  // デモ用のクイックログイン
  const handleDemoLogin = (role: 'LAWYER' | 'CLIENT') => {
    if (role === 'LAWYER') {
      setEmail('lawyer@yanagida-law.jp');
      setPassword('demo123');
    } else {
      setEmail('yamada@example.com');
      setPassword('demo123');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        {/* ロゴ */}
        <div className="flex justify-center">
          <div className="flex items-center">
            <svg className="h-10 w-10 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
            </svg>
            <span className="ml-2 text-2xl font-bold text-gray-900">柳田法律事務所</span>
          </div>
        </div>
        <h2 className="mt-6 text-center text-2xl font-bold text-gray-900">
          ログイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          破産手続支援システム
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow rounded-lg sm:px-10">
          {/* デモ用クイックログイン */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800 font-medium mb-2">デモ用アカウント:</p>
            <div className="flex space-x-2">
              <button
                type="button"
                onClick={() => handleDemoLogin('LAWYER')}
                className="px-3 py-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
              >
                弁護士でログイン
              </button>
              <button
                type="button"
                onClick={() => handleDemoLogin('CLIENT')}
                className="px-3 py-1.5 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
              >
                依頼者でログイン
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {!showMfa ? (
              <>
                {/* メールアドレス */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    メールアドレス
                  </label>
                  <div className="mt-1">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="example@yanagida-law.jp"
                    />
                  </div>
                </div>

                {/* パスワード */}
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    パスワード
                  </label>
                  <div className="mt-1">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                  </div>
                </div>

                {/* パスワードリセット */}
                <div className="flex items-center justify-end">
                  <div className="text-sm">
                    <Link href="/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                      パスワードをお忘れですか？
                    </Link>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* MFAコード入力 */}
                <div>
                  <label htmlFor="mfaCode" className="block text-sm font-medium text-gray-700">
                    認証コード
                  </label>
                  <p className="text-xs text-gray-500 mt-1 mb-2">
                    認証アプリに表示されている6桁のコードを入力してください
                  </p>
                  <div className="mt-1">
                    <input
                      id="mfaCode"
                      name="mfaCode"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      required
                      value={mfaCode}
                      onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ''))}
                      className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-center text-2xl tracking-widest"
                      placeholder="000000"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setShowMfa(false);
                    setMfaCode('');
                  }}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  ← 戻る
                </button>
              </>
            )}

            {/* ログインボタン */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    処理中...
                  </>
                ) : showMfa ? (
                  '認証'
                ) : (
                  'ログイン'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* フッター */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Powered by ZettAI（システム提供）
          </p>
          <p className="mt-2 text-xs text-gray-400">
            法律サービスの提供主体は柳田法律事務所です
          </p>
        </div>
      </div>
    </div>
  );
}
