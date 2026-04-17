ファイル/ディレクトリ: Copilot セットアップ (.github/workflows/copilot-setup-steps.yml)

## 📌 クラウドエージェント用セットアップ手順書とは？
GitHub Copilot クラウドエージェントは、人間から「この Issue を解決して」とお願いされると、GitHub Actions 上の一時的な仮想環境（クラウド）で作業を始めます。
しかし、エージェントは**「このプロジェクトを動かすために、どの言語のバージョンが必要で、ライブラリをどうインストールすればいいか」を知りません**。

この `copilot-setup-steps.yml` は、新しい AI の同僚が入社した初日に渡す **「開発環境の構築 Wiki」** の役割を果たします。

### 🚨 もしこのファイルを設定しないとどうなる？
エージェントがバグを直したりテストを実行しようとしても、「Node.js が入っていない」「パッケージが見つからない」といった初歩的なインフラ構築でエラーになり、無駄な時間と課金枠を消費してしまいます。

### ⏱️ 設定するタイミングはいつ？
このファイルは、以下のタイミングで設定・更新を行ってください。
1. **プロジェクト初期・エージェント導入時**: プロジェクトの主要な言語やフレームワークが決まり、Copilotエージェントを導入する最初のタイミング。
2. **実行環境・バージョンの変更時**: Node.jsやPythonなどの言語バージョンをアップデートしたときや、パッケージマネージャーを変更したとき。
3. **システム依存関係の追加時**: プロジェクトの動作にOSレベルのパッケージ（例: `apt-get install` が必要なライブラリなど）が新たに必要になったとき。

### 📝 使い方のステップ（初学者向け）

プロジェクトで使う言語やフレームワークが決まったら、`copilot-setup-steps.yml` を編集して、開発者が最初に手元で実行するのと同じセットアップ手順を記述します。

#### 1. `copilot-setup-steps.yml` を開く
コメントアウト（`#`）されている設定例をベースにします。

#### 2. 自プロジェクトに合わせて環境を定義する
たとえば、あなたが **Node.js (Next.js)** のプロジェクトを作っているのであれば、以下のようにコメントを外して使います。

```yaml
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20' # あなたが使っているバージョン

      - name: Install dependencies
        run: npm ci # (または npm install, yarn install 等)
```

**Python (Poetry)** であれば、以下のようになります。
```yaml
      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'

      - name: Install Poetry
        run: curl -sSL https://install.python-poetry.org | python3 -

      - name: Install dependencies
        run: poetry install
```

#### 3. 変更をコミットして Push して完了！
これだけで、以降 Copilot クラウドエージェントにお願いをすると、裏で自律的にこのファイルを読み込み、「なるほど、まずは `npm ci` を実行してから作業を始めればいいんだな」と環境を自動構築してくれるようになります。

---
配置場所: .github/workflows/copilot-setup-steps.yml
役割: Copilot エージェント向けの環境構築（クラウド上）
記載する内容: 依存関係インストール、追加ツール導入、ビルド処理など

### ⚠️ 重要: 公式要件
GitHub Copilot Cloud Agentがこのワークフローを認識して使用するためには、以下の厳密なルールを守る必要があります。
1. **ファイルパスとファイル名**: 必ず `.github/workflows/copilot-setup-steps.yml` であること。
2. **ジョブ名**: ワークフロー内のジョブ名は必ず `copilot-setup-steps` とすること。
3. **ブランチ**: このワークフローはデフォルトブランチに存在する必要があります。
4. **許可される属性**: ジョブ内では `steps`、`permissions`、`runs-on`、`services`、`snapshot`、`timeout-minutes` のみが許可されます。