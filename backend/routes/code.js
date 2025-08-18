const express = require('express');
const router = express.Router();
const codeRunner = require('../services/codeRunner');
const { validateCodeRequest } = require('../middleware/validation');

// POST /api/code/execute - Execute code
router.post('/execute', validateCodeRequest, async (req, res, next) => {
  try {
    const { code, language, input } = req.body;
    
    // Execute code safely
    const result = await codeRunner.executeCode(code, language, input);
    
    res.json({
      success: true,
      data: {
        output: result.output,
        error: result.error,
        executionTime: result.executionTime,
        language: language,
        timestamp: new Date().toISOString()
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// POST /api/code/validate - Validate code syntax
router.post('/validate', validateCodeRequest, async (req, res, next) => {
  try {
    const { code, language } = req.body;
    
    // Validate code syntax
    const validation = await codeRunner.validateCode(code, language);
    
    res.json({
      success: true,
      data: {
        isValid: validation.isValid,
        errors: validation.errors,
        warnings: validation.warnings,
        language: language
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/code/languages - Get supported languages
router.get('/languages', (req, res) => {
  const supportedLanguages = [
    { id: 'javascript', name: 'JavaScript', version: 'ES2020', icon: '⚡' },
    { id: 'typescript', name: 'TypeScript', version: '4.9', icon: '🔷' },
    { id: 'python', name: 'Python', version: '3.9', icon: '🐍' },
    { id: 'html', name: 'HTML', version: '5', icon: '🌐' },
    { id: 'css', name: 'CSS', version: '3', icon: '🎨' },
    { id: 'json', name: 'JSON', version: 'RFC 7159', icon: '📄' },
    { id: 'markdown', name: 'Markdown', version: 'CommonMark', icon: '📝' }
  ];
  
  res.json({
    success: true,
    data: supportedLanguages
  });
});

// POST /api/code/format - Format code
router.post('/format', validateCodeRequest, async (req, res, next) => {
  try {
    const { code, language } = req.body;
    
    // Format code
    const formatted = await codeRunner.formatCode(code, language);
    
    res.json({
      success: true,
      data: {
        formattedCode: formatted.code,
        language: language,
        changes: formatted.changes
      }
    });
    
  } catch (error) {
    next(error);
  }
});

// GET /api/code/templates - Get code templates
router.get('/templates/:language', (req, res) => {
  const { language } = req.params;
  
  const templates = {
    javascript: {
      name: 'JavaScript Function',
      code: `function greet(name) {
  return \`Hello, \${name}!\`;
}

console.log(greet("World"));`,
      description: 'Basic JavaScript function template'
    },
    typescript: {
      name: 'TypeScript Interface',
      code: `interface User {
  name: string;
  age: number;
}

function greetUser(user: User): string {
  return \`Hello, \${user.name}! You are \${user.age} years old.\`;
}`,
      description: 'TypeScript interface and function template'
    },
    python: {
      name: 'Python Class',
      code: `class Calculator:
    def __init__(self):
        self.result = 0
    
    def add(self, x):
        self.result += x
        return self.result

calc = Calculator()
print(calc.add(5))`,
      description: 'Python class template'
    },
    html: {
      name: 'HTML Page',
      code: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Page</title>
</head>
<body>
    <h1>Hello World!</h1>
    <p>Welcome to my page.</p>
</body>
</html>`,
      description: 'Basic HTML page template'
    }
  };
  
  const template = templates[language];
  if (!template) {
    return res.status(404).json({
      success: false,
      error: 'Language not supported'
    });
  }
  
  res.json({
    success: true,
    data: template
  });
});

module.exports = router;
