import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/common/ProtectedRoute';
import DashboardLayout from './components/dashboard/DashboardLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Search from './pages/Search';
import MedicineDetail from './pages/MedicineDetail';
import PharmacyDetail from './pages/PharmacyDetail';
import Profile from './pages/Profile';
import Favorites from './pages/Favorites';
import Reservations from './pages/Reservations';
import Notifications from './pages/Notifications';
import PharmacyDashboard from './pages/PharmacyDashboard';
import PharmacyInventory from './pages/PharmacyInventory';
import PharmacyReservations from './pages/PharmacyReservations';
import PharmacyProfile from './pages/PharmacyProfile';
import Requests from './pages/Requests';
import PharmacyRequests from './pages/PharmacyRequests';
import AdminDashboard from './pages/AdminDashboard';
import AdminPharmacies from './pages/AdminPharmacies';
import AdminUsers from './pages/AdminUsers';
import AdminMedicines from './pages/AdminMedicines';
import AdminReports from './pages/AdminReports';
import NotFound from './pages/NotFound';

function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/search" element={<Search />} />
          <Route path="/medicines/:id" element={<MedicineDetail />} />
          <Route path="/pharmacies/:id" element={<PharmacyDetail />} />
          <Route path="/pharmacies" element={<Search />} /> {/* Reuse search logic for pharmacies if needed, or build separate page */}

          {/* User Routes */}
          <Route path="/" element={<ProtectedRoute roles={['user', 'pharmacy', 'admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="profile" element={<Profile />} />
            <Route path="favorites" element={<Favorites />} />
            <Route path="reservations" element={<Reservations />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="requests" element={<Requests />} />
          </Route>

          {/* Pharmacy Routes */}
          <Route path="/pharmacy" element={<ProtectedRoute roles={['pharmacy']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<PharmacyDashboard />} />
            <Route path="inventory" element={<PharmacyInventory />} />
            <Route path="reservations" element={<PharmacyReservations />} />
            <Route path="profile" element={<PharmacyProfile />} />
            <Route path="requests" element={<PharmacyRequests />} />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin" element={<ProtectedRoute roles={['admin']}><DashboardLayout /></ProtectedRoute>}>
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="pharmacies" element={<AdminPharmacies />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="medicines" element={<AdminMedicines />} />
            <Route path="reports" element={<AdminReports />} />
          </Route>

          {/* Catch-All 404 Route */}
          <Route path="*" element={<NotFound />} />

        </Routes>
      </main>
      
      <Toaster 
        position="bottom-right"
        toastOptions={{
          className: 'dark:bg-surface-800 dark:text-white border border-surface-200 dark:border-surface-700 shadow-glass',
          success: { iconTheme: { primary: '#10b981', secondary: 'white' } },
          error: { iconTheme: { primary: '#ef4444', secondary: 'white' } },
        }} 
      />
    </div>
  );
}

export default App;
