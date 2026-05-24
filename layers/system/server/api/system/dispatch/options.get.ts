import { defineAuthorizedHandler } from '#layers/auth/server/services/casl'
import { getDispatchOptions } from '#layers/system/server/services/dispatch'

export default defineAuthorizedHandler(['system:manage'], () => getDispatchOptions())
