/**
 * 送信確認コンポーネント（弁護士専用・送信ゲート）
 *
 * 重要（絶対ルール）：
 * - このボタンは弁護士ロールのみがクリック可能
 * - 事務職員・AIプロセスからは物理的にアクセス不可
 * - 送信実行時に監査ログを記録
 */

'use client';

import React, { useState } from 'react';

interface SendConfirmationProps {
  recipientName: string;
  recipientType: 'CLIENT' | 'CREDITOR' | 'COURT';
  sendType: string;
  sendMethod: string;
  content: string;
  senderName: string;
  senderLawFirm: string;
  onConfirm: (data: {
    confirmationChecked: boolean;
    responsibilityChecked: boolean;
  }) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function SendConfirmation({
  recipientName,
  recipientType,
  sendType,
  sendMethod,
  content,
  senderName,
  senderLawFirm,
  onConfirm,
  onCancel,
  isSubmitting = false,
}: SendConfirmationProps) {
  const [confirmationChecked, setConfirmationChecked] = useState(false);
  const [responsibilityChecked, setResponsibilityChecked] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const recipientTypeLabels: Record<string, string> = {
    CLIENT: '依頼者',
    CREDITOR: '債権者',
    COURT: '裁判所',
  };

  const sendTypeLabels: Record<string, string> = {
    RETENTION_NOTICE: '受任通知',
    PETITION: '申立書',
    SUPPLEMENTARY: '補正書面',
    COURT_RESPONSE: '裁判所への回答',
    CLIENT_RESPONSE: '依頼者への回答',
  };

  const sendMethodLabels: Record<string, string> = {
    EMAIL: 'メール',
    POSTAL: '郵送',
    CERTIFIED_MAIL: '内容証明郵便',
    FAX: 'FAX',
    PORTAL: '裁判所ポータル',
  };

  const canSubmit = confirmationChecked && responsibilityChecked && !isSubmitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    await onConfirm({
      confirmationChecked,
      responsibilityChecked,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200 bg-amber-50">
        <h2 className="text-lg font-semibold text-gray-900">
          送信確認
        </h2>
        <p className="mt-1 text-sm text-amber-700">
          この操作は取り消せません。内容を確認の上、送信してください。
        </p>
      </div>

      <div className="p-6 space-y-6">
        {/* 送信内容の確認 */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-3">
            送信内容の最終確認
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-600">送信先:</dt>
              <dd className="font-medium text-gray-900">{recipientName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">送信先種別:</dt>
              <dd className="font-medium text-gray-900">
                {recipientTypeLabels[recipientType]}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">種別:</dt>
              <dd className="font-medium text-gray-900">
                {sendTypeLabels[sendType] || sendType}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-600">送信方法:</dt>
              <dd className="font-medium text-gray-900">
                {sendMethodLabels[sendMethod] || sendMethod}
              </dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="mt-3 text-sm text-blue-600 hover:text-blue-800"
          >
            {showPreview ? '内容を閉じる' : '内容をプレビュー'}
          </button>
          {showPreview && (
            <div className="mt-3 p-3 bg-white border border-gray-200 rounded max-h-48 overflow-y-auto">
              <pre className="text-xs whitespace-pre-wrap font-sans">
                {content}
              </pre>
            </div>
          )}
        </div>

        {/* 送信者情報 */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-3">
            送信者情報
          </h3>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-blue-700">送信元:</dt>
              <dd className="font-medium text-blue-900">{senderLawFirm}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700">担当弁護士:</dt>
              <dd className="font-medium text-blue-900">{senderName}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-blue-700">送信日時:</dt>
              <dd className="font-medium text-blue-900">
                {new Date().toLocaleString('ja-JP')}
              </dd>
            </div>
          </dl>
        </div>

        {/* 確認チェックボックス */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={confirmationChecked}
              onChange={(e) => setConfirmationChecked(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              内容を確認しました
            </span>
          </label>
          <label className="flex items-start">
            <input
              type="checkbox"
              checked={responsibilityChecked}
              onChange={(e) => setResponsibilityChecked(e.target.checked)}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="ml-3 text-sm text-gray-700">
              弁護士として責任を持って送信します
            </span>
          </label>
        </div>

        {/* 警告メッセージ */}
        <div className="flex items-center text-amber-700 text-sm">
          <svg
            className="h-5 w-5 mr-2"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          この操作は取り消せません。内容を確認の上、送信してください。
        </div>

        {/* アクションボタン */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            キャンセル
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                送信中...
              </span>
            ) : (
              '送信を実行'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default SendConfirmation;
