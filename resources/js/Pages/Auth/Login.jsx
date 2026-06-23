import { Head, Link, useForm } from '@inertiajs/react';
import { TextField, Button } from '@shopify/polaris';
import GuestLayout from '@/Layouts/GuestLayout';

const styles = {
    title: {
        fontSize: '28px',
        fontWeight: '600',
        marginBottom: '24px',
        color: '#000',
    },
    form: {
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
    },
    fieldGroup: {
        marginBottom: '16px',
    },
    forgotLink: {
        textAlign: 'right',
        marginTop: '8px',
    },
    forgotLinkA: {
        fontSize: '14px',
        color: '#0073e6',
        textDecoration: 'none',
    },
    signupText: {
        textAlign: 'center',
        marginTop: '24px',
        fontSize: '14px',
        color: '#666',
    },
    signupLink: {
        color: '#0073e6',
        textDecoration: 'none',
        fontWeight: '500',
    },
    status: {
        padding: '12px 16px',
        backgroundColor: '#dffcf0',
        color: '#137752',
        borderRadius: '4px',
        marginBottom: '16px',
        fontSize: '14px',
    },
};

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <GuestLayout>
            <Head title="Log in" />

            <h1 style={styles.title}>Sign in</h1>

            {status && (
                <div style={styles.status}>{status}</div>
            )}

            <form onSubmit={submit} style={styles.form}>
                <div style={styles.fieldGroup}>
                    <TextField
                        label="Email"
                        type="email"
                        value={data.email}
                        onChange={(value) => setData('email', value)}
                        error={errors.email}
                        autoComplete="username"
                        autoFocus
                        placeholder="admin@example.com"
                    />
                </div>

                <div style={styles.fieldGroup}>
                    <TextField
                        label="Password"
                        type="password"
                        value={data.password}
                        onChange={(value) => setData('password', value)}
                        error={errors.password}
                        autoComplete="current-password"
                        placeholder="Password"
                    />
                </div>

                {canResetPassword && (
                    <div style={styles.forgotLink}>
                        <Link href={route('password.request')} style={styles.forgotLinkA}>
                            Forgot password?
                        </Link>
                    </div>
                )}

                <Button
                    variant="primary"
                    submit
                    fullWidth
                    disabled={processing}
                    loading={processing}
                    size="large"
                >
                    Sign in
                </Button>
            </form>

            <div style={styles.signupText}>
                Don't have an account?{' '}
                <Link href={route('register')} style={styles.signupLink}>
                    Create one
                </Link>
            </div>
        </GuestLayout>
    );
}
