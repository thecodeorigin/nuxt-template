export function removePTags(html: string): string {
  // Remove empty <p> tags from tiptap editor
  return html.replace(/<p>\s*<\/p>/g, '')
}

export const iconMappings: { [key: string]: string | null } = {
  '': null,
  'Time Line': 'ri-timer-line',
  'Home': 'ri-home-line',
  'Settings': 'ri-settings-line',
  'User': 'ri-user-line',
  'Calendar': 'ri-calendar-line',
  'Search': 'ri-search-line',
  'Notification': 'ri-notification-line',
  'Camera': 'ri-camera-line',
  'Shopping Cart': 'ri-shopping-cart-line',
  'Heart': 'ri-heart-line',
  'Layout': 'ri-layout-line',
  'User Smile': 'ri-user-smile-line',
  'Left Arrow': 'ri-arrow-left-line',
  'Right Arrow': 'ri-arrow-right-line',
}

export const iconNameList = Object.keys(iconMappings)

export function getRemixIcon(iconName: string): string | null {
  return iconMappings[iconName] || null
}
