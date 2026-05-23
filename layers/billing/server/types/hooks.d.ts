declare module 'nitropack' {
  interface NitroRuntimeHooks {
    'billing:topup-succeeded': (p: {
      organizationId: string
      userId: string | null
      transactionId: string
      amount: number
      isFirstTopup: boolean
    }) => void | Promise<void>
  }
}
export {}
