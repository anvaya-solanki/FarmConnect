const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');

// Chat endpoint
router.post('/message', chatController.getChatResponse);

module.exports = router; 