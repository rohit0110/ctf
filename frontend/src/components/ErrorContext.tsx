import { createContext, useContext, useState } from "react";

type ErrorContextType = {
  error: string | null;
  showError: (msg: string) => void;
  clearError: () => void;
};

const ErrorContext = createContext<ErrorContextType>({
  error: null,
  showError: () => {},
  clearError: () => {},
});

export function ErrorProvider({ children }: { children: React.ReactNode }) {
  const [error, setError] = useState<string | null>(null);

  const showError = (msg: string) => {
    setError(msg);
  };

  const clearError = () => setError(null);

  return (
    <ErrorContext.Provider value={{ error ,showError, clearError }}>
      {children}
    </ErrorContext.Provider>
  );
}

export const useError = () => useContext(ErrorContext);
