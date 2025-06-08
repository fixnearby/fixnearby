//frontend/src/App.jsx
import { useEffect } from "react";
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader } from "lucide-react";
import { axiosInstance } from './lib/axios';
import { useAuthStore } from './store/authStore';
// Pages
import Landing from './pages/Landing';

useEffect
// Userauth
import UserGetotp  from './pages/user/auth/Getotp';
import UserVerifyotp from './pages/user/auth/Verifyotp';
import UserLogin from './pages/user/auth/Login';
import UserSignup from './pages/user/auth/Signup';

// repairer auth
import RepairerGetotp  from './pages/repairer/auth/Getotp';
import RepairerVerifyotp from './pages/repairer/auth/Verifyotp';
import RepairerLogin from './pages/repairer/auth/Login';
import RepairerSignup from './pages/repairer/auth/Signup';


//UserDashboard
import UserInprogress from './pages/user/dashboard/Inprogress';
import UserPendingservice from './pages/user/dashboard/Pendingservice';
import UserMaindashboard from './pages/user/dashboard/Maindashboard';
import Showservices from './pages/user/dashboard/Showservices';


//repairerDashboard
import RepairerInprogress from './pages/repairer/dashboard/Inprogress';
import RepairerCompleted from './pages/repairer/dashboard/Completed';
import RepairerMaindashboard from './pages/repairer/dashboard/Maindashboard';
import RepairerProfile from './pages/repairer/dashboard/Profile';








function App() {
  
const {
    setUser,
    setRepairer,
    setAdmin,
    clearUser,
    clearRepairer,
    clearAdmin,
    setloading,
    loading,
    user,
    repairer,
    admin
  } = useAuthStore();
  
  

    useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log("ye hai jwt token",document.cookie); // should contain jwt
        const res = await axiosInstance.get("/check-auth");
        const data = res.data;
        console.log("Auth data:", data);
        if (data.role === "user") {
          setUser(data);
        } else if (data.role === "repairer") {
          setRepairer(data);
        } else if (data.role === "admin") {
          setAdmin(data);
        }
      } catch (err) {
        console.error(err);
        clearUser();
        clearRepairer();
        clearAdmin();
      } finally {
        setloading(false); // done loading
      }
    };

    checkAuth();
  }, [clearUser, clearRepairer, clearAdmin, setUser, setRepairer, setAdmin, setloading]);

  if (loading )
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="size-10 animate-spin" />
      </div>
    );

  return (
    <div>
        <Routes>
          
          {/* landing page */}
          <Route
          path="/"
          element={
            user ? (
              <Navigate to="/user/dashboard" />
            ) : repairer ? (
              <Navigate to="/repairer/dashboard" />
            ) : admin ? (
              <Navigate to="/admin/dashboard" />
            ) : (
              <Landing />
            )
          }
        />

          {/* User Auth pages */}
          <Route path="/user/getotp" element={!user ?<UserGetotp />:<Navigate to="/user/dashboard" />} />
          <Route path="/user/verify-otp" element={!user ?<UserVerifyotp />:<Navigate to="/user/dashboard" />} />
          <Route path="/user/login" element={!user ?<UserLogin />:<Navigate to="/user/dashboard" />} />
          <Route path="/user/signup" element={!user ?<UserSignup />:<Navigate to="/user/dashboard" />} />
          

          {/* Repairer Auth pages */}
          <Route path="/repairer/getotp" element={repairer ?<Navigate to="/repairer/dashboard" /> : <RepairerGetotp />} />
          <Route path="/repairer/verify-otp" element={repairer ?<Navigate to="/repairer/dashboard" />:<RepairerVerifyotp />} />
          <Route path="/repairer/login" element={repairer ?<Navigate to="/repairer/dashboard" /> :<RepairerLogin />} />
          <Route path="/repairer/signup" element={repairer ?<Navigate to="/repairer/dashboard" /> :<RepairerSignup />} />

          
          {/* User Dashboard */}
          <Route path="/user/dashboard" element={!user ? <Navigate to="/user/login" /> : <UserMaindashboard /> } />
          <Route path="/user/inprogress" element={!user ? <Navigate to="/user/login" /> : <UserInprogress /> } />
          <Route path="/user/pending-service" element={!user ? <Navigate to="/user/login" /> : <UserPendingservice /> } />
          <Route path="/user/show-services" element={!user ? <Navigate to="/user/login" /> : <Showservices /> } />



          {/* repairer Dashboard */}
          <Route path="/repairer/dashboard" element={!repairer ? <Navigate to="/repairer/login" /> : <RepairerMaindashboard /> } />
          <Route path="/repairer/inprogress" element={!repairer ? <Navigate to="/repairer/login" /> : <RepairerInprogress /> } />
          <Route path="/repairer/completed" element={!repairer ? <Navigate to="/repairer/login" /> : <RepairerCompleted /> } />
          <Route path="/repairer/profile" element={!repairer ? <Navigate to="/repairer/login" /> : <RepairerProfile /> } />

        </Routes>
      
    </div>
  );
}

export default App;