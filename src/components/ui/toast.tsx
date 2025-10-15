'use client';

import * as React from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export interface ToastProps {
  id: string;
  title?: string;
  description?: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
  onClose?: () => void;
}

export interface ToastState {
  toasts: ToastProps[];
}

type ToastActionType = 
  | { type: 'ADD_TOAST'; toast: ToastProps }
  | { type: 'REMOVE_TOAST'; id: string }
  | { type: 'CLEAR_ALL' };

const toastReducer = (state: ToastState, action: ToastActionType): ToastState => {
  switch (action.type) {
    case 'ADD_TOAST':
      return {
        ...state,
        toasts: [...state.toasts, action.toast],
      };
    case 'REMOVE_TOAST':
      return {
        ...state,
        toasts: state.toasts.filter((toast) => toast.id !== action.id),
      };
    case 'CLEAR_ALL':
      return {
        ...state,
        toasts: [],
      };
    default:
      return state;
  }
};

const ToastContext = React.createContext<{
  toasts: ToastProps[];
  addToast: (toast: Omit<ToastProps, 'id'>) => void;
  removeToast: (id: string) => void;
  clearAll: () => void;
} | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = React.useReducer(toastReducer, { toasts: [] });

  const addToast = React.useCallback((toast: Omit<ToastProps, 'id'>) => {
    // Check for duplicate toasts based on title and description
    const isDuplicate = state.toasts.some(existingToast => 
      existingToast.title === toast.title && 
      existingToast.description === toast.description &&
      existingToast.type === toast.type
    );
    
    if (isDuplicate) {
      return; // Don't add duplicate toast
    }

    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      duration: toast.duration ?? 3000, // Slightly increased for better readability
    };
    
    dispatch({ type: 'ADD_TOAST', toast: newToast });

    // Auto-remove toast after duration (unless it has an action)
    if (newToast.duration && newToast.duration > 0 && !newToast.action) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, newToast.duration);
    } else if (newToast.action) {
      // For toasts with actions, auto-remove after 5 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, 5000);
    }
  }, [state.toasts]);

  const removeToast = React.useCallback((toastId: string) => {
    dispatch({ type: 'REMOVE_TOAST', id: toastId });
  }, []);

  const clearAll = React.useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, addToast, removeToast, clearAll }}>
      {children}
      <ToastContainer toasts={state.toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = React.useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

function ToastContainer({ toasts, onRemove }: { toasts: ToastProps[]; onRemove: (id: string) => void }) {
  return (
    <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onClose={() => onRemove(toast.id)} />
      ))}
    </div>
  );
}

function Toast({ title, description, type = 'info', action, onClose }: ToastProps) {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'bg-white dark:bg-gray-900 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300',
    error: 'bg-white dark:bg-gray-900 border-red-200 dark:border-red-800 text-red-700 dark:text-red-300',
    warning: 'bg-white dark:bg-gray-900 border-yellow-200 dark:border-yellow-800 text-yellow-700 dark:text-yellow-300',
    info: 'bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300',
  };

  const iconColors = {
    success: 'text-green-600 dark:text-green-400',
    error: 'text-red-600 dark:text-red-400',
    warning: 'text-yellow-600 dark:text-yellow-400',
    info: 'text-blue-600 dark:text-blue-400',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 border rounded-lg shadow-lg backdrop-blur-sm animate-in slide-in-from-right-full duration-300',
        colors[type]
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[type])} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-semibold text-sm mb-1">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-80">{description}</div>
        )}
        
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="h-8 px-3 text-xs font-medium"
            >
              {action.label}
            </Button>
          </div>
        )}
      </div>

      <Button
        variant="ghost"
        size="sm"
        onClick={onClose}
        className="h-6 w-6 p-0 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}