# 物品借用系統

一個基於 Node.js + Express + PostgreSQL 的物品借用管理系統，專為 Zeabur 部署而設計。

## 功能特色

- 🔐 使用者登入驗證
- 📦 物品管理與借用
- 📰 最新消息發佈
- 📊 借用記錄追蹤
- 🎨 響應式 Web 介面
- 🔒 安全性防護

## 技術棧

- **後端**: Node.js + Express
- **資料庫**: PostgreSQL
- **前端**: HTML5 + Bootstrap 5 + JavaScript
- **部署**: Zeabur
- **安全**: bcrypt + JWT + Session

## 快速開始

### 本地開發

1. **安裝依賴**
   ```bash
   npm install
   ```

2. **設定環境變數**
   ```bash
   cp .env.example .env
   # 編輯 .env 檔案，設定資料庫連線資訊
   ```

3. **初始化資料庫**
   ```bash
   npm run init-db
   ```

4. **啟動開發伺服器**
   ```bash
   npm run dev
   ```

5. **訪問應用程式**
   - 開啟瀏覽器訪問: http://localhost:3000
   - 預設管理員帳號: `admin` / `admin123`

### Zeabur 部署

1. **準備 Git 儲存庫**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <your-git-repository>
   git push -u origin main
   ```

2. **在 Zeabur 建立服務**
   - 登入 [Zeabur](https://zeabur.com)
   - 建立新專案
   - 新增 PostgreSQL 服務
   - 新增 Node.js 服務並連接您的 Git 儲存庫

3. **設定環境變數**
   在 Node.js 服務的環境變數中設定：
   ```
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here
   SESSION_SECRET=your_super_secret_session_key_here
   ```

4. **初始化生產資料庫**
   部署完成後，在 Zeabur 控制台執行：
   ```bash
   npm run init-db
   ```

## 資料庫架構

### 主要資料表

- `users` - 使用者資料
- `categories` - 物品分類
- `items` - 物品資料
- `borrowing_records` - 借用記錄
- `news` - 最新消息

### 預設資料

系統包含以下預設資料：
- 管理員帳號: `admin` / `admin123`
- 物品分類: 電子設備、辦公用品、實驗器材、運動器材
- 示範物品和最新消息

## API 端點

### 認證
- `POST /auth/login` - 使用者登入
- `POST /auth/logout` - 使用者登出
- `GET /auth/status` - 檢查登入狀態

### 資料 API
- `GET /api/news` - 獲取最新消息
- `GET /api/items` - 獲取物品列表 (需登入)
- `GET /api/my-borrowings` - 獲取個人借用記錄 (需登入)

## 頁面結構

- `/` - 首頁 (登入表單 + 最新消息)
- `/dashboard` - 主控面板 (登入後重定向)

## 安全特性

- 密碼使用 bcrypt 加密
- Session 管理與 JWT Token
- CSRF 防護
- Rate Limiting
- Content Security Policy
- SQL Injection 防護

## 開發指令

```bash
npm start          # 啟動生產伺服器
npm run dev        # 啟動開發伺服器 (nodemon)
npm run init-db    # 初始化資料庫
```

## 部署架構

```
使用者 → Zeabur Load Balancer → Node.js App → PostgreSQL Database
```

## 環境需求

- Node.js >= 18.0.0
- PostgreSQL >= 12
- 支援現代瀏覽器

## 授權

MIT License

## 支援

如有問題或建議，請建立 Issue 或聯繫開發團隊。