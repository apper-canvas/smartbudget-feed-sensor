import "@/index.css";
import { createContext, useEffect, useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { store } from '@/store';
import { setUser, clearUser } from '@/store/userSlice';
import { ThemeProvider } from "@/contexts/ThemeContext";
import { ToastContainer } from "react-toastify";
import Transactions from "@/components/pages/Transactions";
import Budgets from "@/components/pages/Budgets";
import Accounts from "@/components/pages/Accounts";
import Goals from "@/components/pages/Goals";
import Dashboard from "@/components/pages/Dashboard";
import Charts from "@/components/pages/Charts";
import Settings from "@/components/pages/Settings";
import Login from "@/components/pages/Login";
import Signup from "@/components/pages/Signup";
import Callback from "@/components/pages/Callback";
import ErrorPage from "@/components/pages/ErrorPage";
import ResetPassword from "@/components/pages/ResetPassword";
import PromptPassword from "@/components/pages/PromptPassword";
import Sidebar from "@/components/organisms/Sidebar";
import Header from "@/components/organisms/Header";
import TransactionForm from "@/components/organisms/TransactionForm";
import Modal from "@/components/atoms/Modal";

// Create auth context
export const AuthContext = createContext(null);

function AppContent() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  
  // Get authentication status with proper error handling
  const userState = useSelector((state) => state.user);
  const isAuthenticated = userState?.isAuthenticated || false;
  
  // Initialize ApperUI once when the app loads
  useEffect(() => {
    const { ApperClient, ApperUI } = window.ApperSDK;
    
    const client = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Initialize but don't show login yet
    ApperUI.setup(client, {
      target: '#authentication',
      clientId: import.meta.env.VITE_APPER_PROJECT_ID,
      view: 'both',
      onSuccess: function (user) {
        setIsInitialized(true);
        // CRITICAL: This exact currentPath logic must be preserved in all implementations
        // DO NOT simplify or modify this pattern as it ensures proper redirection flow
        let currentPath = window.location.pathname + window.location.search;
        let redirectPath = new URLSearchParams(window.location.search).get('redirect');
        const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                           currentPath.includes('/callback') || currentPath.includes('/error') || 
                           currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
        
        if (user) {
          // User is authenticated
          if (redirectPath) {
            navigate(redirectPath);
          } else if (!isAuthPage) {
            if (!currentPath.includes('/login') && !currentPath.includes('/signup')) {
              navigate(currentPath);
            } else {
              navigate('/');
            }
          } else {
            navigate('/');
          }
          // Store user information in Redux
          dispatch(setUser(JSON.parse(JSON.stringify(user))));
        } else {
          // User is not authenticated
          if (!isAuthPage) {
            navigate(
              currentPath.includes('/signup')
                ? `/signup?redirect=${currentPath}`
                : currentPath.includes('/login')
                ? `/login?redirect=${currentPath}`
                : '/login'
            );
          } else if (redirectPath) {
            if (
              !['error', 'signup', 'login', 'callback', 'prompt-password', 'reset-password'].some((path) => currentPath.includes(path))
            ) {
              navigate(`/login?redirect=${redirectPath}`);
            } else {
              navigate(currentPath);
            }
          } else if (isAuthPage) {
            navigate(currentPath);
          } else {
            navigate('/login');
          }
          dispatch(clearUser());
        }
      },
      onError: function(error) {
        console.error("Authentication failed:", error);
      }
    });
  }, []);// No props and state should be bound
  
  // Authentication methods to share via context
  const authMethods = {
    isInitialized,
    logout: async () => {
      try {
        const { ApperUI } = window.ApperSDK;
        await ApperUI.logout();
        dispatch(clearUser());
        navigate('/login');
      } catch (error) {
        console.error("Logout failed:", error);
      }
    }
  };
  
// Don't render routes until initialization is complete
  if (!isInitialized) {
    return <div className="loading flex items-center justify-center p-6 h-full w-full"><svg className="animate-spin" xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" ><path d="M12 2v4"></path><path d="m16.2 7.8 2.9-2.9"></path><path d="M18 12h4"></path><path d="m16.2 16.2 2.9 2.9"></path><path d="M12 18v4"></path><path d="m4.9 19.1 2.9-2.9"></path><path d="M2 12h4"></path><path d="m4.9 4.9 2.9 2.9"></path></svg></div>;
  }
  // Show auth pages if not authenticated
  const currentPath = window.location.pathname;
  const isAuthPage = currentPath.includes('/login') || currentPath.includes('/signup') || 
                     currentPath.includes('/callback') || currentPath.includes('/error') || 
                     currentPath.includes('/prompt-password') || currentPath.includes('/reset-password');
  
  if (!isAuthenticated && !isAuthPage) {
    return (
      <AuthContext.Provider value={authMethods}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/callback" element={<Callback />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
          <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
          <Route path="*" element={<Login />} />
        </Routes>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={authMethods}>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
        <div className="flex h-screen overflow-hidden">
          <Sidebar 
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />
          
          <div className="flex-1 flex flex-col overflow-hidden">
            <Header
              onMenuClick={() => setSidebarOpen(true)}
              onAddTransaction={() => setIsTransactionModalOpen(true)}
            />
            <main className="flex-1 overflow-y-auto">
              <div className="px-4 lg:px-8 py-8">
                <Routes>
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route path="/callback" element={<Callback />} />
                  <Route path="/error" element={<ErrorPage />} />
                  <Route path="/prompt-password/:appId/:emailAddress/:provider" element={<PromptPassword />} />
                  <Route path="/reset-password/:appId/:fields" element={<ResetPassword />} />
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budgets" element={<Budgets />} />
                  <Route path="/goals" element={<Goals />} />
                  <Route path="/charts" element={<Charts />} />
                  <Route path="/accounts" element={<Accounts />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </div>
            </main>
          </div>
        </div>

        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop={true}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          toastClassName="custom-toast"
          bodyClassName="custom-toast-body"
          progressClassName="custom-progress"
          style={{ 
            zIndex: 99999,
            position: 'fixed',
            top: '1rem',
            right: '1rem'
          }}
        />

        {/* Global Transaction Modal */}
        <Modal 
          isOpen={isTransactionModalOpen}
          onClose={() => setIsTransactionModalOpen(false)}
          size="lg"
        >
          <TransactionForm 
            onTransactionAdded={() => {
              setIsTransactionModalOpen(false);
              // Trigger refresh for transaction list if on transactions page
              if (typeof window !== 'undefined' && window.CustomEvent) {
                window.dispatchEvent(new window.CustomEvent('transactionAdded'));
              }
            }}
            editTransaction={null}
            onEditComplete={() => setIsTransactionModalOpen(false)}
          />
        </Modal>
      </div>
    </AuthContext.Provider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ThemeProvider>
    </Provider>
  );
}

export default App;