export interface Faq {
  question: string
  answer: string
}

export interface Faqs {
  id: string
  title: string
  icon: string
  subtitle: string
  questions: Faq[]
}
