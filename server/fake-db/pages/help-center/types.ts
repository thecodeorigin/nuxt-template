// 👉 Help center
export interface HelpCenterSubcategoryArticles {
  slug: string
  title: string
  content: string
}
export interface HelpCenterAllCategoryArticles {
  title: string
  icon: string
  articles: { title: string }[]
}
export interface HelpCenterSubcategories {
  icon: string
  slug: string
  title: string
  articles: HelpCenterSubcategoryArticles[]
}
export interface HelpCenterCategories {
  icon: string
  slug: string
  title: string
  avatarColor: string
  subCategories: HelpCenterSubcategories[]
}
export interface HelpCenterArticlesOverview {
  img: string
  slug: string
  title: string
  subtitle: string
}

export interface HelpCenterArticle {
  title: string
  lastUpdated: string
  productContent: string
  productImg: string
  checkoutContent: string
  checkoutImg: string
  articleList: string[]
}
