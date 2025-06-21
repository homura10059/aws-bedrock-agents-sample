# AWS Bedrock Agents サンプル

このプロジェクトは、AWS Bedrock Agents を使用したサンプル実装です。TypeScript と AWS CDK を使用して、コスト効率的なテキスト処理エージェントを作成・デプロイできます。

## 特徴

✅ **コスト最適化**: Amazon Titan Text G1 Express（最安価モデル）を使用  
✅ **TypeScript**: 型安全な実装  
✅ **CDK デプロイ**: インフラストラクチャーがコードで管理  
✅ **Action Groups**: Lambda 関数による拡張可能な機能  
✅ **すぐに使える**: デプロイ後すぐに使用可能  

## アーキテクチャ

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   User Input    │───▶│  Bedrock Agent  │───▶│  Titan Express  │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │ Action Groups   │
                       │   (Lambda)      │
                       └─────────────────┘
```

### 主要コンポーネント

- **Bedrock Agent**: メインのAIエージェント
- **Amazon Titan Text G1 Express**: 最安価のLLMモデル
- **Action Groups**: カスタム機能を提供するLambda関数
- **CDK スタック**: インフラストラクチャの定義

## 機能

### 基本機能
- 自然言語での質問応答
- テキスト処理（文字数カウント、単語数カウント、大文字・小文字変換）
- 現在時刻の取得

### Action Groups API
| エンドポイント | メソッド | 説明 |
|---------------|----------|------|
| `/get-current-time` | GET | 現在の日時を取得 |
| `/process-text` | POST | テキスト処理操作を実行 |

## クイックスタート

### 1. セットアップ

```bash
# リポジトリをクローン
git clone https://github.com/homura10059/aws-bedrock-agents-sample.git
cd aws-bedrock-agents-sample

# 依存関係をインストール
npm install

# TypeScript をビルド
npm run build
```

### 2. デプロイ

```bash
# CDK を初期化（初回のみ）
npx cdk bootstrap

# デプロイを実行
npm run deploy
```

### 3. 使用例

```typescript
import { BedrockAgentHandler } from './src/agent/agent-handler';

const agentHandler = new BedrockAgentHandler({
  agentId: 'YOUR_AGENT_ID',        // CDK出力から取得
  agentAliasId: 'YOUR_ALIAS_ID',   // CDK出力から取得
  region: 'us-east-1'
});

// 質問する
const response = await agentHandler.askQuestion('こんにちは！何ができますか？');

// テキストを処理する
const wordCount = await agentHandler.processText('Hello World', 'count_words');

// 現在時刻を取得する
const currentTime = await agentHandler.getCurrentTime();
```

## プロジェクト構造

```
├── src/
│   ├── infrastructure/          # CDK インフラストラクチャ
│   │   ├── app.ts              # CDK アプリケーション
│   │   └── stacks/
│   │       └── bedrock-agent-stack.ts
│   ├── agent/                   # エージェント関連コード
│   │   ├── agent-handler.ts     # エージェントクライアント
│   │   └── types.ts            # 型定義
│   └── lambda/                  # Lambda 関数
│       └── action-groups/
│           └── sample-actions.ts
├── docs/
│   └── deployment.md           # デプロイメントガイド
├── package.json
├── tsconfig.json
└── cdk.json
```

## 使用技術

- **言語**: TypeScript
- **インフラ**: AWS CDK
- **LLM**: Amazon Titan Text G1 Express
- **コンピューティング**: AWS Lambda
- **AI プラットフォーム**: AWS Bedrock Agents

## コスト情報

### 料金概算（月間使用量の例）
- **Amazon Titan Text G1 Express**: 
  - 入力: $0.0008/1K tokens
  - 出力: $0.0016/1K tokens
- **Lambda**: 無料利用枠（月100万リクエスト）
- **Bedrock Agent**: 管理費用無料、モデル使用量のみ課金

### 例: 月1000回の対話（各対話で500トークン処理）
- 入力コスト: (500 tokens × 1000 × $0.0008/1K) = $0.40
- 出力コスト: (500 tokens × 1000 × $0.0016/1K) = $0.80
- **月額合計: 約 $1.20**

## 開発・カスタマイズ

### 新しいAction Groupの追加

1. `src/lambda/action-groups/sample-actions.ts` に新しいAPIエンドポイントを追加
2. `src/infrastructure/stacks/bedrock-agent-stack.ts` でOpenAPI スキーマを更新
3. 再デプロイ

### モデルの変更

コストと性能のバランスを考えて他のモデルに変更可能：

```typescript
// bedrock-agent-stack.ts
foundationModel: bedrock.BedrockFoundationModel.ANTHROPIC_CLAUDE_HAIKU_V1_0, // より高性能
```

## 利用可能なコマンド

| コマンド | 説明 |
|----------|------|
| `npm run build` | TypeScript をコンパイル |
| `npm run watch` | ファイル変更を監視 |
| `npm run deploy` | AWS にデプロイ |
| `npm run diff` | デプロイ前の差分確認 |
| `npm run destroy` | リソースを削除 |

## 貢献

プルリクエストやイシューは歓迎です！

## ライセンス

MIT License

## 参考リンク

- [AWS Bedrock Agents Documentation](https://docs.aws.amazon.com/bedrock/latest/userguide/agents.html)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/)
- [Amazon Titan Models](https://docs.aws.amazon.com/bedrock/latest/userguide/titan-models.html)