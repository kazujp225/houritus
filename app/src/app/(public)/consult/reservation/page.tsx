/**
 * 面談予約画面
 *
 * 相談受付チャット後に弁護士との面談を予約する
 *
 * 重要（非弁対策）：
 * - 免責表示を常時表示
 * - 受任を保証しない旨を明記
 * - 利益相反等の理由により受任できない場合がある旨を明記
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface TimeSlot {
  id: string;
  date: string;
  time: string;
  available: boolean;
}

export default function ReservationPage() {
  const [step, setStep] = useState<'select' | 'confirm' | 'complete'>('select');
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    nameKana: '',
    phone: '',
    email: '',
    preferredContact: 'phone',
    notes: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // モックの空き時間
  const timeSlots: TimeSlot[] = [
    { id: '1', date: '2024-12-11', time: '10:00', available: true },
    { id: '2', date: '2024-12-11', time: '11:00', available: false },
    { id: '3', date: '2024-12-11', time: '14:00', available: true },
    { id: '4', date: '2024-12-11', time: '15:00', available: true },
    { id: '5', date: '2024-12-12', time: '10:00', available: true },
    { id: '6', date: '2024-12-12', time: '11:00', available: true },
    { id: '7', date: '2024-12-12', time: '14:00', available: false },
    { id: '8', date: '2024-12-12', time: '15:00', available: true },
    { id: '9', date: '2024-12-13', time: '10:00', available: true },
    { id: '10', date: '2024-12-13', time: '14:00', available: true },
  ];

  // 日付ごとにグループ化
  const slotsByDate = timeSlots.reduce((acc, slot) => {
    if (!acc[slot.date]) acc[slot.date] = [];
    acc[slot.date].push(slot);
    return acc;
  }, {} as Record<string, TimeSlot[]>);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const days = ['日', '月', '火', '水', '木', '金', '土'];
    return `${date.getMonth() + 1}月${date.getDate()}日（${days[date.getDay()]}）`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // TODO: 実際のAPIを呼び出し
      await new Promise(resolve => setTimeout(resolve, 1500));
      setStep('complete');
    } catch (error) {
      console.error('Failed to submit:', error);
      alert('予約に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  // 予約完了画面
  if (step === 'complete') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <header className="bg-white shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center">
              <svg className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
              <span className="ml-2 text-lg font-bold text-gray-900">柳田法律事務所</span>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="max-w-md w-full bg-white rounded-lg shadow p-8 text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">ご予約を受け付けました</h1>
            <p className="text-gray-600 mb-6">
              ご登録いただいたメールアドレスに確認メールをお送りしました。
            </p>

            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <h2 className="text-sm font-medium text-gray-900 mb-3">ご予約内容</h2>
              <dl className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">日時</dt>
                  <dd className="text-gray-900">
                    {selectedSlot && `${formatDate(selectedSlot.date)} ${selectedSlot.time}`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">場所</dt>
                  <dd className="text-gray-900">オンライン面談</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">お名前</dt>
                  <dd className="text-gray-900">{formData.name} 様</dd>
                </div>
              </dl>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-amber-800">
                <strong>【重要】</strong><br />
                このご予約は受任を保証するものではありません。
                利益相反等の理由により受任できない場合がございます。
              </p>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              ご不明な点がございましたら、事務所までお問い合わせください。
            </p>

            <Link
              href="/"
              className="inline-flex items-center justify-center px-6 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              トップページに戻る
            </Link>
          </div>
        </main>

        <footer className="bg-white border-t border-gray-200 py-4">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <p className="text-xs text-gray-500">Powered by ZettAI（システム提供）</p>
            <p className="mt-1 text-xs text-gray-400">法律サービスの提供主体は柳田法律事務所です</p>
          </div>
        </footer>
      </div>
    );
  }

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
            <Link href="/consult" className="text-sm text-gray-500 hover:text-gray-700">
              ← 相談に戻る
            </Link>
          </div>
        </div>
      </header>

      {/* 免責表示 */}
      <DisclaimerBanner variant="detailed" className="max-w-3xl mx-auto mt-4 px-4" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow">
          {/* ステップインジケーター */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-center space-x-4">
              <div className={`flex items-center ${step === 'select' ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'select' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>1</span>
                <span className="ml-2 text-sm">日時選択</span>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className={`flex items-center ${step === 'confirm' ? 'text-blue-600' : 'text-gray-400'}`}>
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step === 'confirm' ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>2</span>
                <span className="ml-2 text-sm">情報入力</span>
              </div>
            </div>
          </div>

          {step === 'select' && (
            <div className="p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">無料相談のご予約</h1>
              <p className="text-sm text-gray-500 mb-6">ご希望の日時をお選びください</p>

              <div className="space-y-6">
                {Object.entries(slotsByDate).map(([date, slots]) => (
                  <div key={date}>
                    <h3 className="text-sm font-medium text-gray-900 mb-3">{formatDate(date)}</h3>
                    <div className="flex flex-wrap gap-2">
                      {slots.map(slot => (
                        <button
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          disabled={!slot.available}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                            selectedSlot?.id === slot.id
                              ? 'bg-blue-600 text-white'
                              : slot.available
                              ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              : 'bg-gray-50 text-gray-300 cursor-not-allowed'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={() => setStep('confirm')}
                  disabled={!selectedSlot}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {step === 'confirm' && (
            <form onSubmit={handleSubmit} className="p-6">
              <h1 className="text-xl font-bold text-gray-900 mb-2">お客様情報の入力</h1>
              <p className="text-sm text-gray-500 mb-6">
                ご予約日時: {selectedSlot && `${formatDate(selectedSlot.date)} ${selectedSlot.time}`}
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="山田 太郎"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      フリガナ <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.nameKana}
                      onChange={e => setFormData({ ...formData, nameKana: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="ヤマダ タロウ"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    電話番号 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="090-1234-5678"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ご希望の連絡方法
                  </label>
                  <div className="flex space-x-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contact"
                        value="phone"
                        checked={formData.preferredContact === 'phone'}
                        onChange={e => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">電話</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="contact"
                        value="email"
                        checked={formData.preferredContact === 'email'}
                        onChange={e => setFormData({ ...formData, preferredContact: e.target.value })}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">メール</span>
                    </label>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備考・ご質問（任意）
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    placeholder="事前にお伝えしたいことがあればご記入ください"
                  />
                </div>
              </div>

              <div className="mt-8 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep('select')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← 日時選択に戻る
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '送信中...' : '予約を確定する'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <p className="text-xs text-gray-500">Powered by ZettAI（システム提供）</p>
          <p className="mt-1 text-xs text-gray-400">法律サービスの提供主体は柳田法律事務所です</p>
        </div>
      </footer>
    </div>
  );
}
