import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';

const styles = {
    container: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '24px',
        marginTop: '24px',
    },
    productCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        border: '1px solid #e5e7eb',
        overflow: 'hidden',
        transition: 'box-shadow 0.2s',
        cursor: 'pointer',
    },
    productImage: {
        width: '100%',
        height: '280px',
        backgroundColor: '#f5f5f5',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '48px',
    },
    productInfo: {
        padding: '16px',
    },
    productTitle: {
        fontSize: '16px',
        fontWeight: '600',
        color: '#000',
        marginBottom: '8px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
    },
    productPrice: {
        fontSize: '18px',
        fontWeight: '700',
        color: '#000',
        marginBottom: '12px',
    },
    productStatus: {
        fontSize: '13px',
        color: '#666',
        marginBottom: '12px',
    },
    button: {
        width: '100%',
        padding: '10px 16px',
        backgroundColor: '#000',
        color: '#fff',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '500',
        transition: 'background-color 0.2s',
    },
    section: {
        marginBottom: '32px',
    },
    sectionTitle: {
        fontSize: '20px',
        fontWeight: '600',
        color: '#000',
    },
    loading: {
        textAlign: 'center',
        padding: '40px 20px',
        fontSize: '16px',
        color: '#666',
    },
    error: {
        backgroundColor: '#fef2f2',
        border: '1px solid #fecaca',
        color: '#991b1b',
        padding: '16px',
        borderRadius: '6px',
        marginTop: '16px',
    },
};

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products');

            if (!response.ok) {
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            setProducts(data.products || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'An error occurred while fetching products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <AuthenticatedLayout header="Products">
            <Head title="Products" />

            <div style={styles.section}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={styles.sectionTitle}>Shopify Products</h2>
                    <button
                        onClick={fetchProducts}
                        style={{
                            padding: '10px 16px',
                            backgroundColor: '#000',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '14px',
                        }}
                    >
                        Refresh
                    </button>
                </div>

                {error && (
                    <div style={styles.error}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <div style={styles.loading}>
                        Loading products from your Shopify store...
                    </div>
                ) : products.length === 0 ? (
                    <div style={styles.loading}>
                        No products found. Make sure your Shopify API credentials are configured.
                    </div>
                ) : (
                    <div style={styles.container}>
                        {products.map((product) => (
                            <div
                                key={product.id}
                                style={styles.productCard}
                                onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 10px 25px rgba(0, 0, 0, 0.1)'}
                                onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}
                            >
                                <div style={styles.productImage}>
                                    {product.image ? (
                                        <img
                                            src={product.image.src}
                                            alt={product.title}
                                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                        />
                                    ) : (
                                        '📦'
                                    )}
                                </div>
                                <div style={styles.productInfo}>
                                    <div style={styles.productTitle} title={product.title}>
                                        {product.title}
                                    </div>
                                    {product.variants && product.variants[0] && (
                                        <div style={styles.productPrice}>
                                            ${product.variants[0].price}
                                        </div>
                                    )}
                                    <div style={styles.productStatus}>
                                        {product.status === 'active' ? '✓ Active' : '⏳ Draft'}
                                    </div>
                                    <button
                                        style={styles.button}
                                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1f2937'}
                                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#000'}
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </AuthenticatedLayout>
    );
}
