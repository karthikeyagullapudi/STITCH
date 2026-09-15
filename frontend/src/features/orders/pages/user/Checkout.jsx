import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useSelector } from 'react-redux';
import { useRazorpay } from 'react-razorpay';
import { FiPlus } from 'react-icons/fi';
import Header from '../../../products/components/Header.jsx';
import Footer from '../../../../shared/components/Footer.jsx';
import PriceBreakdown from '../../components/PriceBreakdown.jsx';
import AddressForm from '../../../account/components/AddressForm.jsx';
import { AddressLines } from '../../../account/components/AddressBook.jsx';
import { useOrder } from '../../hook/useOrder.js';
import { useCart } from '../../../cart/hook/useCart.js';
import { useAccount } from '../../../account/hook/useAccount.js';
import { formatPrice } from '../../../../shared/utils/format.js';

const labelCaps =
  'font-display text-[11px] font-bold uppercase tracking-[0.12em]';
const sectionCls = 'border border-line bg-field p-6';
const errorCls =
  'border border-red-500/30 bg-red-500/10 px-4 py-3 font-display text-[11px] uppercase tracking-wide text-red-400';

const Checkout = () => {
  const navigate = useNavigate();
  const { Razorpay, isLoading: razorpayLoading } = useRazorpay();
  const { handleGetOrderSummary, handleCheckout, handleVerifyOrder } =
    useOrder();
  const { handleGetCart } = useCart();
  const { handleAddAddress } = useAccount();
  const user = useSelector((state) => state.auth.user);
  const items = useSelector((state) => state.cart.items).filter(
    (item) => item?.product,
  );

  const addresses = user.addresses || [];
  const [addressId, setAddressId] = useState(
    (addresses.find((a) => a.isDefault) || addresses[0])?._id,
  );
  const [addingAddress, setAddingAddress] = useState(addresses.length === 0);
  const [summary, setSummary] = useState(null);
  const [summaryError, setSummaryError] = useState(null);
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState(null);
  const [paymentError, setPaymentError] = useState(null);
  const [paying, setPaying] = useState(false);

  const appliedCoupon = summary?.coupon?.code;

  const loadSummary = async (couponCode) => {
    const result = await handleGetOrderSummary(couponCode);
    if (result.success) {
      setSummary(result);
      setSummaryError(null);
    } else if (couponCode) {
      setCouponError(result.error);
    } else {
      setSummaryError(result.error);
    }
    return result;
  };

  useEffect(() => {
    handleGetCart();
    loadSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const applyCoupon = async (e) => {
    e.preventDefault();
    setCouponError(null);
    if (couponInput.trim()) await loadSummary(couponInput.trim());
  };

  const removeCoupon = async () => {
    setCouponInput('');
    setCouponError(null);
    await loadSummary();
  };

  const saveAddress = async (payload) => {
    const result = await handleAddAddress(payload);
    if (result.success) {
      setAddingAddress(false);
      // Ship to the address that was just added.
      setAddressId(result.user.addresses.at(-1)._id);
    }
    return result;
  };

  const handlePay = async () => {
    setPaying(true);
    setPaymentError(null);

    const result = await handleCheckout({ addressId, couponCode: appliedCoupon });
    if (!result.success) {
      setPaymentError(result.error);
      setPaying(false);
      return;
    }

    const { razorpayOrder, key, orderId } = result;
    const razorpay = new Razorpay({
      key,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      name: 'STITCH',
      description: 'Order payment',
      order_id: razorpayOrder.id,
      handler: async (response) => {
        const verified = await handleVerifyOrder({
          razorpayOrderId: response.razorpay_order_id,
          razorpayPaymentId: response.razorpay_payment_id,
          razorpaySignature: response.razorpay_signature,
        });
        if (verified.success) {
          // The backend empties the bag once the payment is verified.
          await handleGetCart();
          navigate(`/orders/${orderId}`, {
            replace: true,
            state: { placed: true },
          });
        } else {
          setPaymentError(verified.error);
          setPaying(false);
        }
      },
      modal: { ondismiss: () => setPaying(false) },
      prefill: {
        name: [user.name?.firstName, user.name?.lastName]
          .filter(Boolean)
          .join(' '),
        email: user.email,
        contact: user.phone,
      },
      theme: { color: '#ff5c00' },
    });
    razorpay.on('payment.failed', (response) => {
      setPaymentError(
        response.error?.description || 'Payment failed. Please try again.',
      );
    });
    razorpay.open();
  };

  const pricing = summary?.pricing;
  const amountToFreeShipping =
    pricing && pricing.shipping > 0
      ? summary.freeShippingThreshold - (pricing.subtotal - pricing.discount)
      : 0;

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        <div className="mb-8">
          <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
            <Link to="/cart" className="hover:text-paper">
              Bag
            </Link>{' '}
            / Checkout
          </p>
          <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
            Checkout
          </h1>
        </div>

        {summaryError ? (
          <div className="flex flex-col items-center gap-6 border border-line bg-field py-24 text-center">
            <p className={errorCls}>{summaryError}</p>
            <Link
              to="/cart"
              className="border border-paper px-10 py-4 font-display text-[11px] font-bold uppercase tracking-[0.15em] text-paper transition-all hover:bg-paper hover:text-ink"
            >
              Back to Bag
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6 lg:flex-row">
            {/* Left — address + items */}
            <div className="w-full space-y-6 lg:w-[65%]">
              <section className={sectionCls}>
                <div className="mb-5 flex items-center justify-between">
                  <h2 className={`${labelCaps} text-muted`}>Shipping Address</h2>
                  {!addingAddress && (
                    <button
                      type="button"
                      onClick={() => setAddingAddress(true)}
                      className={`${labelCaps} flex items-center gap-2 text-accent`}
                    >
                      <FiPlus className="h-4 w-4" />
                      New Address
                    </button>
                  )}
                </div>

                {addingAddress && (
                  <div className="mb-5 border border-line bg-panel p-4">
                    <AddressForm
                      submitLabel="Save Address"
                      onSubmit={saveAddress}
                      onCancel={
                        addresses.length ? () => setAddingAddress(false) : null
                      }
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {addresses.map((address) => (
                    <label
                      key={address._id}
                      className={`flex cursor-pointer gap-3 border p-4 transition-colors ${
                        address._id === addressId
                          ? 'border-accent bg-panel'
                          : 'border-line hover:border-paper/40'
                      }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        className="mt-1 accent-accent"
                        checked={address._id === addressId}
                        onChange={() => setAddressId(address._id)}
                      />
                      <AddressLines address={address} />
                    </label>
                  ))}
                </div>
              </section>

              <section className={sectionCls}>
                <h2 className={`${labelCaps} mb-5 text-muted`}>
                  Items ({items.length})
                </h2>
                <div className="divide-y divide-line">
                  {items.map((item) => {
                    const variant = item.product.variants?.[0];
                    const unitPrice =
                      variant?.price?.amount ?? item.product.price?.amount;
                    return (
                      <div key={item._id} className="flex gap-4 py-4">
                        <img
                          src={
                            variant?.images?.[0]?.url ||
                            item.product.images?.[0]?.url ||
                            '/placeholder.jpg'
                          }
                          alt={item.product.title}
                          className="h-20 w-16 object-cover"
                        />
                        <div className="flex flex-1 justify-between gap-4">
                          <div>
                            <p className="font-display font-semibold uppercase">
                              {item.product.title}
                            </p>
                            <p className="mt-1 font-display text-[11px] uppercase tracking-wide text-muted">
                              {[item.size, item.colorway?.name, `Qty ${item.quantity}`]
                                .filter(Boolean)
                                .join(' · ')}
                            </p>
                          </div>
                          <p className="font-display text-paper">
                            {formatPrice(unitPrice * item.quantity)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Right — summary */}
            <div className="w-full lg:w-[35%]">
              <div className="sticky top-28 flex flex-col gap-4 border border-line bg-field p-8">
                <h2 className="border-b border-line pb-4 font-display text-2xl font-semibold uppercase tracking-tight">
                  Order Summary
                </h2>

                {appliedCoupon ? (
                  <div className="flex items-center justify-between border border-emerald-500/30 bg-emerald-500/10 px-4 py-3">
                    <span className={`${labelCaps} text-emerald-400`}>
                      {appliedCoupon} applied
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className={`${labelCaps} text-muted hover:text-red-400`}
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <form className="flex h-12" onSubmit={applyCoupon}>
                    <input
                      type="text"
                      placeholder="PROMO CODE"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      className="w-full border border-r-0 border-line bg-panel px-4 font-display text-[11px] uppercase tracking-wide text-paper outline-none transition-colors placeholder:text-faint focus:border-accent"
                    />
                    <button
                      type="submit"
                      className="bg-accent px-6 font-display text-[11px] font-bold uppercase tracking-wide text-ink transition hover:opacity-90"
                    >
                      Apply
                    </button>
                  </form>
                )}
                {couponError && (
                  <p className="font-display text-[11px] uppercase tracking-wide text-red-400">
                    {couponError}
                  </p>
                )}

                {pricing ? (
                  <PriceBreakdown pricing={pricing} couponCode={appliedCoupon} />
                ) : (
                  <p className="text-sm text-muted">Calculating...</p>
                )}

                {amountToFreeShipping > 0 && (
                  <p className="font-display text-[11px] uppercase tracking-wide text-muted">
                    Add {formatPrice(amountToFreeShipping)} more for free
                    shipping.
                  </p>
                )}

                {paymentError && <p className={errorCls}>{paymentError}</p>}

                <button
                  type="button"
                  onClick={handlePay}
                  disabled={!pricing || !addressId || paying || razorpayLoading}
                  className="w-full rounded-[4px] bg-accent py-4 font-display text-base font-extrabold uppercase tracking-[0.2em] text-ink transition hover:brightness-110 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {paying
                    ? 'Processing...'
                    : pricing
                      ? `Pay ${formatPrice(pricing.total, pricing.currency)}`
                      : 'Pay'}
                </button>
                {!addressId && (
                  <p className="text-center font-display text-[10px] uppercase tracking-wide text-muted">
                    Add a shipping address to continue.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
