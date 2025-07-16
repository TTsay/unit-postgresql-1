const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ 
        success: false, 
        message: '請輸入使用者名稱和密碼' 
      });
    }

    const userQuery = 'SELECT * FROM users WHERE username = $1';
    const result = await pool.query(userQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: '使用者名稱或密碼錯誤' 
      });
    }

    const user = result.rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);

    if (!isPasswordValid) {
      return res.status(401).json({ 
        success: false, 
        message: '使用者名稱或密碼錯誤' 
      });
    }

    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;

    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      process.env.JWT_SECRET || 'fallback-secret',
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: '登入成功',
      user: {
        id: user.id,
        username: user.username,
        fullName: user.full_name,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error('登入錯誤:', error);
    res.status(500).json({ 
      success: false, 
      message: '伺服器錯誤，請稍後再試' 
    });
  }
});

router.post('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ 
        success: false, 
        message: '登出失敗' 
      });
    }
    res.json({ 
      success: true, 
      message: '已成功登出' 
    });
  });
});

router.get('/status', (req, res) => {
  if (req.session.userId) {
    res.json({
      isLoggedIn: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
      }
    });
  } else {
    res.json({ isLoggedIn: false });
  }
});

module.exports = router;