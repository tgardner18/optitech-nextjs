/**
 * Demo persona type definitions.
 *
 * NOTE: The source project shipped a large hardcoded bank-persona dataset here
 * (Personal/Business customers with accounts and transactions). That dataset
 * is finance-demo-specific and is not used by the Demo Controls tooling in
 * this project, so only the type definitions were ported. Re-add persona
 * instances here if a login/persona-switch flow is ported later.
 */

export interface DemoAccount {
  id: string
  type: 'checking' | 'savings' | 'credit'
  name: string
  balance: number
  accountNumber: string
  /** Product id from lib/demo/products.ts — joins account facts to the catalog. */
  productId?: string
  /** Account open date (YYYY-MM-DD). */
  openedAt?: string
  /** True if this is the customer's primary account of this type. */
  isPrimary?: boolean
}

export interface DemoTransaction {
  id: string
  date: string
  merchant: string
  category: string
  amount: number
  type: 'debit' | 'credit'
}

export interface DemoPersona {
  id: string
  fsUserId: string
  balanceTier?: 'high' | 'medium' | 'low'
  type: 'Personal' | 'Business'
  displayName: string
  profile: {
    firstName: string
    lastName: string
    email: string
    gender: 'M' | 'F'
    phone: string
    avatarUrl: string
    location: {
      street: string
      city: string
      state: string
      zip: string
      country: string
    }
    dob: string
    age: number
    memberSince: string
  }
  credentials: {
    username: string
    password: string
  }
  accounts: DemoAccount[]
  transactions: DemoTransaction[]
  defaultLinkedProductIds: string[]
}
