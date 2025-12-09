# ZettAI 破産手続支援SaaS：データ・ログ定義書

---

## 目次

1. [データモデル概要](#1-データモデル概要)
2. [エンティティ定義](#2-エンティティ定義)
3. [監査ログ定義](#3-監査ログ定義)
4. [データライフサイクル](#4-データライフサイクル)
5. [個人情報管理](#5-個人情報管理)
6. [外部LLM連携時のデータ取り扱い](#6-外部llm連携時のデータ取り扱い)

---

## 1. データモデル概要

### 1-1. ER図（概念レベル）

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   Tenant    │───────│    User     │───────│    Role     │
│ (事務所)    │1     n│ (ユーザー)  │n     1│  (ロール)   │
└─────────────┘       └─────────────┘       └─────────────┘
       │                     │
       │1                    │n
       │                     ↓
       │              ┌─────────────┐
       │              │    Case     │
       └──────────────│   (案件)    │
              1      n└─────────────┘
                            │1
                            │
              ┌─────────────┼─────────────┐
              │n            │n            │n
              ↓             ↓             ↓
       ┌─────────────┐ ┌─────────────┐ ┌─────────────┐
       │  Document   │ │   Message   │ │  AuditLog   │
       │  (書類)     │ │ (メッセージ)│ │ (監査ログ)  │
       └─────────────┘ └─────────────┘ └─────────────┘
```

### 1-2. テナント分離

- 弁護士法人ごとにデータを完全分離
- テナントIDによる論理分離
- クロステナントアクセスは物理的に不可能な設計

---

## 2. エンティティ定義

### 2-1. Tenant（テナント/事務所）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| name | VARCHAR(100) | ✅ | 事務所名 |
| corporate_number | VARCHAR(13) | | 法人番号 |
| address | TEXT | ✅ | 所在地 |
| phone | VARCHAR(20) | ✅ | 電話番号 |
| email | VARCHAR(255) | ✅ | 代表メールアドレス |
| domain | VARCHAR(255) | ✅ | 事務所ドメイン |
| plan | ENUM | ✅ | 契約プラン |
| status | ENUM | ✅ | 状態（active/suspended/terminated） |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

---

### 2-2. User（ユーザー）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| tenant_id | UUID | ✅ | 所属テナント（FK） |
| role | ENUM | ✅ | ロール（LAWYER/STAFF/CLIENT/ADMIN） |
| email | VARCHAR(255) | ✅ | メールアドレス（ログインID） |
| password_hash | VARCHAR(255) | ✅ | パスワードハッシュ |
| name | VARCHAR(100) | ✅ | 氏名 |
| lawyer_number | VARCHAR(20) | | 弁護士登録番号（LAWYERのみ） |
| phone | VARCHAR(20) | | 電話番号 |
| mfa_enabled | BOOLEAN | ✅ | MFA有効フラグ |
| mfa_secret | VARCHAR(255) | | MFAシークレット |
| status | ENUM | ✅ | 状態（active/suspended/deleted） |
| last_login_at | TIMESTAMP | | 最終ログイン日時 |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

---

### 2-3. Case（案件）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| tenant_id | UUID | ✅ | テナント（FK） |
| case_number | VARCHAR(50) | ✅ | 案件番号（事務所内） |
| client_id | UUID | ✅ | 依頼者（FK→User） |
| lawyer_id | UUID | | 担当弁護士（FK→User） |
| staff_id | UUID | | 担当事務職員（FK→User） |
| case_type | ENUM | ✅ | 案件種別（bankruptcy/civil_rehab/voluntary_arrangement） |
| status | ENUM | ✅ | ステータス |
| conflict_check_status | ENUM | ✅ | 利益相反チェック状態 |
| conflict_check_at | TIMESTAMP | | 利益相反チェック日時 |
| conflict_check_by | UUID | | チェック実施者（FK→User） |
| retention_started_at | TIMESTAMP | | 受任日 |
| filed_at | TIMESTAMP | | 申立日 |
| discharged_at | TIMESTAMP | | 免責決定日 |
| closed_at | TIMESTAMP | | 案件終了日 |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

**ステータス値：**
| 値 | 説明 |
|----|------|
| inquiry | 問い合わせ |
| conflict_checking | 利益相反チェック中 |
| consultation | 相談中 |
| retained | 受任済 |
| document_collecting | 資料収集中 |
| drafting | 申立準備中 |
| filed | 申立済 |
| proceeding | 手続進行中 |
| discharged | 免責決定 |
| closed | 終了 |
| rejected | 受任不可 |

---

### 2-4. ClientProfile（依頼者詳細情報）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| case_id | UUID | ✅ | 案件（FK） |
| full_name | VARCHAR(100) | ✅ | 氏名 |
| full_name_kana | VARCHAR(100) | | 氏名（カナ） |
| birth_date | DATE | | 生年月日 |
| address | TEXT | | 住所 |
| phone | VARCHAR(20) | | 電話番号 |
| occupation | VARCHAR(100) | | 職業 |
| employer | VARCHAR(200) | | 勤務先 |
| monthly_income | INTEGER | | 月収（円） |
| family_size | INTEGER | | 家族人数 |
| total_debt | BIGINT | | 負債総額（円） |
| creditor_count | INTEGER | | 債権者数 |
| has_real_estate | BOOLEAN | | 不動産の有無 |
| has_vehicle | BOOLEAN | | 車両の有無 |
| has_insurance | BOOLEAN | | 保険の有無 |
| bankruptcy_reason | TEXT | | 破産原因（自由記述） |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

---

### 2-5. Creditor（債権者）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| case_id | UUID | ✅ | 案件（FK） |
| name | VARCHAR(200) | ✅ | 債権者名 |
| address | TEXT | | 住所 |
| debt_amount | BIGINT | | 債務額（円） |
| debt_type | ENUM | | 債務種別（loan/credit_card/mortgage/etc） |
| contract_date | DATE | | 契約日 |
| last_payment_date | DATE | | 最終返済日 |
| notice_sent_at | TIMESTAMP | | 受任通知送付日時 |
| notice_sent_by | UUID | | 送付実行者（FK→User） |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

---

### 2-6. Document（書類）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| case_id | UUID | ✅ | 案件（FK） |
| document_type | ENUM | ✅ | 書類種別 |
| file_name | VARCHAR(255) | ✅ | ファイル名 |
| file_path | VARCHAR(500) | ✅ | ストレージパス |
| file_size | BIGINT | ✅ | ファイルサイズ（バイト） |
| mime_type | VARCHAR(100) | ✅ | MIMEタイプ |
| uploaded_by | UUID | ✅ | アップロード者（FK→User） |
| ocr_status | ENUM | | OCR処理状態 |
| ocr_result | JSONB | | OCR抽出結果 |
| verified_by | UUID | | 確認者（FK→User） |
| verified_at | TIMESTAMP | | 確認日時 |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

**書類種別：**
| 値 | 説明 |
|----|------|
| id_document | 本人確認書類 |
| bank_statement | 銀行明細 |
| passbook | 通帳 |
| pay_slip | 給与明細 |
| tax_certificate | 源泉徴収票 |
| credit_card_statement | クレジットカード明細 |
| loan_contract | ローン契約書 |
| real_estate_certificate | 不動産登記簿 |
| vehicle_certificate | 車検証 |
| insurance_policy | 保険証券 |
| other | その他 |

---

### 2-7. Draft（AIドラフト）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| case_id | UUID | ✅ | 案件（FK） |
| draft_type | ENUM | ✅ | ドラフト種別 |
| version | INTEGER | ✅ | バージョン番号 |
| content | TEXT | ✅ | ドラフト内容 |
| ai_model | VARCHAR(100) | ✅ | 使用AIモデル |
| ai_prompt_hash | VARCHAR(64) | | プロンプトハッシュ |
| flags | JSONB | | 要確認フラグ |
| status | ENUM | ✅ | 状態（pending/approved/rejected/modified） |
| reviewed_by | UUID | | レビュー者（FK→User） |
| reviewed_at | TIMESTAMP | | レビュー日時 |
| review_comment | TEXT | | レビューコメント |
| final_content | TEXT | | 承認後の最終内容 |
| created_at | TIMESTAMP | ✅ | 作成日時 |
| updated_at | TIMESTAMP | ✅ | 更新日時 |

**ドラフト種別：**
| 値 | 説明 |
|----|------|
| retention_notice | 受任通知 |
| petition | 申立書 |
| statement | 陳述書 |
| creditor_list | 債権者一覧表 |
| asset_list | 財産目録 |
| income_expense | 家計収支表 |
| response | 依頼者への回答 |
| court_response | 裁判所への回答 |

**要確認フラグ（flags）の構造：**
```json
{
  "items": [
    {
      "type": "high_entertainment_expense",
      "severity": "warning",
      "message": "高額な遊興費支出あり",
      "action": "要面談／要追加資料",
      "details": {
        "amount": 150000,
        "period": "2024-10"
      }
    }
  ]
}
```

---

### 2-8. Message（メッセージ）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| case_id | UUID | ✅ | 案件（FK） |
| sender_id | UUID | ✅ | 送信者（FK→User） |
| recipient_id | UUID | ✅ | 受信者（FK→User） |
| message_type | ENUM | ✅ | メッセージ種別 |
| subject | VARCHAR(255) | | 件名 |
| body | TEXT | ✅ | 本文 |
| draft_id | UUID | | 元ドラフト（FK→Draft） |
| is_read | BOOLEAN | ✅ | 既読フラグ |
| read_at | TIMESTAMP | | 既読日時 |
| created_at | TIMESTAMP | ✅ | 作成日時 |

**メッセージ種別：**
| 値 | 説明 | 送信可能ロール |
|----|------|---------------|
| legal_response | 法的回答 | LAWYER |
| admin_notice | 事務連絡 | LAWYER, STAFF |
| reminder | リマインド | LAWYER, STAFF |
| system | システム通知 | SYSTEM |

---

### 2-9. ExternalSend（対外送信記録）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| case_id | UUID | ✅ | 案件（FK） |
| send_type | ENUM | ✅ | 送信種別 |
| recipient_type | ENUM | ✅ | 送信先種別 |
| recipient_name | VARCHAR(200) | ✅ | 送信先名 |
| recipient_address | TEXT | | 送信先住所 |
| draft_id | UUID | | 元ドラフト（FK→Draft） |
| content_snapshot | TEXT | ✅ | 送信内容スナップショット |
| send_method | ENUM | ✅ | 送信方法 |
| sent_by | UUID | ✅ | 送信実行者（FK→User） |
| sent_at | TIMESTAMP | ✅ | 送信日時 |
| confirmation_checked | BOOLEAN | ✅ | 確認チェックボックス |
| created_at | TIMESTAMP | ✅ | 作成日時 |

**送信種別：**
| 値 | 説明 |
|----|------|
| retention_notice | 受任通知 |
| petition | 申立書 |
| supplementary | 補正書面 |
| court_response | 裁判所への回答 |
| client_response | 依頼者への回答 |

**送信先種別：**
| 値 | 説明 |
|----|------|
| client | 依頼者 |
| creditor | 債権者 |
| court | 裁判所 |

**送信方法：**
| 値 | 説明 |
|----|------|
| email | メール |
| postal | 郵送 |
| certified_mail | 内容証明郵便 |
| fax | FAX |
| portal | 裁判所ポータル |

---

## 3. 監査ログ定義

### 3-1. AuditLog（監査ログ）

| カラム名 | 型 | 必須 | 説明 |
|----------|-----|------|------|
| id | UUID | ✅ | プライマリキー |
| tenant_id | UUID | ✅ | テナント（FK） |
| timestamp | TIMESTAMP(6) | ✅ | 発生日時（マイクロ秒精度） |
| user_id | UUID | | 操作者（FK→User） |
| role | ENUM | | 操作者ロール |
| action | VARCHAR(100) | ✅ | アクション種別 |
| resource_type | VARCHAR(50) | ✅ | リソース種別 |
| resource_id | UUID | | リソースID |
| case_id | UUID | | 関連案件（FK→Case） |
| ip_address | INET | ✅ | IPアドレス |
| user_agent | TEXT | | ユーザーエージェント |
| result | ENUM | ✅ | 結果（success/failure/denied） |
| details | JSONB | | 詳細情報 |
| created_at | TIMESTAMP | ✅ | 作成日時 |

### 3-2. アクション種別一覧

| アクション | 説明 | 記録タイミング |
|-----------|------|---------------|
| `auth.login` | ログイン | ログイン成功/失敗時 |
| `auth.logout` | ログアウト | ログアウト時 |
| `auth.mfa_verify` | MFA検証 | MFA認証時 |
| `case.view` | 案件閲覧 | 案件詳細表示時 |
| `case.create` | 案件作成 | 新規案件作成時 |
| `case.update` | 案件更新 | 案件情報更新時 |
| `case.conflict_check` | 利益相反チェック | チェック実行時 |
| `case.retain` | 受任 | 受任決定時 |
| `draft.view` | ドラフト閲覧 | AIドラフト表示時 |
| `draft.approve` | ドラフト承認 | 承認実行時 |
| `draft.modify` | ドラフト修正 | 修正保存時 |
| `draft.reject` | ドラフト差戻し | 差戻し時 |
| `send.execute` | 対外送信 | 送信実行時 |
| `document.upload` | 書類アップロード | アップロード時 |
| `document.download` | 書類ダウンロード | ダウンロード時 |
| `document.delete` | 書類削除 | 削除時 |
| `message.send` | メッセージ送信 | 送信時 |
| `user.create` | ユーザー作成 | 作成時 |
| `user.update` | ユーザー更新 | 更新時 |
| `user.delete` | ユーザー削除 | 削除時 |
| `permission.denied` | 権限拒否 | 権限外操作試行時 |

### 3-3. 詳細情報（details）の構造例

**ドラフト承認時：**
```json
{
  "draft_type": "retention_notice",
  "draft_version": 1,
  "review_time_seconds": 180,
  "has_modification": true,
  "modification_summary": "送付先住所を修正",
  "flags_count": 2,
  "flags_acknowledged": true
}
```

**対外送信時：**
```json
{
  "send_type": "retention_notice",
  "recipient_type": "creditor",
  "recipient_name": "A消費者金融株式会社",
  "send_method": "certified_mail",
  "confirmation_checked": true,
  "draft_id": "xxx-xxx-xxx"
}
```

### 3-4. 異常検知用クエリ例

**オート承認検知（5秒以内の承認）：**
```sql
SELECT
  user_id,
  COUNT(*) as quick_approvals
FROM audit_log
WHERE action = 'draft.approve'
  AND (details->>'review_time_seconds')::int < 5
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY user_id
HAVING COUNT(*) > 3;
```

**大量承認検知（1分以内に10件以上）：**
```sql
SELECT
  user_id,
  DATE_TRUNC('minute', timestamp) as minute,
  COUNT(*) as approval_count
FROM audit_log
WHERE action = 'draft.approve'
  AND timestamp > NOW() - INTERVAL '24 hours'
GROUP BY user_id, DATE_TRUNC('minute', timestamp)
HAVING COUNT(*) >= 10;
```

---

## 4. データライフサイクル

### 4-1. 保存期間

| データ種別 | 保存期間 | 根拠 |
|-----------|---------|------|
| 案件データ | 事件終了後10年 | 弁護士法（帳簿保存義務） |
| 委任契約書 | 事件終了後10年 | 同上 |
| 申立書類 | 事件終了後10年 | 同上 |
| 通信記録 | 事件終了後10年 | 同上 |
| 監査ログ | 10年 | 同上 |
| アクセスログ | 1年 | 運用上の必要性 |
| 一時ファイル | 24時間 | 処理完了後削除 |

### 4-2. 削除フロー

```
1. 保存期間満了
        ↓
2. 削除対象リストの生成（自動）
        ↓
3. 弁護士による削除承認
        ↓
4. 削除実行（論理削除→物理削除）
        ↓
5. 削除ログの記録
        ↓
6. 削除証明書の発行
```

### 4-3. 論理削除と物理削除

| 段階 | 状態 | 復元可能 | 期間 |
|------|------|---------|------|
| アクティブ | 通常利用可能 | - | - |
| 論理削除 | 非表示だがDB上存在 | ✅ | 30日間 |
| 物理削除 | DBから完全削除 | ❌ | - |

---

## 5. 個人情報管理

### 5-1. 個人情報の分類

| 分類 | 例 | 取り扱いレベル |
|------|-----|---------------|
| 特定個人情報 | マイナンバー | 最高（本システムでは取り扱わない） |
| 要配慮個人情報 | 病歴、犯罪歴 | 高 |
| 機微情報 | 金融情報、資産情報 | 高 |
| 一般個人情報 | 氏名、住所、電話番号 | 中 |
| 匿名加工情報 | 統計データ | 低 |

### 5-2. アクセス権限と個人情報

| データ | LAWYER | STAFF | CLIENT | TECH_SUPPORT |
|--------|--------|-------|--------|--------------|
| 依頼者の金融情報 | ✅ | ✅（担当のみ） | ✅（自分のみ） | ❌ |
| 依頼者の資産情報 | ✅ | ✅（担当のみ） | ✅（自分のみ） | ❌ |
| 依頼者の連絡先 | ✅ | ✅（担当のみ） | ✅（自分のみ） | ❌ |
| 監査ログ | ✅ | ❌ | ❌ | ✅（障害時） |

### 5-3. 暗号化要件

| データ種別 | 転送時暗号化 | 保存時暗号化 | キー管理 |
|-----------|------------|------------|---------|
| 認証情報 | TLS 1.3 | AES-256 | HSM |
| 金融情報 | TLS 1.3 | AES-256 | KMS |
| 書類ファイル | TLS 1.3 | AES-256 | KMS |
| 監査ログ | TLS 1.3 | AES-256 | KMS |
| 一般データ | TLS 1.3 | AES-256 | KMS |

---

## 6. 外部LLM連携時のデータ取り扱い

### 6-1. LLMプロバイダ選定基準

| 項目 | 要件 |
|------|------|
| SOC2認証 | 必須 |
| GDPR準拠 | 必須 |
| データ処理地域 | 日本または米国（EU十分性認定国） |
| 学習利用オプトアウト | 必須 |
| データ保持期間 | 30日以内（可能であれば0日） |
| 暗号化 | 転送時・保存時ともに必須 |

### 6-2. LLMに送信するデータの制限

**送信可能：**
- 匿名化された事実情報
- テンプレート文言
- 一般的な法律用語・条文

**送信不可（マスキング必須）：**
- 実名
- 住所
- 電話番号
- メールアドレス
- 口座番号
- その他個人を特定できる情報

### 6-3. マスキング処理例

**送信前：**
```
依頼者：山田太郎
住所：東京都新宿区西新宿1-1-1
借入先：A消費者金融株式会社
借入額：150万円
```

**マスキング後（LLMに送信）：**
```
依頼者：[CLIENT_001]
住所：[ADDRESS_001]
借入先：[CREDITOR_001]
借入額：150万円
```

### 6-4. 依頼者への説明・同意

**利用規約に含める事項：**
- AI（大規模言語モデル）を業務効率化のために利用すること
- 個人情報はマスキング処理を行うこと
- データがLLMプロバイダのサーバーに一時的に送信されること
- LLMプロバイダはデータを学習に利用しないこと
- 最終的な法的判断は弁護士が行うこと

**同意取得タイミング：**
- 初回相談チャット開始時
- 委任契約締結時（詳細説明）

---

## 7. バックアップ・リカバリ

### 7-1. バックアップ方針

| 種別 | 頻度 | 保持期間 | 保存先 |
|------|------|---------|--------|
| フルバックアップ | 週次 | 1年 | 別リージョン |
| 差分バックアップ | 日次 | 1ヶ月 | 同リージョン |
| トランザクションログ | リアルタイム | 7日 | 同リージョン |

### 7-2. RPO/RTO目標

| 指標 | 目標値 | 説明 |
|------|--------|------|
| RPO（Recovery Point Objective） | 1時間以内 | 最大1時間分のデータ損失を許容 |
| RTO（Recovery Time Objective） | 4時間以内 | 4時間以内にサービス復旧 |

### 7-3. リカバリ手順

```
1. 障害検知・影響範囲特定
        ↓
2. リカバリ方針決定（柳田承認）
        ↓
3. バックアップからリストア
        ↓
4. データ整合性検証
        ↓
5. サービス再開
        ↓
6. インシデントレポート作成
```
