import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Navbar from "./components/layout/Navbar";
import Footer from "./components/layout/Footer";
import Home from "./pages/Home";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Dashboard from "./pages/Dashboard";
import CreateDonation from "./pages/CreateDonation";
import DonationsList from "./pages/DonationsList";
import DonationDetail from "./pages/DonationDetail";
import Profile from "./pages/Profile";
import ProtectedRoute from "./components/routing/ProtectedRoute";
import Notifications from "./pages/Notifications";
import Analytics from "./pages/Analytics";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="flex flex-col min-h-screen w-full">
          <Navbar />
          <main className="flex-grow w-full">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected routes */}
              <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/donations/:id" element={<DonationDetail />} />
                <Route path="/profile" element={<Profile />} />{" "}
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/analytics" element={<Analytics />} />{" "}
              </Route>

              {/* Donor-specific routes */}
              <Route element={<ProtectedRoute allowedRoles={["donor"]} />}>
                <Route path="/donations/create" element={<CreateDonation />} />
              </Route>

              {/* Recipient-specific routes */}
              <Route element={<ProtectedRoute allowedRoles={["recipient"]} />}>
                <Route path="/donations" element={<DonationsList />} />
              </Route>
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
