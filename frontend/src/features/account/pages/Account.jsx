import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router';
import Header from '../../products/components/Header.jsx';
import Footer from '../../../shared/components/Footer.jsx';
import ProfileCard from '../components/ProfileCard.jsx';
import PasswordForm from '../components/PasswordForm.jsx';
import AddressBook from '../components/AddressBook.jsx';
import { useAuth } from '../../auth/hook/useAuth.js';

const Account = () => {
  const user = useSelector((state) => state.auth.user);
  const { handleLogout } = useAuth();
  const navigate = useNavigate();

  const onLogout = async () => {
    await handleLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-ink font-body text-paper">
      <Header />

      <main className="mx-auto max-w-[1440px] px-6 pb-16 pt-28 md:pt-32">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="mb-2 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-muted">
              Home / Account
            </p>
            <h1 className="font-display text-4xl font-bold uppercase tracking-tight md:text-6xl">
              Hi, {user.name?.firstName}
            </h1>
          </div>
          <button
            type="button"
            onClick={onLogout}
            className="font-display text-[11px] font-bold uppercase tracking-[0.12em] text-muted transition-colors hover:text-red-400"
          >
            Log Out
          </button>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
          <div className="space-y-6">
            <ProfileCard user={user} />
            <PasswordForm />
          </div>
          <AddressBook addresses={user.addresses || []} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Account;
