import { useParams } from 'react-router';
import Header from '../../features/products/components/Header.jsx';
import Footer from '../components/Footer.jsx';
import NotFound from './NotFound.jsx';

/* Static store policy pages, keyed by the URL slug (/pages/:slug). */
const pages = {
  shipping: {
    title: 'Shipping',
    sections: [
      [
        'Dispatch',
        'Orders are packed and dispatched within 1–2 business days of payment. You can follow each status update from My Orders.',
      ],
      [
        'Delivery',
        'Domestic deliveries typically arrive within 3–7 business days depending on your location.',
      ],
      [
        'Fees',
        'Shipping fees and the free-shipping threshold are always shown in your order summary at checkout before you pay.',
      ],
    ],
  },
  returns: {
    title: 'Returns & Cancellations',
    sections: [
      [
        'Cancellations',
        "Orders that haven't shipped yet can be cancelled from My Orders. The full amount is refunded to your original payment method.",
      ],
      [
        'Refund timing',
        'Refunds are issued immediately on our side; your bank usually takes 5–7 business days to show them.',
      ],
      [
        'Returns',
        'Unworn items with their tags attached can be returned within 14 days of delivery. Contact us with your order number to start a return.',
      ],
    ],
  },
  contact: {
    title: 'Contact',
    sections: [
      [
        'Support',
        'Email support@stitch-tech.jp with your order number and we will reply within one business day.',
      ],
      [
        'Hours',
        'Our team is available Monday to Friday, 10:00–18:00 IST.',
      ],
    ],
  },
  stores: {
    title: 'Stores',
    sections: [
      [
        'Online only',
        'STITCH currently sells exclusively online. Every drop is available here first.',
      ],
    ],
  },
  privacy: {
    title: 'Privacy Policy',
    sections: [
      [
        'What we collect',
        'Your name, email, phone number, saved addresses and order history — only what we need to run your account and deliver your orders.',
      ],
      [
        'Payments',
        'Payments are processed by Razorpay. We never see or store your card details.',
      ],
      [
        'Cookies',
        'We use a single secure cookie to keep you signed in.',
      ],
      [
        'Emails',
        'We email you about your account and orders. Drop alerts are only sent if you subscribe, and you can unsubscribe at any time.',
      ],
      [
        'Your data',
        'Contact support to request a copy of your data or to delete your account.',
      ],
    ],
  },
  terms: {
    title: 'Terms of Service',
    sections: [
      [
        'Accounts',
        'You are responsible for keeping your login details secure and for activity on your account.',
      ],
      [
        'Pricing & availability',
        'Prices and stock can change without notice. Your order is confirmed once payment succeeds.',
      ],
      [
        'Orders',
        'We may cancel and fully refund an order if an item becomes unavailable or a payment cannot be verified.',
      ],
      [
        'Use of the site',
        'Do not misuse the site, attempt to access other accounts, or interfere with its operation.',
      ],
    ],
  },
  accessibility: {
    title: 'Accessibility',
    sections: [
      [
        'Our commitment',
        'We want STITCH to be usable by everyone and continually improve contrast, keyboard navigation and screen-reader support.',
      ],
      [
        'Feedback',
        'If something is hard to use, email support@stitch-tech.jp and we will help.',
      ],
    ],
  },
};

const InfoPage = () => {
  const { slug } = useParams();
  const page = pages[slug];
  if (!page) return <NotFound />;

  return (
    <div className="flex min-h-screen flex-col bg-ink font-body text-paper">
      <Header />
      <main className="mx-auto w-full flex-1 max-w-3xl px-6 pb-16 pt-28 md:pt-32">
        <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
          Help / {page.title}
        </p>
        <h1 className="mb-10 font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
          {page.title}
        </h1>
        <div className="space-y-8">
          {page.sections.map(([heading, body]) => (
            <section key={heading} className="border-l-2 border-accent pl-6">
              <h2 className="mb-2 font-display text-lg font-semibold uppercase tracking-tight">
                {heading}
              </h2>
              <p className="leading-relaxed text-muted">{body}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default InfoPage;
