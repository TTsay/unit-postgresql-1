const { Pool } = require('pg');
require('dotenv').config();

// Zeabur 環境下的資料庫連線配置
function createDatabaseConfig() {
  // 判斷是否為 Zeabur 環境 (通常 Zeabur 不需要 SSL)
  const isZeabur = process.env.ZEABUR || process.env.DATABASE_URL?.includes('zeabur');
  
  // 如果有 DATABASE_URL 環境變數，直接使用
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      // Zeabur 環境不使用 SSL，其他生產環境使用 SSL
      ssl: isZeabur ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
    };
  }

  // 如果沒有 DATABASE_URL，使用個別環境變數
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD && process.env.DB_NAME) {
    return {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      // Zeabur 環境不使用 SSL
      ssl: isZeabur ? false : (process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false),
    };
  }

  // 預設本地開發配置
  console.warn('⚠️  警告: 未找到資料庫環境變數，使用預設本地配置');
  return {
    host: 'localhost',
    port: 5432,
    database: 'item_borrowing_system',
    user: 'postgres',
    password: 'password',
    ssl: false,
  };
}

const pool = new Pool(createDatabaseConfig());

// 測試資料庫連線
pool.on('connect', () => {
  console.log('✅ 資料庫連線成功');
});

pool.on('error', (err) => {
  console.error('❌ 資料庫連線錯誤:', err);
});

module.exports = pool;