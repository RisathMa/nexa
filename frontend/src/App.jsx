import React, { useState } from 'react';
import Chat from './components/Chat';
import CodeEditor from './components/CodeEditor';
import { ChatBubbleLeftRightIcon, CodeBracketIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import api from './services/api';

function App() {
  const [activeTab, setActiveTab] = useState('chat');
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [codeOutput, setCodeOutput] = useState(null);
  const [isCodeRunning, setIsCodeRunning] = useState(false);

  const handleSendMessage = async (message) => {
    const userMessage = {
      role: 'user',
      content: message,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Simulate AI response for now (we'll connect to backend later)
      setTimeout(() => {
        const aiMessage = {
          role: 'assistant',
          content: `I received your message: "${message}". This is a placeholder response. In Phase 3, I'll connect to the real AI backend!`,
          timestamp: new Date().toISOString()
        };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      const errorMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      setIsLoading(false);
    }
  };

  const handleCodeChange = (code) => {
    // Handle code changes
    console.log('Code changed:', code);
  };

  const handleRunCode = async (code, language) => {
    setIsCodeRunning(true);
    setCodeOutput(null);

    try {
      const response = await api.executeCode(code, language, '');
      if (response?.success) {
        const { output, error } = response.data;
        setCodeOutput(error ? `Error: ${error}` : output || '');
      } else {
        setCodeOutput('Error: Unable to execute code');
      }
    } catch (error) {
      setCodeOutput(`Error: ${error.message}`);
    } finally {
      setIsCodeRunning(false);
    }
  };

  const tabs = [
    { id: 'chat', label: 'Chat', icon: ChatBubbleLeftRightIcon, description: 'Talk with AI' },
    { id: 'code', label: 'Code Editor', icon: CodeBracketIcon, description: 'Write & execute code' },
    { id: 'settings', label: 'Settings', icon: Cog6ToothIcon, description: 'Configure AI agent' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-50 via-white to-primary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-dark-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl flex items-center justify-center">
                <CodeBracketIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-dark-900">Nexa</h1>
                <p className="text-sm text-dark-500">Next Developer</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm text-dark-500">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Phase 2: Frontend Complete</span>
              </div>
              <button className="px-4 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-sm border border-dark-200">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'bg-primary-500 text-white shadow-md'
                      : 'text-dark-600 hover:text-dark-900 hover:bg-dark-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
          
          {/* Tab Description */}
          <div className="mt-3 text-center">
            <p className="text-sm text-dark-500">
              {tabs.find(tab => tab.id === activeTab)?.description}
            </p>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl border border-dark-200 overflow-hidden">
          {activeTab === 'chat' && (
            <div className="h-[600px]">
              <Chat
                messages={messages}
                onSendMessage={handleSendMessage}
                isLoading={isLoading}
              />
            </div>
          )}

          {activeTab === 'code' && (
            <div className="h-[600px]">
              <CodeEditor
                                 code="// Welcome to the Code Editor!\n// Write your code here and click Run to execute it.\n\nconsole.log('Hello from Nexa!');"
                language="javascript"
                onCodeChange={handleCodeChange}
                onRunCode={handleRunCode}
                output={codeOutput}
                isRunning={isCodeRunning}
              />
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-primary-100 to-primary-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cog6ToothIcon className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-dark-900 mb-2">Settings Coming Soon</h3>
              <p className="text-dark-500 max-w-md mx-auto">
                Configuration options for AI models, code execution settings, and personalization 
                will be available in Phase 3 when we connect the backend.
              </p>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-dark-200">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-dark-600">Phase 2 Complete: Frontend UI Ready</span>
          </div>
          <p className="mt-2 text-xs text-dark-500">
            Next: Backend API & AI Integration
          </p>
        </div>
      </main>
    </div>
  );
}

export default App;
