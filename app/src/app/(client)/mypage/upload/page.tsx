/**
 * 書類アップロード画面（依頼者用）
 *
 * 依頼者が必要書類をアップロードする
 *
 * 重要：
 * - 依頼者画面に「法的判断」を出さない
 * - 免責表示を常時表示
 * - アップロードされた書類は弁護士が確認
 */

'use client';

import React, { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/common/Header';
import { DisclaimerBanner } from '@/components/common/DisclaimerBanner';

interface UploadFile {
  id: string;
  file: File;
  documentType: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  progress: number;
  error?: string;
}

const documentTypes = [
  { value: 'ID_DOCUMENT', label: '本人確認書類', description: '運転免許証、マイナンバーカード、パスポートなど' },
  { value: 'PASSBOOK', label: '通帳のコピー', description: '過去2年分の全ページ' },
  { value: 'BANK_STATEMENT', label: '銀行明細', description: 'ネットバンキングの取引履歴でも可' },
  { value: 'PAY_SLIP', label: '給与明細', description: '直近3ヶ月分' },
  { value: 'TAX_CERTIFICATE', label: '源泉徴収票', description: '直近のもの' },
  { value: 'CREDIT_CARD_STATEMENT', label: 'クレジットカード明細', description: '全ての保有カード' },
  { value: 'LOAN_CONTRACT', label: 'ローン契約書', description: '借入に関する契約書類' },
  { value: 'REAL_ESTATE_CERT', label: '不動産登記簿', description: '所有不動産がある場合' },
  { value: 'VEHICLE_CERT', label: '車検証', description: '所有車両がある場合' },
  { value: 'INSURANCE_POLICY', label: '保険証券', description: '生命保険、損害保険など' },
  { value: 'OTHER', label: 'その他', description: '上記に該当しない書類' },
];

export default function DocumentUploadPage() {
  const router = useRouter();
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [selectedType, setSelectedType] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    if (!selectedType) {
      alert('先に書類の種類を選択してください');
      return;
    }

    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, [selectedType]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedType) {
      alert('先に書類の種類を選択してください');
      return;
    }

    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const uploadFiles: UploadFile[] = newFiles.map(file => ({
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file,
      documentType: selectedType,
      status: 'pending',
      progress: 0,
    }));

    setFiles(prev => [...prev, ...uploadFiles]);
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFiles = async () => {
    if (files.length === 0) {
      alert('アップロードするファイルを選択してください');
      return;
    }

    setUploading(true);

    for (const uploadFile of files) {
      if (uploadFile.status !== 'pending') continue;

      // ファイルのステータスを更新
      setFiles(prev =>
        prev.map(f =>
          f.id === uploadFile.id ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        // TODO: 実際のアップロードAPI
        // const formData = new FormData();
        // formData.append('file', uploadFile.file);
        // formData.append('documentType', uploadFile.documentType);
        // await fetch('/api/documents/upload', { method: 'POST', body: formData });

        // シミュレート
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 成功時の処理
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id ? { ...f, status: 'success' as const, progress: 100 } : f
          )
        );
      } catch (error) {
        // エラー時の処理
        setFiles(prev =>
          prev.map(f =>
            f.id === uploadFile.id
              ? { ...f, status: 'error' as const, error: 'アップロードに失敗しました' }
              : f
          )
        );
      }
    }

    setUploading(false);
  };

  const getDocumentTypeLabel = (value: string) => {
    return documentTypes.find(t => t.value === value)?.label || value;
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'success');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        tenantName="柳田法律事務所"
        userName="山田 太郎"
        userRole="CLIENT"
        showPoweredBy
      />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            <li className="text-gray-900 font-medium">資料アップロード</li>
          </ol>
        </nav>

        {/* ヘッダー */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <h1 className="text-xl font-bold text-gray-900">資料のアップロード</h1>
          <p className="mt-2 text-sm text-gray-600">
            手続きに必要な書類をアップロードしてください。
            アップロードされた書類は担当弁護士が確認します。
          </p>
        </div>

        {/* 書類種別選択 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              1. 書類の種類を選択
            </h2>
          </div>
          <div className="px-6 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {documentTypes.map(type => (
                <button
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={`p-3 border-2 rounded-lg text-left transition-colors ${
                    selectedType === type.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className={`font-medium text-sm ${
                    selectedType === type.value ? 'text-blue-700' : 'text-gray-900'
                  }`}>
                    {type.label}
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500">{type.description}</p>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ファイル選択 */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              2. ファイルを選択
            </h2>
          </div>
          <div className="px-6 py-4">
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? 'border-blue-500 bg-blue-50'
                  : selectedType
                  ? 'border-gray-300 hover:border-gray-400'
                  : 'border-gray-200 bg-gray-50 cursor-not-allowed'
              }`}
            >
              <svg
                className={`mx-auto h-12 w-12 ${selectedType ? 'text-gray-400' : 'text-gray-300'}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className="mt-4 text-sm text-gray-600">
                {selectedType
                  ? 'ファイルをドラッグ＆ドロップ、または'
                  : '先に書類の種類を選択してください'}
              </p>
              {selectedType && (
                <>
                  <label className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 cursor-pointer">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.jpg,.jpeg,.png,.gif"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    ファイルを選択
                  </label>
                  <p className="mt-2 text-xs text-gray-500">
                    PDF, JPG, PNG形式 / 1ファイル10MBまで
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 選択されたファイル一覧 */}
        {files.length > 0 && (
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                3. 選択されたファイル
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {files.map(uploadFile => (
                <div key={uploadFile.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0">
                      <div className="flex-shrink-0">
                        {uploadFile.status === 'success' ? (
                          <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        ) : uploadFile.status === 'error' ? (
                          <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        ) : uploadFile.status === 'uploading' ? (
                          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full" />
                        ) : (
                          <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        )}
                      </div>
                      <div className="ml-3 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {uploadFile.file.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {getDocumentTypeLabel(uploadFile.documentType)} ・ {(uploadFile.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                        {uploadFile.error && (
                          <p className="text-xs text-red-500 mt-1">{uploadFile.error}</p>
                        )}
                      </div>
                    </div>
                    {uploadFile.status === 'pending' && (
                      <button
                        onClick={() => removeFile(uploadFile.id)}
                        className="ml-4 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* アクションボタン */}
        <div className="flex items-center justify-between">
          <Link
            href="/mypage"
            className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900"
          >
            ← マイページに戻る
          </Link>
          <div className="flex items-center space-x-3">
            {completedFiles.length > 0 && (
              <span className="text-sm text-green-600">
                {completedFiles.length}件アップロード完了
              </span>
            )}
            <button
              onClick={uploadFiles}
              disabled={uploading || pendingFiles.length === 0}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? 'アップロード中...' : `アップロード (${pendingFiles.length}件)`}
            </button>
          </div>
        </div>

        {/* 注意事項 */}
        <div className="mt-8 bg-gray-50 rounded-lg p-4">
          <h3 className="text-sm font-medium text-gray-900 mb-2">ご注意</h3>
          <ul className="text-xs text-gray-600 space-y-1 list-disc list-inside">
            <li>アップロードされた書類は、担当弁護士のみが閲覧します</li>
            <li>個人情報を含む書類は適切に管理されます</li>
            <li>不明点がございましたら、担当弁護士にお問い合わせください</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
