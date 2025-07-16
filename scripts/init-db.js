const fs = require('fs');
const path = require('path');
const pool = require('../config/database');
const bcrypt = require('bcrypt');

async function initializeDatabase() {
    console.log('開始初始化資料庫...');
    
    // 顯示連線資訊用於診斷
    console.log('📋 連線資訊診斷:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? '已設定' : '未設定');
    if (process.env.DATABASE_URL) {
        // 安全地顯示 DATABASE_URL (隱藏密碼)
        const urlMasked = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ':***@');
        console.log('DATABASE_URL (masked):', urlMasked);
    }
    console.log('DB_HOST:', process.env.DB_HOST || '未設定');
    console.log('DB_USER:', process.env.DB_USER || '未設定');
    console.log('DB_NAME:', process.env.DB_NAME || '未設定');
    console.log('NODE_ENV:', process.env.NODE_ENV || '未設定');
    console.log('ZEABUR:', process.env.ZEABUR || '未設定');
    
    try {
        // 測試資料庫連線
        console.log('🔗 測試資料庫連線...');
        await pool.query('SELECT NOW() as current_time');
        console.log('✅ 資料庫連線測試成功');
        
        const schemaSQL = fs.readFileSync(
            path.join(__dirname, '../database/schema.sql'), 
            'utf8'
        );
        
        console.log('📝 執行資料庫結構建立...');
        await pool.query(schemaSQL);
        console.log('✅ 資料庫表格建立成功');
        
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        const insertAdminQuery = `
            INSERT INTO users (username, email, password_hash, full_name, role) 
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (username) DO UPDATE SET
                password_hash = $3,
                updated_at = CURRENT_TIMESTAMP
        `;
        
        await pool.query(insertAdminQuery, [
            'admin',
            'admin@example.com',
            hashedPassword,
            '系統管理員',
            'admin'
        ]);
        console.log('✅ 管理員帳號建立/更新成功');
        
        const insertNewsQuery = `
            INSERT INTO news (title, content, published, author_id) 
            VALUES 
                ('歡迎使用物品借用系統', '本系統提供便利的物品借用管理功能，您可以輕鬆查看可借用物品、管理借用記錄等。', true, 1),
                ('系統使用說明', '請使用您的帳號密碼登入系統。登入後可以查看物品列表、借用物品、查看個人借用記錄等功能。', true, 1),
                ('維護通知', '系統將於每週日凌晨 2:00-4:00 進行例行維護，期間可能無法正常使用，請見諒。', true, 1)
            ON CONFLICT DO NOTHING
        `;
        
        await pool.query(insertNewsQuery);
        console.log('✅ 預設最新消息建立成功');
        
        const insertItemsQuery = `
            INSERT INTO items (name, description, category_id, barcode, location) 
            VALUES 
                ('筆記型電腦 - Dell Latitude', '商用筆記型電腦，適合辦公使用', 1, 'LAPTOP001', '辦公室A區'),
                ('投影機 - Epson EB-X05', '便攜式投影機，支援 HDMI 輸入', 1, 'PROJ001', '會議室B'),
                ('平板電腦 - iPad', '10.9吋 iPad，適合行動辦公', 1, 'TABLET001', '辦公室A區'),
                ('影印機 - Canon imageRUNNER', '多功能影印機，支援雙面列印', 2, 'PRINTER001', '辦公室C區'),
                ('顯微鏡 - Nikon Eclipse', '光學顯微鏡，放大倍率 40-1000x', 3, 'MICRO001', '實驗室1'),
                ('籃球', '標準籃球，適合室內外使用', 4, 'BALL001', '體育器材室')
            ON CONFLICT (barcode) DO NOTHING
        `;
        
        await pool.query(insertItemsQuery);
        console.log('✅ 預設物品資料建立成功');
        
        console.log('\n🎉 資料庫初始化完成！');
        console.log('📝 預設管理員帳號:');
        console.log('   使用者名稱: admin');
        console.log('   密碼: admin123');
        
    } catch (error) {
        console.error('❌ 資料庫初始化失敗:', error);
        process.exit(1);
    } finally {
        await pool.end();
    }
}

if (require.main === module) {
    initializeDatabase();
}

module.exports = initializeDatabase;