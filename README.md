# ZettAI 破産手続支援SaaS

弁護士法人が提供する個人破産手続の業務を、AIで効率化するB2B業務支援SaaS

## 概要

**重要：法律サービス提供主体は弁護士法人であり、ZettAIはSaaS提供者に徹する**

| 項目 | 内容 |
|------|------|
| サービス形態 | B2B SaaS |
| 提供者 | ZettAI株式会社 |
| 利用者 | 弁護士法人 |
| 法律サービス提供主体 | 弁護士法人（ZettAIではない） |

## 非弁リスク回避の5原則

1. **法律サービス提供主体は弁護士法人** - 契約・窓口・請求・責任の全てが弁護士法人
2. **AIは補助ツールに徹する** - 事実整理・ドラフト生成・進捗管理のみ
3. **対外送信は弁護士のみ** - 依頼者・債権者・裁判所への送信権限は弁護士だけ
4. **個別判断は弁護士が行う** - 「あなたは破産が最適」等の結論はAIが出さない
5. **課金は案件連動しない** - SaaS月額のみ、紹介料・成功報酬は禁止

## 技術スタック

- **Frontend**: Next.js 16, React 19, Tailwind CSS 4
- **Backend**: Next.js API Routes, Prisma ORM
- **Authentication**: NextAuth.js
- **Database**: PostgreSQL（予定）
- **Validation**: Zod

## ディレクトリ構成

```
houritsu/
├── app/                 # Next.js アプリケーション
│   ├── src/
│   │   └── app/        # App Router
│   ├── package.json
│   └── ...
├── plan.md             # 設計指針（マスタードキュメント）
├── concept.md          # コンセプト定義書
├── pages.md            # 画面定義書
├── roles.md            # 権限・ロール定義書
├── data.md             # データ・ログ定義書
├── contracts.md        # 契約・規約骨子
└── CLAUDE.md           # 開発ガイドライン
```

## セットアップ

```bash
# 依存関係のインストール
cd app
npm install

# 開発サーバー起動
npm run dev
```

開発サーバーは http://localhost:3000 で起動します。

## 主要コマンド

| コマンド | 説明 |
|---------|------|
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run start` | 本番サーバー起動 |
| `npm run lint` | ESLint実行 |

## ロール定義

| ロール | 権限 |
|--------|------|
| `LAWYER` | 弁護士：法的判断・承認・対外送信 |
| `STAFF` | 事務職員：依頼者対応・資料管理（事務連絡のみ） |
| `CLIENT` | 依頼者：自分の案件の閲覧・資料提出 |
| `TECH_SUPPORT` | ZettAI技術サポート：システム保守（案件内容アクセス不可） |
| `ADMIN` | システム管理者：ユーザー管理・設定 |

## ドキュメント

詳細は各定義書を参照:

- [plan.md](./plan.md) - 非弁リスク回避と業務自動化の設計指針
- [concept.md](./concept.md) - コンセプト定義書
- [pages.md](./pages.md) - 画面定義書
- [roles.md](./roles.md) - 権限・ロール定義書
- [data.md](./data.md) - データ・ログ定義書
- [contracts.md](./contracts.md) - 契約・規約骨子

## ライセンス

Private - All Rights Reserved
