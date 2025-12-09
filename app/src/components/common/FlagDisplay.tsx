/**
 * 要確認フラグ表示コンポーネント
 *
 * 重要：フラグは「結論」ではなく「次のアクション」形式で表示
 * OK: 「要面談」「要追加資料」「弁護士確認必須」
 * NG: 「免責不許可事由リスク」「破産が適切」
 */

'use client';

import React from 'react';

interface Flag {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action: string; // 次のアクション（「要面談」「要追加資料」など）
  details?: Record<string, unknown>;
}

interface FlagDisplayProps {
  flags: Flag[];
  className?: string;
  showDetails?: boolean;
}

export function FlagDisplay({
  flags,
  className = '',
  showDetails = false,
}: FlagDisplayProps) {
  if (!flags || flags.length === 0) {
    return null;
  }

  const severityStyles = {
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      icon: 'text-blue-400',
      text: 'text-blue-800',
      actionBg: 'bg-blue-100',
      actionText: 'text-blue-700',
    },
    warning: {
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      icon: 'text-amber-400',
      text: 'text-amber-800',
      actionBg: 'bg-amber-100',
      actionText: 'text-amber-700',
    },
    critical: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      icon: 'text-red-400',
      text: 'text-red-800',
      actionBg: 'bg-red-100',
      actionText: 'text-red-700',
    },
  };

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-900">要確認項目</h4>
      {flags.map((flag, index) => {
        const styles = severityStyles[flag.severity];
        return (
          <div
            key={index}
            className={`${styles.bg} ${styles.border} border rounded-lg p-3`}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {flag.severity === 'critical' ? (
                  <svg
                    className={`h-5 w-5 ${styles.icon}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : flag.severity === 'warning' ? (
                  <svg
                    className={`h-5 w-5 ${styles.icon}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <svg
                    className={`h-5 w-5 ${styles.icon}`}
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="ml-3 flex-1">
                <div className="flex items-center justify-between">
                  <p className={`text-sm font-medium ${styles.text}`}>
                    {flag.message}
                  </p>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles.actionBg} ${styles.actionText}`}
                  >
                    {flag.action}
                  </span>
                </div>
                {showDetails && flag.details && (
                  <div className="mt-2 text-sm text-gray-600">
                    {Object.entries(flag.details).map(([key, value]) => (
                      <div key={key} className="flex">
                        <span className="font-medium mr-2">{key}:</span>
                        <span>{String(value)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FlagDisplay;
