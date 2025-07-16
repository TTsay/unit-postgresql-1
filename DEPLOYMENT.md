# Zeabur 部署指南

本文件詳細說明如何將物品借用系統部署到 Zeabur 平台。

## 部署步驟

### 1. 準備工作

確保您已經：
- 註冊 [Zeabur](https://zeabur.com) 帳號
- 準備好 Git 儲存庫 (GitHub/GitLab)
- 本地測試通過

### 2. 上傳程式碼到 Git

```bash
# 初始化 Git 儲存庫 (如果還沒有)
git init

# 添加所有檔案
git add .

# 建立初始提交
git commit -m "feat: 初始版本 - 物品借用系統"

# 添加遠端儲存庫
git remote add origin https://github.com/your-username/item-borrowing-system.git

# 推送到主分支
git push -u origin main
```

### 3. 在 Zeabur 建立專案

1. 登入 Zeabur 控制台
2. 點擊 "Create Project"
3. 輸入專案名稱: `item-borrowing-system`
4. 選擇合適的區域 (建議選擇離使用者最近的區域)

### 4. 部署 PostgreSQL 資料庫

1. 在專案中點擊 "Add Service"
2. 選擇 "Database" → "PostgreSQL"
3. 等待資料庫部署完成
4. 記錄資料庫連線資訊 (會自動產生 `DATABASE_URL`)

### 5. 部署 Node.js 應用程式

1. 在專案中點擊 "Add Service"
2. 選擇 "Git Repository"
3. 連接您的 GitHub/GitLab 帳號
4. 選擇包含程式碼的儲存庫
5. 選擇要部署的分支 (通常是 `main`)

### 6. 設定環境變數

#### 為什麼需要設定環境變數？

環境變數用於存放敏感資訊和配置，避免將密鑰直接寫在程式碼中。本系統需要設定：

#### 必要環境變數

在 Node.js 服務的 **"Environment"** 頁籤中添加以下變數：

| 變數名稱 | 值 | 用途 |
|---------|---|------|
| `NODE_ENV` | `production` | 啟用生產環境模式 |
| `ZEABUR` | `true` | 標識 Zeabur 環境 (停用 SSL) |
| `JWT_SECRET` | `您的強密碼` | JWT Token 加密密鑰 |
| `SESSION_SECRET` | `您的強密碼` | Session 加密密鑰 |

#### 詳細設定步驟

1. **進入環境變數設定**
   - 在 Zeabur 控制台選擇您的 Node.js 服務
   - 點擊 **"Environment"** 頁籤
   - 點擊 **"Add Environment Variable"**

2. **逐一添加變數**
   ```env
   NODE_ENV=production
   ZEABUR=true
   JWT_SECRET=jW8$mK9#pL7@nR3!qS6&tY2*uX5+vC1
   SESSION_SECRET=aB4$cD8#eF2@gH6!iJ0&kL9*mN3+oP7
   ```

#### 密鑰產生建議

**方法 1: 使用 Node.js 產生**
```javascript
// 在本地執行以下指令產生 32 位隨機密鑰
require('crypto').randomBytes(32).toString('hex')
```

**方法 2: 使用命令列**
```bash
# macOS/Linux
openssl rand -hex 32

# 或使用 uuidgen (產生較短但安全的密鑰)
uuidgen
```

**方法 3: 線上工具**
- 訪問 https://www.uuidgenerator.net/
- 或 https://passwordsgenerator.net/ (選擇 32+ 字元)

#### 資料庫連線設定

**重要**: 在 Zeabur 中，需要手動建立 PostgreSQL 與 Node.js 服務的連接：

1. **建立服務連接**
   - 在 Node.js 服務的 **"Variable"** 頁籤中
   - 找到 **"Add Environment Variable"** 下方的 **"Add Service Reference"**
   - 選擇您的 PostgreSQL 服務
   - 這會自動產生 `DATABASE_URL` 環境變數

2. **或手動設定資料庫變數**
   
   如果自動連接失敗，可以手動添加以下變數：
   ```env
   DATABASE_URL=postgresql://username:password@postgresql-host:5432/database_name
   ```
   
   或使用分別的環境變數：
   ```env
   DB_HOST=postgresql-service-hostname
   DB_PORT=5432
   DB_NAME=postgres
   DB_USER=postgres
   DB_PASSWORD=your-database-password
   ```

#### 自動設定的環境變數

以下變數由 Zeabur 自動提供：

- `PORT` - 應用程式監聽埠 (Zeabur 自動分配)

#### 安全注意事項

⚠️ **重要提醒**:
- 請將範例中的密鑰替換為您自己產生的強密碼
- 密鑰至少 32 個字元，包含大小寫字母、數字和特殊符號
- 不要在程式碼中硬編碼密鑰
- 定期更換密鑰 (建議每 6 個月)

#### 驗證設定

設定完成後：
1. 點擊 **"Save"** 儲存環境變數
2. 等待應用程式重新部署
3. 查看部署日誌確認無錯誤
4. 測試登入功能確認設定正確

### 7. 等待部署完成

- Zeabur 會自動偵測 Node.js 專案
- 執行 `npm install` 安裝依賴
- 啟動應用程式

### 8. 初始化資料庫

部署完成後，需要初始化資料庫：

1. 在 Node.js 服務的 "Terminal" 頁籤中執行：
   ```bash
   npm run init-db
   ```

2. 看到成功訊息後，資料庫就準備好了

### 9. 設定自訂網域 (可選)

1. 在服務設定中點擊 "Domain"
2. 添加您的自訂網域
3. 設定 DNS 記錄指向 Zeabur 提供的 CNAME

## 部署架構

```
Internet
    ↓
Zeabur Load Balancer
    ↓
Node.js Container (您的應用程式)
    ↓
PostgreSQL Container (資料庫)
```

## 自動部署

設定完成後，每次推送程式碼到 Git 儲存庫的指定分支，Zeabur 會自動：
1. 拉取最新程式碼
2. 重新建置應用程式
3. 自動部署更新

## 監控與日誌

### 查看應用程式日誌
1. 進入 Node.js 服務頁面
2. 點擊 "Logs" 頁籤
3. 即時查看應用程式輸出

### 查看資源使用情況
1. 在服務頁面查看 CPU、記憶體使用率
2. 監控請求數量和回應時間

## 常見問題排除

### 1. 應用程式無法啟動

**檢查項目**:
- 確認 `package.json` 中的 `start` 腳本正確
- 檢查 PORT 環境變數 (Zeabur 會自動設定)
- 查看部署日誌中的錯誤訊息

### 2. 資料庫連線失敗

**常見錯誤**: `password authentication failed for user "postgres"`

**解決步驟**:

**Step 1: 檢查 PostgreSQL 服務資訊**
1. 點擊 Zeabur 左側的 `postgresql` 服務
2. 在 "Variable" 頁籤查看：
   - `POSTGRES_USER` (通常是 `postgres`)
   - `POSTGRES_PASSWORD` (自動產生的密碼)
   - `POSTGRES_DB` (通常是 `postgres`)

**Step 2: 設定 Node.js 服務連線**

方法 A - 使用服務引用 (推薦):
1. 在 Node.js 服務的 "Variable" 頁籤
2. 點擊 "Add Service Reference" 
3. 選擇 `postgresql` 服務
4. 這會自動產生正確的 `DATABASE_URL`

方法 B - 手動設定:
```env
DB_HOST=postgresql
DB_PORT=5432  
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=從PostgreSQL服務複製的密碼
```

**Step 3: 驗證連線**
執行初始化腳本會顯示連線診斷資訊：
```bash
npm run init-db
```

**Step 4: 檢查服務間網路**
- 確認兩個服務在同一個 Zeabur 專案中
- PostgreSQL 服務狀態為 "Running"

### 3. 登入功能異常

**檢查項目**:
- 確認已執行 `npm run init-db`
- 檢查 JWT_SECRET 和 SESSION_SECRET 是否設定
- 確認使用預設帳號 `admin/admin123`

### 4. 靜態資源載入失敗

**檢查項目**:
- 確認 `public` 資料夾結構正確
- 檢查 Content Security Policy 設定
- 查看瀏覽器開發者工具中的網路錯誤

## 效能最佳化

### 1. 資料庫最佳化
- 建立適當的索引
- 定期清理舊資料
- 使用連線池

### 2. 應用程式最佳化
- 啟用 gzip 壓縮
- 使用 CDN 託管靜態資源
- 實作快取機制

### 3. 監控設定
- 設定健康檢查端點
- 配置警報通知
- 監控關鍵指標

## 備份策略

### 自動備份
Zeabur 提供 PostgreSQL 自動備份功能：
1. 進入 PostgreSQL 服務設定
2. 啟用自動備份
3. 設定備份保留期間

### 手動備份
```bash
# 在 Terminal 中執行
pg_dump $DATABASE_URL > backup.sql
```

## 擴展部署

### 垂直擴展
- 在 Zeabur 控制台調整服務資源配置
- 升級 CPU 和記憶體規格

### 水平擴展
- 啟用多實例部署
- 配置負載平衡器
- 使用 Redis 作為 Session 儲存

## 成本管理

- 定期檢查資源使用情況
- 合理配置服務規格
- 使用 Zeabur 的計費監控功能

## 安全注意事項

1. **環境變數安全**
   - 不要在程式碼中硬編碼密鑰
   - 定期更換 JWT 和 Session 密鑰

2. **資料庫安全**
   - 定期更新密碼
   - 限制資料庫存取權限
   - 啟用 SSL 連線

3. **應用程式安全**
   - 定期更新依賴套件
   - 監控安全性漏洞
   - 實作適當的存取控制

## 聯繫支援

如遇到部署問題：
1. 查看 Zeabur 官方文件
2. 聯繫 Zeabur 技術支援
3. 查看專案 GitHub Issues