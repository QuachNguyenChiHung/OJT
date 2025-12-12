import { useState, useEffect, createContext, useContext, useCallback } from 'react';

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within ToastProvider');
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now();
        setToasts(prev => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts(prev => prev.filter(t => t.id !== id));
        }, duration);
    }, []);

    const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
    const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
    const warning = useCallback((msg) => addToast(msg, 'warning'), [addToast]);
    const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

    return (
        <ToastContext.Provider value={{ success, error, warning, info }}>
            {children}
            <ToastContainer toasts={toasts} />
        </ToastContext.Provider>
    );
};

const ToastContainer = ({ toasts }) => {
    if (toasts.length === 0) return null;

    return (
        <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
        }}>
            {toasts.map(toast => (
                <ToastItem key={toast.id} {...toast} />
            ))}
        </div>
    );
};


const ToastItem = ({ message, type }) => {
    const colors = {
        success: { bg: '#d4edda', border: '#28a745', text: '#155724' },
        error: { bg: '#f8d7da', border: '#dc3545', text: '#721c24' },
        warning: { bg: '#fff3cd', border: '#ffc107', text: '#856404' },
        info: { bg: '#d1ecf1', border: '#17a2b8', text: '#0c5460' }
    };
    const color = colors[type] || colors.info;

    const icons = {
        success: '✓',
        error: '✕',
        warning: '⚠',
        info: 'ℹ'
    };

    return (
        <div style={{
            padding: '12px 20px',
            borderRadius: '8px',
            backgroundColor: color.bg,
            border: `1px solid ${color.border}`,
            color: color.text,
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            minWidth: '280px',
            maxWidth: '400px',
            animation: 'slideIn 0.3s ease'
        }}>
            <span style={{ fontSize: '18px' }}>{icons[type]}</span>
            <span style={{ flex: 1 }}>{message}</span>
        </div>
    );
};

// CSS animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
`;
if (!document.querySelector('#toast-styles')) {
    style.id = 'toast-styles';
    document.head.appendChild(style);
}

export default ToastProvider;
