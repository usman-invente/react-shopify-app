import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

const styles = {
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#f5f5f5',
        padding: '20px',
    },
    logo: {
        marginBottom: '60px',
    },
    card: {
        width: '100%',
        maxWidth: '400px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        padding: '40px 32px',
    },
};

export default function GuestLayout({ children }) {
    return (
        <div style={styles.container}>
            <div style={styles.logo}>
                <Link href="/">
                    <ApplicationLogo style={{ height: '50px', width: '50px', display: 'block' }} />
                </Link>
            </div>

            <div style={styles.card}>
                {children}
            </div>
        </div>
    );
}
