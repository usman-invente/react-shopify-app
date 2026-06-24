import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, router } from '@inertiajs/react';
import { useState } from 'react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '600px',
        padding: '40px 20px',
    },
    card: {
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '40px 32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
        textAlign: 'center',
    },
    icon: {
        fontSize: '64px',
        marginBottom: '24px',
    },
    title: {
        fontSize: '28px',
        fontWeight: '700',
        color: '#000',
        marginBottom: '12px',
    },
    subtitle: {
        fontSize: '14px',
        color: '#666',
        lineHeight: '1.6',
        marginBottom: '32px',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    input: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        boxSizing: 'border-box',
        fontFamily: 'inherit',
    },
    button: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s',
    },
    uninstallButton: {
        width: '100%',
        padding: '12px 16px',
        fontSize: '16px',
        fontWeight: '600',
        backgroundColor: '#fff',
        color: '#dc2626',
        border: '1px solid #dc2626',
        borderRadius: '6px',
        cursor: 'pointer',
        transition: 'background-color 0.2s, color 0.2s',
        marginTop: '12px',
    },
    error: {
        padding: '12px 16px',
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        borderRadius: '6px',
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '16px',
    },
    footer: {
        textAlign: 'center',
        marginTop: '20px',
        fontSize: '12px',
        color: '#999',
    },
    badge: {
        display: 'inline-block',
        backgroundColor: '#ecfdf5',
        color: '#065f46',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        marginBottom: '16px',
    },
    connectedBadge: {
        display: 'inline-block',
        backgroundColor: '#ecfdf5',
        color: '#065f46',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '500',
        marginBottom: '16px',
    },
    shopName: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#374151',
        backgroundColor: '#f9fafb',
        border: '1px solid #e5e7eb',
        borderRadius: '6px',
        padding: '12px 16px',
        marginBottom: '8px',
        wordBreak: 'break-all',
    },
    divider: {
        border: 'none',
        borderTop: '1px solid #e5e7eb',
        margin: '24px 0',
    },
};

export default function Connector({ connectedShop }) {
    const [shopDomain, setShopDomain] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [uninstalling, setUninstalling] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleConnect = (e) => {
        e.preventDefault();
        setError('');

        if (!shopDomain.trim()) {
            setError('Please enter your shop domain');
            return;
        }

        let domain = shopDomain.trim().toLowerCase();
        if (!domain.includes('.myshopify.com')) {
            if (domain.includes('.')) {
                domain = domain.split('.')[0];
            }
            domain = `${domain}.myshopify.com`;
        }

        setLoading(true);
        window.location.href = `/authenticate?shop=${encodeURIComponent(domain)}`;
    };

    const handleUninstall = async () => {
        if (!showConfirm) {
            setShowConfirm(true);
            return;
        }

        try {
            setUninstalling(true);
            setError('');

            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

            const response = await fetch('/connector/uninstall', {
                method: 'POST',
                credentials: 'same-origin',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken || '',
                },
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to uninstall');
            }

            router.visit(route('connector'));
        } catch (err) {
            setError(err.message || 'An error occurred during uninstall');
            setUninstalling(false);
        }
    };

    return (
        <AuthenticatedLayout header="Connect Shopify Store">
            <Head title="Connect Store" />

            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>🛍️</div>

                    {connectedShop ? (
                        <>
                            <div style={styles.connectedBadge}>Connected</div>
                            <h1 style={styles.title}>Store Connected</h1>
                            <p style={styles.subtitle}>
                                Your Shopify store is currently connected to this app.
                            </p>

                            {error && <div style={styles.error}>⚠️ {error}</div>}

                            <div style={styles.shopName}>{connectedShop.name}</div>

                            <hr style={styles.divider} />

                            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '12px' }}>
                                To connect a different store, uninstall first.
                            </p>

                            {showConfirm ? (
                                <>
                                    <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '12px', fontWeight: '500' }}>
                                        This will uninstall the app from your Shopify store and disconnect it from this app.
                                    </p>
                                    <div style={{ display: 'flex', gap: '12px' }}>
                                        <button
                                            style={{ ...styles.uninstallButton, flex: 1, marginTop: 0 }}
                                            onClick={handleUninstall}
                                            disabled={uninstalling}
                                        >
                                            {uninstalling ? 'Uninstalling...' : 'Yes, Uninstall'}
                                        </button>
                                        <button
                                            style={{ ...styles.button, flex: 1, backgroundColor: '#6b7280' }}
                                            onClick={() => setShowConfirm(false)}
                                            disabled={uninstalling}
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <button
                                    style={styles.uninstallButton}
                                    onClick={handleUninstall}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.backgroundColor = '#dc2626';
                                        e.currentTarget.style.color = '#fff';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.backgroundColor = '#fff';
                                        e.currentTarget.style.color = '#dc2626';
                                    }}
                                >
                                    Uninstall App
                                </button>
                            )}
                        </>
                    ) : (
                        <>
                            <div style={styles.badge}>Quick Setup</div>
                            <h1 style={styles.title}>Connect Your Shopify Store</h1>
                            <p style={styles.subtitle}>
                                Enter your Shopify store domain to connect and start managing your products.
                            </p>

                            {error && <div style={styles.error}>⚠️ {error}</div>}

                            <form style={styles.form} onSubmit={handleConnect}>
                                <input
                                    type="text"
                                    style={styles.input}
                                    placeholder="example.myshopify.com"
                                    value={shopDomain}
                                    onChange={(e) => setShopDomain(e.target.value)}
                                    disabled={loading}
                                    autoFocus
                                />
                                <button
                                    type="submit"
                                    style={styles.button}
                                    disabled={loading}
                                    onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = '#1f2937')}
                                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#000')}
                                >
                                    {loading ? '⏳ Connecting...' : '🔗 Connect Store'}
                                </button>
                            </form>

                            <div style={styles.footer}>
                                <p>✨ You'll be redirected to Shopify to authorize the app securely</p>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
