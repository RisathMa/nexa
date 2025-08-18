const OpenAI = require('openai');

class AIService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    this.model = process.env.OPENAI_MODEL || 'gpt-4';
    this.maxTokens = parseInt(process.env.OPENAI_MAX_TOKENS) || 4000;
    
    // System prompts for different contexts
    this.systemPrompts = {
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

  async generateResponse(message, conversationHistory = [], context = {}) {
    try {
      // Determine context and select appropriate system prompt
      const systemPrompt = this.selectSystemPrompt(message, context);
      
      // Build conversation messages
      const messages = this.buildConversationMessages(systemPrompt, conversationHistory, message);
      
      // Call OpenAI API
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: messages,
        max_tokens: this.maxTokens,
        temperature: 0.7,
        top_p: 0.9,
        frequency_penalty: 0.1,
        presence_penalty: 0.1,
        stream: false
      });

      const response = completion.choices[0].message.content;
      
      return {
        content: response,
        model: this.model,
        usage: completion.usage,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('AI Service Error:', error);
      
      // Handle specific OpenAI errors
      if (error.code === 'insufficient_quota') {
        throw new Error('OpenAI API quota exceeded. Please check your billing.');
      } else if (error.code === 'invalid_api_key') {
        throw new Error('Invalid OpenAI API key. Please check your configuration.');
      } else if (error.code === 'rate_limit_exceeded') {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      }
      
      throw new Error('Failed to generate AI response. Please try again.');
    }
  }

  selectSystemPrompt(message, context) {
    const messageLower = message.toLowerCase();
    
    // Analyze message content to determine context
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

    // Add conversation history (limit to last 10 messages for context)
    const recentHistory = history.slice(-10);
    recentHistory.forEach(msg => {
      messages.push({
        role: msg.role,
        content: msg.content
      });
    });

    // Add current message
    messages.push({
      role: 'user',
      content: currentMessage
    });

    return messages;
  }

  async generateCodeSuggestion(prompt, language, context = {}) {
    try {
      const systemPrompt = `You are Nexa, a coding expert. Generate ${language} code based on the user's request.
      
Requirements:
- Write clean, well-commented code
- Follow ${language} best practices
- Include error handling where appropriate
- Provide a brief explanation of the solution
- Use modern syntax and features

User request: ${prompt}`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.3, // Lower temperature for more focused code generation
        stream: false
      });

      return {
        code: completion.choices[0].message.content,
        language: language,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Code Generation Error:', error);
      throw new Error('Failed to generate code suggestion.');
    }
  }

  async analyzeCode(code, language) {
    try {
      const systemPrompt = `You are Nexa, a code reviewer. Analyze the following ${language} code and provide feedback.
      
Provide:
1. Code quality assessment
2. Potential improvements
3. Security considerations
4. Performance optimizations
5. Best practices suggestions

Be constructive and specific.`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze this ${language} code:\n\n\`\`\`${language}\n${code}\n\`\`\`` }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.4,
        stream: false
      });

      return {
        analysis: completion.choices[0].message.content,
        language: language,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Code Analysis Error:', error);
      throw new Error('Failed to analyze code.');
    }
  }

  async explainConcept(concept, context = {}) {
    try {
      const systemPrompt = `You are Nexa, a patient and knowledgeable teacher. Explain the concept in a clear, engaging way.
      
Guidelines:
- Start with simple explanations
- Use analogies and examples
- Build up to more complex aspects
- Provide practical applications
- Suggest learning resources
- Encourage questions and experimentation`;

      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please explain: ${concept}` }
        ],
        max_tokens: this.maxTokens,
        temperature: 0.6,
        stream: false
      });

      return {
        explanation: completion.choices[0].message.content,
        concept: concept,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Concept Explanation Error:', error);
      throw new Error('Failed to explain concept.');
    }
  }

  // Health check method
  async healthCheck() {
    try {
      // Test API connection with a simple request
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      });
      
      return {
        status: 'healthy',
        model: this.model,
        apiKey: !!process.env.OPENAI_API_KEY,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new AIService();
