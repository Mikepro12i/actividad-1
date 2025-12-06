import React, { createContext, useState, useContext } from 'react';
// ^^ He quitado 'useEffect' de aquí arriba para que no de error.

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark');

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`app-container ${theme}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
};

// Agregamos esta linea para que Vite no marque error en la exportación:
// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeContext); 