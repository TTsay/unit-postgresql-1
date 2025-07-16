const express = require('express');
const pool = require('../config/database');

const router = express.Router();

function requireAuth(req, res, next) {
  if (!req.session.userId) {
    return res.status(401).json({ 
      success: false, 
      message: '請先登入' 
    });
  }
  next();
}

router.get('/news', async (req, res) => {
  try {
    const query = `
      SELECT n.*, u.full_name as author_name 
      FROM news n 
      LEFT JOIN users u ON n.author_id = u.id 
      WHERE n.published = true 
      ORDER BY n.created_at DESC 
      LIMIT 10
    `;
    const result = await pool.query(query);
    res.json({ success: true, news: result.rows });
  } catch (error) {
    console.error('獲取最新消息錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '無法載入最新消息' 
    });
  }
});

router.get('/items', requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.name as category_name 
      FROM items i 
      LEFT JOIN categories c ON i.category_id = c.id 
      ORDER BY i.created_at DESC
    `;
    const result = await pool.query(query);
    res.json({ success: true, items: result.rows });
  } catch (error) {
    console.error('獲取物品列表錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '無法載入物品列表' 
    });
  }
});

router.get('/my-borrowings', requireAuth, async (req, res) => {
  try {
    const query = `
      SELECT br.*, i.name as item_name, i.description as item_description
      FROM borrowing_records br
      JOIN items i ON br.item_id = i.id
      WHERE br.user_id = $1
      ORDER BY br.borrowed_at DESC
    `;
    const result = await pool.query(query, [req.session.userId]);
    res.json({ success: true, borrowings: result.rows });
  } catch (error) {
    console.error('獲取借用記錄錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '無法載入借用記錄' 
    });
  }
});

module.exports = router;