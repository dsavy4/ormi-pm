import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const success = await login(email, password);
      if (success) {
        navigate('/dashboard');
      } else {
        setError('Invalid email or password. Please try again.');
      }
    } catch (error) {
      console.error('Login failed:', error);
      setError('Login failed. Please check your credentials and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden gradient-bg">
      {/* Subtle Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-ormi-primary/5 to-ormi-primary/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.1, 1],
            rotate: [0, 45, 0],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
        />
        <motion.div
          className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-ormi-primary/3 to-ormi-primary/8 rounded-full blur-3xl"
          animate={{
            scale: [1.1, 1, 1.1],
            rotate: [45, 0, 45],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      </div>

      {/* Login Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Premium Glassmorphism Card */}
        <Card className="card-premium border-0 shadow-2xl">
          <CardContent className="p-8">
            {/* Logo and Branding */}
            <motion.div
              className="text-center mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              {/* Professional ORMI Logo - Much Larger */}
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <motion.img
                    src={theme === 'dark' ? '/ormi_logo_dark.png' : '/ormi-logo.png'}
                    alt="ORMI"
                    className="h-32 w-auto object-contain max-w-full"
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    onError={(e) => {
                      // Fallback to simple text logo if image fails
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  
                  {/* Fallback text logo */}
                  <div className="hidden">
                    <h1 className="text-5xl font-bold text-ormi-gradient">
                      ORMI
                    </h1>
                  </div>
                </motion.div>
              </div>
              
              {/* Single Professional Tagline - Industry Standard */}
              <h2 className="text-lg font-semibold text-ormi-primary">
                Professional Property Management Platform
              </h2>
            </motion.div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  className="mb-6 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 flex-shrink-0" />
                  <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Login Form */}
            <motion.form
              onSubmit={handleSubmit}
              className="space-y-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
            >
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Email Address
                </label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-ormi-primary transition-colors" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12 form-input hover-glow focus:ring-ormi-primary/20"
                    placeholder="Enter your email"
                    disabled={isLoading}
                    required
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Password
                </label>
                <div className="relative group">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-ormi-primary transition-colors" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-12 h-12 form-input hover-glow focus:ring-ormi-primary/20"
                    placeholder="Enter your password"
                    disabled={isLoading}
                    required
                  />
                  <motion.button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-ormi-primary transition-colors p-1 rounded-md hover:bg-muted flex items-center justify-center w-6 h-6"
                    whileTap={{ scale: 0.95 }}
                    disabled={isLoading}
                    data-testid="password-toggle"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </motion.button>
                </div>
              </div>

              {/* Sign In Button */}
              <motion.div
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  type="submit"
                  disabled={isLoading || !email || !password}
                  className="w-full h-12 bg-ormi-gradient hover:shadow-lg hover:shadow-ormi-primary/25 text-white font-medium rounded-lg transition-all-smooth group active-press"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Signing in...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      Sign In
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  )}
                </Button>
              </motion.div>
            </motion.form>

            {/* Footer Links */}
            <motion.div
              className="mt-8 space-y-4 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to="/forgot-password"
                className="text-ormi-primary hover:text-ormi-primary-dark text-sm font-medium transition-colors hover-lift inline-block"
              >
                Forgot your password?
              </Link>
              
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-ormi-primary hover:text-ormi-primary-dark font-medium transition-colors hover-lift inline-block"
                >
                  Sign up here
                </Link>
              </div>
            </motion.div>
          </CardContent>
        </Card>

        {/* Trust Indicators */}
        <motion.div
          className="mt-6 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Secure & Encrypted</span>
            </div>
            <div className="w-px h-3 bg-border"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-ormi-primary rounded-full animate-pulse"></div>
              <span>Trusted Platform</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 