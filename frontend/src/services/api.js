const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  // Generic request method
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    
    const defaultOptions = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    };

    const config = {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Request Error:', error);
      throw error;
    }
  }

  // Chat API methods
  async sendMessage(message, conversationId = null, context = {}) {
    return this.request('/chat', {
      method: 'POST',
      body: JSON.stringify({
        message,
        conversationId,
        context
      })
    });
  }

  async getConversations() {
    return this.request('/chat/conversations', {
      method: 'GET'
    });
  }

  async getConversation(id) {
    return this.request(`/chat/conversation/${id}`, {
      method: 'GET'
    });
  }

  async deleteConversation(id) {
    return this.request(`/chat/conversation/${id}`, {
      method: 'DELETE'
    });
  }

  // Code execution API methods
  async executeCode(code, language, input = '') {
    return this.request('/code/execute', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language,
        input
      })
    });
  }

  async validateCode(code, language) {
    return this.request('/code/validate', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language
      })
    });
  }

  async getSupportedLanguages() {
    return this.request('/code/languages', {
      method: 'GET'
    });
  }

  async formatCode(code, language) {
    return this.request('/code/format', {
      method: 'POST',
      body: JSON.stringify({
        code,
        language
      })
    });
  }

  async getCodeTemplate(language) {
    return this.request(`/code/templates/${language}`, {
      method: 'GET'
    });
  }

  // Memory API methods
  async getAllConversations() {
    return this.request('/memory/conversations', {
      method: 'GET'
    });
  }

  async getConversationById(id) {
    return this.request(`/memory/conversation/${id}`, {
      method: 'GET'
    });
  }

  async getConversationMessages(id, limit = 50, offset = 0) {
    return this.request(`/memory/conversation/${id}/messages?limit=${limit}&offset=${offset}`, {
      method: 'GET'
    });
  }

  async createConversation(title, context = {}) {
    return this.request('/memory/conversation', {
      method: 'POST',
      body: JSON.stringify({
        title,
        context
      })
    });
  }

  async updateConversation(id, updates) {
    return this.request(`/memory/conversation/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  async deleteConversation(id) {
    return this.request(`/memory/conversation/${id}`, {
      method: 'DELETE'
    });
  }

  async saveMessage(role, content, conversationId, metadata = {}) {
    return this.request('/memory/message', {
      method: 'POST',
      body: JSON.stringify({
        role,
        content,
        conversationId,
        metadata
      })
    });
  }

  async searchMessages(query, conversationId = null, role = null, limit = 20) {
    const params = new URLSearchParams({
      query,
      limit: limit.toString()
    });
    
    if (conversationId) params.append('conversationId', conversationId);
    if (role) params.append('role', role);

    return this.request(`/memory/search?${params.toString()}`, {
      method: 'GET'
    });
  }

  async getMemoryStats() {
    return this.request('/memory/stats', {
      method: 'GET'
    });
  }

  async exportConversation(conversationId, format = 'json') {
    return this.request(`/memory/export/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ format })
    });
  }

  // Health check
  async healthCheck() {
    try {
      const response = await fetch(`${this.baseURL.replace('/api', '')}/health`);
      return await response.json();
    } catch (error) {
      throw new Error('Backend health check failed');
    }
  }

  // Error handling utilities
  handleError(error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return {
        type: 'NETWORK_ERROR',
        message: 'Unable to connect to server. Please check your connection.',
        details: error.message
      };
    }

    if (error.message.includes('401')) {
      return {
        type: 'UNAUTHORIZED',
        message: 'Authentication required. Please log in.',
        details: error.message
      };
    }

    if (error.message.includes('403')) {
      return {
        type: 'FORBIDDEN',
        message: 'Access denied. You don\'t have permission for this action.',
        details: error.message
      };
    }

    if (error.message.includes('404')) {
      return {
        type: 'NOT_FOUND',
        message: 'The requested resource was not found.',
        details: error.message
      };
    }

    if (error.message.includes('429')) {
      return {
        type: 'RATE_LIMITED',
        message: 'Too many requests. Please wait a moment and try again.',
        details: error.message
      };
    }

    if (error.message.includes('500')) {
      return {
        type: 'SERVER_ERROR',
        message: 'Server error occurred. Please try again later.',
        details: error.message
      };
    }

    return {
      type: 'UNKNOWN_ERROR',
      message: 'An unexpected error occurred.',
      details: error.message
    };
  }

  // Retry mechanism for failed requests
  async retryRequest(fn, maxRetries = 3, delay = 1000) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await fn();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
      }
    }
  }

  // Streaming support for chat (future enhancement)
  async streamChat(message, conversationId = null, context = {}) {
    const url = `${this.baseURL}/chat/stream`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId,
          context
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      return {
        stream: reader,
        decoder,
        cancel: () => reader.cancel()
      };
    } catch (error) {
      console.error('Streaming chat error:', error);
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();

export default apiService;
