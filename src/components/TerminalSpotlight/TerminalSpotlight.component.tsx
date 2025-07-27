import React, { useState, useEffect, useRef } from 'react';

const TerminalSpotlight = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(0);
  const inputRef = useRef(null);

  // Available commands and their routes
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
      action: 'navigate', 
      route: '/about', 
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

  // Open spotlight with Ctrl+/ or Cmd+K
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

  // Update suggestions based on input
  useEffect(() => {
    if (input.trim() === '') {
      setSuggestions([]);
      return;
    }

    const filtered = Object.entries(commands)
      .filter(([cmd]) => cmd.toLowerCase().includes(input.toLowerCase()))
      .sort((a, b) => {
        // Exact matches first, then startsWith, then contains
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

  const executeCommand = (command) => {
    const cmd = commands[command];
    if (!cmd) {
      alert(`bash: ${command}: command not found`);
      return;
    }

    // Add to history
    setHistory(prev => [command, ...prev.filter(h => h !== command)].slice(0, 20));
    
    switch (cmd.action) {
      case 'navigate':
        // In a real implementation, you'd use your router here
        alert(`Navigating to: ${cmd.route}`);
        break;
      case 'showHelp':
        alert('Available commands:\n\n' + 
          Object.entries(commands)
            .map(([cmd, info]) => `${cmd.padEnd(20)} - ${info.description}`)
            .join('\n'));
        break;
      case 'showWhoami':
        alert('Atish Maharjan\nmathematician | computer_scientist | problem_solver\nlocation: University of Manitoba');
        break;
      case 'showPwd':
        alert('/home/atish');
        break;
      case 'listDirectory':
        alert('total 8\ndrwxr-xr-x  projects/\ndrwxr-xr-x  research/\n-rw-r--r--  about.txt\n-rw-r--r--  welcome.txt');
        break;
      case 'showWelcome':
        alert('Hey there! Welcome to my terminal interface.\n\nI\'m a mathematician and computer scientist currently studying at the University of Manitoba and building web applications at Alpinist Studios.');
        break;
      case 'clear':
        alert('Terminal cleared');
        break;
      case 'exit':
        setIsOpen(false);
        break;
      default:
        alert(`Command executed: ${command}`);
    }

    setIsOpen(false);
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
          className="bg-gray-900 text-green-400 px-4 py-2 rounded border border-green-500 font-mono text-xs hover:bg-gray-800 transition-all duration-300 shadow-lg"
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
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-start justify-center pt-32 z-50">
      <div className="bg-gray-900 border-2 border-green-500 rounded-lg shadow-2xl max-w-2xl w-full mx-4">
        {/* Terminal Header */}
        <div className="bg-gray-800 px-4 py-2 border-b border-green-500 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-green-400 font-mono text-sm ml-4">atish@terminal:~</span>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-white text-sm"
          >
            ✕
          </button>
        </div>

        {/* Command Input */}
        <div className="p-4">
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
            <div className="space-y-1">
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
          <div className="mt-4 pt-4 border-t border-gray-700">
            <div className="text-gray-400 text-xs font-mono space-y-1">
              <div>↑↓ Navigate • Tab Complete • Enter Execute • Esc Close</div>
              <div>Try: help, whoami, ls, cd about, ./about --verbose</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerminalSpotlight;
