const express = require('express');
const router = express.Router();
const aiService = require('../services/ai');
const memoryService = require('../services/memory');
const { validateChatRequest } = require('../middleware/validation');

// POST /api/chat - Send a message to AI
router.post('/', validateChatRequest, async (req, res, next) => {
  try {
    const { message, conversationId, context } = req.body;
    
    // Get conversation history for context
    let conversationHistory = [];
    if (conversationId) {
      conversationHistory = await memoryService.getConversationHistory(conversationId);
    }
    
    // Call AI service
    const aiResponse = await aiService.generateResponse(message, conversationHistory, context);
    
    // Save conversation to memory
    const savedMessage = await memoryService.saveMessage({
      role: 'user',
      content: message,
      conversationId: conversationId || 'new',
      timestamp: new Date().toISOString()
    });
    
    const savedResponse = await memoryService.saveMessage({
      role: 'assistant',
      content: aiResponse.content,
      conversationId: savedMessage.conversationId,
      timestamp: new Date().toISOString()
    });
    
    res.json({
      success: true,
      data: {
        response: aiResponse.content,
        conversationId: savedMessage.conversationId,
        messageId: savedMessage.id,
        responseId: savedResponse.id,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/chat/conversations - Get all conversations
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

// GET /api/chat/conversation/:id - Get specific conversation
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

// DELETE /api/chat/conversation/:id - Delete conversation
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

module.exports = router;
