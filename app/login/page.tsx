"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, AlertCircle, CheckCircle, PartyPopper } from "lucide-react";

type AuthMode = 'login' | 'signup' | 'reset';

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect'); // Get redirect parameter

  // Check if already logged in
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        // Already logged in, redirect
        if (session.user.email === 'usa@furnitures.com') {
          router.push('/admin');
        } else {
          // If there's a redirect URL and user is not admin, use it
          if (redirectUrl) {
            router.push(redirectUrl);
          } else {
            router.push('/user');
          }
        }
      }
    };
    checkUser();
  }, [router, redirectUrl]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) {
        setError(error.message);
        setLoading(false);
      } else if (data.user) {
        // Successfully logged in
        setSuccess("Login successful! Redirecting...");
        
        // Determine redirect path
        let redirectPath: string;
        
        if (data.user.email === 'usa@furnitures.com') {
          // Admin always goes to admin dashboard
          redirectPath = '/admin';
        } else if (redirectUrl) {
          // Regular user with redirect URL (e.g., came from checkout)
          redirectPath = redirectUrl;
        } else {
          // Regular user, normal login - go to home
          redirectPath = '/';
        }
        
        setTimeout(() => {
          router.push(redirectPath);
          router.refresh(); // Refresh to update session
        }, 1000);
      }
    } catch (err) {
      setError("An error occurred during login");
      setLoading(false);
    }
  }

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Enhanced email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const trimmedEmail = email.trim().toLowerCase();
    
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }

    if (!fullName.trim()) {
      setError("Please enter your full name");
      return;
    }

    setLoading(true);
    
    try {
      // Sign up the user with minimal options first
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password: password,
      });
      
      if (error) {
        console.error('Signup error:', error);
        
        // Provide user-friendly error messages
        if (error.message.includes('invalid')) {
          setError("This email address format is not accepted. Please use a different email provider (Gmail, Outlook, etc.)");
        } else if (error.message.includes('already registered')) {
          setError("This email is already registered. Please login instead or use a different email.");
        } else if (error.message.includes('rate limit')) {
          setError("Too many signup attempts. Please wait a few minutes and try again.");
        } else {
          setError(error.message || "Failed to create account. Please try again.");
        }
        
        setLoading(false);
        return;
      }
      
      if (data.user) {
        // Update user metadata after signup
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            address: address.trim(),
          }
        });

        if (updateError) {
          console.error('Metadata update error:', updateError);
        }

        // Create profile entry
        try {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: trimmedEmail,
              full_name: fullName.trim(),
              phone: phone.trim() || null,
              address: address.trim() || null,
              role: trimmedEmail === 'usa@furnitures.com' ? 'admin' : 'user'
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // Don't show error to user, profile might be created by trigger
          }
        } catch (profileErr) {
          console.error('Profile insertion failed:', profileErr);
          // Continue anyway, trigger might handle it
        }

        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          setSuccess("Please check your email to confirm your account before logging in.");
          setLoading(false);
          setTimeout(() => {
            setMode('login');
            setPassword("");
            setConfirmPassword("");
          }, 4000);
          return;
        }

        // Show success modal
        setShowSuccessModal(true);
        setLoading(false);
        
        // Wait 3 seconds then redirect to login
        setTimeout(() => {
          setShowSuccessModal(false);
          setMode('login');
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setFullName("");
          setPhone("");
          setAddress("");
          setSuccess("Account created! Please log in with your credentials.");
        }, 3000);
      } else {
        setError("Account created but verification may be required. Please check your email.");
        setLoading(false);
      }
    } catch (err) {
      setError("An error occurred during signup");
      setLoading(false);
    }
  }

  async function handlePasswordReset(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setLoading(true);
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) {
        setError(error.message);
      } else {
        setSuccess("Password reset email sent! Check your inbox.");
        setTimeout(() => {
          setMode('login');
        }, 3000);
      }
      setLoading(false);
    } catch (err) {
      setError("An error occurred while sending reset email");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 py-12 px-4">
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center animate-bounce-in shadow-2xl">
            <div className="mb-6">
              {/* Success Icon with Animation */}
              <div className="mx-auto w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mb-4 animate-scale-in">
                <CheckCircle className="w-16 h-16 text-green-600" />
              </div>
              
              {/* Celebration Icons */}
              <div className="flex justify-center gap-4 mb-4">
                <PartyPopper className="w-8 h-8 text-yellow-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
                <PartyPopper className="w-8 h-8 text-pink-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
                <PartyPopper className="w-8 h-8 text-blue-500 animate-bounce" style={{ animationDelay: '0.3s' }} />
              </div>
            </div>
            
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Aboard! 🎉</h2>
            <p className="text-gray-600 mb-2">Your account has been created successfully!</p>
            <p className="text-sm text-gray-500">Redirecting you to login...</p>
            
            {/* Progress Bar */}
            <div className="mt-6 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div className="bg-gradient-to-r from-primary-500 to-primary-700 h-full animate-progress"></div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-md mx-auto">
        {/* Mode Tabs */}
        <div className="bg-white rounded-t-xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                mode === 'login' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); setSuccess(''); }}
              className={`flex-1 py-4 px-6 font-semibold transition-all ${
                mode === 'signup' 
                  ? 'bg-primary-600 text-white' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form Container */}
          <div className="p-8">
            {/* Redirect Info Message */}
            {redirectUrl && mode === 'login' && (
              <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-blue-800 text-sm">
                  Please sign in to continue to checkout. Your cart items are waiting!
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-green-800 text-sm">{success}</p>
              </div>
            )}

            {/* Login Form */}
            {mode === 'login' && (
              <form onSubmit={handleLogin} className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Welcome Back!</h1>
                
                {/* Email Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-14 pr-14 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => setMode('reset')}
                    className="text-base text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 text-lg font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? "Logging in..." : "Login"}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {mode === 'signup' && (
              <form onSubmit={handleSignup} className="space-y-5">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Create Account</h1>
                
                {/* Full Name Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="John Doe"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Email Address *</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Phone Number (Optional)</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Address Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Address (Optional)</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="text"
                      placeholder="123 Main St, City, State"
                      value={address}
                      onChange={e => setAddress(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pl-14 pr-14 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">Must be at least 6 characters</p>
                </div>

                {/* Confirm Password Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      className="w-full pl-14 pr-14 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
                    </button>
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 text-lg font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-6" 
                  disabled={loading}
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </button>
              </form>
            )}

            {/* Password Reset Form */}
            {mode === 'reset' && (
              <form onSubmit={handlePasswordReset} className="space-y-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-3">Reset Password</h1>
                <p className="text-base text-gray-600 mb-8">Enter your email address and we'll send you a link to reset your password.</p>
                
                {/* Email Input */}
                <div>
                  <label className="block text-base font-semibold text-gray-700 mb-3">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full pl-14 pr-4 py-4 text-base border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button 
                  type="submit" 
                  className="w-full py-4 text-lg font-bold bg-primary-600 hover:bg-primary-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed" 
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </button>

                {/* Back to Login */}
                <button
                  type="button"
                  onClick={() => setMode('login')}
                  className="w-full text-center text-sm text-gray-600 hover:text-gray-800 mt-2"
                >
                  ← Back to Login
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-6 text-center text-sm text-gray-600">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
}
