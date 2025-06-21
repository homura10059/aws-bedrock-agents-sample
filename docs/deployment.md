# デプロイメントガイド

このドキュメントでは、AWS Bedrock Agents サンプルのデプロイ方法を説明します。

## 前提条件

### 必要な環境
- Node.js 18.x 以上
- AWS CLI v2
- AWS CDK CLI v2
- 適切な AWS 認証情報の設定

### AWS 権限
以下のサービスへのアクセス権限が必要です：
- AWS Bedrock
- AWS Lambda
- AWS IAM
- AWS CloudFormation

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. TypeScript のビルド

```bash
npm run build
```

### 3. CDK の初期設定（初回のみ）

```bash
# AWS アカウントで CDK を初期化
npx cdk bootstrap
```

### 4. デプロイ前の確認

```bash
# 変更内容を確認
npm run diff
```

### 5. デプロイの実行

```bash
# デプロイを実行
npm run deploy
```

## デプロイ後の設定

### Agent ID とAlias ID の取得

デプロイが完了すると、以下の出力値が表示されます：

```
BedrockAgentStack.AgentId = XXXXXXXXXX
BedrockAgentStack.AgentAliasId = XXXXXXXXXX
BedrockAgentStack.AgentArn = arn:aws:bedrock:us-east-1:ACCOUNT:agent/XXXXXXXXXX
BedrockAgentStack.ActionGroupLambdaArn = arn:aws:lambda:us-east-1:ACCOUNT:function:BedrockAgentStack-ActionGroupLambdaXXXXXXXX-XXXXXXXXXX
```

これらの値を `src/agent/agent-handler.ts` の `exampleUsage` 関数で使用してください。

### サンプルの実行

```bash
# エージェントをテスト（agent-handler.ts でexampleUsage()のコメントアウトを外す）
npx ts-node src/agent/agent-handler.ts
```

## 利用可能なコマンド

| コマンド | 説明 |
|----------|------|
| `npm run build` | TypeScript をコンパイル |
| `npm run watch` | ファイル変更を監視してビルド |
| `npm run diff` | デプロイ前の変更差分を確認 |
| `npm run synth` | CloudFormation テンプレートを生成 |
| `npm run deploy` | AWS にデプロイ |
| `npm run destroy` | リソースを削除 |

## トラブルシューティング

### よくあるエラー

#### 1. Bedrock モデルアクセスエラー
```
AccessDeniedException: You don't have access to the model with the specified model ID.
```

**解決方法**: AWS コンソールの Bedrock サービスで、Amazon Titan Text G1 Express モデルへのアクセスを有効にしてください。

#### 2. CDK デプロイエラー
```
Resource is not in the state stackUpdateComplete
```

**解決方法**: 
```bash
# 既存のスタックを削除して再デプロイ
npm run destroy
npm run deploy
```

#### 3. Lambda関数のタイムアウト
```
Task timed out after 30.00 seconds
```

**解決方法**: CDK スタックで Lambda のタイムアウト設定を調整してください。

## セキュリティ考慮事項

- IAM ロールは最小権限の原則に従って設定されています
- Lambda 関数のログは1週間で自動削除されます
- Agent は指定されたモデルのみにアクセス可能です

## コスト最適化

使用されるリソースのコスト概算：
- **Amazon Titan Text G1 Express**: 入力 $0.0008/1K tokens, 出力 $0.0016/1K tokens
- **Lambda**: 無料利用枠内（月100万リクエスト）
- **Bedrock Agent**: エージェント作成・管理は無料、モデル使用量のみ課金

## クリーンアップ

リソースを削除してコストを避けるには：

```bash
npm run destroy
```

このコマンドで作成されたすべてのAWSリソースが削除されます。