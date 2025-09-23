'use client';

import { useTheme } from '@/contexts/theme-context';

export default function ThemeTest() {
  const { theme, toggleTheme } = useTheme();
  
  try {
    
    const handleToggle = () => {
      console.log('Button clicked, current theme:', theme);
      const htmlElement = document.documentElement;
      console.log('HTML element classes before toggle:', htmlElement.className);
      console.log('HTML element classList:', Array.from(htmlElement.classList));
      
      toggleTheme();
      
      // Check again after a short delay
      setTimeout(() => {
        console.log('HTML element classes after toggle:', htmlElement.className);
        console.log('HTML element classList after:', Array.from(htmlElement.classList));
      }, 100);
    };
    
    return (
      <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-black dark:text-white p-3 rounded-lg shadow-lg">
        <p className="text-sm font-medium">Current Theme: <span className="font-bold">{theme}</span></p>
        <p className="text-xs text-gray-500 dark:text-gray-400">HTML has dark class: {document.documentElement.classList.contains('dark') ? 'YES' : 'NO'}</p>
        <button 
          onClick={handleToggle} 
          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded mt-2 text-sm font-medium transition-colors"
        >
          Switch to {theme === 'light' ? 'Dark' : 'Light'}
        </button>
        <div className="mt-2 text-xs">
          <div className="bg-gray-100 dark:bg-gray-700 p-1 rounded">Tailwind Test: This should change color</div>
          <div className="test-dark-mode p-1 rounded mt-1 bg-gray-200">Custom CSS Test: This should also change</div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="fixed top-4 right-4 z-50 bg-red-500 text-white p-3 rounded-lg">
        <p className="text-sm">Error: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }
}
