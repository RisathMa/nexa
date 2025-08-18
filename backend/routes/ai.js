const express = require('express');
const router = express.Router();
const multiAI = require('../services/multiAI');

// GET /api/ai/providers - Get available AI providers
router.get('/providers', async (req, res, next) => {
  try {
    const providers = multiAI.getAvailableProviders();
    res.json({
      success: true,
      data: providers
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/provider/:name - Get specific provider info
router.get('/provider/:name', async (req, res, next) => {
  try {
    const { name } = req.params;
    const provider = multiAI.getProviderInfo(name);
    
    if (!provider) {
      return res.status(404).json({
        success: false,
        error: 'Provider not found'
      });
    }
    
    res.json({
      success: true,
      data: provider
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/test - Test AI provider
router.post('/test', async (req, res, next) => {
  try {
    const { provider, message = 'Hello, this is a test message.' } = req.body;
    
    const response = await multiAI.generateResponse(message, [], {}, provider);
    
    res.json({
      success: true,
      data: {
        provider: response.provider,
        model: response.model,
        response: response.content,
        timestamp: response.timestamp
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/health - Health check for all providers
router.get('/health', async (req, res, next) => {
  try {
    const health = await multiAI.healthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/compare - Compare responses from multiple providers
router.post('/compare', async (req, res, next) => {
  try {
    const { message, providers = ['openai', 'gemini', 'deepseek'] } = req.body;
    
    const results = {};
    const errors = {};
    
    // Test each provider
    for (const provider of providers) {
      try {
        const response = await multiAI.generateResponse(message, [], {}, provider);
        results[provider] = {
          content: response.content,
          model: response.model,
          provider: response.provider,
          timestamp: response.timestamp
        };
      } catch (error) {
        errors[provider] = error.message;
      }
    }
    
    res.json({
      success: true,
      data: {
        results,
        errors,
        message,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/ai/models - Get all available models across providers
router.get('/models', async (req, res, next) => {
  try {
    const providers = multiAI.getAvailableProviders();
    const models = {};
    
    providers.forEach(provider => {
      models[provider.name] = {
        displayName: provider.displayName,
        models: provider.models,
        defaultModel: provider.defaultModel
      };
    });
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/ai/chat - Chat with specific provider
router.post('/chat', async (req, res, next) => {
  try {
    const { message, conversationId, context, provider } = req.body;
    
    const response = await multiAI.generateResponse(message, [], context, provider);
    
    res.json({
      success: true,
      data: {
        response: response.content,
        provider: response.provider,
        model: response.model,
        conversationId: conversationId || 'new',
        timestamp: response.timestamp
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
