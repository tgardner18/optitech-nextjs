/**
 * Demo product catalog (ported from the source finance demo).
 *
 * Referenced by the BigQuery sync (lib/bq/sync.ts) to join a customer's linked
 * product ids to catalog facts (rates, fees, features). Finance-demo domain
 * data — kept intact for the ported sync payloads; not wired into the public
 * OptiTech site.
 */

export type ProductCategory = 'Personal' | 'Business'
export type ProductType = 'checking' | 'savings' | 'credit_card'

export interface DemoProduct {
  product_id: string
  name: string
  segment: ProductCategory
  product_type: ProductType
  description: string
  image_url: string
  features: string
  apr: string
  rewards_rate: string
  annual_fee: number
  monthly_fee: number
  interest_rate: string
  minimum_balance: number
  target_audience: string
  featured: boolean
  product_url: string
}

export const PRODUCTS: DemoProduct[] = [
  // Personal — Bank Accounts
  {
    product_id: 'personal-checking-everyday',
    name: 'Brightstream Everyday Checking',
    segment: 'Personal',
    product_type: 'checking',
    description:
      'No-fee everyday checking with early direct deposit and fee-free access to over 55,000 ATMs nationwide.',
    image_url: '/design/Brightstream-bank/images/products/everyday-checking.jpg',
    features:
      'No monthly fee; No minimum balance; Early direct deposit (up to 2 days early); Free debit card; 55,000+ fee-free ATMs',
    apr: '',
    rewards_rate: '',
    annual_fee: 0,
    monthly_fee: 0,
    interest_rate: '0.01% APY',
    minimum_balance: 0,
    target_audience: 'Everyday banking customers',
    featured: true,
    product_url: '/personal-banking/checking',
  },
  {
    product_id: 'personal-savings-high-yield',
    name: 'Brightstream High-Yield Savings',
    segment: 'Personal',
    product_type: 'savings',
    description:
      'Earn one of the highest savings rates in the country with no monthly fees and no minimums to start.',
    image_url: '/design/Brightstream-bank/images/products/high-yield-savings.jpg',
    features: '4.50% APY; No monthly fee; No minimum to open; FDIC insured; Auto-save tools',
    apr: '',
    rewards_rate: '',
    annual_fee: 0,
    monthly_fee: 0,
    interest_rate: '4.50% APY',
    minimum_balance: 0,
    target_audience: 'Savers and emergency-fund builders',
    featured: true,
    product_url: '/personal-banking/savings',
  },
  {
    product_id: 'personal-checking-student',
    name: 'Brightstream Student Checking',
    segment: 'Personal',
    product_type: 'checking',
    description:
      'Built for students 16–24: no fees, free overdraft protection, and budgeting tools that grow with you.',
    image_url: '/design/Brightstream-bank/images/products/student-checking.jpg',
    features:
      'No monthly fee for students; No overdraft fees; Budgeting & goals app; Parental co-management option',
    apr: '',
    rewards_rate: '',
    annual_fee: 0,
    monthly_fee: 0,
    interest_rate: '0.01% APY',
    minimum_balance: 0,
    target_audience: 'Students ages 16–24',
    featured: false,
    product_url: '/personal-banking/student-checking',
  },

  // Personal — Credit Cards
  {
    product_id: 'personal-cc-cashback',
    name: 'Brightstream Cashback Card',
    segment: 'Personal',
    product_type: 'credit_card',
    description:
      'Unlimited 2% cash back on every purchase with no annual fee and no rotating categories.',
    image_url: '/design/Brightstream-bank/images/products/cashback-card.jpg',
    features:
      '2% cash back on all purchases; $200 welcome bonus; No annual fee; No foreign transaction fees',
    apr: '19.99%–28.99% variable',
    rewards_rate: '2% cash back',
    annual_fee: 0,
    monthly_fee: 0,
    interest_rate: '',
    minimum_balance: 0,
    target_audience: 'Everyday spenders who want simple rewards',
    featured: true,
    product_url: '/personal-banking/credit-cards/cashback',
  },
  {
    product_id: 'personal-cc-travel',
    name: 'Brightstream Travel Rewards',
    segment: 'Personal',
    product_type: 'credit_card',
    description:
      'Earn 3x miles on travel and dining with travel insurance, lounge access, and no foreign transaction fees.',
    image_url: '/design/Brightstream-bank/images/products/travel-card.jpg',
    features:
      '3x miles on travel & dining; 1x miles on everything else; 60,000 mile welcome offer; Trip insurance; Priority Pass lounge access',
    apr: '21.99%–29.99% variable',
    rewards_rate: '3x miles on travel & dining',
    annual_fee: 95,
    monthly_fee: 0,
    interest_rate: '',
    minimum_balance: 0,
    target_audience: 'Frequent travelers and foodies',
    featured: true,
    product_url: '/personal-banking/credit-cards/travel',
  },
  {
    product_id: 'personal-cc-secured-starter',
    name: 'Brightstream Secured Starter Card',
    segment: 'Personal',
    product_type: 'credit_card',
    description:
      'Build or rebuild credit with a refundable security deposit, automatic credit-line reviews, and free credit-score monitoring.',
    image_url: '/design/Brightstream-bank/images/products/starter-card.jpg',
    features:
      'Refundable security deposit; Reports to all 3 bureaus; Automatic credit-line increase reviews; Free FICO® score',
    apr: '24.99% variable',
    rewards_rate: '1% cash back on essentials',
    annual_fee: 0,
    monthly_fee: 0,
    interest_rate: '',
    minimum_balance: 0,
    target_audience: 'Customers building or rebuilding credit',
    featured: false,
    product_url: '/personal-banking/credit-cards/starter',
  },

  // Business — Bank Accounts
  {
    product_id: 'business-checking-operating',
    name: 'Brightstream Business Operating Checking',
    segment: 'Business',
    product_type: 'checking',
    description:
      'A flexible operating account for growing businesses with unlimited transactions and built-in cash-flow tools.',
    image_url: '/design/Brightstream-bank/images/products/business-operating.jpg',
    features:
      'Unlimited transactions; Free incoming wires; Cash-flow dashboard; Multi-user access; QuickBooks & Xero integration',
    apr: '',
    rewards_rate: '',
    annual_fee: 0,
    monthly_fee: 15,
    interest_rate: '0.05% APY',
    minimum_balance: 1500,
    target_audience: 'SMBs with regular daily transactions',
    featured: true,
    product_url: '/business/checking',
  },
  {
    product_id: 'business-savings-reserve',
    name: 'Brightstream Business Reserve Savings',
    segment: 'Business',
    product_type: 'savings',
    description:
      'Set aside operating reserves and earn competitive interest with same-day transfers to your operating account.',
    image_url: '/design/Brightstream-bank/images/products/business-reserve.jpg',
    features:
      '3.75% APY on balances up to $250K; Same-day transfers; FDIC insured; Sub-account labels',
    apr: '',
    rewards_rate: '',
    annual_fee: 0,
    monthly_fee: 5,
    interest_rate: '3.75% APY',
    minimum_balance: 1000,
    target_audience: 'Established businesses building reserves',
    featured: false,
    product_url: '/business/savings',
  },
  {
    product_id: 'business-money-market',
    name: 'Brightstream Business Money Market',
    segment: 'Business',
    product_type: 'savings',
    description:
      'Tiered, high-yield money market account with check-writing access for larger working-capital balances.',
    image_url: '/design/Brightstream-bank/images/products/business-mmkt.jpg',
    features:
      'Tiered APY up to 4.25%; Check-writing privileges; Sweep from operating account; Dedicated relationship manager at $250K+',
    apr: '',
    rewards_rate: '',
    annual_fee: 0,
    monthly_fee: 10,
    interest_rate: '4.25% APY (top tier)',
    minimum_balance: 25000,
    target_audience: 'Businesses with significant working capital',
    featured: false,
    product_url: '/business/money-market',
  },

  // Business — Credit Cards
  {
    product_id: 'business-cc-platinum',
    name: 'Brightstream Business Platinum',
    segment: 'Business',
    product_type: 'credit_card',
    description:
      'Premium business card with 5x rewards on travel, lounge access, and elevated expense controls.',
    image_url: '/design/Brightstream-bank/images/products/business-platinum.jpg',
    features:
      '5x points on travel; 3x on shipping & advertising; 1x on everything else; 120,000 point welcome bonus; Airport lounge access; Employee cards with controls',
    apr: '20.49%–28.49% variable',
    rewards_rate: '5x on travel; 3x on shipping & advertising',
    annual_fee: 250,
    monthly_fee: 0,
    interest_rate: '',
    minimum_balance: 0,
    target_audience: 'Established businesses with significant travel spend',
    featured: true,
    product_url: '/business/credit-cards/platinum',
  },
  {
    product_id: 'business-cc-cashback',
    name: 'Brightstream Business Cashback',
    segment: 'Business',
    product_type: 'credit_card',
    description:
      'Simple 2% cash back on every business purchase with no annual fee and free employee cards.',
    image_url: '/design/Brightstream-bank/images/products/business-cashback.jpg',
    features:
      '2% cash back on all purchases; $500 welcome bonus after $5K spend; No annual fee; Free employee cards; Expense category reports',
    apr: '19.49%–27.49% variable',
    rewards_rate: '2% cash back on all purchases',
    annual_fee: 0,
    monthly_fee: 0,
    interest_rate: '',
    minimum_balance: 0,
    target_audience: 'Small businesses wanting straightforward rewards',
    featured: true,
    product_url: '/business/credit-cards/cashback',
  },
  {
    product_id: 'business-cc-travel',
    name: 'Brightstream Business Travel',
    segment: 'Business',
    product_type: 'credit_card',
    description:
      '3x miles on business travel and dining with trip insurance and no foreign transaction fees.',
    image_url: '/design/Brightstream-bank/images/products/business-travel.jpg',
    features:
      '3x miles on travel & dining; 1.5x miles on everything else; 75,000 mile welcome offer; Trip cancellation insurance; No foreign transaction fees',
    apr: '21.49%–28.99% variable',
    rewards_rate: '3x miles on travel & dining',
    annual_fee: 95,
    monthly_fee: 0,
    interest_rate: '',
    minimum_balance: 0,
    target_audience: 'Businesses with frequent travel needs',
    featured: false,
    product_url: '/business/credit-cards/travel',
  },
]

export function getProductById(id: string): DemoProduct | undefined {
  return PRODUCTS.find((p) => p.product_id === id)
}

export function getProductsByCategory(category: ProductCategory): DemoProduct[] {
  return PRODUCTS.filter((p) => p.segment === category)
}

export function getProductsByType(type: ProductType): DemoProduct[] {
  return PRODUCTS.filter((p) => p.product_type === type)
}
