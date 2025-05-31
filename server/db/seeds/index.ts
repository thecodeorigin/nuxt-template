import { seedProducts } from './products.seed'
import { seedNotifications } from './notifications.seed'

(async () => {
  await seedProducts()

  await seedNotifications('ax0p23zp6a2k', 'nguyenhuunguyeny.ny@gmail.com')

  process.exit(0)
})()
