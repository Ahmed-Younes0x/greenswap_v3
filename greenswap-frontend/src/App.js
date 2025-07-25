import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import ErrorBoundary from './components/Common/ErrorBoundary';
import Navbar from './components/Layout/Navbar';
import Footer from './components/Layout/Footer';
import Home from './pages/Home';
import AuthSelection from './pages/Auth/AuthSelection';
import IndividualLogin from './pages/Auth/IndividualLogin';
import BusinessLogin from './pages/Auth/BusinessLogin';
import RecyclingLogin from './pages/Auth/RecyclingLogin';
import IndividualRegister from './pages/Auth/IndividualRegister';
import BusinessRegister from './pages/Auth/BusinessRegister';
import RecyclingRegister from './pages/Auth/RecyclingRegister';
import Profile from './pages/Auth/Profile';
import Items from './pages/Items/Items';
import ItemDetail from './pages/Items/ItemDetail';
import AddItem from './pages/Items/AddItem';
import Verfy from './pages/Verfy';
import EditItem from './pages/Items/EditItem';
import Orders from './pages/Orders/Orders';
import OrderDetail from './pages/Orders/OrderDetail';
import Chat from './pages/Chat/Chat';
import AIClassification from './pages/AI/AIClassification';
import AIChat from './pages/AI/AIChat';
import AIAnalytics from './pages/AI/AIAnalytics';
import Reports from './pages/Reports/Reports';
import Dashboard from './pages/Dashboard/Dashboard';
import Notifications from './pages/Notifications/Notifications';
import About from './pages/About/About';
import Contact from './pages/Contact/Contact';
import PaymentPage from './pages/PaymentPage';
import Help from './pages/Help/Help';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import NotificationToast from './components/Notifications/NotificationToast';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <NotificationProvider>
          <Router>
            <div className="App animated-bg">
              <Navbar />
              <main>
                <Routes>
                  <Route path="/" element={<Home />} />
                  
                  {/* Auth Routes */}
                  <Route path="/auth" element={<AuthSelection />} />
                  <Route path="/auth/verfy" element={<Verfy />} />
                  <Route path="/auth/reset" element={<ResetPasswordPage />} />
                  <Route path="/login/individual" element={<IndividualLogin />} />
                  <Route path="/login/business" element={<BusinessLogin />} />
                  <Route path="/login/recycling" element={<RecyclingLogin />} />
                  <Route path="/register/individual" element={<IndividualRegister />} />
                  <Route path="/register/business" element={<BusinessRegister />} />
                  <Route path="/register/recycling" element={<RecyclingRegister />} />
                  
                  {/* Legacy routes for backward compatibility */}
                  <Route path="/login" element={<AuthSelection />} />
                  <Route path="/register" element={<AuthSelection />} />
                  
                  {/* Public Routes */}
                  <Route path="/items" element={<Items />} />
                  <Route path="/items/:id" element={<ItemDetail />} />
                  <Route path="/ai-classify" element={<AIClassification />} />
                  <Route path="/ai-chat" element={<AIChat />} />
                  <Route path="/ai-analytics" element={<AIAnalytics />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/payment/:orderId" element={<PaymentPage />} />
                  <Route path="/help" element={<Help />} />
                  
                  {/* Protected Routes */}
                  <Route path="/profile" element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  } />
                  <Route path="/add-item" element={
                    <ProtectedRoute>
                      <AddItem />
                    </ProtectedRoute>
                  } />
                  <Route path="/items/:id/edit" element={
                    <ProtectedRoute>
                      <EditItem />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders" element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  } />
                  <Route path="/orders/:id" element={
                    <ProtectedRoute>
                      <OrderDetail />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/chat/:id" element={
                    <ProtectedRoute>
                      <Chat />
                    </ProtectedRoute>
                  } />
                  <Route path="/notifications" element={
                    <ProtectedRoute>
                      <Notifications />
                    </ProtectedRoute>
                  } />
                  <Route path="/reports" element={
                    <ProtectedRoute>
                      <Reports />
                    </ProtectedRoute>
                  } />
                  
                  {/* Admin Routes */}
                  <Route path="/dashboard" element={
                    <ProtectedRoute adminOnly={true}>
                      <Dashboard />
                    </ProtectedRoute>
                  } />
                </Routes>
              </main>
              <Footer />
              <NotificationToast />
            </div>
          </Router>
        </NotificationProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;