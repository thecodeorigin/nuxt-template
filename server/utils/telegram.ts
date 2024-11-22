interface TelegramEventDetails {
  [key: string]: any // Định nghĩa một object linh hoạt, có thể chứa bất kỳ cặp key-value nào
}

type EventType = 'CREATE_USER' | 'CREATE_STRIPE_CUSTOMER_ON_SIGNUP' | 'CREATE_STRIPE_CUSTOMER' | 'CREATE_STRIPE_SUBSCRIPTION' | 'CREATE_PROJECT' | 'FILE_ERROR' | 'LOGIN_SUCCESS' | 'LOGIN_FAILURE' | 'SYSTEM_ALERT' | 'DELETE_USER' | 'UPDATE_PROJECT'

interface TelegramLogEvent {
  isError?: boolean // Có phải là lỗi không
  eventType: EventType // Loại sự kiện, ví dụ: CREATE_USER, FILE_ERROR
  details?: TelegramEventDetails // Chi tiết của sự kiện (tuỳ chọn)
}

export async function logEventToTelegram({ eventType, details, isError }: TelegramLogEvent) {
  if (!process.env.TELEGRAM_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.error('Telegram configuration is missing: TELEGRAM_TOKEN or TELEGRAM_CHAT_ID is not set.')
    return
  }

  // Kiểm tra loại sự kiện có phải là lỗi
  const icon = isError ? '❌' : '✅'
  const message = `${icon} <b>Event Type:</b> ${eventType}`
  const formattedDetails = details ? `<code>${JSON.stringify(details, null, 2)}</code>` : ''

  try {
    await $fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_TOKEN}/sendMessage`, {
      method: 'POST',
      body: {
        chat_id: process.env.TELEGRAM_CHAT_ID,
        text: `
${message}
${formattedDetails}
        `.trim(),
        parse_mode: 'HTML',
      },
    })

    console.log('Telegram message sent successfully')
  }
  catch (error: any) {
    console.error('Failed to send message to Telegram:', error?.message || error)
  }
}
