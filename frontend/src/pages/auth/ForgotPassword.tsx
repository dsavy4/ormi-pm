import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Mail, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useTheme } from '@/contexts/ThemeContext';
import toast from 'react-hot-toast';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Simulate API call for password reset
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll show success for any valid email
      if (email.includes('@') && email.includes('.')) {
        setIsSubmitted(true);
        toast.success('Password reset link sent successfully!', {
          duration: 4000,
          position: 'bottom-right',
          style: {
            background: 'hsl(var(--card))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        });
      } else {
        setError('Please enter a valid email address.');
      }
    } catch (error) {
      console.error('Password reset failed:', error);
      setError('Failed to send reset email. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTryAgain = () => {
    setIsSubmitted(false);
    setEmail('');
    setError('');
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

      {/* Card Container */}
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
              {/* Professional ORMI Logo */}
              <div className="flex items-center justify-center mb-4">
                <motion.div
                  className="relative"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                >
                  <img
                    src={theme === 'dark' ? '/ormi_logo_dark.png' : '/ormi-logo.png'}
                    alt="ORMI"
                    className="h-20 w-auto object-contain max-w-full"
                    onError={(e) => {
                      // Fallback to simple text logo if image fails
                      e.currentTarget.style.display = 'none';
                      const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                      if (fallback) fallback.style.display = 'block';
                    }}
                  />
                  
                  {/* Fallback text logo */}
                  <div className="hidden">
                    <h1 className="text-4xl font-bold text-ormi-gradient">
                      ORMI
                    </h1>
                  </div>
                </motion.div>
              </div>
              
              {/* Page Title */}
              <h2 className="text-xl font-semibold text-ormi-primary mb-2">
                {isSubmitted ? 'Check Your Email' : 'Reset Your Password'}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isSubmitted 
                  ? 'We\'ve sent a password reset link to your email'
                  : 'Enter your email to receive a password reset link'
                }
              </p>
            </motion.div>

            <AnimatePresence mode="wait">
              {!isSubmitted ? (
                <motion.div
                  key="form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
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

                  {/* Reset Form */}
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
                          placeholder="Enter your email address"
                          disabled={isLoading}
                          required
                        />
                      </div>
                    </div>

                    {/* Send Reset Link Button */}
                    <motion.div
                      whileTap={{ scale: 0.98 }}
                    >
                      <Button
                        type="submit"
                        disabled={isLoading || !email}
                        className="w-full h-12 bg-ormi-gradient hover:shadow-lg hover:shadow-ormi-primary/25 text-white font-medium rounded-lg transition-all-smooth group active-press"
                      >
                        {isLoading ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Sending Reset Link...
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            Send Reset Link
                            <Mail className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                          </div>
                        )}
                      </Button>
                    </motion.div>
                  </motion.form>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center space-y-6"
                >
                  {/* Success Icon */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
                    className="flex justify-center"
                  >
                    <div className="w-16 h-16 bg-ormi-primary/10 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-ormi-primary" />
                    </div>
                  </motion.div>

                  {/* Success Message */}
                  <div className="space-y-2">
                    <p className="text-foreground">
                      We've sent a password reset link to:
                    </p>
                    <p className="font-medium text-ormi-primary">
                      {email}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Please check your email and click the link to reset your password.
                    </p>
                  </div>

                  {/* Try Again Button */}
                  <Button
                    onClick={handleTryAgain}
                    variant="outline"
                    className="w-full h-12 border-ormi-primary text-ormi-primary hover:bg-ormi-primary hover:text-white transition-all-smooth"
                  >
                    Send to Different Email
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer Links */}
            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <Link
                to="/login"
                className="text-ormi-primary hover:text-ormi-primary-dark text-sm font-medium transition-colors hover-lift inline-flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
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
              <span>Professional Platform</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export function ResetPassword() {
  return <div>Reset Password - Coming soon...</div>;
} 