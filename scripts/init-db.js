const { Pool } = require('pg');

async function initializeDatabase() {
    console.log('開始初始化資料庫...');
    
    // 詳細診斷環境變數
    console.log('📋 環境變數診斷:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定');
    console.log('DB_HOST:', process.env.DB_HOST || '未設定');
    console.log('DB_PORT:', process.env.DB_PORT || '未設定');
    console.log('DB_USER:', process.env.DB_USER || '未設定');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已設定' : '未設定');
    console.log('DB_NAME:', process.env.DB_NAME || '未設定');
    
    // 檢查 Zeabur 自動注入的變數
    console.log('\n📋 Zeabur 自動注入變數:');
    console.log('POSTGRES_URL:', process.env.POSTGRES_URL ? '已設定' : '未設定');
    console.log('POSTGRES_HOST:', process.env.POSTGRES_HOST || '未設定');
    console.log('POSTGRES_PORT:', process.env.POSTGRES_PORT || '未設定');
    console.log('POSTGRES_USER:', process.env.POSTGRES_USER || '未設定');
    console.log('POSTGRES_PASSWORD:', process.env.POSTGRES_PASSWORD ? '已設定' : '未設定');
    console.log('POSTGRES_DATABASE:', process.env.POSTGRES_DATABASE || '未設定');

    // 嘗試不同的連接配置
    const connectionConfigs = [
        {
            name: 'POSTGRES_URL (Zeabur 自動注入)',
            config: process.env.POSTGRES_URL ? {
                connectionString: process.env.POSTGRES_URL,
                ssl: false
            } : null
        },
        {
            name: 'DATABASE_URL',
            config: process.env.DATABASE_URL ? {
                connectionString: process.env.DATABASE_URL,
                ssl: false
            } : null
        },
        {
            name: '個別環境變數',
            config: {
                host: process.env.DB_HOST || 'postgresql',
                port: parseInt(process.env.DB_PORT || '5432'),
                database: process.env.DB_NAME || 'postgres',
                user: process.env.DB_USER || 'postgres',
                password: process.env.DB_PASSWORD,
                ssl: false
            }
        },
        {
            name: 'Zeabur 自動注入變數',
            config: process.env.POSTGRES_HOST ? {
                host: process.env.POSTGRES_HOST,
                port: parseInt(process.env.POSTGRES_PORT || '5432'),
                database: process.env.POSTGRES_DATABASE || 'postgres',
                user: process.env.POSTGRES_USER || 'postgres',
                password: process.env.POSTGRES_PASSWORD,
                ssl: false
            } : null
        }
    ];

    for (const { name, config } of connectionConfigs) {
        if (!config) {
            console.log(`\n⏭️ 跳過 ${name}：配置不完整`);
            continue;
        }

        console.log(`\n📡 測試配置: ${name}`);
        
        // 安全地顯示配置（隱藏密碼）
        const safeConfig = { ...config };
        if (safeConfig.password) safeConfig.password = '***';
        if (safeConfig.connectionString) {
            safeConfig.connectionString = safeConfig.connectionString.replace(/:([^@]+)@/, ':***@');
        }
        console.log('配置:', JSON.stringify(safeConfig, null, 2));

        try {
            const pool = new Pool({
                ...config,
                connectionTimeoutMillis: 10000,
                idleTimeoutMillis: 30000
            });

            console.log('🔗 嘗試連接...');
            const client = await pool.connect();
            
            console.log('✅ 連接成功！');
            
            // 測試基本查詢
            const result = await client.query('SELECT version()');
            console.log('📊 PostgreSQL 版本:', result.rows[0].version);
            
            // 創建資料表
            console.log('📝 創建資料表...');
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS items (
                    id SERIAL PRIMARY KEY,
                    name VARCHAR(255) NOT NULL,
                    description TEXT,
                    status VARCHAR(50) DEFAULT 'available',
                    borrower_id INTEGER,
                    borrowed_at TIMESTAMP,
                    returned_at TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);
            
            await client.query(`
                CREATE TABLE IF NOT EXISTS users (
                    id SERIAL PRIMARY KEY,
                    username VARCHAR(255) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    role VARCHAR(50) DEFAULT 'user',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                );
            `);

            console.log('✅ 資料表創建成功');
            
            client.release();
            await pool.end();
            
            console.log('🎉 資料庫初始化完成');
            return;
            
        } catch (error) {
            console.log(`❌ 連線失敗:`, error.message);
            console.log('錯誤詳情:', error.code || 'N/A');
            continue;
        }
    }
    
    console.error('\n❌ 所有連接嘗試都失敗了');
    console.error('請檢查：');
    console.error('1. PostgreSQL 服務是否正在運行');
    console.error('2. 環境變數是否設定正確');
    console.error('3. 服務之間的網路連接是否正常');
    process.exit(1);
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };