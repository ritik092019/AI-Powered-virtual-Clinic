import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import { Alert } from '../ui/Alert';
import { motion, AnimatePresence } from 'motion/react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useNotification();

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="pointer-events-auto"
          >
            <Alert
              variant={toast.type}
              title={toast.title}
              onDismiss={() => removeToast(toast.id)}
            >
              {toast.message}
            </Alert>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
