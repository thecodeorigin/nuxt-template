import type { HelpCenterAllCategoryArticles, HelpCenterArticle, HelpCenterArticlesOverview } from './types'
import { getPublicUrl } from '@/server/utils/getPublicUrl'

interface DB {
  allArticles: HelpCenterAllCategoryArticles[]
  keepLearning: HelpCenterArticlesOverview[]
  popularArticles: HelpCenterArticlesOverview[]
  articleData: HelpCenterArticle
}

// Images
const discord = getPublicUrl('/images/svg/discord.svg')
const gift = getPublicUrl('/images/svg/gift.svg')
const keyboard = getPublicUrl('/images/svg/keyboard.svg')
const laptop = getPublicUrl('/images/svg/laptop.svg')
const lightbulb = getPublicUrl('/images/svg/lightbulb.svg')
const rocket = getPublicUrl('/images/svg/rocket.svg')
const checkoutImg = getPublicUrl('/images/misc/checkout-image.png')
const productImg = getPublicUrl('/images/misc/product-image.png')

export const db: DB = {
  popularArticles: [
    {
      slug: 'getting-started',
      title: 'Getting Started',
      img: rocket,
      subtitle: 'Whether you\'re new or you\'re a power user, this article will help you to',
    },
    {
      slug: 'first-steps',
      title: 'First Steps',
      img: gift,
      subtitle: 'Are you a new customer wondering on how to get started?',
    },
    {
      slug: 'external-content',
      title: 'Add External Content',
      img: keyboard,
      subtitle: 'Article will show you how to expand the functionality of App',
    },
  ],
  allArticles: [
    {
      title: 'Buying',
      icon: 'ri-shopping-cart-line',
      articles: [
        { title: 'What are Favourites?' },
        { title: 'How do I purchase an item?' },
        { title: 'How do i add or change my details?' },
        { title: 'How do refunds work?' },
        { title: 'Can I Get A Refund?' },
        { title: 'I\'m trying to find a specific item' },
      ],
    },
    {
      title: 'Item Support',
      icon: 'ri-question-line',
      articles: [
        { title: 'What is Item Support?' },
        { title: 'How to contact an author?' },
        { title: 'Where Is My Purchase Code?' },
        { title: 'Extend or renew Item Support' },
        { title: 'Item Support FAQ' },
        { title: 'Why has my item been removed?' },
      ],
    },
    {
      title: 'Licenses',
      icon: 'ri-file-text-line',
      articles: [
        { title: 'Can I use the same license for the...' },
        { title: 'How to contact an author?' },
        { title: 'I\'m making a test site - it\'s not for ...' },
        { title: 'which license do I need?' },
        { title: 'I want to make multiple end prod ...' },
        { title: 'For logo what license do I need?' },
      ],
    },
    {
      title: 'Template Kits',
      icon: 'ri-palette-line',
      articles: [
        { title: 'Template Kits' },
        { title: 'Elementor Template Kits: PHP Zip ...' },
        { title: 'Template Kits - Imported template ...' },
        { title: 'Troubleshooting Import Problems' },
        { title: 'How to use the WordPress Plugin ...' },
        { title: 'How to use the Template Kit Import ...' },
      ],
    },
    {
      title: 'Account & Password',
      icon: 'ri-lock-line',
      articles: [
        { title: 'Signing in with a social account' },
        { title: 'Locked Out of Account' },
        { title: 'I\'m not receiving the verification email' },
        { title: 'Forgotten Username Or Password' },
        { title: 'New password not accepted' },
        { title: 'What is Sign In Verification?' },
      ],
    },
    {
      title: 'Account Settings',
      icon: 'ri-user-3-line',
      articles: [
        { title: 'How do I change my password?' },
        { title: 'How do I change my username?' },
        { title: 'How do I close my account?' },
        { title: 'How do I change my email address?' },
        { title: 'How can I regain access to my a ...' },
        { title: 'Are RSS feeds available on Market?' },
      ],
    },

  ],
  keepLearning: [
    {
      slug: 'blogging',
      title: 'Blogging',
      img: laptop,
      subtitle: 'Expert tips & tools to improve your website or online store using blog.',
    },
    {
      slug: 'inspiration-center',
      title: 'Inspiration Center',
      img: lightbulb,
      subtitle: 'inspiration from experts to help you start and grow your big ideas.',
    },
    {
      slug: 'community',
      title: 'Community',
      img: discord,
      subtitle: 'A group of people living in the same place or having a particular.',
    },
  ],
  articleData: {
    title: 'How to add product in cart?',
    lastUpdated: '1 month ago  -  Updated',
    productContent: `
            <p class='text-body-1'>
              If you're after only one item, simply choose the 'Buy Now' option on the item page. This will take you directly to Checkout.
            </p>
            <p class='text-body-1'>
              If you want several items, use the 'Add to Cart' button and then choose 'Keep Browsing' to continue shopping or 'Checkout' to finalize your purchase.
            </p>
        `,
    checkoutContent: 'You can go back to your cart at any time by clicking on the shopping cart icon at the top right side of the page.',
    articleList: [
      'Template Kits',
      'Elementor Template Kits: PHP Zip Extends',
      'Envato Elements Template Kits',
      'Envato Elements Template Kits',
      'How to use the template in WordPress',
      'How to use the Template Kit Import',
    ],
    checkoutImg,
    productImg,
  },
}
