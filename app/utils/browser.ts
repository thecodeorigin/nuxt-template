export function isInAppBrowser() {
  const { userAgent, isMobile } = useDevice()

  const inAppKeywords = [
    'FBAN',
    'FBAV',
    'Instagram',
    'Messenger',
    'Line',
    'Snapchat',
    'Twitter',
    'WeChat',
    'WhatsApp',
  ]

  return isMobile && inAppKeywords.some(keyword => userAgent.includes(keyword))
}
