import { db } from '@nuxthub/db'
import { invoiceItemTable, invoiceTable } from '@nuxthub/db/schema'
import { createError, readValidatedBody } from 'h3'
import { CreateInvoiceSchema } from '#layers/billing/shared/schemas/invoice'

function generateInvoiceNumber(): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const rand = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `INV-${year}${month}-${rand}`
}

export default defineAuthorizedHandler(['billing:manage'], async (event, { session }) => {
  const orgId = session.activeOrg
  if (!orgId)
    throw createError({ statusCode: 400, statusMessage: 'No active organization' })

  const { items, ...invoiceData } = await readValidatedBody(event, CreateInvoiceSchema.parse)

  const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
  const total = subtotal

  const [invoice] = await db.insert(invoiceTable).values({
    ...invoiceData,
    organization_id: orgId,
    number: generateInvoiceNumber(),
    subtotal,
    total,
    due_at: invoiceData.due_at ? new Date(invoiceData.due_at) : undefined,
  }).returning()

  if (items.length > 0) {
    await db.insert(invoiceItemTable).values(
      items.map(item => ({
        invoice_id: invoice!.id,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency: item.currency,
        amount: item.unit_price * item.quantity,
      })),
    )
  }

  return invoice!
})
