import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
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
};

export default function Connector() {
    const [shopDomain, setShopDomain] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

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

    return (
        <AuthenticatedLayout header="Connect Shopify Store">
            <Head title="Connect Store" />

            <div style={styles.container}>
                <div style={styles.card}>
                    <div style={styles.icon}>🛍️</div>
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
                            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
                        >
                            {loading ? '⏳ Connecting...' : '🔗 Connect Store'}
                        </button>
                    </form>

                    <div style={styles.footer}>
                        <p>✨ You'll be redirected to Shopify to authorize the app securely</p>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
