import { getDispatchOptions } from '#layers/system/server/services/dispatch'

export default defineAuthorizedHandler(['system:manage'], () => getDispatchOptions())
