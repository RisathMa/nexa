const OpenAI = require('openai');
const { GoogleGenerativeAI } = require('@google/generative-ai');

class MultiAIService {
  constructor() {
    this.providers = this.initializeProviders();
    this.defaultProvider = process.env.DEFAULT_AI_PROVIDER || 'openai';
    this.fallbackProviders = ['openai', 'deepseek', 'gemini', 'grok'];
  }

  initializeProviders() {
    const providers = {};

    // OpenAI Provider
    if (process.env.OPENAI_API_KEY) {
      providers.openai = {
        name: 'OpenAI',
        client: new OpenAI({ apiKey: process.env.OPENAI_API_KEY }),
        models: {
          'gpt-4': { maxTokens: 8192, cost: 'high' },
          'gpt-4-turbo': { maxTokens: 128000, cost: 'medium' },
          'gpt-3.5-turbo': { maxTokens: 4096, cost: 'low' }
        },
        defaultModel: process.env.OPENAI_MODEL || 'gpt-4'
      };
    }

    // DeepSeek Provider
    if (process.env.DEEPSEEK_API_KEY) {
      providers.deepseek = {
        name: 'DeepSeek',
        client: new OpenAI({ 
          apiKey: process.env.DEEPSEEK_API_KEY,
          baseURL: 'https://api.deepseek.com/v1'
        }),
        models: {
          'deepseek-chat': { maxTokens: 32768, cost: 'medium' },
          'deepseek-coder': { maxTokens: 16384, cost: 'medium' }
        },
        defaultModel: 'deepseek-chat'
      };
    }

    // Grok Provider (via xAI)
    if (process.env.GROK_API_KEY) {
      providers.grok = {
        name: 'Grok (xAI)',
        client: new OpenAI({ 
          apiKey: process.env.GROK_API_KEY,
          baseURL: 'https://api.x.ai/v1'
        }),
        models: {
          'grok-beta': { maxTokens: 8192, cost: 'medium' },
          'grok-2': { maxTokens: 128000, cost: 'high' }
        },
        defaultModel: 'grok-beta'
      };
    }

    // Gemini Provider
    if (process.env.GEMINI_API_KEY) {
      providers.gemini = {
        name: 'Google Gemini',
        client: new GoogleGenerativeAI(process.env.GEMINI_API_KEY),
        models: {
          'gemini-pro': { maxTokens: 30720, cost: 'low' },
          'gemini-pro-vision': { maxTokens: 30720, cost: 'low' }
        },
        defaultModel: 'gemini-pro'
      };
    }

    // Anthropic Claude Provider
    if (process.env.ANTHROPIC_API_KEY) {
      providers.claude = {
        name: 'Anthropic Claude',
        client: new OpenAI({ 
          apiKey: process.env.ANTHROPIC_API_KEY,
          baseURL: 'https://api.anthropic.com/v1'
        }),
        models: {
          'claude-3-opus': { maxTokens: 200000, cost: 'high' },
          'claude-3-sonnet': { maxTokens: 200000, cost: 'medium' },
          'claude-3-haiku': { maxTokens: 200000, cost: 'low' }
        },
        defaultModel: 'claude-3-sonnet'
      };
    }

    // Mistral AI Provider
    if (process.env.MISTRAL_API_KEY) {
      providers.mistral = {
        name: 'Mistral AI',
        client: new OpenAI({ 
          apiKey: process.env.MISTRAL_API_KEY,
          baseURL: 'https://api.mistral.ai/v1'
        }),
        models: {
          'mistral-large': { maxTokens: 32768, cost: 'medium' },
          'mistral-medium': { maxTokens: 32768, cost: 'low' },
          'mistral-small': { maxTokens: 32768, cost: 'very-low' }
        },
        defaultModel: 'mistral-medium'
      };
    }

    return providers;
  }

  async generateResponse(message, conversationHistory = [], context = {}, preferredProvider = null) {
    const provider = preferredProvider || this.defaultProvider;
    
    try {
      // Try preferred provider first
      if (this.providers[provider]) {
        return await this.callProvider(provider, message, conversationHistory, context);
      }
      
      // Fallback to available providers
      for (const fallbackProvider of this.fallbackProviders) {
        if (this.providers[fallbackProvider]) {
          console.log(`Falling back to ${fallbackProvider} provider`);
          return await this.callProvider(fallbackProvider, message, conversationHistory, context);
        }
      }
      
      throw new Error('No AI providers available');
      
    } catch (error) {
      console.error(`Error with provider ${provider}:`, error);
      
      // Try other providers as fallback
      for (const fallbackProvider of Object.keys(this.providers)) {
        if (fallbackProvider !== provider) {
          try {
            console.log(`Trying fallback provider: ${fallbackProvider}`);
            return await this.callProvider(fallbackProvider, message, conversationHistory, context);
          } catch (fallbackError) {
            console.error(`Fallback provider ${fallbackProvider} failed:`, fallbackError);
          }
        }
      }
      
      throw new Error('All AI providers failed');
    }
  }

