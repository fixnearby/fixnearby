import { useState } from "react";
import {
  ArrowRight,
  Wrench,
  User,
  Eye,
  Lock,
  EyeOff,
  Phone,
} from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, Link } from "react-router-dom";
import images from "../../assets/images";
import { axiosInstance } from "../../lib/axios";

const Signup = () => {
  const navigate = useNavigate();

  const [fullname, setFullname] = useState("");
  const [phone, setPhone] = useState("");
  const [secretkey, setSecretkey] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!fullname || fullname.length < 3) {
      toast.error("Full name must be at least 3 characters");
      return;
    }

    if (!password || password.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }

    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) {
      toast.error("Phone number is required");
      return;
    }
    if (!phoneRegex.test(phone)) {
      toast.error("Please enter a valid 10-digit phone number");
      return;
    }

    if (!secretkey) {
      toast.error("Please enter a valid Secret Key");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/admin/signup", {
        fullname,
        phone,
        secretkey,
        password,
      });
      if (response.status === 200 || response.status === 201) {
        toast.success("Signup successful!");
        setFullname("");
        setPhone("");
        setSecretkey("");
        setPassword("");
        setConfirmPassword("");
        navigate("/admin/dashboard");
        window.location.reload();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.error("Signup failed:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to Signup. Please try again.";
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-50 via-white to-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6 cursor-pointer">
            <a href="/">
              <img
                src={images.logooo}
                alt="fixNearby Logo"
                className="h-10 w-auto rounded-lg shadow-md cursor-pointer"
              />
            </a>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Create an Account
          </h1>
          <p className="text-gray-600">Register as an Admin</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Full Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullname"
                  name="fullname"
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your Full Name as on Aadhar Card"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="phone"
                className="block text-sm font-semibold text-gray-700"
              >
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your Phone Number"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="secretkey"
                className="block text-sm font-semibold text-gray-700"
              >
                Secret Key
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="secretkey"
                  name="secretkey"
                  type={showPassword ? "text" : "password"}
                  value={secretkey}
                  onChange={(e) => setSecretkey(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter a valid secretkey"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-semibold text-gray-700"
              >
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="block w-full pl-10 pr-12 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  placeholder="Confirm your password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-red-500 text-xs mt-1">
                  Passwords do not match
                </p>
              )}
            </div>

            <button
              onClick={handleSubmit}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-emerald-600 to-green-700 text-white py-3 px-4 rounded-xl font-semibold text-lg hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Signup</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        .animate-slide-in { animation: slide-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Signup;
