import { Link, useParams } from 'react-router';
import { FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useProduct } from '../../hook/useProduct.js';
import { useSelector } from 'react-redux';
import ProductGallery from '../../components/ProductGallery.jsx';
import ProductInfo from '../../components/ProductInfo.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import Header from '../../components/Header.jsx';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const Product = () => {
  const { productId } = useParams();
  const { handleGetProductById, handleGetAllProducts } = useProduct();
  const { allProducts, isLoading } = useSelector((state) => state.product);
  const [product, setProduct] = useState(null);

  const fetchProductData = async () => {
    try {
      const response = await handleGetProductById(productId);
      if (response && response.product) {
        setProduct(response.product);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    fetchProductData();
  }, [productId]);

  useEffect(() => {
    handleGetAllProducts();
  }, []);

  const relatedProducts = allProducts
    .filter((p) => p._id !== productId)
    .slice(0, 4);

  if (isLoading && !product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-body text-paper">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-accent border-t-transparent"></div>
          <p className={`${labelCaps} text-muted`}>Loading Product Details...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-body text-paper">
        <div className="text-center">
          <h2 className="mb-4 font-display text-2xl font-bold uppercase tracking-tight">Product Not Found</h2>
          <Link to="/" className={`${labelCaps} bg-accent px-6 py-3 text-ink transition hover:brightness-110`}>
            Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pt-24 pb-16 md:pt-28">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          <Link to="/" className="transition-colors hover:text-paper">
            Home
          </Link>
          <FiChevronRight className="h-3 w-3" />
          <Link to="/" className="transition-colors hover:text-paper">
            Shop
          </Link>
          <FiChevronRight className="h-3 w-3" />
          <span className="transition-colors hover:text-paper">{product.category || 'Apparel'}</span>
          <FiChevronRight className="h-3 w-3" />
          <span className="text-paper">{product.title}</span>
        </nav>

        {/* Product section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Gallery Component */}
          <div className="lg:col-span-6">
            <ProductGallery
              images={product.images}
              title={product.title}
              collectionName={product.collectionName}
            />
          </div>

          {/* Info Component */}
          <div className="lg:col-span-6">
            <ProductInfo product={product} />
          </div>
        </div>

        {/* You might also like */}
        <section className="mt-16 border-t border-line py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
              You Might Also Like
            </h2>
            <Link
              to="/"
              className={`${labelCaps} group flex items-center gap-2 text-muted transition-colors hover:text-accent`}
            >
              View Archive
              <FiArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {relatedProducts.length > 0 ? (
              relatedProducts.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))
            ) : (
              <p className="text-muted text-sm col-span-4 text-center">No other products available.</p>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-line bg-surface">
        <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 px-6 py-8 md:flex-row">
          <div className="flex flex-col items-center gap-2 md:items-start">
            <span className="font-display text-2xl font-bold uppercase tracking-tight text-paper">
              STITCH
            </span>
            <span className="font-display text-[11px] uppercase tracking-wide text-muted">
              © 2024 STITCH Technical Apparel. All rights reserved.
            </span>
          </div>
          <div className="flex gap-8">
            {['Shipping', 'Returns', 'Privacy', 'Terms'].map((l) => (
              <a
                key={l}
                href="#"
                className="font-display text-[11px] uppercase tracking-wide text-muted transition-colors hover:text-accent"
              >
                {l}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Product;
