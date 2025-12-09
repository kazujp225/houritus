/**
 * ヒアリング回答画面（依頼者用）
 *
 * 弁護士からの追加質問に回答する
 *
 * 重要：
 * - 依頼者には弁護士承認後の質問のみ表示
 * - AIが生成した内部用質問は非表示
 * - 免責表示を常時表示
 */

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface Question {
  id: string;
  question: string;
  type: 'TEXT' | 'SELECT' | 'MULTI_SELECT' | 'DATE' | 'NUMBER';
  options?: string[];
  required: boolean;
  answered: boolean;
  answer?: string;
  category: string;
}

interface QuestionCategory {
  id: string;
  name: string;
  description: string;
  questions: Question[];
  completedCount: number;
  totalCount: number;
}

export default function HearingPage() {
  const [categories, setCategories] = useState<QuestionCategory[]>([]);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState('');

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      // TODO: 実際のAPIから取得
      // モックデータ
      const mockCategories: QuestionCategory[] = [
        {
          id: 'basic',
          name: '基本情報',
          description: 'ご本人様の基本情報について',
          completedCount: 5,
          totalCount: 5,
          questions: [
            { id: 'q1', question: 'お名前（フリガナ）をお教えください', type: 'TEXT', required: true, answered: true, answer: 'ヤマダ タロウ', category: 'basic' },
            { id: 'q2', question: '生年月日をお教えください', type: 'DATE', required: true, answered: true, answer: '1980-05-15', category: 'basic' },
            { id: 'q3', question: '現在のご住所をお教えください', type: 'TEXT', required: true, answered: true, answer: '東京都千代田区〇〇1-2-3', category: 'basic' },
            { id: 'q4', question: '電話番号をお教えください', type: 'TEXT', required: true, answered: true, answer: '090-1234-5678', category: 'basic' },
            { id: 'q5', question: 'ご家族構成をお教えください', type: 'TEXT', required: true, answered: true, answer: '妻、子供1人', category: 'basic' },
          ],
        },
        {
          id: 'income',
          name: '収入・職業',
          description: '現在の収入状況について',
          completedCount: 2,
          totalCount: 4,
          questions: [
            { id: 'q6', question: '現在のご職業をお教えください', type: 'SELECT', options: ['会社員', '自営業', 'パート・アルバイト', '無職', 'その他'], required: true, answered: true, answer: '会社員', category: 'income' },
            { id: 'q7', question: '勤務先名をお教えください', type: 'TEXT', required: true, answered: true, answer: '株式会社〇〇商事', category: 'income' },
            { id: 'q8', question: '月収（手取り）はおいくらですか？', type: 'NUMBER', required: true, answered: false, category: 'income' },
            { id: 'q9', question: 'ボーナスは年間でおいくらですか？', type: 'NUMBER', required: false, answered: false, category: 'income' },
          ],
        },
        {
          id: 'debt',
          name: '借入状況',
          description: '現在の借入れについて',
          completedCount: 0,
          totalCount: 5,
          questions: [
            { id: 'q10', question: '借入れを始めた時期はいつ頃ですか？', type: 'TEXT', required: true, answered: false, category: 'debt' },
            { id: 'q11', question: '借入れの主な理由をお教えください', type: 'MULTI_SELECT', options: ['生活費', '住宅ローン', '事業資金', '医療費', 'ギャンブル', '投資', 'その他'], required: true, answered: false, category: 'debt' },
            { id: 'q12', question: '現在の借入総額はおいくらですか？', type: 'NUMBER', required: true, answered: false, category: 'debt' },
            { id: 'q13', question: '借入先の数はいくつですか？', type: 'NUMBER', required: true, answered: false, category: 'debt' },
            { id: 'q14', question: '保証人になっている借入れはありますか？', type: 'SELECT', options: ['はい', 'いいえ', 'わからない'], required: true, answered: false, category: 'debt' },
          ],
        },
        {
          id: 'assets',
          name: '資産状況',
          description: 'お持ちの資産について',
          completedCount: 0,
          totalCount: 4,
          questions: [
            { id: 'q15', question: '不動産（土地・建物）はお持ちですか？', type: 'SELECT', options: ['はい', 'いいえ'], required: true, answered: false, category: 'assets' },
            { id: 'q16', question: '自動車はお持ちですか？', type: 'SELECT', options: ['はい（ローンあり）', 'はい（ローンなし）', 'いいえ'], required: true, answered: false, category: 'assets' },
            { id: 'q17', question: '生命保険に加入されていますか？', type: 'SELECT', options: ['はい', 'いいえ'], required: true, answered: false, category: 'assets' },
            { id: 'q18', question: '預貯金はおおよそいくらありますか？', type: 'NUMBER', required: true, answered: false, category: 'assets' },
          ],
        },
      ];

      setCategories(mockCategories);
      setActiveCategory(mockCategories[0]?.id || null);

      // 既存の回答をセット
      const existingAnswers: Record<string, string> = {};
      mockCategories.forEach(cat => {
        cat.questions.forEach(q => {
          if (q.answer) {
            existingAnswers[q.id] = q.answer;
          }
        });
      });
      setAnswers(existingAnswers);
    } catch (error) {
      console.error('Failed to fetch questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // TODO: 実際のAPIを呼び出し
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSavedMessage('回答を保存しました');
      setTimeout(() => setSavedMessage(''), 3000);
    } catch (error) {
      console.error('Failed to save:', error);
    } finally {
      setSaving(false);
    }
  };

  const activeCategoryData = categories.find(c => c.id === activeCategory);
  const totalCompleted = categories.reduce((sum, c) => sum + c.completedCount, 0);
  const totalQuestions = categories.reduce((sum, c) => sum + c.totalCount, 0);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="山田 太郎"
        userRole="CLIENT"
        showPoweredBy
      />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 免責表示 */}
        <DisclaimerBanner variant="compact" className="mb-6" />

        {/* パンくずリスト */}
        <nav className="mb-4 text-sm">
          <ol className="flex items-center space-x-2">
            <li>
              <Link href="/mypage" className="text-gray-500 hover:text-gray-700">
                マイページ
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">ヒアリング回答</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">ヒアリング回答</h1>
          <p className="mt-1 text-sm text-gray-500">
            弁護士からの質問にお答えください
          </p>
        </div>

        {/* 進捗バー */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">回答状況</span>
            <span className="text-sm text-gray-500">{totalCompleted} / {totalQuestions} 完了</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(totalCompleted / totalQuestions) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex gap-6">
          {/* カテゴリーサイドバー */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-sm font-medium text-gray-900">カテゴリー</h2>
              </div>
              <nav className="p-2">
                {categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm mb-1 ${
                      activeCategory === category.id
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{category.name}</span>
                      <span className={`text-xs ${
                        category.completedCount === category.totalCount
                          ? 'text-green-600'
                          : 'text-gray-400'
                      }`}>
                        {category.completedCount}/{category.totalCount}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* 質問フォーム */}
          <div className="flex-1">
            {activeCategoryData && (
              <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium text-gray-900">{activeCategoryData.name}</h2>
                  <p className="mt-1 text-sm text-gray-500">{activeCategoryData.description}</p>
                </div>
                <div className="px-6 py-4 space-y-6">
                  {activeCategoryData.questions.map((question, index) => (
                    <div key={question.id} className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        {index + 1}. {question.question}
                        {question.required && <span className="text-red-500 ml-1">*</span>}
                      </label>

                      {question.type === 'TEXT' && (
                        <input
                          type="text"
                          value={answers[question.id] || ''}
                          onChange={e => handleAnswerChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          placeholder="回答を入力してください"
                        />
                      )}

                      {question.type === 'NUMBER' && (
                        <div className="relative">
                          <input
                            type="number"
                            value={answers[question.id] || ''}
                            onChange={e => handleAnswerChange(question.id, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="金額を入力してください"
                          />
                          <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-400">
                            円
                          </span>
                        </div>
                      )}

                      {question.type === 'DATE' && (
                        <input
                          type="date"
                          value={answers[question.id] || ''}
                          onChange={e => handleAnswerChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        />
                      )}

                      {question.type === 'SELECT' && question.options && (
                        <select
                          value={answers[question.id] || ''}
                          onChange={e => handleAnswerChange(question.id, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">選択してください</option>
                          {question.options.map(option => (
                            <option key={option} value={option}>{option}</option>
                          ))}
                        </select>
                      )}

                      {question.type === 'MULTI_SELECT' && question.options && (
                        <div className="space-y-2">
                          {question.options.map(option => (
                            <label key={option} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={(answers[question.id] || '').split(',').includes(option)}
                                onChange={e => {
                                  const current = (answers[question.id] || '').split(',').filter(Boolean);
                                  if (e.target.checked) {
                                    handleAnswerChange(question.id, [...current, option].join(','));
                                  } else {
                                    handleAnswerChange(question.id, current.filter(v => v !== option).join(','));
                                  }
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 保存ボタン */}
            <div className="mt-6 flex items-center justify-between">
              <Link
                href="/mypage"
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                ← マイページに戻る
              </Link>
              <div className="flex items-center space-x-4">
                {savedMessage && (
                  <span className="text-sm text-green-600">{savedMessage}</span>
                )}
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
                >
                  {saving ? '保存中...' : '回答を保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
