"use client";
import { createContext, useContext, useState } from 'react';

const LoaderContext = createContext();

export function LoaderProvider({ children }) {
  const [loaderCompleted, setLoaderCompleted] = useState(false);

  return (
    <LoaderContext.Provider value={{ loaderCompleted, setLoaderCompleted }}>
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error('useLoader must be used within LoaderProvider');
  }
  return context;
}
