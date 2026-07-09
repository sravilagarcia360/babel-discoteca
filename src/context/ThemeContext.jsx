import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  useEffect(() => {
    // Definimos los colores para la barra superior (meta theme-color)
    const darkColor = '#020617'; // slate-950
    const lightColor = '#f1f5f9'; // slate-100

    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      metaThemeColor.setAttribute('content', darkColor);
    } else {
      document.documentElement.classList.remove('dark');
      metaThemeColor.setAttribute('content', lightColor);
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
