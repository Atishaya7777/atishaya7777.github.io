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
    'cd ~': {
      action: 'navigate',
      route: '/',
      description: 'Navigate back to home page',
      category: 'navigation'
    },
    'cd about': { 
      action: 'navigate', 
      route: '/about', 
      description: 'Navigate to about page',
      category: 'navigation'
    },
    'cd works': { 
      action: 'navigate', 
      route: '/works', 
      description: 'Navigate to works',
      category: 'navigation'
    },
    'cd blog': { 
      action: 'navigate', 
      route: '/blog', 
      description: 'Navigate to blog',
      category: 'navigation'
    },
    'cd contact': { 
      action: 'navigate', 
      route: '/contact', 
      description: 'Navigate to contact',
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
    },
    'discuss --topic="graph_theory" --depth="infinite"': {
      action: 'navigate',
      route: '/contact',
      description: 'Discuss graph theory and mathematics',
      category: 'contact'
    },
    'npm run discuss --framework="any" --bugs="welcome"': {
      action: 'navigate',
      route: '/contact',
      description: 'Talk about web development',
      category: 'contact'
    },
    'share --experience="grad_school" --advice="freely"': {
      action: 'navigate',
      route: '/contact',
      description: 'Share academic experiences',
      category: 'contact'
    },
    'help --mutual --learning="continuous"': {
      action: 'navigate',
      route: '/contact',
      description: 'Get help or share knowledge',
      category: 'contact'
    }
  };