  async callProvider(providerName, message, conversationHistory, context) {
    const provider = this.providers[providerName];
    const systemPrompt = this.selectSystemPrompt(message, context);
    const messages = this.buildConversationMessages(systemPrompt, conversationHistory, message);
    
    switch (providerName) {
      case 'openai':
      case 'deepseek':
      case 'grok':
      case 'claude':
      case 'mistral':
        return await this.callOpenAICompatible(provider, messages);
      
      case 'gemini':
        return await this.callGemini(provider, messages);
      
      default:
        throw new Error(`Unsupported provider: ${providerName}`);
    }
  }

  async callOpenAICompatible(provider, messages) {
    const completion = await provider.client.chat.completions.create({
      model: provider.defaultModel,
      messages: messages,
      max_tokens: provider.models[provider.defaultModel].maxTokens,
      temperature: 0.7,
      top_p: 0.9,
      frequency_penalty: 0.1,
      presence_penalty: 0.1,
      stream: false
    });

    return {
      content: completion.choices[0].message.content,
      provider: provider.name,
      model: provider.defaultModel,
      usage: completion.usage,
      timestamp: new Date().toISOString()
    };
  }

  async callGemini(provider, messages) {
    const model = provider.client.getGenerativeModel({ model: provider.defaultModel });
    
    // Convert messages to Gemini format
    const geminiMessages = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : msg.role,
      parts: [{ text: msg.content }]
    }));

    const result = await model.generateContent({
      contents: geminiMessages,
      generationConfig: {
        maxOutputTokens: provider.models[provider.defaultModel].maxTokens,
        temperature: 0.7,
        topP: 0.9
      }
    });

    return {
      content: result.response.text(),
      provider: provider.name,
      model: provider.defaultModel,
      usage: { total_tokens: result.response.candidates[0].tokenCount },
      timestamp: new Date().toISOString()
    };
  }

  selectSystemPrompt(message, context) {
    const messageLower = message.toLowerCase();
    
    if (messageLower.includes('bug') || messageLower.includes('error') || messageLower.includes('fix')) {
      return this.systemPrompts.debugging;
    } else if (messageLower.includes('code') || messageLower.includes('function') || messageLower.includes('class')) {
      return this.systemPrompts.coding;
    } else if (messageLower.includes('learn') || messageLower.includes('explain') || messageLower.includes('how')) {
      return this.systemPrompts.learning;
    }
    
    return this.systemPrompts.default;
  }

  buildConversationMessages(systemPrompt, history, currentMessage) {
    const messages = [
      { role: 'system', content: systemPrompt }
    ];

    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  get systemPrompts() {
    return {
      default: `You are Nexa, an intelligent AI development companion. You help developers with:
- Code review and debugging
- Best practices and architecture
- Problem-solving and algorithm design
- Technology recommendations
- Learning and documentation

Always provide clear, practical, and actionable advice. When showing code, use proper syntax highlighting and explain your reasoning.`,
      
      coding: `You are Nexa, a coding expert. Focus on:
- Writing clean, efficient code
- Explaining complex concepts simply
- Providing multiple solutions when possible
- Following language-specific best practices
- Suggesting improvements and optimizations`,
      
      debugging: `You are Nexa, a debugging specialist. Help with:
- Identifying root causes of issues
- Suggesting debugging strategies
- Providing step-by-step solutions
- Explaining error messages
- Preventing similar issues in the future`,
      
      learning: `You are Nexa, a patient teacher. Focus on:
- Breaking down complex topics
- Providing examples and analogies
- Suggesting learning resources
- Encouraging experimentation
- Building confidence through practice`
    };
  }

  // Provider management methods
  getAvailableProviders() {
    return Object.keys(this.providers).map(name => ({
      name,
      displayName: this.providers[name].name,
      models: Object.keys(this.providers[name].models),
      defaultModel: this.providers[name].defaultModel
    }));
  }

  getProviderInfo(providerName) {
    if (!this.providers[providerName]) {
      return null;
    }
    
    const provider = this.providers[providerName];
    return {
      name: providerName,
      displayName: provider.name,
      models: provider.models,
      defaultModel: provider.defaultModel,
      status: 'available'
    };
  }

  // Health check for all providers
  async healthCheck() {
    const results = {};
    
    for (const [name, provider] of Object.entries(this.providers)) {
      try {
        if (name === 'gemini') {
          // Test Gemini with a simple request
          const model = provider.client.getGenerativeModel({ model: provider.defaultModel });
          await model.generateContent('Hello');
          results[name] = { status: 'healthy', provider: provider.name };
        } else {
          // Test OpenAI-compatible providers
          await provider.client.chat.completions.create({
            model: provider.defaultModel,
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 10
          });
          results[name] = { status: 'healthy', provider: provider.name };
        }
      } catch (error) {
        results[name] = { 
          status: 'unhealthy', 
          provider: provider.name, 
          error: error.message 
        };
      }
    }
    
    return results;
  }
}

module.exports = new MultiAIService();
