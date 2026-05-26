import { z } from 'zod'

export const InvoiceItemSchema = z.object({
  description: z.string().min(1).max(500),
  quantity: z.number().int().min(1).default(1),
  unit_price: z.number().int().min(0),
  currency: z.string().length(3).default('USD'),
})

export const CreateInvoiceSchema = z.object({
  status: z.enum(['draft', 'sent', 'paid', 'overdue', 'cancelled']).default('draft'),
  currency: z.string().length(3).default('USD'),
  notes: z.string().max(2000).optional(),
  due_at: z.string().datetime().optional(),
  items: z.array(InvoiceItemSchema).min(1),
})

export const UpdateInvoiceSchema = CreateInvoiceSchema.omit({ items: true }).partial()

export const UpdateBillingSettingsSchema = z.object({
  company_name: z.string().max(200).optional(),
  tax_id: z.string().max(100).optional(),
  address: z.string().max(500).optional(),
  city: z.string().max(100).optional(),
  country: z.string().length(2).optional(),
  currency: z.string().length(3).optional(),
})

export type InvoiceItem = z.infer<typeof InvoiceItemSchema>
export type CreateInvoice = z.infer<typeof CreateInvoiceSchema>
export type UpdateInvoice = z.infer<typeof UpdateInvoiceSchema>
export type UpdateBillingSettings = z.infer<typeof UpdateBillingSettingsSchema>
