import { defineAuthenticatedHandler } from '#layers/auth/server/services/auth'
import { getReferralStats } from '#layers/referral/server/services/referral'

export default defineAuthenticatedHandler((_event, session) => getReferralStats(session.id))
