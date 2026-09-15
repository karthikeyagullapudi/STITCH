import { useSelector } from 'react-redux';
import AdminLayout from '../../../admin/components/AdminLayout.jsx';
import ProductForm from '../../components/ProductForm.jsx';
import { useProduct } from '../../hook/useProduct.js';

const CreateProduct = () => {
  const { handleCreateProduct } = useProduct();
  const { loading, errors } = useSelector((state) => state.product);

  return (
    <AdminLayout active="Create">
      <ProductForm
        onSubmit={handleCreateProduct}
        saving={loading}
        error={errors}
      />
    </AdminLayout>
  );
};

export default CreateProduct;
