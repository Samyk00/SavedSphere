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
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      ...toast,
      id,
      duration: toast.duration ?? 5000,
    };
    
    dispatch({ type: 'ADD_TOAST', toast: newToast });

    // Auto-remove toast after duration (unless it has an action)
    if (newToast.duration && newToast.duration > 0 && !newToast.action) {
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, newToast.duration);
    } else if (newToast.action) {
      // For toasts with actions, auto-remove after 8 seconds
      setTimeout(() => {
        dispatch({ type: 'REMOVE_TOAST', id });
      }, 8000);
    }
  }, []);

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
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
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
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconColors = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const Icon = icons[type];

  return (
    <div
      className={cn(
        'relative flex items-start gap-3 p-4 border rounded-lg shadow-lg animate-in slide-in-from-right-full duration-300',
        colors[type]
      )}
    >
      <Icon className={cn('h-5 w-5 mt-0.5 flex-shrink-0', iconColors[type])} />
      
      <div className="flex-1 min-w-0">
        {title && (
          <div className="font-medium text-sm mb-1">{title}</div>
        )}
        {description && (
          <div className="text-sm opacity-90">{description}</div>
        )}
        
        {action && (
          <div className="mt-3">
            <Button
              variant="outline"
              size="sm"
              onClick={action.onClick}
              className="h-8 px-3 text-xs"
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
        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}