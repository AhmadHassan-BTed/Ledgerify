import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { ServiceProvider } from './context/ServiceContext';
import { ThemeProvider } from './context/ThemeContext';
import { DataProvider } from './context/DataContext';
import { FilterProvider } from './context/FilterContext';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider>
      <ServiceProvider>
        <DataProvider>
          <FilterProvider>
            <App />
          </FilterProvider>
        </DataProvider>
      </ServiceProvider>
    </ThemeProvider>
  </React.StrictMode>
);
