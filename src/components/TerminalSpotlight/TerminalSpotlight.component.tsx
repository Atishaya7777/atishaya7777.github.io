import { useState, useEffect, useRef } from 'react';

const TerminalSpotlight = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const [output, setOutput] = useState([]);
  const [showOutput, setShowOutput] = useState(false);
  const inputRef = useRef(null);
  const outputRef = useRef(null);

  const commands = {
    'help': { 
      action: 'showHelp', 
      description: 'Show available commands',
      category: 'system'
    },
    'whoami': { 
      action: 'showWhoami', 
      description: 'Display user information',
      category: 'system'
    },
    'pwd': { 
      action: 'showPwd', 
      description: 'Print working directory',
      category: 'system'
    },
    'ls': { 
      action: 'listDirectory', 
      description: 'List directory contents',
      category: 'navigation'
    },
    'ls ~/projects/': { 
      action: 'navigate', 
      route: '/works', 
      description: 'View all projects and work',
      category: 'navigation'
    },
    'cd about': { 
      action: 'navigate', 
      route: '/about', 
      description: 'Navigate to about page',
      category: 'navigation'
    },
    'cd projects': { 
      action: 'navigate', 
      route: '/works', 
      description: 'Navigate to projects',
      category: 'navigation'
    },
    'cd blog': { 
      action: 'navigate', 
      route: '/blog', 
      description: 'Navigate to blog',
      category: 'navigation'
    },
    './about': { 
      action: 'navigate', 
      route: '/about', 
      description: 'Execute about script',
      category: 'navigation'
    },
    './about --verbose': { 
      action: 'showAboutVerbose', 
      description: 'Execute about script with verbose output',
      category: 'navigation'
    },
    'cat ~/thoughts/*': { 
      action: 'navigate', 
      route: '/blog', 
      description: 'Read all blog posts',
      category: 'navigation'
    },
    'cat welcome.txt': { 
      action: 'showWelcome', 
      description: 'Display welcome message',
      category: 'system'
    },
    'cat about.txt': { 
      action: 'showAbout', 
      description: 'Display about information',
      category: 'system'
    },
    'tree': { 
      action: 'showTree', 
      description: 'Display directory tree',
      category: 'navigation'
    },
    'date': { 
      action: 'showDate', 
      description: 'Display current date and time',
      category: 'system'
    },
    'uname -a': { 
      action: 'showSystem', 
      description: 'Display system information',
      category: 'system'
    },
    'clear': { 
      action: 'clear', 
      description: 'Clear terminal output',
      category: 'system'
    },
    'exit': { 
      action: 'exit', 
      description: 'Close command palette',
      category: 'system'
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === '/' || e.key === 'k')) {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
        setInput('');
        setSuggestions([]);
        setSelectedSuggestion(0);
        setShowOutput(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Scroll output to bottom when new content is added
  useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [output]);

  // Update suggestions based on input
  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = Object.entries(commands)
      .filter(([cmd]) => cmd.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => {
        const aCmd = a[0].toLowerCase();
        const bCmd = b[0].toLowerCase();
        const inputLower = input.toLowerCase();
        
        if (aCmd === inputLower) return -1;
        if (bCmd === inputLower) return 1;
        if (aCmd.startsWith(inputLower) && !bCmd.startsWith(inputLower)) return -1;
        if (bCmd.startsWith(inputLower) && !aCmd.startsWith(inputLower)) return 1;
        return aCmd.localeCompare(bCmd);
      })
      .slice(0, 6)
      .map(([cmd, info]) => ({ cmd, ...info }));

    setSuggestions(filtered);
    setSelectedSuggestion(0);
  }, [input]);

  const addOutput = (content, type = 'output') => {
    const timestamp = new Date().toLocaleTimeString();
    setOutput(prev => [...prev, { content, type, timestamp, id: Date.now() }]);
    setShowOutput(true);
  };

  const navigate = (route) => {
    // For Astro, we'll use window.location for navigation
    // You might want to use your preferred router method here
    addOutput(`Navigating to ${route}...`, 'success');
    setTimeout(() => {
      window.location.href = route;
    }, 1000);
  };

  const executeCommand = (command) => {
    const cmd = commands[command];
    
    // Add command to output
    addOutput(`$ ${command}`, 'command');
    
    // Add to history
    setHistory(prev => [command, ...prev.filter(h => h !== command)].slice(0, 20));
    
    if (!cmd) {
      addOutput(`bash: ${command}: command not found`, 'error');
      return;
    }
    
    switch (cmd.action) {
      case 'navigate':
        navigate(cmd.route);
        break;
        
      case 'showHelp':
        const helpContent = [
          'Available commands:',
          '',
          ...Object.entries(commands)
            .sort((a, b) => a[1].category.localeCompare(b[1].category))
            .map(([cmdName, info]) => `  ${cmdName.padEnd(20)} - ${info.description}`)
        ];
        addOutput(helpContent.join('\n'));
        break;
        
      case 'showWhoami':
        addOutput([
          'Atish Maharjan',
          'mathematician | computer_scientist | problem_solver',
          'location: University of Manitoba',
          '',
          'Skills: Mathematics, Computer Science, Web Development',
          'Currently: Building applications at Alpinist Studios'
        ].join('\n'));
        break;
        
      case 'showPwd':
        addOutput('/home/atish');
        break;
        
      case 'listDirectory':
        addOutput([
          'total 8',
          'drwxr-xr-x  3 atish atish 4096 Jan 30 12:00 projects/',
          'drwxr-xr-x  2 atish atish 4096 Jan 30 12:00 research/',
          'drwxr-xr-x  2 atish atish 4096 Jan 30 12:00 thoughts/',
          '-rw-r--r--  1 atish atish  256 Jan 30 12:00 about.txt',
          '-rw-r--r--  1 atish atish  128 Jan 30 12:00 welcome.txt',
          '-rwxr-xr-x  1 atish atish  512 Jan 30 12:00 about*'
        ].join('\n'));
        break;
        
      case 'showWelcome':
        addOutput([
          '=== Welcome to Atish\'s Terminal Interface ===',
          '',
          'Hey there! Welcome to my interactive terminal.',
          '',
          'I\'m a mathematician and computer scientist currently',
          'studying at the University of Manitoba and building',
          'web applications at Alpinist Studios.',
          '',
          'Type "help" to see available commands or start exploring!',
          '',
          'Quick navigation:',
          '• cd about    - Learn more about me',
          '• cd projects - View my work',
          '• cd blog     - Read my thoughts',
          '',
          'Happy exploring! 🚀'
        ].join('\n'));
        break;
        
      case 'showAbout':
        addOutput([
          '=== About Atish Maharjan ===',
          '',
          'A passionate mathematician and computer scientist with a love',
          'for solving complex problems and building innovative solutions.',
          '',
          'Education: University of Manitoba',
          'Focus: Mathematics & Computer Science',
          'Current Role: Developer at Alpinist Studios',
          '',
          'Interests: Algorithm design, mathematical modeling,',
          'web development, and exploring the intersection of',
          'mathematics and technology.',
          '',
          'For more details, try: ./about --verbose'
        ].join('\n'));
        break;
        
      case 'showAboutVerbose':
        addOutput([
          '=== Detailed About Information ===',
          '',
          'Name: Atish Maharjan',
          'Role: Mathematician | Computer Scientist | Problem Solver',
          'Location: University of Manitoba, Canada',
          '',
          '--- Background ---',
          'Currently pursuing advanced studies in Mathematics and',
          'Computer Science, with a focus on algorithmic problem',
          'solving and mathematical modeling.',
          '',
          '--- Professional Experience ---',
          '• Developer at Alpinist Studios',
          '• Research in computational mathematics',
          '• Web application development',
          '',
          '--- Skills & Interests ---',
          '• Mathematics: Analysis, Algebra, Discrete Math',
          '• Programming: Multiple languages and frameworks',
          '• Problem Solving: Algorithmic thinking',
          '• Research: Mathematical modeling',
          '',
          '--- Philosophy ---',
          '"At the intersection of mathematics and computer science',
          'lies the power to solve some of the world\'s most',
          'interesting problems."',
          '',
          'Ready to navigate to my full profile? Try: cd about'
        ].join('\n'));
        navigate('/about');
        break;
        
      case 'showTree':
        addOutput([
          '.',
          '├── projects/',
          '│   ├── web-apps/',
          '│   ├── algorithms/',
          '│   └── research/',
          '├── thoughts/',
          '│   ├── mathematics/',
          '│   ├── technology/',
          '│   └── philosophy/',
          '├── research/',
          '│   ├── papers/',
          '│   └── experiments/',
          '├── about.txt',
          '├── welcome.txt',
          '└── about*'
        ].join('\n'));
        break;
        
      case 'showDate':
        const now = new Date();
        addOutput([
          now.toDateString(),
          now.toLocaleTimeString(),
          `Timezone: ${Intl.DateTimeFormat().resolvedOptions().timeZone}`
        ].join('\n'));
        break;
        
      case 'showSystem':
        addOutput([
          'AtishOS 1.0.0 (Mathematical Computing Environment)',
          'Kernel: Brain v2.5.0-mathematician',
          'Architecture: x86_64-problem-solver',
          'Uptime: Continuously learning since birth',
          'Shell: /bin/curiosity',
          'Environment: University of Manitoba',
          'Current Process: Building awesome things'
        ].join('\n'));
        break;
        
      case 'clear':
        setOutput([]);
        setShowOutput(false);
        addOutput('Terminal cleared', 'success');
        break;
        
      case 'exit':
        addOutput('Goodbye! 👋', 'success');
        setTimeout(() => {
          setIsOpen(false);
          setOutput([]);
          setShowOutput(false);
        }, 1000);
        break;
        
      default:
        addOutput(`Executed: ${command}`, 'success');
    }

    setInput('');
    setSuggestions([]);
    setSelectedSuggestion(0);
  };

  const handleKeyDown = (e) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        if (suggestions.length > 0) {
          executeCommand(suggestions[selectedSuggestion].cmd);
        } else if (input.trim()) {
          executeCommand(input.trim());
        }
        setInput("");
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion(prev => 
            prev > 0 ? prev - 1 : suggestions.length - 1
          );
        } else if (history.length > 0) {
          const newIndex = historyIndex < history.length - 1 ? historyIndex + 1 : historyIndex;
          setHistoryIndex(newIndex);
          setInput(history[newIndex] || '');
        }
        break;
      case 'ArrowDown':
        e.preventDefault();
        if (suggestions.length > 0) {
          setSelectedSuggestion(prev => 
            prev < suggestions.length - 1 ? prev + 1 : 0
          );
        } else if (historyIndex > -1) {
          const newIndex = historyIndex > 0 ? historyIndex - 1 : -1;
          setHistoryIndex(newIndex);
          setInput(newIndex >= 0 ? history[newIndex] : '');
        }
        break;
      case 'Tab':
        e.preventDefault();
        if (suggestions.length > 0) {
          setInput(suggestions[selectedSuggestion].cmd);
          setSuggestions([]);
        }
        break;
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-gray-900 text-green-400 px-4 py-2 rounded border border-green-500 font-mono text-xs hover:bg-gray-800 transition-all duration-300 shadow-lg hover:shadow-green-500/20"
        >
          <span className="opacity-60">Press </span>
          <kbd className="bg-gray-700 px-1 rounded">Ctrl</kbd>
          <span className="opacity-60"> + </span>
          <kbd className="bg-gray-700 px-1 rounded">/</kbd>
          <span className="opacity-60"> for terminal</span>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center pt-16 z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 border-b border-green-500 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-green-400 font-mono text-sm ml-4">atish@terminal:~</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-sm transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 flex flex-col min-h-0">
          {/* Output Section */}
          {showOutput && (
            <div 
              ref={outputRef}
              className="flex-1 p-4 overflow-y-auto bg-gray-950 border-b border-gray-700"
              style={{ maxHeight: '50%' }}
            >
              {output.map((item) => (
                <div key={item.id} className="mb-2">
                  <pre className={`font-mono text-sm whitespace-pre-wrap ${
                    item.type === 'command' ? 'text-cyan-400' :
                    item.type === 'error' ? 'text-red-400' :
                    item.type === 'success' ? 'text-green-400' :
                    'text-green-300'
                  }`}>
                    {item.content}
                  </pre>
                </div>
              ))}
            </div>
          )}

          {/* Command Input Section */}
          <div className="p-4 flex-shrink-0">
            <div className="flex items-center space-x-2 mb-4">
              <span className="text-green-400 font-mono">$</span>
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a command..."
                className="flex-1 bg-transparent text-green-400 font-mono outline-none placeholder-gray-500"
                autoComplete="off"
              />
            </div>

            {/* Suggestions */}
            {suggestions.length > 0 && (
              <div className="space-y-1 mb-4">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={suggestion.cmd}
                    className={`flex items-center justify-between p-2 rounded cursor-pointer font-mono text-sm transition-colors ${
                      index === selectedSuggestion
                        ? 'bg-green-900 bg-opacity-30 border border-green-500'
                        : 'hover:bg-gray-800'
                    }`}
                    onClick={() => executeCommand(suggestion.cmd)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        suggestion.category === 'navigation' 
                          ? 'bg-blue-900 text-blue-300' 
                          : 'bg-yellow-900 text-yellow-300'
                      }`}>
                        {suggestion.category}
                      </span>
                      <span className="text-green-400">{suggestion.cmd}</span>
                    </div>
                    <span className="text-gray-400 text-xs">{suggestion.description}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Help Text */}
            <div className="pt-4 border-t border-gray-700">
              <div className="text-gray-400 text-xs font-mono space-y-1">
                <div>↑↓ Navigate • Tab Complete • Enter Execute • Esc Close</div>
                <div>Try: help, whoami, ls, tree, cat welcome.txt, ./about --verbose</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalSpotlight;
