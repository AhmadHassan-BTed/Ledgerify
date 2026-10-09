import React, { createContext, useContext } from 'react';
import { IAppContainer, appContainer } from '../core/di/container';

const ServiceContext = createContext<IAppContainer>(appContainer);

export const ServiceProvider: React.FC<{
  container?: IAppContainer;
  children: React.ReactNode;
}> = ({ container = appContainer, children }) => {
  return (
    <ServiceContext.Provider value={container}>
      {children}
    </ServiceContext.Provider>
  );
};

export const useServices = (): IAppContainer => {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
};
