/**
 * ドラフトレビューパネル（弁護士専用）
 *
 * 重要：
 * - AIドラフトは弁護士用レビュー画面のみに表示
 * - 依頼者には弁護士承認後の回答のみ表示
 * - フラグは「結論」ではなく「次のアクション」形式
 */

'use client';

import React, { useState, useEffect } from 'react';
import { FlagDisplay } from '@/components/common/FlagDisplay';

interface Flag {
  type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  action: string;
  details?: Record<string, unknown>;
}

interface Draft {
  id: string;
  draftType: string;
  version: number;
  content: string;
  flags: { items: Flag[] } | null;
  status: string;
  createdAt: string;
}

interface DraftReviewPanelProps {
  draft: Draft;
  clientInput?: {
    totalDebt?: string;
    creditorCount?: number;
    monthlyIncome?: number;
    familySize?: number;
  };
  referenceInfo?: {
    statutes?: string[];
    similarCases?: string[];
    notes?: string[];
  };
  onApprove: (data: {
    action: 'approve' | 'modify' | 'reject';
    finalContent?: string;
    comment?: string;
    reviewStartTime: number;
    flagsAcknowledged: boolean;
  }) => Promise<void>;
  isSubmitting?: boolean;
}

export function DraftReviewPanel({
  draft,
  clientInput,
  referenceInfo,
  onApprove,
  isSubmitting = false,
}: DraftReviewPanelProps) {
  const [reviewStartTime] = useState(() => Date.now());
  const [action, setAction] = useState<'approve' | 'modify' | 'reject'>('approve');
  const [editedContent, setEditedContent] = useState(draft.content);
  const [comment, setComment] = useState('');
  const [flagsAcknowledged, setFlagsAcknowledged] = useState(false);

  const flags = draft.flags?.items || [];
  const hasFlags = flags.length > 0;

  const draftTypeLabels: Record<string, string> = {
    RETENTION_NOTICE: '受任通知',
    PETITION: '申立書',
    STATEMENT: '陳述書',
    CREDITOR_LIST: '債権者一覧表',
    ASSET_LIST: '財産目録',
    INCOME_EXPENSE: '家計収支表',
    RESPONSE: '依頼者への回答',
    COURT_RESPONSE: '裁判所への回答',
  };

  const handleSubmit = async () => {
    await onApprove({
      action,
      finalContent: action === 'modify' ? editedContent : undefined,
      comment: comment || undefined,
      reviewStartTime,
      flagsAcknowledged,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* ヘッダー */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            レビュー・承認
          </h2>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
            {draftTypeLabels[draft.draftType] || draft.draftType}
          </span>
        </div>
        <p className="mt-1 text-sm text-gray-500">
          バージョン {draft.version} | 作成日時: {new Date(draft.createdAt).toLocaleString('ja-JP')}
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左側：依頼者入力情報 */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              依頼者入力情報
            </h3>
            {clientInput && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                {clientInput.totalDebt && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">借入総額:</span>
                    <span className="font-medium">{clientInput.totalDebt}円</span>
                  </div>
                )}
                {clientInput.creditorCount !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">借入先:</span>
                    <span className="font-medium">{clientInput.creditorCount}社</span>
                  </div>
                )}
                {clientInput.monthlyIncome !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">月収:</span>
                    <span className="font-medium">{clientInput.monthlyIncome.toLocaleString()}円</span>
                  </div>
                )}
                {clientInput.familySize !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">家族人数:</span>
                    <span className="font-medium">{clientInput.familySize}人</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 右側：AIドラフト */}
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-3">
              AIドラフト
              <span className="ml-2 text-xs text-gray-500">
                （弁護士専用・依頼者には非表示）
              </span>
            </h3>
            {action === 'modify' ? (
              <textarea
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="w-full h-64 p-4 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
              />
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {draft.content}
                </pre>
              </div>
            )}
          </div>
        </div>

        {/* 要確認フラグ */}
        {hasFlags && (
          <div className="mt-6">
            <FlagDisplay flags={flags} showDetails />
            <div className="mt-3">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={flagsAcknowledged}
                  onChange={(e) => setFlagsAcknowledged(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <span className="ml-2 text-sm text-gray-700">
                  上記の要確認項目を確認しました
                </span>
              </label>
            </div>
          </div>
        )}

        {/* 参照情報（弁護士用） */}
        {referenceInfo && (
          <div className="mt-6 bg-blue-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">
              参照情報（弁護士用）
            </h4>
            {referenceInfo.statutes && referenceInfo.statutes.length > 0 && (
              <div className="mb-2">
                <span className="text-xs font-medium text-blue-700">関連条文:</span>
                <ul className="ml-4 text-xs text-blue-800 list-disc">
                  {referenceInfo.statutes.map((statute, i) => (
                    <li key={i}>{statute}</li>
                  ))}
                </ul>
              </div>
            )}
            {referenceInfo.notes && referenceInfo.notes.length > 0 && (
              <div>
                <span className="text-xs font-medium text-blue-700">注意点:</span>
                <ul className="ml-4 text-xs text-blue-800 list-disc">
                  {referenceInfo.notes.map((note, i) => (
                    <li key={i}>{note}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* コメント入力 */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            修正コメント（任意）
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-blue-500 focus:border-blue-500"
            placeholder="修正内容や確認事項があれば記載してください"
          />
        </div>

        {/* アクションボタン */}
        <div className="mt-6 flex items-center justify-end space-x-3">
          <button
            type="button"
            onClick={() => setAction('reject')}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              action === 'reject'
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-600 border border-red-300 hover:bg-red-50'
            } disabled:opacity-50`}
          >
            差戻し
          </button>
          <button
            type="button"
            onClick={() => setAction('modify')}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              action === 'modify'
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-600 border border-amber-300 hover:bg-amber-50'
            } disabled:opacity-50`}
          >
            修正して承認
          </button>
          <button
            type="button"
            onClick={() => setAction('approve')}
            disabled={isSubmitting}
            className={`px-4 py-2 text-sm font-medium rounded-lg ${
              action === 'approve'
                ? 'bg-green-600 text-white'
                : 'bg-white text-green-600 border border-green-300 hover:bg-green-50'
            } disabled:opacity-50`}
          >
            承認
          </button>
        </div>

        {/* 送信ボタン */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || (hasFlags && !flagsAcknowledged)}
            className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                処理中...
              </span>
            ) : (
              `${
                action === 'approve'
                  ? '承認する'
                  : action === 'modify'
                  ? '修正して承認する'
                  : '差戻す'
              }`
            )}
          </button>
          {hasFlags && !flagsAcknowledged && (
            <p className="mt-2 text-sm text-amber-600 text-center">
              要確認項目を確認してチェックを入れてください
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default DraftReviewPanel;
