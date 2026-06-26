import { getReferralStats } from '#layers/referral/server/services/referral'

export default defineAuthenticatedHandler((_event, session) => getReferralStats(session.sub))
