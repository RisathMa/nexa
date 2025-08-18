import React, { useState, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { PlayIcon, DocumentDuplicateIcon, TrashIcon, CodeBracketIcon } from '@heroicons/react/24/outline';

const CodeEditor = ({ 
  code = '', 
  language = 'javascript', 
  onCodeChange, 
  onRunCode, 
  output = null, 
  isRunning = false 
}) => {
  const [editorValue, setEditorValue] = useState(code);
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const editorRef = useRef(null);

  const languages = [
    { value: 'javascript', label: 'JavaScript', icon: '⚡' },
    { value: 'typescript', label: 'TypeScript', icon: '🔷' },
    { value: 'python', label: 'Python', icon: '🐍' },
    { value: 'html', label: 'HTML', icon: '🌐' },
    { value: 'css', label: 'CSS', icon: '🎨' },
    { value: 'json', label: 'JSON', label: '📄' },
    { value: 'markdown', label: 'Markdown', icon: '📝' }
  ];

  const handleEditorDidMount = (editor) => {
    editorRef.current = editor;
    editor.focus();
  };

  const handleCodeChange = (value) => {
    setEditorValue(value || '');
    onCodeChange?.(value || '');
  };

  const handleRunCode = () => {
    if (editorValue.trim()) {
      onRunCode?.(editorValue, selectedLanguage);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(editorValue);
  };

  const handleClearCode = () => {
    setEditorValue('');
    onCodeChange?.('');
  };

  const handleLanguageChange = (newLanguage) => {
    setSelectedLanguage(newLanguage);
    // Reset code when changing languages
    setEditorValue('');
    onCodeChange?.('');
  };

  const getDefaultCode = (lang) => {
    const defaults = {
             javascript: '// Write your JavaScript code here\nconsole.log("Hello, World!");\n\n// Example function\nfunction greet(name) {\n  return `Hello, ${name}!`;\n}\n\ngreet("Nexa");',
             typescript: '// Write your TypeScript code here\ninterface User {\n  name: string;\n  age: number;\n}\n\nfunction greetUser(user: User): string {\n  return `Hello, ${user.name}! You are ${user.age} years old.`;\n}\n\nconst user: User = { name: "Nexa", age: 1 };\ngreetUser(user);',
             python: '# Write your Python code here\nprint("Hello, World!")\n\n# Example function\ndef greet(name):\n    return f"Hello, {name}!"\n\ngreet("Nexa")',
             html: '<!DOCTYPE html>\n<html lang="en">\n<head>\n    <meta charset="UTF-8">\n    <meta name="viewport" content="width=device-width, initial-scale=1.0">\n    <title>Nexa Code</title>\n</head>\n<body>\n    <h1>Hello from Nexa!</h1>\n    <p>This is a sample HTML template.</p>\n</body>\n</html>',
      css: '/* Write your CSS here */\nbody {\n    font-family: Arial, sans-serif;\n    margin: 0;\n    padding: 20px;\n    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);\n    color: white;\n}\n\nh1 {\n    text-align: center;\n    font-size: 2.5rem;\n    margin-bottom: 1rem;\n}',
             json: '{\n  "name": "Nexa Code",\n  "description": "Sample JSON structure",\n  "version": "1.0.0",\n  "features": [\n    "Code editing",\n    "Execution",\n    "AI assistance"\n  ]\n}',
             markdown: '# Nexa Code Editor\n\n## Features\n\n- **Syntax Highlighting**: Support for multiple languages\n- **Code Execution**: Run your code safely\n- **AI Integration**: Get help from AI\n\n## Getting Started\n\n1. Choose your language\n2. Write your code\n3. Click Run to execute\n\n```javascript\nconsole.log("Hello, World!");\n```'
    };
    return defaults[lang] || defaults.javascript;
  };

  const handleLanguageSelect = (lang) => {
    handleLanguageChange(lang);
    setEditorValue(getDefaultCode(lang));
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-lg border border-dark-200 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-dark-200 bg-gradient-to-r from-dark-50 to-dark-100">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
            <CodeBracketIcon className="w-4 h-4 text-white" />
          </div>
          <h3 className="text-lg font-semibold text-dark-900">Code Editor</h3>
        </div>
        
        {/* Language Selector */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedLanguage}
            onChange={(e) => handleLanguageSelect(e.target.value)}
            className="px-3 py-2 border border-dark-200 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white"
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.icon} {lang.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          language={selectedLanguage}
          value={editorValue}
          onChange={handleCodeChange}
          onMount={handleEditorDidMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: 'JetBrains Mono, Monaco, Consolas, monospace',
            lineNumbers: 'on',
            roundedSelection: false,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            wordWrap: 'on',
            suggestOnTriggerCharacters: true,
            quickSuggestions: true,
            tabSize: 2,
            insertSpaces: true,
            detectIndentation: true,
            trimAutoWhitespace: true,
            largeFileOptimizations: true,
            folding: true,
            foldingStrategy: 'indentation',
            showFoldingControls: 'always',
            unfoldOnClickAfterEnd: false,
            matchBrackets: 'always',
            autoClosingBrackets: 'always',
            autoClosingQuotes: 'always',
            autoClosingOvertype: 'always',
            autoIndent: 'full',
            formatOnPaste: true,
            formatOnType: true,
            dragAndDrop: true,
            emptySelectionClipboard: false,
            copyWithSyntaxHighlighting: true,
            mouseWheelZoom: true,
            smoothScrolling: true,
            cursorBlinking: 'smooth',
            cursorSmoothCaretAnimation: 'on',
            cursorWidth: 2,
            renderLineHighlight: 'all',
            renderWhitespace: 'selection',
            renderControlCharacters: false,
            renderIndentGuides: true,
            renderValidationDecorations: 'on',
            overviewRulerBorder: false,
            overviewRulerLanes: 0,
            scrollbar: {
              vertical: 'visible',
              horizontal: 'visible',
              verticalScrollbarSize: 14,
              horizontalScrollbarSize: 14,
              useShadows: false,
              verticalHasArrows: false,
              horizontalHasArrows: false
            }
          }}
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between p-4 border-t border-dark-200 bg-dark-50">
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRunCode}
            disabled={!editorValue.trim() || isRunning}
            className="px-4 py-2 bg-primary-500 hover:bg-primary-600 disabled:bg-dark-300 disabled:cursor-not-allowed text-white rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <PlayIcon className="w-4 h-4" />
            <span>{isRunning ? 'Running...' : 'Run Code'}</span>
          </button>
          
          <button
            onClick={handleCopyCode}
            disabled={!editorValue.trim()}
            className="px-3 py-2 bg-dark-200 hover:bg-dark-300 disabled:bg-dark-100 disabled:cursor-not-allowed text-dark-700 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <DocumentDuplicateIcon className="w-4 h-4" />
            <span>Copy</span>
          </button>
          
          <button
            onClick={handleClearCode}
            disabled={!editorValue.trim()}
            className="px-3 py-2 bg-red-100 hover:bg-red-200 disabled:bg-red-50 disabled:cursor-not-allowed text-red-700 rounded-lg transition-all duration-200 flex items-center space-x-2"
          >
            <TrashIcon className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
        
        <div className="text-xs text-dark-500">
          {editorValue.length} characters
        </div>
      </div>

      {/* Output Display */}
      {output && (
        <div className="border-t border-dark-200 bg-dark-900 text-green-400 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-green-300">Output</h4>
            <span className="text-xs text-green-500">Execution completed</span>
          </div>
          <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}

      {/* Error Display */}
      {output && output.includes('Error:') && (
        <div className="border-t border-red-200 bg-red-50 text-red-800 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-red-700">Error</h4>
            <span className="text-xs text-red-600">Execution failed</span>
          </div>
          <pre className="text-sm font-mono overflow-x-auto whitespace-pre-wrap">
            {output}
          </pre>
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
