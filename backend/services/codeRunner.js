const { VM } = require('vm2');
const { v4: uuidv4 } = require('uuid');

class CodeRunner {
  constructor() {
    this.timeout = parseInt(process.env.CODE_EXECUTION_TIMEOUT) || 10000;
    this.maxCodeLength = parseInt(process.env.MAX_CODE_LENGTH) || 10000;
    
    // Initialize VM with safe configuration
    this.vm = new VM({
      timeout: this.timeout,
      sandbox: this.createSafeSandbox(),
      eval: false,
      wasm: false
    });
  }

  createSafeSandbox() {
    return {
      // Safe console methods
      console: {
        log: (...args) => this.captureOutput('log', args),
        error: (...args) => this.captureOutput('error', args),
        warn: (...args) => this.captureOutput('warn', args),
        info: (...args) => this.captureOutput('info', args),
        debug: (...args) => this.captureOutput('debug', args)
      },
      
      // Safe Math functions
      Math: {
        ...Math,
        random: () => Math.random() // Allow random for demo purposes
      },
      
      // Safe Date functions
      Date: Date,
      
      // Safe JSON functions
      JSON: JSON,
      
      // Safe Array methods
      Array: Array,
      ArrayBuffer: ArrayBuffer,
      Int8Array: Int8Array,
      Uint8Array: Uint8Array,
      Int16Array: Int16Array,
      Uint16Array: Uint16Array,
      Int32Array: Int32Array,
      Uint32Array: Uint32Array,
      Float32Array: Float32Array,
      Float64Array: Float64Array,
      
      // Safe String methods
      String: String,
      
      // Safe Number methods
      Number: Number,
      
      // Safe Boolean methods
      Boolean: Boolean,
      
      // Safe Object methods
      Object: Object,
      
      // Safe RegExp
      RegExp: RegExp,
      
      // Safe Map and Set
      Map: Map,
      Set: Set,
      
      // Safe WeakMap and WeakSet
      WeakMap: WeakMap,
      WeakSet: WeakSet,
      
      // Safe Promise
      Promise: Promise,
      
      // Safe Error constructors
      Error: Error,
      TypeError: TypeError,
      ReferenceError: ReferenceError,
      SyntaxError: SyntaxError,
      RangeError: RangeError,
      
      // Safe global functions
      parseInt: parseInt,
      parseFloat: parseFloat,
      isNaN: isNaN,
      isFinite: isFinite,
      encodeURI: encodeURI,
      encodeURIComponent: encodeURIComponent,
      decodeURI: decodeURI,
      decodeURIComponent: decodeURIComponent,
      escape: escape,
      unescape: unescape
    };
  }

  async executeCode(code, language, input = '') {
    const startTime = Date.now();
    let output = [];
    let error = null;
    
    try {
      // Validate code length
      if (code.length > this.maxCodeLength) {
        throw new Error(`Code too long. Maximum allowed: ${this.maxCodeLength} characters`);
      }
      
      // Language-specific execution
      switch (language) {
        case 'javascript':
          output = await this.executeJavaScript(code, input);
          break;
        case 'typescript':
          output = await this.executeTypeScript(code, input);
          break;
        case 'python':
          output = await this.executePython(code, input);
          break;
        case 'html':
          output = await this.executeHTML(code);
          break;
        case 'css':
          output = await this.executeCSS(code);
          break;
        case 'json':
          output = await this.executeJSON(code);
          break;
        case 'markdown':
          output = await this.executeMarkdown(code);
          break;
        default:
          throw new Error(`Unsupported language: ${language}`);
      }
      
      const executionTime = Date.now() - startTime;
      
      return {
        output: output.join('\n'),
        error: null,
        executionTime: `${executionTime}ms`,
        language: language,
        success: true
      };
      
    } catch (err) {
      const executionTime = Date.now() - startTime;
      
      return {
        output: output.join('\n'),
        error: err.message,
        executionTime: `${executionTime}ms`,
        language: language,
        success: false
      };
    }
  }

