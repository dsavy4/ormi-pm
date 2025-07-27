import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
  PaymentElement,
  AddressElement,
  LinkAuthenticationElement,
} from '@stripe/react-stripe-js';
import {
  CreditCard,
  DollarSign,
  Calendar,
  CheckCircle,
  AlertTriangle,
  Lock,
  Shield,
  Clock,
  Receipt,
  Download,
  Send,
  Plus,
  Minus,
  CreditCard as CreditCardIcon,
  Building2,
  User,
  Mail,
  Phone,
  MapPin,
  FileText,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Info,
  HelpCircle,
  Star,
  Award,
  Zap,
  Sparkles
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// API
import { paymentsApi } from '@/lib/api';

// Type declaration for import.meta.env
declare global {
  interface ImportMetaEnv {
    VITE_STRIPE_PUBLISHABLE_KEY: string;
  }
}

// Initialize Stripe
const stripePromise = loadStripe((import.meta as any).env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_...');

interface PaymentFormProps {
  amount: number;
  propertyId: string;
  unitId: string;
  onSuccess: (payment: any) => void;
  onError: (error: string) => void;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  last4: string;
  brand?: string;
  bankName?: string;
  isDefault: boolean;
  expiryMonth?: number;
  expiryYear?: number;
}

interface PaymentSchedule {
  id: string;
  amount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  isRecurring: boolean;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ amount, propertyId, unitId, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<PaymentMethod[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [showSavedMethods, setShowSavedMethods] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(amount);
  const [tipAmount, setTipAmount] = useState(0);
  const [totalAmount, setTotalAmount] = useState(amount);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'monthly' | 'weekly'>('monthly');

  // Calculate total amount including tip
  useEffect(() => {
    setTotalAmount(paymentAmount + tipAmount);
  }, [paymentAmount, tipAmount]);

  // Mock saved payment methods
  useEffect(() => {
    setSavedPaymentMethods([
      {
        id: 'pm_1',
        type: 'card',
        last4: '4242',
        brand: 'visa',
        isDefault: true,
        expiryMonth: 12,
        expiryYear: 2025,
      },
      {
        id: 'pm_2',
        type: 'bank_account',
        last4: '6789',
        bankName: 'Chase Bank',
        isDefault: false,
      },
    ]);
  }, []);

  const handlePayment = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!stripe || !elements) {
      setError('Stripe is not loaded');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // Create payment intent
      const { data: paymentIntent } = await paymentsApi.createPaymentIntent({
        amount: totalAmount * 100, // Convert to cents
        currency: 'usd',
        propertyId,
        unitId,
        paymentMethodType: paymentMethod,
        isScheduled,
        scheduleDate: isScheduled ? scheduleDate : undefined,
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : undefined,
      });

      if (paymentIntent.requiresAction) {
        // Handle 3D Secure authentication
        const { error: confirmError } = await stripe.confirmCardPayment(paymentIntent.clientSecret);
        if (confirmError) {
          setError(confirmError.message || 'Payment failed');
          return;
        }
      } else {
        // Confirm payment
        const { error: confirmError } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/tenant/payments/success`,
          },
        });

        if (confirmError) {
          setError(confirmError.message || 'Payment failed');
          return;
        }
      }

      setSuccess(true);
      onSuccess(paymentIntent);
      
      // Invalidate payment queries
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });

    } catch (err: any) {
      setError(err.message || 'Payment failed');
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSavedPaymentMethod = async () => {
    if (!selectedPaymentMethod) {
      setError('Please select a payment method');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      const { data: payment } = await paymentsApi.processPayment({
        amount: totalAmount * 100,
        paymentMethodId: selectedPaymentMethod,
        propertyId,
        unitId,
        isScheduled,
        scheduleDate: isScheduled ? scheduleDate : undefined,
        isRecurring,
        recurringInterval: isRecurring ? recurringInterval : undefined,
      });

      setSuccess(true);
      onSuccess(payment);
      
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['tenant-dashboard'] });

    } catch (err: any) {
      setError(err.message || 'Payment failed');
      onError(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const getCardIcon = (brand: string) => {
    switch (brand.toLowerCase()) {
      case 'visa': return '💳';
      case 'mastercard': return '💳';
      case 'amex': return '💳';
      case 'discover': return '💳';
      default: return '💳';
    }
  };

  const getPaymentMethodIcon = (method: PaymentMethod) => {
    if (method.type === 'card') {
      return <CreditCard className="h-4 w-4" />;
    }
    return <Building2 className="h-4 w-4" />;
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center space-y-4"
      >
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
          Payment Successful!
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Your payment of ${totalAmount.toFixed(2)} has been processed successfully.
        </p>
        <div className="flex gap-2 justify-center">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Make Another Payment
          </Button>
          <Button onClick={() => window.location.href = '/tenant/payments'}>
            View Payment History
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Amount */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Payment Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Base Amount</label>
              <Input
                type="number"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.01"
                className="text-lg font-semibold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Tip Amount</label>
              <div className="flex gap-2">
                {[0, 5, 10, 15, 20].map((tip) => (
                  <Button
                    key={tip}
                    variant={tipAmount === tip ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTipAmount(tip)}
                  >
                    {tip}%
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <Separator />
          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total Amount:</span>
            <span className="text-2xl text-green-600">${totalAmount.toFixed(2)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Method</CardTitle>
          <CardDescription>
            Choose how you'd like to pay
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={paymentMethod} onValueChange={(value) => setPaymentMethod(value as 'card' | 'ach')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="card" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Credit Card
              </TabsTrigger>
              <TabsTrigger value="ach" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Bank Transfer
              </TabsTrigger>
            </TabsList>

            <TabsContent value="card" className="space-y-4">
              {/* Saved Payment Methods */}
              {savedPaymentMethods.filter(m => m.type === 'card').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Saved Cards</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedMethods(!showSavedMethods)}
                    >
                      {showSavedMethods ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {showSavedMethods && (
                    <div className="space-y-2">
                      {savedPaymentMethods
                        .filter(m => m.type === 'card')
                        .map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded flex items-center justify-center">
                                {getCardIcon(method.brand || 'card')}
                              </div>
                              <div>
                                <div className="font-medium">
                                  {method.brand?.toUpperCase()} •••• {method.last4}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Expires {method.expiryMonth}/{method.expiryYear}
                                </div>
                              </div>
                            </div>
                            {method.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                        ))}
                      
                      {selectedPaymentMethod && (
                        <Button
                          onClick={handleSavedPaymentMethod}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                </div>
              )}

              {/* New Card */}
              <div className="space-y-4">
                <h4 className="font-medium">New Card</h4>
                <form onSubmit={handlePayment}>
                  <div className="space-y-4">
                    <PaymentElement />
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Lock className="h-4 w-4" />
                      <span>Your payment information is secure and encrypted</span>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={!stripe || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Payment...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Shield className="h-4 w-4" />
                          Pay ${totalAmount.toFixed(2)} Securely
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>

            <TabsContent value="ach" className="space-y-4">
              {/* Saved Bank Accounts */}
              {savedPaymentMethods.filter(m => m.type === 'bank_account').length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Saved Bank Accounts</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowSavedMethods(!showSavedMethods)}
                    >
                      {showSavedMethods ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>
                  
                  {showSavedMethods && (
                    <div className="space-y-2">
                      {savedPaymentMethods
                        .filter(m => m.type === 'bank_account')
                        .map((method) => (
                          <div
                            key={method.id}
                            className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                              selectedPaymentMethod === method.id
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                            }`}
                            onClick={() => setSelectedPaymentMethod(method.id)}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded flex items-center justify-center">
                                <Building2 className="h-4 w-4 text-green-600" />
                              </div>
                              <div>
                                <div className="font-medium">
                                  {method.bankName} •••• {method.last4}
                                </div>
                                <div className="text-sm text-gray-500">
                                  Bank Account
                                </div>
                              </div>
                            </div>
                            {method.isDefault && (
                              <Badge variant="secondary">Default</Badge>
                            )}
                          </div>
                        ))}
                      
                      {selectedPaymentMethod && (
                        <Button
                          onClick={handleSavedPaymentMethod}
                          disabled={isProcessing}
                          className="w-full"
                        >
                          {isProcessing ? 'Processing...' : `Pay $${totalAmount.toFixed(2)}`}
                        </Button>
                      )}
                    </div>
                  )}
                  
                  <Separator />
                </div>
              )}

              {/* New Bank Account */}
              <div className="space-y-4">
                <h4 className="font-medium">New Bank Account</h4>
                <form onSubmit={handlePayment}>
                  <div className="space-y-4">
                    <PaymentElement />
                    
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <Lock className="h-4 w-4" />
                      <span>Your bank information is secure and encrypted</span>
                    </div>
                    
                    <Button
                      type="submit"
                      disabled={!stripe || isProcessing}
                      className="w-full"
                    >
                      {isProcessing ? (
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Processing Payment...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          Pay ${totalAmount.toFixed(2)} via Bank Transfer
                        </div>
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Payment Options */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Options</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Schedule Payment */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">Schedule Payment</span>
            </div>
            <Button
              variant={isScheduled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsScheduled(!isScheduled)}
            >
              {isScheduled ? 'Scheduled' : 'Schedule'}
            </Button>
          </div>

          {isScheduled && (
            <div className="space-y-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Schedule Date</label>
                  <Input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recurring Payment</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isRecurring}
                      onChange={(e) => setIsRecurring(e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm">Make this a recurring payment</span>
                  </div>
                </div>
              </div>
              
              {isRecurring && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Recurring Interval</label>
                  <Select value={recurringInterval} onValueChange={(value: 'monthly' | 'weekly') => setRecurringInterval(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          )}

          {/* Save Payment Method */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              <span className="font-medium">Save Payment Method</span>
            </div>
            <input
              type="checkbox"
              defaultChecked
              className="rounded"
            />
          </div>
        </CardContent>
      </Card>

      {/* Security & Trust */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <span className="font-medium">Bank-Level Security</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-green-600" />
              <span className="font-medium">256-bit Encryption</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="h-5 w-5 text-purple-600" />
              <span className="font-medium">PCI Compliant</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
};

const PaymentProcessor: React.FC<PaymentFormProps> = (props) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};

export default PaymentProcessor; 