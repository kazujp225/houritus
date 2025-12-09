/**
 * 書類プレビュー画面
 *
 * 申立書類一式のプレビュー・印刷
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';

interface PreviewDocument {
  id: string;
  name: string;
  type: 'main' | 'schedule' | 'attachment';
  pages: number;
}

export default function FilingPreviewPage() {
  const params = useParams();
  const caseId = params.id as string;

  const [selectedDocId, setSelectedDocId] = useState<string>('1');
  const [zoom, setZoom] = useState(100);

  // モックデータ
  const documents: PreviewDocument[] = [
    { id: '1', name: '破産申立書', type: 'main', pages: 3 },
    { id: '2', name: '陳述書', type: 'main', pages: 5 },
    { id: '3', name: '債権者一覧表', type: 'schedule', pages: 2 },
    { id: '4', name: '財産目録', type: 'schedule', pages: 2 },
    { id: '5', name: '家計収支表', type: 'schedule', pages: 1 },
  ];

  const selectedDoc = documents.find(d => d.id === selectedDocId);

  // 破産申立書のモック内容
  const mockApplicationContent = `
                                                      令和　年（フ）第　　　号

                    破　産　手　続　開　始　申　立　書

                                                      令和６年１２月　日

東京地方裁判所民事第20部　御中

                                              申立代理人弁護士　柳田　太郎　　印

第１　当事者

　１　申立人
　　　　住　所　　東京都新宿区西新宿１丁目１番１号
　　　　氏　名　　田中　一郎
　　　　生年月日　昭和○年○月○日生（○歳）
　　　　職　業　　会社員

第２　申立ての趣旨

　　申立人について破産手続を開始し、免責許可の決定を求める。

第３　申立ての理由

　１　債務の状況
　　　申立人の現在の債務総額は、別紙債権者一覧表記載のとおり、
　　　金３，４５０，０００円である。

　２　支払不能に至った経緯
　　　申立人は、令和○年頃から、生活費の不足を補うため、
　　　消費者金融各社から借入れを開始した。
　　　その後、返済のための借入れを繰り返すうちに、
　　　債務が膨らみ、現在の月収では返済が困難な状況となった。

　３　支払不能の状況
　　　申立人の月収は手取り約２０万円であるが、
　　　家賃・光熱費等の生活費を支払うと、
　　　債務の返済に充てる余裕がない状況である。

第４　免責不許可事由について

　　　申立人には、破産法第２５２条第１項各号に定める
　　　免責不許可事由は存在しない。

第５　添付書類

　　１　陳述書　　　　　　　　　　　　１通
　　２　債権者一覧表　　　　　　　　　１通
　　３　財産目録　　　　　　　　　　　１通
　　４　家計収支表　　　　　　　　　　１通
　　５　住民票　　　　　　　　　　　　１通
　　６　戸籍謄本　　　　　　　　　　　１通
　　７　給与明細書（直近３か月分）　　３通
　　８　預金通帳写し　　　　　　　　　一式

                                                              以　上
  `;

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href={`/cases/${caseId}/filing`}
              className="text-gray-500 hover:text-gray-700"
            >
              ← 申立書作成に戻る
            </Link>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-lg font-bold text-gray-900">書類プレビュー</h1>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                </svg>
              </button>
              <span className="text-sm text-gray-600 w-12 text-center">{zoom}%</span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </button>
            </div>
            <div className="h-6 w-px bg-gray-300" />
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
              ダウンロード
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              印刷
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 flex">
        {/* サイドバー */}
        <div className="w-64 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-900 mb-3">書類一覧</h2>
            <div className="space-y-1">
              {documents.map(doc => (
                <button
                  key={doc.id}
                  onClick={() => setSelectedDocId(doc.id)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm ${
                    selectedDocId === doc.id
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{doc.name}</span>
                    <span className="text-xs text-gray-400">{doc.pages}P</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-2">ページ情報</h3>
            <dl className="text-sm space-y-1">
              <div className="flex justify-between">
                <dt className="text-gray-500">総ページ数</dt>
                <dd className="text-gray-900">
                  {documents.reduce((sum, d) => sum + d.pages, 0)}ページ
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">書類数</dt>
                <dd className="text-gray-900">{documents.length}通</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* プレビューエリア */}
        <div className="flex-1 overflow-auto p-8 flex justify-center">
          <div
            className="bg-white shadow-lg"
            style={{
              width: `${(210 * zoom) / 100}mm`,
              minHeight: `${(297 * zoom) / 100}mm`,
              transform: `scale(${zoom / 100})`,
              transformOrigin: 'top center',
            }}
          >
            {selectedDoc && (
              <div className="p-12">
                {selectedDocId === '1' && (
                  <pre
                    className="text-sm leading-relaxed whitespace-pre-wrap font-serif"
                    style={{ fontSize: `${12 * (zoom / 100)}px` }}
                  >
                    {mockApplicationContent}
                  </pre>
                )}

                {selectedDocId === '2' && (
                  <div className="text-center">
                    <h1 className="text-xl font-bold mb-8">陳　述　書</h1>
                    <div className="text-left space-y-4 text-sm">
                      <p>私は、以下のとおり陳述いたします。</p>

                      <h2 className="font-bold mt-6">第１　経歴・家族構成</h2>
                      <p>
                        私は、昭和○年○月○日、東京都で出生しました。
                        現在、妻と2人暮らしです。
                      </p>

                      <h2 className="font-bold mt-6">第２　職業・収入</h2>
                      <p>
                        現在、○○株式会社に勤務しており、月収は手取り約20万円です。
                      </p>

                      <h2 className="font-bold mt-6">第３　債務の経緯</h2>
                      <p>
                        令和○年頃から、生活費の不足を補うため、
                        消費者金融から借入れを開始しました...
                      </p>

                      <p className="text-right mt-8">（以下略）</p>
                    </div>
                  </div>
                )}

                {selectedDocId === '3' && (
                  <div>
                    <h1 className="text-center text-xl font-bold mb-6">債権者一覧表</h1>
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 px-2 py-1">番号</th>
                          <th className="border border-gray-400 px-2 py-1">債権者名</th>
                          <th className="border border-gray-400 px-2 py-1">住所</th>
                          <th className="border border-gray-400 px-2 py-1 text-right">債権額</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-center">1</td>
                          <td className="border border-gray-400 px-2 py-1">アコム株式会社</td>
                          <td className="border border-gray-400 px-2 py-1">東京都千代田区...</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">500,000円</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-center">2</td>
                          <td className="border border-gray-400 px-2 py-1">プロミス株式会社</td>
                          <td className="border border-gray-400 px-2 py-1">東京都千代田区...</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">800,000円</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1 text-center">3</td>
                          <td className="border border-gray-400 px-2 py-1">三井住友カード</td>
                          <td className="border border-gray-400 px-2 py-1">東京都港区...</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">450,000円</td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan={3} className="border border-gray-400 px-2 py-1 text-right">合計</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">3,450,000円</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedDocId === '4' && (
                  <div>
                    <h1 className="text-center text-xl font-bold mb-6">財産目録</h1>
                    <table className="w-full border-collapse border border-gray-400 text-sm">
                      <thead>
                        <tr className="bg-gray-100">
                          <th className="border border-gray-400 px-2 py-1">財産の種類</th>
                          <th className="border border-gray-400 px-2 py-1">内容</th>
                          <th className="border border-gray-400 px-2 py-1 text-right">評価額</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1">現金</td>
                          <td className="border border-gray-400 px-2 py-1">手持ち現金</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">15,000円</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1">預金</td>
                          <td className="border border-gray-400 px-2 py-1">三菱UFJ銀行 普通預金</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">32,500円</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1">不動産</td>
                          <td className="border border-gray-400 px-2 py-1">なし</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">0円</td>
                        </tr>
                        <tr>
                          <td className="border border-gray-400 px-2 py-1">自動車</td>
                          <td className="border border-gray-400 px-2 py-1">なし</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">0円</td>
                        </tr>
                        <tr className="bg-gray-50 font-bold">
                          <td colSpan={2} className="border border-gray-400 px-2 py-1 text-right">合計</td>
                          <td className="border border-gray-400 px-2 py-1 text-right">47,500円</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {selectedDocId === '5' && (
                  <div>
                    <h1 className="text-center text-xl font-bold mb-6">家計収支表</h1>
                    <div className="grid grid-cols-2 gap-8">
                      <div>
                        <h2 className="font-bold mb-2">収入</h2>
                        <table className="w-full border-collapse border border-gray-400 text-sm">
                          <tbody>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">給与</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">200,000円</td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                              <td className="border border-gray-400 px-2 py-1">収入合計</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">200,000円</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                      <div>
                        <h2 className="font-bold mb-2">支出</h2>
                        <table className="w-full border-collapse border border-gray-400 text-sm">
                          <tbody>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">家賃</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">70,000円</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">光熱費</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">15,000円</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">食費</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">40,000円</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">通信費</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">10,000円</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">交通費</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">15,000円</td>
                            </tr>
                            <tr>
                              <td className="border border-gray-400 px-2 py-1">その他</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">50,000円</td>
                            </tr>
                            <tr className="bg-gray-50 font-bold">
                              <td className="border border-gray-400 px-2 py-1">支出合計</td>
                              <td className="border border-gray-400 px-2 py-1 text-right">200,000円</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
