export default defineNuxtPlugin(() => {
  return {
    provide: {
      formatCreatedAt: (createdAt: string) => {
        const now = new Date().getTime()
        const diffTime = now - new Date(createdAt).getTime()
        const seconds = diffTime / 1000
        const minutes = seconds / 60
        const hours = minutes / 60
        const days = hours / 24
        const months = days / 30
        const years = months / 12

        if (seconds < 60) {
          return 'now'
        }
        else if (minutes < 60) {
          return `${Math.floor(minutes)} minutes ago`
        }
        else if (hours < 24) {
          return `${Math.floor(hours)} hours ago`
        }
        else if (days < 30) {
          return `${Math.floor(days)} days ago`
        }
        else if (months < 12) {
          return `${Math.floor(months)} months ago`
        }
        else {
          return `${Math.floor(years)} years ago`
        }
      },
    },
  }
})