  async executeJavaScript(code, input) {
    const output = [];
    
    // Override console methods to capture output
    this.vm.sandbox.console = {
      log: (...args) => output.push(args.map(arg => this.formatOutput(arg)).join(' ')),
      error: (...args) => output.push(`ERROR: ${args.map(arg => this.formatOutput(arg)).join(' ')}`),
      warn: (...args) => output.push(`WARN: ${args.map(arg => this.formatOutput(arg)).join(' ')}`),
      info: (...args) => output.push(`INFO: ${args.map(arg => this.formatOutput(arg)).join(' ')}`),
      debug: (...args) => output.push(`DEBUG: ${args.map(arg => this.formatOutput(arg)).join(' ')}`)
    };
    
    // Execute code
    const result = this.vm.run(code);
    
    // If code returns a value, add it to output
    if (result !== undefined) {
      output.push(this.formatOutput(result));
    }
    
    return output;
  }

  async executeTypeScript(code, input) {
    // For now, treat TypeScript as JavaScript (in production, you'd use ts-node or similar)
    // This is a simplified implementation
    try {
      // Basic TypeScript validation (very basic)
      if (code.includes('interface') || code.includes('type') || code.includes(':')) {
        // Remove TypeScript syntax for execution
        const jsCode = code
          .replace(/:\s*[a-zA-Z<>\[\]{}|&]+/g, '') // Remove type annotations
          .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
          .replace(/type\s+\w+\s*=\s*[^;]+;/g, '') // Remove type aliases
          .replace(/<[^>]*>/g, ''); // Remove generics
        
        return await this.executeJavaScript(jsCode, input);
      } else {
        return await this.executeJavaScript(code, input);
      }
    } catch (error) {
      throw new Error(`TypeScript execution failed: ${error.message}`);
    }
  }

  async executePython(code, input) {
    // Note: This is a placeholder. In production, you'd need a Python runtime
    // For now, we'll return a message about Python support
    return [`Python execution is not yet implemented in this demo version.`,
            `Code received:`,
            code,
            `Input received: ${input}`];
  }

  async executeHTML(code) {
    // For HTML, we'll return the formatted HTML
    return [
      'HTML Preview:',
      '```html',
      code,
      '```',
      '',
      'Note: This is a preview. To see the rendered result, copy the HTML to a file and open it in a browser.'
    ];
  }

  async executeCSS(code) {
    // For CSS, we'll return the formatted CSS
    return [
      'CSS Code:',
      '```css',
      code,
      '```',
      '',
      'Note: This is a preview. To see the rendered result, copy the CSS to a file and link it to an HTML document.'
    ];
  }

