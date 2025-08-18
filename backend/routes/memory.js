const express = require('express');
const router = express.Router();
const memoryService = require('../services/memory');

// GET /api/memory/conversations - Get all conversations
router.get('/conversations', async (req, res, next) => {
  try {
    const conversations = await memoryService.getAllConversations();
    res.json({
      success: true,
      data: conversations
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memory/conversation/:id - Get specific conversation with messages
router.get('/conversation/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const conversation = await memoryService.getConversationById(id);
    
    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: 'Conversation not found'
      });
    }
    
    res.json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memory/conversation/:id/messages - Get messages for a conversation
router.get('/conversation/:id/messages', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;
    
    const messages = await memoryService.getConversationMessages(id, parseInt(limit), parseInt(offset));
    
    res.json({
      success: true,
      data: messages
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/memory/conversation - Create new conversation
router.post('/conversation', async (req, res, next) => {
  try {
    const { title, context } = req.body;
    
    const conversation = await memoryService.createConversation({
      title: title || 'New Conversation',
      context: context || {},
      createdAt: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      data: conversation
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/memory/conversation/:id - Update conversation
router.put('/conversation/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, context, metadata } = req.body;
    
    const updated = await memoryService.updateConversation(id, {
      title,
      context,
      metadata,
      updatedAt: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: updated
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/memory/conversation/:id - Delete conversation and all messages
router.delete('/conversation/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    await memoryService.deleteConversation(id);
    
    res.json({
      success: true,
      message: 'Conversation deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/memory/message - Save a single message
router.post('/message', async (req, res, next) => {
  try {
    const { role, content, conversationId, metadata } = req.body;
    
    const message = await memoryService.saveMessage({
      role,
      content,
      conversationId,
      metadata: metadata || {},
      timestamp: new Date().toISOString()
    });
    
    res.status(201).json({
      success: true,
      data: message
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memory/search - Search conversations and messages
router.get('/search', async (req, res, next) => {
  try {
    const { query, conversationId, role, limit = 20 } = req.query;
    
    const results = await memoryService.searchMessages({
      query,
      conversationId,
      role,
      limit: parseInt(limit)
    });
    
    res.json({
      success: true,
      data: results
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/memory/stats - Get memory statistics
router.get('/stats', async (req, res, next) => {
  try {
    const stats = await memoryService.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/memory/export - Export conversation data
router.post('/export/:conversationId', async (req, res, next) => {
  try {
    const { conversationId } = req.params;
    const { format = 'json' } = req.body;
    
    const exportData = await memoryService.exportConversation(conversationId, format);
    
    res.json({
      success: true,
      data: exportData
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
