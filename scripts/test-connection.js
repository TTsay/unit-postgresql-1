const { Pool } = require('pg');
require('dotenv').config();

async function testConnection() {
    console.log('🔍 測試資料庫連線...');
    
    // 顯示所有相關環境變數
    console.log('\n📋 環境變數檢查:');
    console.log('NODE_ENV:', process.env.NODE_ENV || '未設定');
    console.log('ZEABUR:', process.env.ZEABUR || '未設定');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定');
    console.log('DB_HOST:', process.env.DB_HOST || '未設定');
    console.log('DB_PORT:', process.env.DB_PORT || '未設定');
    console.log('DB_NAME:', process.env.DB_NAME || '未設定');
    console.log('DB_USER:', process.env.DB_USER || '未設定');
    console.log('DB_PASSWORD:', process.env.DB_PASSWORD ? '已設定' : '未設定');
    
    // 測試不同連線方式
    const configs = [];
    
    // 配置 1: 使用 DATABASE_URL
    if (process.env.DATABASE_URL) {
        configs.push({
            name: 'DATABASE_URL',
            config: {
                connectionString: process.env.DATABASE_URL,
                ssl: false
            }
        });
    }
    
    // 配置 2: 使用個別環境變數
    if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_NAME) {
        configs.push({
            name: '個別環境變數',
            config: {
                host: process.env.DB_HOST,
                port: process.env.DB_PORT || 5432,
                database: process.env.DB_NAME,
                user: process.env.DB_USER,
                password: process.env.DB_PASSWORD,
                ssl: false
            }
        });
    }
    
    // 配置 3: 預設 Zeabur 配置
    configs.push({
        name: '預設 Zeabur 配置',
        config: {
            host: 'postgresql',
            port: 5432,
            database: 'postgres',
            user: 'postgres',
            password: process.env.DB_PASSWORD || '',
            ssl: false
        }
    });
    
    console.log(`\n🧪 測試 ${configs.length} 種連線配置:\n`);
    
    for (const { name, config } of configs) {
        console.log(`📡 測試配置: ${name}`);
        
        // 安全地顯示配置（隱藏密碼）
        const safeConfig = { ...config };
        if (safeConfig.password) {
            safeConfig.password = '***';
        }
        if (safeConfig.connectionString) {
            safeConfig.connectionString = safeConfig.connectionString.replace(/:([^:@]+)@/, ':***@');
        }
        console.log('配置:', JSON.stringify(safeConfig, null, 2));
        
        const pool = new Pool(config);
        
        try {
            const result = await pool.query('SELECT NOW() as current_time, version() as version');
            console.log('✅ 連線成功!');
            console.log('⏰ 時間:', result.rows[0].current_time);
            console.log('📊 版本:', result.rows[0].version.split(' ')[0]);
            
            await pool.end();
            console.log('🎉 找到可用的連線配置!');
            return;
            
        } catch (error) {
            console.log('❌ 連線失敗:', error.message);
            await pool.end();
        }
        
        console.log('');
    }
    
    console.log('💡 所有配置都失敗了。請檢查:');
    console.log('1. PostgreSQL 服務是否正在運行');
    console.log('2. 環境變數是否正確設定');
    console.log('3. 服務間網路是否正常');
}

if (require.main === module) {
    testConnection().catch(console.error);
}

module.exports = testConnection;