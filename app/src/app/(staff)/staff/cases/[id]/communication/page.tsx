/**
 * 依頼者対応画面（事務職員用）
 *
 * 事務職員が依頼者からの問い合わせに対応する
 *
 * 重要：
 * - 事務職員は事務連絡のみ送信可能
 * - 法的判断が必要な内容は弁護士確認フローへ
 * - 送信可能：資料提出リマインド、日程調整、一般的な事務連絡
 * - 送信不可：法的判断を含む回答、方針に関する説明
 */

'use client';

import React, { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  senderName: string;
  senderRole: 'CLIENT' | 'STAFF' | 'LAWYER';
  content: string;
  createdAt: string;
  isLegalContent: boolean;
}

interface CaseInfo {
  id: string;
  caseNumber: string;
  clientName: string;
  clientEmail: string;
  lawyerName: string;
}

interface Template {
  id: string;
  name: string;
  content: string;
  category: 'REMINDER' | 'SCHEDULE' | 'GENERAL';
  requiresLawyerApproval: boolean;
}

const templateCategories: Record<string, string> = {
  REMINDER: 'リマインド',
  SCHEDULE: '日程調整',
  GENERAL: '一般連絡',
};

const roleLabels: Record<string, string> = {
  CLIENT: '依頼者',
  STAFF: '事務',
  LAWYER: '弁護士',
};

export default function CommunicationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id: caseId } = use(params);
  const [caseInfo, setCaseInfo] = useState<CaseInfo | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [messageContent, setMessageContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showLegalWarning, setShowLegalWarning] = useState(false);

  useEffect(() => {
    fetchData();
  }, [caseId]);

  const fetchData = async () => {
    try {
      // TODO: 実際のAPIから取得
      // モックデータ
      setCaseInfo({
        id: caseId,
        caseNumber: '2024-0001',
        clientName: '山田 太郎',
        clientEmail: 'yamada@example.com',
        lawyerName: '柳田 一郎',
      });

      setMessages([
        {
          id: 'm1',
          direction: 'outbound',
          senderName: '田中 花子',
          senderRole: 'STAFF',
          content: '山田様\n\nお世話になっております。\n以下の書類のご提出をお願いいたします。\n・給与明細（直近3ヶ月分）\n・源泉徴収票\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n柳田法律事務所\n田中 花子',
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          isLegalContent: false,
        },
        {
          id: 'm2',
          direction: 'inbound',
          senderName: '山田 太郎',
          senderRole: 'CLIENT',
          content: '田中様\n\nご連絡ありがとうございます。\n給与明細をアップロードしました。\n源泉徴収票は会社に再発行を依頼しているので、届き次第アップロードします。\n\nもう一点お伺いしたいのですが、破産すると仕事に影響はありますか？\n\n山田',
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          isLegalContent: true,
        },
        {
          id: 'm3',
          direction: 'outbound',
          senderName: '田中 花子',
          senderRole: 'STAFF',
          content: '山田様\n\n給与明細のアップロード、ありがとうございます。\n確認いたしました。\n\n源泉徴収票については、届き次第で構いませんので、ご都合の良い時にアップロードをお願いいたします。\n\nなお、お仕事への影響についてのご質問は、担当弁護士の柳田より改めてご連絡いたします。\n\n柳田法律事務所\n田中 花子',
          createdAt: new Date().toISOString(),
          isLegalContent: false,
        },
      ]);

      setTemplates([
        {
          id: 't1',
          name: '資料提出リマインド',
          content: '[依頼者名]様\n\nお世話になっております。\n以下の書類のご提出をお願いいたします。\n\n・[書類名]\n\nご提出期限：[期限]\n\nご不明な点がございましたら、お気軽にお問い合わせください。\n\n柳田法律事務所\n[担当者名]',
          category: 'REMINDER',
          requiresLawyerApproval: false,
        },
        {
          id: 't2',
          name: '面談日程調整',
          content: '[依頼者名]様\n\nお世話になっております。\n弁護士との面談日程について、以下の候補日をご提案いたします。\n\n候補1：○月○日（○）○時〜\n候補2：○月○日（○）○時〜\n候補3：○月○日（○）○時〜\n\nご都合の良い日時をお知らせください。\n\n柳田法律事務所\n[担当者名]',
          category: 'SCHEDULE',
          requiresLawyerApproval: false,
        },
        {
          id: 't3',
          name: '資料受領確認',
          content: '[依頼者名]様\n\nお世話になっております。\n[書類名]を受領いたしました。\nありがとうございます。\n\n内容を確認の上、追加でご連絡させていただく場合がございます。\n引き続きよろしくお願いいたします。\n\n柳田法律事務所\n[担当者名]',
          category: 'GENERAL',
          requiresLawyerApproval: false,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find(t => t.id === templateId);
    if (template) {
      // プレースホルダーを置換
      let content = template.content;
      content = content.replace('[依頼者名]', caseInfo?.clientName || '');
      content = content.replace('[担当者名]', '田中 花子');
      setMessageContent(content);
    }
  };

  const checkLegalContent = (content: string): boolean => {
    // 法的判断を含む可能性のあるキーワードをチェック
    const legalKeywords = [
      '免責', '破産', '申立', '裁判所', '債務整理', '弁済',
      '法的', '判断', '方針', 'アドバイス', '助言', '見通し',
      '可能性', 'リスク', '影響', '資格', '制限'
    ];
    return legalKeywords.some(keyword => content.includes(keyword));
  };

  const handleContentChange = (content: string) => {
    setMessageContent(content);
    setShowLegalWarning(checkLegalContent(content));
  };

  const handleSend = async () => {
    if (!messageContent.trim()) return;

    if (showLegalWarning) {
      // 法的判断を含む可能性がある場合は弁護士確認フローへ
      if (!confirm('法的判断を含む可能性のある内容です。弁護士の確認を依頼しますか？')) {
        return;
      }
      // TODO: 弁護士確認フローへ送信
      alert('弁護士に確認を依頼しました。承認後に送信されます。');
      setMessageContent('');
      setSelectedTemplate('');
      return;
    }

    setSending(true);
    try {
      // TODO: 実際のAPIを呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));

      const newMessage: Message = {
        id: `m-${Date.now()}`,
        direction: 'outbound',
        senderName: '田中 花子',
        senderRole: 'STAFF',
        content: messageContent,
        createdAt: new Date().toISOString(),
        isLegalContent: false,
      };
      setMessages(prev => [...prev, newMessage]);
      setMessageContent('');
      setSelectedTemplate('');
    } catch (error) {
      console.error('Failed to send:', error);
      alert('送信に失敗しました');
    } finally {
      setSending(false);
    }
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

  if (!caseInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">案件が見つかりません</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="田中 花子"
        userRole="STAFF"
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/staff/dashboard" className="text-gray-500 hover:text-gray-700">
                ダッシュボード
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href={`/staff/cases/${caseId}`} className="text-gray-500 hover:text-gray-700">
                {caseInfo.clientName}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">依頼者対応</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">依頼者対応</h1>
          <p className="mt-1 text-sm text-gray-500">
            案件：{caseInfo.clientName} 様 | {caseInfo.caseNumber}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 連絡履歴 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">連絡履歴</h2>
              </div>
              <div className="px-6 py-4 space-y-4 max-h-[500px] overflow-y-auto">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`p-4 rounded-lg ${
                      message.direction === 'inbound'
                        ? 'bg-gray-50'
                        : 'bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                          message.senderRole === 'CLIENT'
                            ? 'bg-gray-200 text-gray-700'
                            : message.senderRole === 'LAWYER'
                            ? 'bg-blue-200 text-blue-700'
                            : 'bg-green-200 text-green-700'
                        }`}>
                          {roleLabels[message.senderRole]}
                        </span>
                        <span className="text-sm font-medium text-gray-900">
                          {message.senderName}
                        </span>
                        {message.isLegalContent && (
                          <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded text-xs">
                            法的内容含む
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">
                        {new Date(message.createdAt).toLocaleString('ja-JP')}
                      </span>
                    </div>
                    <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">
                      {message.content}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* メッセージ送信 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow sticky top-4">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">メッセージ送信</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                {/* テンプレート選択 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    テンプレート選択
                  </label>
                  <select
                    value={selectedTemplate}
                    onChange={e => handleTemplateChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">テンプレートを選択...</option>
                    {Object.entries(
                      templates.reduce((acc, t) => {
                        if (!acc[t.category]) acc[t.category] = [];
                        acc[t.category].push(t);
                        return acc;
                      }, {} as Record<string, Template[]>)
                    ).map(([category, items]) => (
                      <optgroup key={category} label={templateCategories[category]}>
                        {items.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                </div>

                {/* メッセージ入力 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メッセージ内容
                  </label>
                  <textarea
                    value={messageContent}
                    onChange={e => handleContentChange(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="メッセージを入力..."
                  />
                </div>

                {/* 法的内容警告 */}
                {showLegalWarning && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <div className="flex">
                      <svg className="h-5 w-5 text-amber-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="text-sm text-amber-700">
                        法的判断を含む可能性のある内容です。弁護士確認が必要です。
                      </p>
                    </div>
                  </div>
                )}

                {/* 送信ボタン */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => {
                      setMessageContent('');
                      setSelectedTemplate('');
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50"
                  >
                    クリア
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!messageContent.trim() || sending}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium ${
                      showLegalWarning
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {sending ? '送信中...' : showLegalWarning ? '弁護士確認を依頼' : '送信'}
                  </button>
                </div>
              </div>
            </div>

            {/* 注意事項 */}
            <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">送信可能な内容</h3>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>資料提出のリマインド</li>
                <li>面談日程の調整</li>
                <li>資料受領の確認</li>
                <li>一般的な事務連絡</li>
              </ul>
              <h3 className="text-sm font-medium text-gray-700 mt-3 mb-2">弁護士確認が必要</h3>
              <ul className="text-xs text-gray-500 space-y-1 list-disc list-inside">
                <li>法的判断を含む回答</li>
                <li>手続の方針に関する説明</li>
                <li>今後の見通しに関する内容</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
