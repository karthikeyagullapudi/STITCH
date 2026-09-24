import { Link, useParams } from 'react-router';
import { FiChevronRight, FiArrowRight } from 'react-icons/fi';
import { useEffect, useState } from 'react';
import { useProduct } from '../../hook/useProduct.js';
import { useSelector } from 'react-redux';
import ProductGallery from '../../components/ProductGallery.jsx';
import ProductInfo from '../../components/ProductInfo.jsx';
import ProductCard from '../../components/ProductCard.jsx';
import Header from '../../components/Header.jsx';
import Footer from '../../../../shared/components/Footer.jsx';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';

const Product = () => {
  const { slug } = useParams();
  const { handleGetProductBySlug, handleGetAllProducts } = useProduct();
  const { allProducts } = useSelector((state) => state.product);
  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  // Local flag — the slice's `loading` is shared with the related-products fetch.
  const [loading, setLoading] = useState(true);

  const fetchProductData = async () => {
    setLoading(true);
    const response = await handleGetProductBySlug(slug);
    const loaded = response?.product || null;
    setProduct(loaded);
    // Always reset, so a product without variants never keeps the previous one's.
    setSelectedVariant(loaded?.variants?.[0] || null);
    setLoading(false);
    // Related products come from the same category (one extra to drop itself).
    if (loaded) {
      handleGetAllProducts({ category: loaded.category || undefined, limit: 5 });
    }
  };

  useEffect(() => {
    fetchProductData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  const relatedProducts = allProducts
    .filter((p) => p._id !== product?._id)
    .slice(0, 4);

  const displayImages =
    selectedVariant && selectedVariant.images && selectedVariant.images.length > 0
      ? selectedVariant.images
      : product?.images;

  if (loading && !product) {
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
    <div className="flex min-h-screen flex-col bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto w-full flex-1 max-w-[1440px] px-6 pt-24 pb-16 md:pt-28">
        {/* Breadcrumb */}
        <nav className="mb-8 flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.12em] text-muted">
          <Link to="/" className="transition-colors hover:text-paper">
            Home
          </Link>
          <FiChevronRight className="h-3 w-3" />
          <Link to="/collections/all" className="transition-colors hover:text-paper">
            Shop
          </Link>
          <FiChevronRight className="h-3 w-3" />
          {product.category ? (
            <Link
              to={`/collections/all?category=${encodeURIComponent(product.category)}`}
              className="transition-colors hover:text-paper"
            >
              {product.category}
            </Link>
          ) : (
            <span>Apparel</span>
          )}
          <FiChevronRight className="h-3 w-3" />
          <span className="text-paper">{product.title}</span>
        </nav>

        {/* Product section */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-16 items-start">
          {/* Gallery Component */}
          <div className="lg:col-span-6">
            <ProductGallery
              images={displayImages}
              title={product.title}
              collectionName={product.collectionName}
            />
          </div>

          {/* Info Component */}
          <div className="lg:col-span-6">
            {/* Keyed so quantity/tab/feedback reset when switching products. */}
            <ProductInfo
              key={product._id}
              product={product}
              selectedVariant={selectedVariant}
              onSelectVariant={setSelectedVariant}
            />
          </div>
        </div>

        {/* You might also like */}
        <section className="mt-16 border-t border-line py-16">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight">
              You Might Also Like
            </h2>
            <Link
              to="/collections/all"
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

      <Footer />
    </div>
  );
};

export default Product;
