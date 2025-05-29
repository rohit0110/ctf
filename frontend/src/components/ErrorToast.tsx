import { useEffect } from "react";
import { useError } from './ErrorContext';
import { AnimatePresence, motion } from "framer-motion";

export const ErrorToast = () => {
  const { error, clearError } = useError();

  useEffect(() => {
    if (error) {
      const timeout = setTimeout(clearError, 4000);
      return () => clearTimeout(timeout);
    }
  }, [error, clearError]);

  return (
    <AnimatePresence>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-4 right-4 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl z-50 max-w-sm"
          style={ {zIndex: 1000 , backgroundColor: '#f87171'} }
          
        >
          <strong className="font-semibold">Error:</strong> {error}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
