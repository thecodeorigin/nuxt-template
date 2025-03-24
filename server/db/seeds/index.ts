import { seedCreditPackages } from './credit_packages.seed'
import { seedNotifications } from './notifications.seed'

(async () => {
  await seedCreditPackages()

  await seedNotifications('ax0p23zp6a2k', 'nguyenhuunguyeny.ny@gmail.com')

  process.exit(0)
})()
