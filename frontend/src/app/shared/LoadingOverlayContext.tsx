'use client';

import React, { createContext, useState, useContext, FC } from 'react';
import { ReactNode } from 'react';

interface LoadingOverlayProviderProps {
  children: ReactNode;
}

export interface LoadingOverlayContextProps {
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
}

export const LoadingOverlayContext = createContext<LoadingOverlayContextProps>(
  {} as LoadingOverlayContextProps,
);

export const LoadingOverlayProvider: FC<LoadingOverlayProviderProps> = ({
  children,
}: LoadingOverlayProviderProps) => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  return (
    <LoadingOverlayContext.Provider value={{ isLoading, setIsLoading }}>
      {children}
    </LoadingOverlayContext.Provider>
  );
};
