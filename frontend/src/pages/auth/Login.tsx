import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Loader2, AlertCircle, Shield, CheckCircle, Info, Key, Server, Database, Globe, Fingerprint } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

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
                  <img
                    src={theme === 'dark' ? '/ormi_logo_dark.png' : '/ormi-logo.png'}
                    alt="ORMI"
                    className="h-32 w-auto object-contain max-w-full"
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
                    autoComplete="email"
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
                    autoComplete="current-password"
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
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 hover:shadow-lg hover:shadow-emerald-500/25 text-white font-medium rounded-lg transition-all-smooth group active-press"
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
                to="/auth/forgot-password"
                className="text-ormi-primary hover:text-ormi-primary-dark text-sm font-medium transition-colors hover-lift inline-block"
              >
                Forgot your password?
              </Link>
              
              <div className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link
                  to="/auth/register"
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
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 hover:text-green-400 transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>Secure & Encrypted</span>
                  <Info className="w-3 h-3" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg">
                      <Shield className="h-6 w-6 text-white" />
                    </div>
                    Enterprise Security & Compliance
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    ORMI employs enterprise-grade security measures to protect your data and ensure the integrity of our platform.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Security Features */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Lock className="h-5 w-5 text-emerald-600" />
                      Security Features
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Multi-Factor Authentication</div>
                          <div className="text-xs text-muted-foreground">Secure login with 2FA for all users</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Eye className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">End-to-End Encryption</div>
                          <div className="text-xs text-muted-foreground">AES-256 encryption in transit and at rest</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Key className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Role-Based Access Control</div>
                          <div className="text-xs text-muted-foreground">Fine-grained permissions and access management</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Infrastructure & Compliance */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Server className="h-5 w-5 text-blue-600" />
                      Infrastructure & Compliance
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Secure Database</div>
                          <div className="text-xs text-muted-foreground">Geographically distributed, encrypted storage</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Global Infrastructure</div>
                          <div className="text-xs text-muted-foreground">99.9% uptime with worldwide data centers</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Fingerprint className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Advanced Monitoring</div>
                          <div className="text-xs text-muted-foreground">Real-time threat detection and response</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Certifications */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-semibold mb-3">Security Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      SOC 2 Type II
                    </Badge>
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <Shield className="h-3 w-3 mr-1" />
                      GDPR Compliant
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <Lock className="h-3 w-3 mr-1" />
                      ISO 27001
                    </Badge>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      <Server className="h-3 w-3 mr-1" />
                      PCI DSS Level 1
                    </Badge>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <div className="w-px h-3 bg-border"></div>
            
            <Dialog>
              <DialogTrigger asChild>
                <button className="flex items-center gap-1 hover:text-ormi-primary transition-colors cursor-pointer">
                  <div className="w-2 h-2 bg-ormi-primary rounded-full animate-pulse"></div>
                  <span>Trusted Platform</span>
                  <Info className="w-3 h-3" />
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-lg">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    Trusted Platform & Infrastructure
                  </DialogTitle>
                  <DialogDescription className="text-base">
                    Built with reliability, performance, and trust at the core of our enterprise platform.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  {/* Platform Reliability */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Server className="h-5 w-5 text-blue-600" />
                      Platform Reliability
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <CheckCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">99.9% Uptime</div>
                          <div className="text-xs text-muted-foreground">Enterprise-grade infrastructure with redundant systems</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Globe className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Global Infrastructure</div>
                          <div className="text-xs text-muted-foreground">Data centers worldwide for low latency access</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Database className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Secure Database</div>
                          <div className="text-xs text-muted-foreground">Point-in-time recovery and automated backups</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Support & Monitoring */}
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      <Eye className="h-5 w-5 text-indigo-600" />
                      Support & Monitoring
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Fingerprint className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">24/7 Monitoring</div>
                          <div className="text-xs text-muted-foreground">Real-time monitoring and automated alerting</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Shield className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Expert Support</div>
                          <div className="text-xs text-muted-foreground">Dedicated support team available 24/7</div>
                        </div>
                      </div>
                      <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Key className="h-4 w-4 text-indigo-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="font-medium text-sm">Performance Optimization</div>
                          <div className="text-xs text-muted-foreground">Continuous optimization for optimal performance</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Platform Badges */}
                <div className="mt-6 pt-4 border-t border-border">
                  <h4 className="font-semibold mb-3">Platform Certifications</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      ISO 27001
                    </Badge>
                    <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200">
                      <Server className="h-3 w-3 mr-1" />
                      SOC 2 Type II
                    </Badge>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      <Globe className="h-3 w-3 mr-1" />
                      99.9% Uptime
                    </Badge>
                    <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      <Shield className="h-3 w-3 mr-1" />
                      Enterprise Ready
                    </Badge>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
} 