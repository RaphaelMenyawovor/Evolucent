declare module "@paystack/inline-js" {
  interface PaystackTransactionOptions {
    key: string
    email: string
    amount: number
    currency?: string
    ref?: string
    metadata?: Record<string, unknown>
    onSuccess: (transaction: { reference: string; trans: string; status: string; message: string }) => void
    onCancel: () => void
  }

  class PaystackPop {
    newTransaction(options: PaystackTransactionOptions): void
  }

  export default PaystackPop
}
