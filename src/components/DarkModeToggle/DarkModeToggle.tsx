import { useEffect, useState } from 'react';

export default function DarkModeToggle() {
    const [dark, setDark] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const stored = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDark = stored ? stored === 'dark' : prefersDark;
        setDark(isDark);
    }, []);

    useEffect(() => {
        if (!mounted) return;
        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [dark, mounted]);

    if (!mounted) {
        return (
            <button
                aria-label="Toggle dark mode"
                className="w-8 h-8 flex items-center justify-center text-primary-600 dark:text-background-300 hover:text-primary-900 dark:hover:text-background-100 transition-colors"
            >
                <span className="text-sm">○</span>
            </button>
        );
    }

    return (
        <button
            onClick={() => setDark(!dark)}
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-8 h-8 flex items-center justify-center text-primary-600 dark:text-background-300 hover:text-primary-900 dark:hover:text-background-100 transition-colors"
        >
            {dark ? (
                // Sun icon
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <line x1="12" y1="1" x2="12" y2="3" />
                    <line x1="12" y1="21" x2="12" y2="23" />
                    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                    <line x1="1" y1="12" x2="3" y2="12" />
                    <line x1="21" y1="12" x2="23" y2="12" />
                    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
            ) : (
                // Moon icon
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
            )}
        </button>
    );
}
