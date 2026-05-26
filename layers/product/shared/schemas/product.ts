import { z } from 'zod'

export const PRODUCT_CURRENCIES = ['USD', 'EUR', 'GBP', 'VND', 'JPY', 'AUD', 'CAD'] as const
export type ProductCurrency = typeof PRODUCT_CURRENCIES[number]

const ProductBaseSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  type: z.enum(['one_time', 'recurring']).default('one_time'),
  price: z.number().int().min(0),
  price_currency: z.enum(PRODUCT_CURRENCIES).default('USD'),
  billing_interval: z.enum(['month', 'year']).optional(),
  status: z.enum(['active', 'inactive']).default('active'),
})

export const CreateProductSchema = ProductBaseSchema.refine(
  data => data.type !== 'recurring' || !!data.billing_interval,
  { message: 'billing_interval is required for recurring products', path: ['billing_interval'] },
)

export const UpdateProductSchema = ProductBaseSchema.partial()

export type CreateProduct = z.infer<typeof CreateProductSchema>
export type UpdateProduct = z.infer<typeof UpdateProductSchema>
