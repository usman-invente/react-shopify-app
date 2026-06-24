import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import { useState, useEffect, useCallback, useMemo } from 'react';
import {
    Badge,
    Banner,
    Button,
    Card,
    EmptyState,
    IndexTable,
    Modal,
    Spinner,
    Text,
    TextField,
    Thumbnail,
    DropZone,
} from '@shopify/polaris';

const resourceName = {
    singular: 'product',
    plural: 'products',
};

function formatPrice(price) {
    if (!price) {
        return '—';
    }

    return `$${parseFloat(price).toFixed(2)}`;
}

function statusBadge(status) {
    const normalized = (status || '').toLowerCase();

    if (normalized === 'active') {
        return <Badge tone="success">Active</Badge>;
    }

    if (normalized === 'draft') {
        return <Badge tone="info">Draft</Badge>;
    }

    if (normalized === 'archived') {
        return <Badge tone="warning">Archived</Badge>;
    }

    return <Badge>{status || 'Unknown'}</Badge>;
}

export default function Products() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editingProduct, setEditingProduct] = useState(null);
    const [editFormData, setEditFormData] = useState({ title: '', vendor: '', price: '', inventory: '', imageFile: null });
    const [updatingProduct, setUpdatingProduct] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [imagePreview, setImagePreview] = useState(null);

    const filteredProducts = useMemo(() => {
        if (!searchQuery.trim()) {
            return products;
        }
        const query = searchQuery.toLowerCase();
        return products.filter(
            (product) =>
                product.title?.toLowerCase().includes(query) ||
                product.vendor?.toLowerCase().includes(query) ||
                product.handle?.toLowerCase().includes(query)
        );
    }, [products, searchQuery]);

    const fetchProducts = useCallback(async () => {
        try {
            setLoading(true);
            const response = await fetch('/api/products', {
                headers: { Accept: 'application/json' },
                credentials: 'same-origin',
            });
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to fetch products');
            }

            setProducts(data.products || []);
            setError(null);
        } catch (err) {
            setError(err.message || 'An error occurred while fetching products');
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    const openEditModal = (product) => {
        setEditingProduct(product);
        setEditFormData({
            title: product.title || '',
            vendor: product.vendor || '',
            price: product.price || '',
            inventory: product.inventory ?? '',
            imageFile: null,
        });
        setImagePreview(product.image?.src || null);
    };

    const closeEditModal = () => {
        setEditingProduct(null);
        setEditFormData({ title: '', vendor: '', price: '', inventory: '', imageFile: null });
        setImagePreview(null);
    };

    const handleImageUpload = (files) => {
        const file = files[0];
        if (file) {
            setEditFormData({ ...editFormData, imageFile: file });
            const reader = new FileReader();
            reader.onload = (e) => {
                setImagePreview(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateProduct = async () => {
        if (!editingProduct) return;

        // Capture before any state changes
        const productId = editingProduct.id;
        const updates = {
            title: editFormData.title,
            vendor: editFormData.vendor,
            price: editFormData.price,
            inventory: editFormData.inventory,
            imageFile: editFormData.imageFile,
            imagePreview: imagePreview,
        };

        try {
            setUpdatingProduct(true);

            const formData = new FormData();
            formData.append('_method', 'PUT');
            formData.append('title', updates.title);
            formData.append('vendor', updates.vendor);
            if (updates.price !== '') {
                formData.append('price', updates.price);
            }
            if (updates.inventory !== '') {
                formData.append('inventory', updates.inventory);
            }
            if (updates.imageFile) {
                formData.append('imageFile', updates.imageFile);
            }

            const response = await fetch(`/api/products/${productId}`, {
                method: 'POST',
                credentials: 'same-origin',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to update product');
            }

            // Use server-confirmed values — avoids Shopify's stale totalInventory GraphQL cache
            const confirmed = data.updated || {};
            setProducts((prev) =>
                prev.map((p) =>
                    p.id === productId
                        ? {
                              ...p,
                              ...(confirmed.title     ? { title: confirmed.title }                : {}),
                              ...(confirmed.vendor    ? { vendor: confirmed.vendor }              : {}),
                              ...(confirmed.price     ? { price: confirmed.price }                : {}),
                              ...(confirmed.inventory !== null ? { inventory: confirmed.inventory } : {}),
                              ...(updates.imageFile   ? { image: { ...p.image, src: updates.imagePreview } } : {}),
                          }
                        : p
                )
            );
            setError(null);
            closeEditModal();
        } catch (err) {
            setError(err.message);
        } finally {
            setUpdatingProduct(false);
        }
    };

    const rowMarkup = filteredProducts.map((product, index) => (
        <IndexTable.Row id={String(product.id)} key={product.id} position={index}>
            <IndexTable.Cell>
                <Thumbnail
                    source={product.image?.src || ''}
                    alt={product.image?.alt || product.title}
                    size="small"
                />
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text variant="bodyMd" fontWeight="semibold" as="span">
                    {product.title}
                </Text>
                {product.handle && (
                    <Text variant="bodySm" tone="subdued" as="p">
                        {product.handle}
                    </Text>
                )}
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span">{product.vendor || '—'}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span">{formatPrice(product.price)}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>
                <Text as="span">{product.inventory ?? 0}</Text>
            </IndexTable.Cell>
            <IndexTable.Cell>{statusBadge(product.status)}</IndexTable.Cell>
            <IndexTable.Cell>
                <Button size="slim" onClick={() => openEditModal(product)}>
                    Edit
                </Button>
            </IndexTable.Cell>
        </IndexTable.Row>
    ));

    return (
        <AuthenticatedLayout header="Products">
            <Head title="Products" />
            <style>{`.Polaris-Page { max-width: 100% !important; }`}</style>

            {error && (
                <div style={{ marginBottom: '16px' }}>
                    <Banner tone="critical" title="Error">
                        <p>{error}</p>
                    </Banner>
                </div>
            )}

            <Card padding="0">
                <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <Text variant="headingMd" as="h2">
                            Shopify Products
                        </Text>
                        <Button onClick={fetchProducts} loading={loading}>
                            Refresh
                        </Button>
                    </div>
                    <TextField
                        label="Search products"
                        placeholder="Search by title, vendor, or handle..."
                        value={searchQuery}
                        onChange={setSearchQuery}
                        autoComplete="off"
                    />
                </div>

                {loading ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                        <Spinner accessibilityLabel="Loading products" size="large" />
                        <div style={{ marginTop: '12px' }}>
                            <Text tone="subdued" as="p">
                                Loading products from your Shopify store...
                            </Text>
                        </div>
                    </div>
                ) : products.length === 0 ? (
                    <EmptyState
                        heading="No products found"
                        image="https://cdn.shopify.com/s/files/1/0262/4071/2726/files/emptystate-files.png"
                        action={{
                            content: 'Refresh',
                            onAction: fetchProducts,
                        }}
                        secondaryAction={{
                            content: 'Connect store',
                            url: route('connector'),
                        }}
                    >
                        <p>Connect your store on the Connector page, or add products in Shopify.</p>
                    </EmptyState>
                ) : filteredProducts.length === 0 ? (
                    <div style={{ padding: '48px', textAlign: 'center' }}>
                        <Text tone="subdued" as="p">
                            No products match "{searchQuery}". Try adjusting your search.
                        </Text>
                    </div>
                ) : (
                    <IndexTable
                        resourceName={resourceName}
                        itemCount={filteredProducts.length}
                        selectable={false}
                        headings={[
                            { title: 'Image' },
                            { title: 'Product' },
                            { title: 'Vendor' },
                            { title: 'Price' },
                            { title: 'Inventory' },
                            { title: 'Status' },
                            { title: 'Action' },
                        ]}
                    >
                        {rowMarkup}
                    </IndexTable>
                )}
            </Card>

            <Modal
                open={!!editingProduct}
                onClose={closeEditModal}
                title="Edit Product"
                primaryAction={{
                    content: 'Save',
                    onAction: handleUpdateProduct,
                    loading: updatingProduct,
                }}
                secondaryActions={[
                    {
                        content: 'Cancel',
                        onAction: closeEditModal,
                    },
                ]}
            >
                <Modal.Section>
                    <TextField
                        label="Product Title"
                        value={editFormData.title}
                        onChange={(value) => setEditFormData({ ...editFormData, title: value })}
                        autoComplete="off"
                    />
                    <div style={{ marginTop: '16px' }}>
                        <TextField
                            label="Vendor"
                            value={editFormData.vendor}
                            onChange={(value) => setEditFormData({ ...editFormData, vendor: value })}
                            autoComplete="off"
                        />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <TextField
                            label="Price"
                            value={editFormData.price}
                            onChange={(value) => setEditFormData({ ...editFormData, price: value })}
                            type="number"
                            step="0.01"
                            min="0"
                            autoComplete="off"
                        />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <TextField
                            label="Inventory Quantity"
                            value={String(editFormData.inventory)}
                            onChange={(value) => setEditFormData({ ...editFormData, inventory: value })}
                            type="number"
                            min="0"
                            autoComplete="off"
                        />
                    </div>
                    <div style={{ marginTop: '16px' }}>
                        <Text variant="bodySm" fontWeight="semibold" as="p">
                            Product Image
                        </Text>
                        <DropZone
                            onDrop={handleImageUpload}
                            accept="image/*"
                            errorOverlayText="File type must be an image"
                            type="image"
                        >
                            {imagePreview ? (
                                <div style={{ padding: '16px' }}>
                                    <Thumbnail
                                        source={imagePreview}
                                        alt="Product image preview"
                                        size="large"
                                    />
                                    <Button
                                        onClick={() => {
                                            setEditFormData({ ...editFormData, imageFile: null });
                                            setImagePreview(null);
                                        }}
                                        destructive
                                        plain
                                        size="slim"
                                        style={{ marginTop: '8px' }}
                                    >
                                        Remove
                                    </Button>
                                </div>
                            ) : (
                                <DropZone.FileUpload />
                            )}
                        </DropZone>
                    </div>
                </Modal.Section>
            </Modal>
        </AuthenticatedLayout>
    );
}