  async executeJSON(code) {
    try {
      const parsed = JSON.parse(code);
      return [
        'Valid JSON:',
        '```json',
        JSON.stringify(parsed, null, 2),
        '```'
      ];
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  async executeMarkdown(code) {
    // For Markdown, we'll return the formatted markdown
    return [
      'Markdown Preview:',
      '```markdown',
      code,
      '```',
      '',
      'Note: This is a preview. To see the rendered result, copy the markdown to a file and open it in a markdown viewer.'
    ];
  }

  formatOutput(value) {
    if (value === null) return 'null';
    if (value === undefined) return 'undefined';
    if (typeof value === 'object') {
      try {
        return JSON.stringify(value, null, 2);
      } catch {
        return value.toString();
      }
    }
    return String(value);
  }

  captureOutput(level, args) {
    // This method is used by the sandbox console methods
    const message = args.map(arg => this.formatOutput(arg)).join(' ');
    return `[${level.toUpperCase()}] ${message}`;
  }

  async validateCode(code, language) {
    try {
      // Basic validation based on language
      switch (language) {
        case 'javascript':
          return this.validateJavaScript(code);
        case 'typescript':
          return this.validateTypeScript(code);
        case 'json':
          return this.validateJSON(code);
        case 'html':
          return this.validateHTML(code);
        case 'css':
          return this.validateCSS(code);
        case 'python':
          return this.validatePython(code);
        case 'markdown':
          return this.validateMarkdown(code);
        default:
          return { isValid: false, errors: [`Unsupported language: ${language}`] };
      }
    } catch (error) {
      return { isValid: false, errors: [error.message] };
    }
  }

  validateJavaScript(code) {
    try {
      // Basic syntax validation
      new Function(code);
      return { isValid: true, errors: [], warnings: [] };
    } catch (error) {
      return { isValid: false, errors: [error.message], warnings: [] };
    }
  }

  validateTypeScript(code) {
    // Basic TypeScript validation (simplified)
    const errors = [];
    const warnings = [];
    
    // Check for basic TypeScript syntax
    if (code.includes('interface') || code.includes('type')) {
      // Very basic interface validation
      const interfaceRegex = /interface\s+\w+\s*{/g;
      const matches = code.match(interfaceRegex);
      if (matches) {
        // Check if interfaces are properly closed
        const openBraces = (code.match(/{/g) || []).length;
        const closeBraces = (code.match(/}/g) || []).length;
        if (openBraces !== closeBraces) {
          errors.push('Mismatched braces in TypeScript code');
        }
      }
    }
    
    // Try to execute as JavaScript (remove TypeScript syntax)
    try {
      const jsCode = code
        .replace(/:\s*[a-zA-Z<>\[\]{}|&]+/g, '')
        .replace(/interface\s+\w+\s*{[^}]*}/g, '')
        .replace(/type\s+\w+\s*=\s*[^;]+;/g, '')
        .replace(/<[^>]*>/g, '');
      
      new Function(jsCode);
      return { isValid: errors.length === 0, errors, warnings };
    } catch (error) {
      errors.push(`JavaScript execution failed: ${error.message}`);
      return { isValid: false, errors, warnings };
    }
  }

  validateJSON(code) {
    try {
      JSON.parse(code);
      return { isValid: true, errors: [], warnings: [] };
    } catch (error) {
      return { isValid: false, errors: [error.message], warnings: [] };
    }
  }

  validateHTML(code) {
    const errors = [];
    const warnings = [];
    
    // Basic HTML validation
    if (!code.includes('<html') && !code.includes('<body')) {
      warnings.push('Missing HTML structure tags');
    }
    
    // Check for unclosed tags (very basic)
    const openTags = (code.match(/<[^/][^>]*>/g) || []).length;
    const closeTags = (code.match(/<\/[^>]*>/g) || []).length;
    
    if (openTags !== closeTags) {
      warnings.push('Possible unclosed HTML tags');
    }
    
    return { isValid: true, errors, warnings };
  }

  validateCSS(code) {
    const errors = [];
    const warnings = [];
    
    // Basic CSS validation
    if (!code.includes('{') || !code.includes('}')) {
      warnings.push('Missing CSS braces');
    }
    
    return { isValid: true, errors, warnings };
  }

  validatePython(code) {
    // Placeholder for Python validation
    return { isValid: true, errors: [], warnings: ['Python validation not yet implemented'] };
  }

  validateMarkdown(code) {
    // Markdown is very permissive, so basic validation
    return { isValid: true, errors: [], warnings: [] };
  }

  async formatCode(code, language) {
    try {
      switch (language) {
        case 'javascript':
          return this.formatJavaScript(code);
        case 'json':
          return this.formatJSON(code);
        case 'html':
          return this.formatHTML(code);
        case 'css':
          return this.formatCSS(code);
        default:
          return { code, changes: [] };
      }
    } catch (error) {
      throw new Error(`Code formatting failed: ${error.message}`);
    }
  }

  formatJavaScript(code) {
    // Basic JavaScript formatting (in production, use prettier)
    const changes = [];
    let formattedCode = code;
    
    // Add semicolons where missing
    if (!code.trim().endsWith(';') && !code.trim().endsWith('}')) {
      formattedCode += ';';
      changes.push('Added missing semicolon');
    }
    
    return { code: formattedCode, changes };
  }

  formatJSON(code) {
    try {
      const parsed = JSON.parse(code);
      const formatted = JSON.stringify(parsed, null, 2);
      return { code: formatted, changes: ['Formatted JSON with proper indentation'] };
    } catch (error) {
      throw new Error(`Invalid JSON: ${error.message}`);
    }
  }

  formatHTML(code) {
    // Basic HTML formatting
    const changes = [];
    let formattedCode = code;
    
    // Ensure proper spacing
    formattedCode = formattedCode.replace(/>\s*</g, '>\n<');
    
    return { code: formattedCode, changes: ['Added line breaks between HTML tags'] };
  }

  formatCSS(code) {
    // Basic CSS formatting
    const changes = [];
    let formattedCode = code;
    
    // Ensure proper spacing
    formattedCode = formattedCode.replace(/{\s*/g, ' {\n  ');
    formattedCode = formattedCode.replace(/;\s*}/g, ';\n}');
    
    return { code: formattedCode, changes: ['Added proper CSS formatting'] };
  }
}

module.exports = new CodeRunner();
