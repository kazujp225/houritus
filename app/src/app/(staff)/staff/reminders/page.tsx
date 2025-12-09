/**
 * リマインド管理画面
 *
 * 依頼者への資料提出リマインドを管理
 *
 * 重要（非弁対策）：
 * - 事務職員は事務連絡（リマインド）のみ送信可能
 * - 法的判断を含む内容は送信不可
 * - リマインドテンプレートは事前承認済みのもののみ使用
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface Reminder {
  id: string;
  caseId: string;
  clientName: string;
  type: 'document_request' | 'hearing_reminder' | 'payment_reminder' | 'general';
  subject: string;
  scheduledAt: Date;
  status: 'scheduled' | 'sent' | 'cancelled';
  sentAt?: Date;
  createdBy: string;
}

interface ReminderTemplate {
  id: string;
  name: string;
  type: Reminder['type'];
  subject: string;
  body: string;
}

export default function RemindersPage() {
  const [activeTab, setActiveTab] = useState<'scheduled' | 'sent' | 'templates'>('scheduled');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  // モックデータ: リマインド一覧
  const [reminders] = useState<Reminder[]>([
    {
      id: '1',
      caseId: 'case-001',
      clientName: '田中 一郎',
      type: 'document_request',
      subject: '住民票のご提出について',
      scheduledAt: new Date('2024-12-10T09:00:00'),
      status: 'scheduled',
      createdBy: '山田事務員',
    },
    {
      id: '2',
      caseId: 'case-002',
      clientName: '佐藤 花子',
      type: 'document_request',
      subject: '給与明細のご提出について',
      scheduledAt: new Date('2024-12-10T10:00:00'),
      status: 'scheduled',
      createdBy: '山田事務員',
    },
    {
      id: '3',
      caseId: 'case-001',
      clientName: '田中 一郎',
      type: 'hearing_reminder',
      subject: 'ヒアリング回答のお願い',
      scheduledAt: new Date('2024-12-09T09:00:00'),
      status: 'sent',
      sentAt: new Date('2024-12-09T09:00:00'),
      createdBy: '山田事務員',
    },
    {
      id: '4',
      caseId: 'case-003',
      clientName: '鈴木 太郎',
      type: 'document_request',
      subject: '通帳コピーの再提出について',
      scheduledAt: new Date('2024-12-08T14:00:00'),
      status: 'sent',
      sentAt: new Date('2024-12-08T14:00:00'),
      createdBy: '佐藤事務員',
    },
  ]);

  // 事前承認済みテンプレート
  const templates: ReminderTemplate[] = [
    {
      id: 't1',
      name: '書類提出リマインド',
      type: 'document_request',
      subject: '【柳田法律事務所】書類ご提出のお願い',
      body: `○○様

お世話になっております。柳田法律事務所でございます。

お手続きに必要な書類のご提出をお願いいたします。

【未提出の書類】
・{{document_name}}

ご提出方法：マイページからアップロード
提出期限：{{deadline}}

ご不明な点がございましたら、お気軽にお問い合わせください。

柳田法律事務所 事務局`,
    },
    {
      id: 't2',
      name: 'ヒアリング回答リマインド',
      type: 'hearing_reminder',
      subject: '【柳田法律事務所】ヒアリングへのご回答のお願い',
      body: `○○様

お世話になっております。柳田法律事務所でございます。

マイページのヒアリングフォームへのご回答がお済みでないようです。
お手続きを進めるために必要な情報ですので、ご回答をお願いいたします。

回答方法：マイページ → ヒアリング

ご不明な点がございましたら、お気軽にお問い合わせください。

柳田法律事務所 事務局`,
    },
    {
      id: 't3',
      name: '一般連絡',
      type: 'general',
      subject: '【柳田法律事務所】ご連絡',
      body: `○○様

お世話になっております。柳田法律事務所でございます。

{{message}}

ご不明な点がございましたら、お気軽にお問い合わせください。

柳田法律事務所 事務局`,
    },
  ];

  const getTypeBadge = (type: Reminder['type']) => {
    switch (type) {
      case 'document_request':
        return <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">書類提出</span>;
      case 'hearing_reminder':
        return <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs font-medium rounded">ヒアリング</span>;
      case 'payment_reminder':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">支払い</span>;
      case 'general':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">一般</span>;
    }
  };

  const getStatusBadge = (status: Reminder['status']) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 text-xs font-medium rounded">予約中</span>;
      case 'sent':
        return <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">送信済</span>;
      case 'cancelled':
        return <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs font-medium rounded">キャンセル</span>;
    }
  };

  const scheduledReminders = reminders.filter(r => r.status === 'scheduled');
  const sentReminders = reminders.filter(r => r.status === 'sent');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                href="/staff/dashboard"
                className="text-gray-500 hover:text-gray-700"
              >
                ← ダッシュボード
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <h1 className="text-lg font-bold text-gray-900">リマインド管理</h1>
            </div>
            <div className="flex items-center space-x-3">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs font-medium rounded">
                事務職員
              </span>
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700"
              >
                + リマインドを作成
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* 権限注意 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-800">
            <strong>事務職員の権限</strong>：事務連絡（リマインド）のみ送信可能です。
            法的判断や法的アドバイスを含む内容は送信できません。
            事前承認済みのテンプレートをご使用ください。
          </p>
        </div>

        {/* サマリーカード */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">予約中</p>
            <p className="text-2xl font-bold text-yellow-600">{scheduledReminders.length}件</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">今日送信予定</p>
            <p className="text-2xl font-bold text-blue-600">
              {scheduledReminders.filter(r => {
                const today = new Date();
                return r.scheduledAt.toDateString() === today.toDateString();
              }).length}件
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-500">送信済み（今月）</p>
            <p className="text-2xl font-bold text-green-600">{sentReminders.length}件</p>
          </div>
        </div>

        {/* タブ */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px">
              {[
                { id: 'scheduled', label: '予約中', count: scheduledReminders.length },
                { id: 'sent', label: '送信済み', count: sentReminders.length },
                { id: 'templates', label: 'テンプレート', count: templates.length },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'scheduled' | 'sent' | 'templates')}
                  className={`px-6 py-3 text-sm font-medium border-b-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {tab.label}
                  <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                    {tab.count}
                  </span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* 予約中リスト */}
        {activeTab === 'scheduled' && (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-100">
              {scheduledReminders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  予約中のリマインドはありません
                </div>
              ) : (
                scheduledReminders.map(reminder => (
                  <div key={reminder.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{reminder.clientName}</span>
                          {getTypeBadge(reminder.type)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reminder.subject}</p>
                        <div className="flex items-center space-x-3 mt-1">
                          <span className="text-xs text-gray-500">
                            案件: {reminder.caseId}
                          </span>
                          <span className="text-xs text-gray-500">
                            作成: {reminder.createdBy}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {reminder.scheduledAt.toLocaleDateString('ja-JP')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {reminder.scheduledAt.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <button className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded">
                          編集
                        </button>
                        <button className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded">
                          取消
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 送信済みリスト */}
        {activeTab === 'sent' && (
          <div className="bg-white rounded-lg shadow">
            <div className="divide-y divide-gray-100">
              {sentReminders.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  送信済みのリマインドはありません
                </div>
              ) : (
                sentReminders.map(reminder => (
                  <div key={reminder.id} className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-gray-900">{reminder.clientName}</span>
                          {getTypeBadge(reminder.type)}
                          {getStatusBadge(reminder.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{reminder.subject}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        送信: {reminder.sentAt?.toLocaleDateString('ja-JP')}
                      </p>
                      <p className="text-xs text-gray-500">
                        {reminder.sentAt?.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* テンプレート一覧 */}
        {activeTab === 'templates' && (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                事前承認済みのテンプレートのみ使用可能です。新規テンプレートは弁護士の承認が必要です。
              </p>
            </div>
            <div className="divide-y divide-gray-100">
              {templates.map(template => (
                <div key={template.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">{template.name}</span>
                      {getTypeBadge(template.type)}
                    </div>
                    <button
                      onClick={() => {
                        setSelectedTemplate(template.id);
                        setShowCreateModal(true);
                      }}
                      className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-50 rounded"
                    >
                      使用する
                    </button>
                  </div>
                  <p className="text-sm text-gray-600">{template.subject}</p>
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">本文を表示</summary>
                    <pre className="mt-2 p-3 bg-gray-50 rounded text-xs text-gray-600 whitespace-pre-wrap">
                      {template.body}
                    </pre>
                  </details>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 作成モーダル */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900">リマインドを作成</h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setSelectedTemplate('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  案件 <span className="text-red-500">*</span>
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500">
                  <option value="">案件を選択</option>
                  <option value="case-001">case-001 - 田中 一郎</option>
                  <option value="case-002">case-002 - 佐藤 花子</option>
                  <option value="case-003">case-003 - 鈴木 太郎</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  テンプレート <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedTemplate}
                  onChange={e => setSelectedTemplate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="">テンプレートを選択</option>
                  {templates.map(t => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  送信予定日時 <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  備考（内部メモ）
                </label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                  placeholder="内部用のメモを記載..."
                />
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  <strong>注意</strong>：事務連絡のみ送信可能です。
                  法的判断や法的アドバイスを含む内容は送信できません。
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setSelectedTemplate('');
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  キャンセル
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                  作成
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
