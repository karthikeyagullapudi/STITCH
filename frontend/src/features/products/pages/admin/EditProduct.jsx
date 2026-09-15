import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import AdminLayout from '../../../admin/components/AdminLayout.jsx';
import ProductForm from '../../components/ProductForm.jsx';
import { useProduct } from '../../hook/useProduct.js';

const EditProduct = () => {
  const { productId } = useParams();
  const { handleGetAdminProductById, handleUpdateProduct } = useProduct();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    handleGetAdminProductById(productId).then((result) =>
      result.success ? setProduct(result.product) : setError(result.error),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  const onSubmit = async (formData) => {
    setSaving(true);
    setError(null);
    const result = await handleUpdateProduct(productId, formData);
    setSaving(false);
    if (!result.success) setError(result.error);
    return result;
  };

  return (
    <AdminLayout active="Products">
      {product ? (
        <ProductForm
          product={product}
          onSubmit={onSubmit}
          saving={saving}
          error={error}
        />
      ) : (
        <p
          className={`p-10 font-display text-xs uppercase tracking-[0.12em] ${
            error ? 'text-red-400' : 'text-muted'
          }`}
        >
          {error || 'Loading product...'}
        </p>
      )}
    </AdminLayout>
  );
};

export default EditProduct;
