import { z } from 'zod'

export const CheckoutSchema = z.object({
  amount: z.coerce.number().int().min(10000).max(50_000_000),
})

export const SepayWebhookSchema = z.object({
  id: z.union([z.string(), z.number()]).transform(String),
  transferAmount: z.coerce.number().int().positive(),
  transferType: z.string(),
  content: z.string().default(''),
  code: z.string().nullable().optional(),
})

export type Checkout = z.infer<typeof CheckoutSchema>
