'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substring(2, 9);
    const newToast: Toast = {
      id,
      duration: 5000,
      ...toast,
    };

    setToasts(prev => [...prev, newToast]);

    // Auto remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToast();


  const getIcon = (type: ToastType) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-400" />;
      default:
        return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  const getBorderColor = (type: ToastType) => {
    switch (type) {
      case 'success':
        return 'border-green-500/30';
      case 'error':
        return 'border-red-500/30';
      case 'warning':
        return 'border-yellow-500/30';
      case 'info':
        return 'border-blue-500/30';
      default:
        return 'border-blue-500/30';
    }
  };

  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      // Prefer an explicit portal root element by id. If one exists but isn't
      // attached to document.body (e.g., accidentally nested), move it there.
      let root = document.getElementById('toast-root');

      if (root && root.parentElement !== document.body) {
        document.body.appendChild(root);
      }

      // If no root exists, create one and append it to body to guarantee it's
      // top-level and unaffected by app layout transforms.
      if (!root) {
        root = document.createElement('div');
        root.id = 'toast-root';
        document.body.appendChild(root);
      }

      // Ensure root is direct child of body
      if (root.parentElement !== document.body) {
        document.body.appendChild(root);
      }

      // Inject strong CSS to guarantee top-level fixed top-center positioning
      if (!document.getElementById('toast-root-style')) {
        const style = document.createElement('style');
        style.id = 'toast-root-style';
        style.innerHTML = `#toast-root { position: fixed !important; top: 0 !important; left: 0 !important; width: 100% !important; pointer-events: none !important; z-index: 99999999 !important; display: flex !important; justify-content: center !important; align-items: flex-start !important; padding: 24px !important; }`;
        document.head.appendChild(style);
      }

      setPortalRoot(root as HTMLElement);
    }
  }, []);

  const toastContainer = (
    <div className="flex flex-col items-center space-y-2 w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`bg-black/90 backdrop-blur-md border ${getBorderColor(toast.type)} rounded-lg p-4 shadow-lg max-w-sm animate-in slide-in-from-top fade-in duration-300 pointer-events-auto`}
          style={{ marginTop: '4px' }}
        >
          <div className="flex items-start gap-3">
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h4 className="text-white text-sm font-medium">{toast.title}</h4>
              {toast.message && (
                <p className="text-zinc-300 text-sm mt-1">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  return portalRoot ? createPortal(toastContainer, portalRoot) : null;
};