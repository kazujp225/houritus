/**
 * 免責表示バナー
 *
 * 依頼者向け画面に常時表示する免責表示
 * 非弁リスク回避のための必須コンポーネント
 */

'use client';

import React from 'react';

interface DisclaimerBannerProps {
  variant?: 'default' | 'compact' | 'detailed';
  className?: string;
}

export function DisclaimerBanner({
  variant = 'default',
  className = '',
}: DisclaimerBannerProps) {
  if (variant === 'compact') {
    return (
      <div
        className={`bg-amber-50 border-l-4 border-amber-400 p-3 text-sm ${className}`}
        role="alert"
      >
        <p className="text-amber-700">
          このチャットは受任を保証するものではありません。法的助言は受任後に弁護士が行います。
        </p>
      </div>
    );
  }

  if (variant === 'detailed') {
    return (
      <div
        className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="h-5 w-5 text-amber-400"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-amber-800">重要なお知らせ</h3>
            <div className="mt-2 text-sm text-amber-700">
              <ul className="list-disc list-inside space-y-1">
                <li>このチャットは受任を保証するものではありません</li>
                <li>法的助言は受任後に弁護士が行います</li>
                <li>利益相反等の理由により受任できない場合があります</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // default variant
  return (
    <div
      className={`bg-amber-50 border-l-4 border-amber-400 p-4 ${className}`}
      role="alert"
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-amber-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-amber-700">
            <strong>【重要】</strong>
            このチャットは受任を保証するものではありません。
            法的助言は受任後に弁護士が行います。
            利益相反等の理由により受任できない場合があります。
          </p>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerBanner;
