const modalStyles = `
    @keyframes modalOverlayOpen {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }
    @keyframes modalContentOpen {
        from {
            opacity: 0;
            transform: scale(0.95);
        }
        to {
            opacity: 1;
            transform: scale(1);
        }
    }
    .modal-overlay {
        animation: modalOverlayOpen 0.3s ease-out;
    }
    .modal-content {
        animation: modalContentOpen 0.3s ease-out;
    }
`;

if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.textContent = modalStyles;
    document.head.appendChild(style);
}

export default function Modal({
    children,
    show = false,
    maxWidth = '2xl',
    closeable = true,
    onClose = () => {},
}) {
    const close = () => {
        if (closeable) {
            onClose();
        }
    };

    const maxWidths = {
        sm: '384px',
        md: '448px',
        lg: '512px',
        xl: '576px',
        '2xl': '672px',
    };

    if (!show) return null;

    return (
        <div
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
            }}
        >
            {/* Overlay */}
            <div
                className="modal-overlay"
                style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.5)',
                    cursor: 'pointer',
                }}
                onClick={close}
            />

            {/* Modal Content */}
            <div
                className="modal-content"
                style={{
                    position: 'relative',
                    zIndex: 51,
                    backgroundColor: '#fff',
                    borderRadius: '8px',
                    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
                    maxWidth: maxWidths[maxWidth] || maxWidths['2xl'],
                    width: '100%',
                    maxHeight: '90vh',
                    overflow: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
            >
                {children}
            </div>
        </div>
    );
}
