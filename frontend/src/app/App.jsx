import './App.css';
import { RouterProvider } from 'react-router';
import router from './app.routes';
import { Provider } from 'react-redux';
import store from './app.store';
import { useEffect } from 'react';
import { useAuth } from '../features/auth/hook/useAuth';

function AppContent() {
  const { loadUser } = useAuth();

  useEffect(() => {
    loadUser();
  }, []);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
