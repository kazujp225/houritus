/**
 * 新規案件登録画面
 *
 * 相談者情報を登録し、利益相反チェックを行う
 *
 * 重要：
 * - 利益相反チェックが完了するまで受任判断は行わない
 * - 受任前は詳細な財務情報の収集は行わない
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';

interface Creditor {
  name: string;
  estimatedAmount: string;
}

export default function NewCasePage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: 基本情報
  const [basicInfo, setBasicInfo] = useState({
    fullName: '',
    fullNameKana: '',
    birthDate: '',
    phone: '',
    email: '',
    address: '',
    consultationDate: '',
    consultationType: 'ONLINE',
    referralSource: '',
  });

  // Step 2: 債権者情報（利益相反チェック用）
  const [creditors, setCreditors] = useState<Creditor[]>([
    { name: '', estimatedAmount: '' },
  ]);

  // Step 3: 案件種別・担当者
  const [caseInfo, setCaseInfo] = useState({
    caseType: 'BANKRUPTCY',
    estimatedTotalDebt: '',
    assignedLawyerId: '',
    notes: '',
  });

  const addCreditor = () => {
    setCreditors([...creditors, { name: '', estimatedAmount: '' }]);
  };

  const removeCreditor = (index: number) => {
    if (creditors.length > 1) {
      setCreditors(creditors.filter((_, i) => i !== index));
    }
  };

  const updateCreditor = (index: number, field: keyof Creditor, value: string) => {
    const updated = [...creditors];
    updated[index][field] = value;
    setCreditors(updated);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      // TODO: 実際のAPIを呼び出し
      const response = await fetch('/api/cases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...basicInfo,
          creditors: creditors.filter(c => c.name),
          ...caseInfo,
        }),
      });

      if (!response.ok) {
        throw new Error('案件登録に失敗しました');
      }

      const data = await response.json();
      router.push(`/cases/${data.id}/conflict-check`);
    } catch (error) {
      console.error('Failed to create case:', error);
      alert('案件登録に失敗しました。もう一度お試しください。');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="柳田 一郎"
        userRole="LAWYER"
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* パンくずリスト */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/cases" className="text-gray-500 hover:text-gray-700">
                案件一覧
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">新規案件登録</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">新規案件登録</h1>
          <p className="mt-1 text-sm text-gray-500">
            相談者情報を登録し、利益相反チェックを行います
          </p>
        </div>

        {/* ステップインジケーター */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              {[
                { num: 1, label: '基本情報' },
                { num: 2, label: '債権者情報' },
                { num: 3, label: '案件設定' },
              ].map((s, i) => (
                <React.Fragment key={s.num}>
                  <div className="flex items-center">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      step >= s.num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step > s.num ? '✓' : s.num}
                    </span>
                    <span className={`ml-2 text-sm ${
                      step >= s.num ? 'text-gray-900 font-medium' : 'text-gray-500'
                    }`}>
                      {s.label}
                    </span>
                  </div>
                  {i < 2 && <div className="flex-1 mx-4 h-px bg-gray-200" />}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow">
          {/* Step 1: 基本情報 */}
          {step === 1 && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">相談者の基本情報</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      氏名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={basicInfo.fullName}
                      onChange={e => setBasicInfo({ ...basicInfo, fullName: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                      value={basicInfo.fullNameKana}
                      onChange={e => setBasicInfo({ ...basicInfo, fullNameKana: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="ヤマダ タロウ"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      生年月日 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={basicInfo.birthDate}
                      onChange={e => setBasicInfo({ ...basicInfo, birthDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={basicInfo.phone}
                      onChange={e => setBasicInfo({ ...basicInfo, phone: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="090-1234-5678"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    メールアドレス
                  </label>
                  <input
                    type="email"
                    value={basicInfo.email}
                    onChange={e => setBasicInfo({ ...basicInfo, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="example@email.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    住所 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={basicInfo.address}
                    onChange={e => setBasicInfo({ ...basicInfo, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="東京都千代田区〇〇1-2-3"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      相談日
                    </label>
                    <input
                      type="date"
                      value={basicInfo.consultationDate}
                      onChange={e => setBasicInfo({ ...basicInfo, consultationDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      相談方法
                    </label>
                    <select
                      value={basicInfo.consultationType}
                      onChange={e => setBasicInfo({ ...basicInfo, consultationType: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="ONLINE">オンライン</option>
                      <option value="OFFICE">事務所来所</option>
                      <option value="PHONE">電話</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    紹介元（任意）
                  </label>
                  <input
                    type="text"
                    value={basicInfo.referralSource}
                    onChange={e => setBasicInfo({ ...basicInfo, referralSource: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="Web検索、紹介など"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setStep(2)}
                  disabled={!basicInfo.fullName || !basicInfo.fullNameKana || !basicInfo.birthDate || !basicInfo.phone || !basicInfo.address}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {/* Step 2: 債権者情報 */}
          {step === 2 && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-2">主要債権者の情報</h2>
              <p className="text-sm text-gray-500 mb-4">
                利益相反チェックのため、主要な借入先を入力してください
              </p>

              <div className="space-y-4">
                {creditors.map((creditor, index) => (
                  <div key={index} className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        債権者名 {index === 0 && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        required={index === 0}
                        value={creditor.name}
                        onChange={e => updateCreditor(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="例: A消費者金融株式会社"
                      />
                    </div>
                    <div className="w-40">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        概算債務額
                      </label>
                      <input
                        type="text"
                        value={creditor.estimatedAmount}
                        onChange={e => updateCreditor(index, 'estimatedAmount', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="約100万円"
                      />
                    </div>
                    {creditors.length > 1 && (
                      <button
                        onClick={() => removeCreditor(index)}
                        className="mt-6 p-2 text-gray-400 hover:text-red-500"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                onClick={addCreditor}
                className="mt-4 flex items-center text-sm text-blue-600 hover:text-blue-800"
              >
                <svg className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                債権者を追加
              </button>

              <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  <strong>利益相反チェックについて</strong><br />
                  入力された債権者名は既存案件との照合に使用されます。
                  チェック完了後、弁護士が受任可否を判断します。
                </p>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(1)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← 戻る
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!creditors[0]?.name}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  次へ
                </button>
              </div>
            </div>
          )}

          {/* Step 3: 案件設定 */}
          {step === 3 && (
            <div className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">案件設定</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    案件種別
                  </label>
                  <select
                    value={caseInfo.caseType}
                    onChange={e => setCaseInfo({ ...caseInfo, caseType: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="BANKRUPTCY">自己破産</option>
                    <option value="CIVIL_REHAB">個人再生</option>
                    <option value="VOLUNTARY_ARRANGEMENT">任意整理</option>
                    <option value="UNDETERMINED">未定（相談中）</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    概算債務総額
                  </label>
                  <input
                    type="text"
                    value={caseInfo.estimatedTotalDebt}
                    onChange={e => setCaseInfo({ ...caseInfo, estimatedTotalDebt: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder="約500万円"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    担当弁護士
                  </label>
                  <select
                    value={caseInfo.assignedLawyerId}
                    onChange={e => setCaseInfo({ ...caseInfo, assignedLawyerId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="">選択してください</option>
                    <option value="lawyer-1">柳田 一郎</option>
                    <option value="lawyer-2">佐藤 二郎</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    備考
                  </label>
                  <textarea
                    value={caseInfo.notes}
                    onChange={e => setCaseInfo({ ...caseInfo, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="相談時のメモなど"
                  />
                </div>
              </div>

              <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>次のステップ</strong><br />
                  登録後、利益相反チェック画面に移動します。
                  チェック完了後、受任可否を判断してください。
                </p>
              </div>

              <div className="mt-6 flex justify-between">
                <button
                  onClick={() => setStep(2)}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  ← 戻る
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? '登録中...' : '登録して利益相反チェックへ'}
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
