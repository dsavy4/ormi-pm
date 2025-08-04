import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  CreditCard,
  DollarSign,
  Calendar,
  AlertCircle,
  CheckCircle,
  Loader2,
  Lock,
  Shield,
  Eye,
  EyeOff,
} from 'lucide-react';

// UI Components
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';

// API
import { tenantApi } from '@/lib/api';

// Payment form validation schema
const paymentSchema = z.object({
  amount: z.number().min(1, 'Amount must be at least $1'),
  paymentMethod: z.enum(['card', 'ach']),
  cardNumber: z.string().optional(),
  cardExpiry: z.string().optional(),
  cardCvc: z.string().optional(),
  bankAccount: z.string().optional(),
  routingNumber: z.string().optional(),
  accountNumber: z.string().optional(),
  savePaymentMethod: z.boolean().default(false),
});

type PaymentFormData = z.infer<typeof paymentSchema>;

interface PaymentFormProps {
  amount: number;
  dueDate: string;
  onSuccess: (payment: any) => void;
  onCancel: () => void;
}

export function PaymentForm({ amount, dueDate, onSuccess, onCancel }: PaymentFormProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ach'>('card');
  const [showCardDetails, setShowCardDetails] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<PaymentFormData>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount,
      paymentMethod: 'card',
      savePaymentMethod: false,
    },
  });

  const watchedAmount = watch('amount');

  const onSubmit = async (data: PaymentFormData) => {
    setIsProcessing(true);
    setError(null);

    try {
      // Create payment intent
      const paymentData = {
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        description: `Rent payment for ${new Date(dueDate).toLocaleDateString()}`,
        savePaymentMethod: data.savePaymentMethod,
      };

      const response = await tenantApi.makePayment(paymentData);

      if (response.success) {
        setSuccess(true);
        onSuccess(response.data);
      } else {
        setError(response.error || 'Payment failed');
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError('Payment processing failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center py-8"
      >
        <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500" />
        <h3 className="text-xl font-semibold mb-2">Payment Successful!</h3>
        <p className="text-gray-500 mb-4">
          Your payment of ${watchedAmount?.toFixed(2)} has been processed successfully.
        </p>
        <p className="text-sm text-gray-400">
          You will receive a confirmation email shortly.
        </p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-md mx-auto"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Make Payment
          </CardTitle>
          <CardDescription>
            Secure payment powered by Stripe
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount Due:</span>
                <span className="text-lg font-semibold">${amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Due Date:</span>
                <span className="text-sm">{new Date(dueDate).toLocaleDateString()}</span>
              </div>
              <Separator />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Amount to Pay:</span>
                <span className="text-lg font-semibold text-green-600">
                  ${watchedAmount?.toFixed(2) || amount.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div className="space-y-3">
              <Label>Payment Method</Label>
              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant={paymentMethod === 'card' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('card')}
                  className="h-12"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Credit Card
                </Button>
                <Button
                  type="button"
                  variant={paymentMethod === 'ach' ? 'default' : 'outline'}
                  onClick={() => setPaymentMethod('ach')}
                  className="h-12"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Bank Transfer
                </Button>
              </div>
            </div>

            {/* Amount Input */}
            <div className="space-y-2">
              <Label htmlFor="amount">Payment Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  className="pl-10"
                  {...register('amount', { valueAsNumber: true })}
                />
              </div>
              {errors.amount && (
                <p className="text-sm text-red-500">{errors.amount.message}</p>
              )}
            </div>

            {/* Payment Details */}
            {paymentMethod === 'card' ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Card Number</Label>
                  <Input
                    placeholder="1234 5678 9012 3456"
                    {...register('cardNumber')}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Expiry Date</Label>
                    <Input
                      placeholder="MM/YY"
                      {...register('cardExpiry')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CVC</Label>
                    <Input
                      placeholder="123"
                      {...register('cardCvc')}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Bank Name</Label>
                  <Input
                    placeholder="Your Bank Name"
                    {...register('bankAccount')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Routing Number</Label>
                  <Input
                    placeholder="123456789"
                    {...register('routingNumber')}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Account Number</Label>
                  <Input
                    placeholder="1234567890"
                    {...register('accountNumber')}
                  />
                </div>
              </div>
            )}

            {/* Save Payment Method */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="savePaymentMethod"
                checked={watch('savePaymentMethod')}
                onCheckedChange={(checked) => setValue('savePaymentMethod', !!checked)}
              />
              <Label htmlFor="savePaymentMethod" className="text-sm">
                Save payment method for future use
              </Label>
            </div>

            {/* Security Notice */}
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Your payment information is encrypted and secure. We use industry-standard SSL encryption to protect your data.
              </AlertDescription>
            </Alert>

            {/* Error Display */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isProcessing}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isProcessing}
                className="flex-1"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Pay ${watchedAmount?.toFixed(2) || amount.toFixed(2)}
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  );
} 