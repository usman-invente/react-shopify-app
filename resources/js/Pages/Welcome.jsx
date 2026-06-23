import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

const styles = {
    page: {
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        flexDirection: 'column',
    },
    navbar: {
        backgroundColor: '#fff',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    logo: {
        fontSize: '24px',
        fontWeight: '700',
        color: '#000',
    },
    navLinks: {
        display: 'flex',
        gap: '16px',
    },
    navLink: {
        padding: '8px 16px',
        fontSize: '14px',
        color: '#0073e6',
        textDecoration: 'none',
        borderRadius: '4px',
        transition: 'background-color 0.2s',
    },
    container: {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
    },
    content: {
        width: '100%',
        maxWidth: '500px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '40px 32px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        border: '1px solid #e5e7eb',
    },
    header: {
        textAlign: 'center',
        marginBottom: '32px',
    },
    icon: {
        fontSize: '48px',
        marginBottom: '16px',
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

export default function Welcome({ auth }) {
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

    if (auth.user) {
        return (
            <>
                <Head title="Welcome" />
                <div style={styles.page}>
                    <div style={styles.navbar}>
                        <div style={styles.logo}>🛒 Shopify</div>
                        <div style={styles.navLinks}>
                            <Link href={route('dashboard')} style={styles.navLink}>
                                Dashboard
                            </Link>
                            <Link href={route('logout')} method="post" as="button" style={styles.navLink}>
                                Log Out
                            </Link>
                        </div>
                    </div>

                    <div style={styles.container}>
                        <div style={styles.content}>
                            <div style={styles.header}>
                                <div style={styles.icon}>✨</div>
                                <h1 style={styles.title}>Welcome Back!</h1>
                                <p style={styles.subtitle}>You're all set. Head to your dashboard to manage your Shopify products.</p>
                            </div>

                            <Link
                                href={route('dashboard')}
                                style={{
                                    ...styles.button,
                                    textDecoration: 'none',
                                    display: 'block',
                                    textAlign: 'center',
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
                            >
                                Go to Dashboard
                            </Link>
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <Head title="Connect Shopify Store" />
            <div style={styles.page}>
                <div style={styles.navbar}>
                    <div style={styles.logo}>🛒 Shopify</div>
                    <div style={styles.navLinks}>
                        <Link href={route('login')} style={styles.navLink}>
                            Log in
                        </Link>
                        <Link href={route('register')} style={styles.navLink}>
                            Register
                        </Link>
                    </div>
                </div>

                <div style={styles.container}>
                    <div style={styles.content}>
                        <div style={styles.header}>
                            <div style={styles.icon}>🛍️</div>
                            <div style={styles.badge}>Quick Setup</div>
                            <h1 style={styles.title}>Connect Your Store</h1>
                            <p style={styles.subtitle}>
                                Manage your Shopify products in one place. Enter your store domain to get started.
                            </p>
                        </div>

                        {error && <div style={styles.error}>⚠️ {error}</div>}

                        <form style={styles.form} onSubmit={handleConnect}>
                            <input
                                type="text"
                                style={styles.input}
                                placeholder="example.myshopify.com"
                                value={shopDomain}
                                onChange={(e) => setShopDomain(e.target.value)}
                                disabled={loading}
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
                            <p>You'll be redirected to Shopify to authorize the app securely</p>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
