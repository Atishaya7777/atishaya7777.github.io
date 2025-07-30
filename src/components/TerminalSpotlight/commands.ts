export const commands = {
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
