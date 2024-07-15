import type { SearchResults } from './types'

interface DB {
  searchItems: SearchResults[]
}

export const db: DB = {
  searchItems: [
    {
      title: 'Dashboard',
      category: 'dashboards',
      children: [
        {
          url: { name: 'dashboards-analytics' },
          icon: 'ri-line-chart-line',
          title: 'Analytics Dashboard',
        },
        {
          url: { name: 'dashboards-crm' },
          icon: 'ri-computer-line',
          title: 'CRM Dashboard',
        },
        {
          url: { name: 'dashboards-ecommerce' },
          title: 'eCommerce Dashboard',
          icon: 'ri-shopping-cart-2-line',
        },
        {
          url: { name: 'dashboards-academy' },
          title: 'Academy Dashboard',
          icon: 'ri-book-open-line',
        },
        {
          url: { name: 'dashboards-logistics' },
          title: 'Logistics Dashboard',
          icon: 'ri-truck-line',
        },
      ],
    },
    {
      title: 'Front Pages',
      category: 'frontPages',
      children: [
        {
          url: { name: 'front-pages-landing-page' },
          icon: 'ri-article-line',
          title: 'Landing Front',
        },
        {
          url: { name: 'front-pages-pricing' },
          icon: 'ri-money-dollar-circle-line',
          title: 'Pricing Front',
        },
        {
          url: { name: 'front-pages-payment' },
          icon: 'ri-bank-card-line',
          title: 'Payment Front',
        },
        {
          url: { name: 'front-pages-checkout' },
          icon: 'ri-shopping-cart-2-line',
          title: 'Checkout Front',
        },
        {
          url: { name: 'front-pages-help-center' },
          icon: 'ri-question-line',
          title: 'Help Center Front',
        },
      ],
    },
    {
      title: 'Apps & Pages',
      category: 'appsPages',
      children: [
        {
          url: { name: 'apps-email' },
          icon: 'ri-mail-line',
          title: 'Email',
        },
        {
          url: { name: 'apps-chat' },
          icon: 'ri-message-line',
          title: 'Chat',
        },
        {
          url: { name: 'apps-calendar' },
          icon: 'ri-calendar-line',
          title: 'Calendar',
        },
        {
          title: 'Kanban',
          icon: 'ri-drag-drop-line',
          url: { name: 'apps-kanban' },
        },
        {
          url: { name: 'apps-ecommerce-product-list' },
          icon: 'ri-file-list-line',
          title: 'Ecommerce - Product List',
        },
        {
          url: { name: 'apps-ecommerce-product-add' },
          icon: 'ri-add-line',
          title: 'Ecommerce - Add Product',
        },
        {
          url: { name: 'apps-ecommerce-product-category-list' },
          icon: 'ri-list-unordered',
          title: 'Ecommerce - Category List',
        },
        {
          url: { name: 'apps-ecommerce-order-list' },
          icon: 'ri-list-unordered',
          title: 'Ecommerce - Order List',
        },
        {
          url: { name: 'apps-ecommerce-order-details-id', params: { id: '9042' } },
          icon: 'ri-play-list-line',
          title: 'Ecommerce - Order Details',
        },
        {
          url: { name: 'apps-ecommerce-customer-list' },
          icon: 'ri-user-line',
          title: 'Ecommerce - Customer List',
        },
        {
          url: { name: 'apps-ecommerce-customer-details-id', params: { id: '478426', tab: 'security' } },
          icon: 'ri-list-unordered',
          title: 'Ecommerce - Customer Details',
        },
        {
          url: { name: 'apps-ecommerce-manage-review' },
          icon: 'ri-message-line',
          title: 'Ecommerce - Manage Review',
        },
        {
          url: { name: 'apps-ecommerce-referrals' },
          icon: 'ri-group-line',
          title: 'Ecommerce - Referrals',
        },
        {
          url: { name: 'apps-ecommerce-settings' },
          icon: 'ri-settings-2-line',
          title: 'Ecommerce - Settings',
        },
        {
          url: { name: 'apps-academy-dashboard' },
          icon: 'ri-book-open-line',
          title: 'Academy - Overview',
        },
        {
          url: { name: 'apps-academy-my-course' },
          icon: 'ri-list-unordered',
          title: 'Academy - My Courses',
        },
        {
          url: { name: 'apps-academy-course-details' },
          icon: 'ri-play-circle-line',
          title: 'Academy - Course Details',
        },
        {
          url: { name: 'apps-logistics-dashboard' },
          icon: 'ri-book-open-line',
          title: 'Logistics',
        },
        {
          url: { name: 'apps-logistics-fleet' },
          icon: 'ri-car-line',
          title: 'Logistics - fleet',
        },
        {
          url: { name: 'apps-invoice-list' },
          icon: 'ri-list-ordered-2',
          title: 'Invoice List',
        },
        {
          url: { name: 'apps-invoice-preview-id', params: { id: '5036' } },
          icon: 'ri-article-line',
          title: 'Invoice Preview',
        },
        {
          url: { name: 'apps-invoice-edit-id', params: { id: '5036' } },
          icon: 'ri-file-edit-line',
          title: 'Invoice Edit',
        },
        {
          url: { name: 'apps-invoice-add' },
          icon: 'ri-file-add-line',
          title: 'Invoice Add',
        },
        {
          url: { name: 'apps-user-list' },
          icon: 'ri-group-line',
          title: 'User List',
        },
        {
          url: { name: 'apps-user-view-id', params: { id: 21 } },
          icon: 'ri-eye-line',
          title: 'User View',
        },
        {
          url: { name: 'pages-user-profile-tab', params: { tab: 'profile' } },
          icon: 'ri-user-settings-line',
          title: 'User Profile - Profile',
        },
        {
          url: { name: 'settings-tab', params: { tab: 'account' } },
          icon: 'ri-user-settings-line',
          title: 'Account Settings - Account',
        },
        {
          url: { name: 'settings-tab', params: { tab: 'security' } },
          icon: 'ri-lock-unlock-line',
          title: 'Account Settings - Security',
        },
        {
          url: { name: 'settings-tab', params: { tab: 'billing-plans' } },
          icon: 'ri-money-dollar-circle-line',
          title: 'Account Settings - Billing',
        },
        {
          url: { name: 'settings-tab', params: { tab: 'notification' } },
          icon: 'ri-notification-3-line',
          title: 'Account Settings - Notifications',
        },
        {
          url: { name: 'settings-tab', params: { tab: 'connection' } },
          icon: 'ri-link',
          title: 'Account Settings - Connections',
        },
        {
          url: { name: 'pages-pricing' },
          icon: 'ri-money-dollar-circle-line',
          title: 'Pricing',
        },
        {
          url: { name: 'pages-faq' },
          icon: 'ri-question-line',
          title: 'FAQ',
        },
        {
          url: { name: 'pages-misc-coming-soon' },
          icon: 'ri-time-line',
          title: 'Coming Soon',
        },
        {
          url: { name: 'pages-misc-under-maintenance' },
          icon: 'ri-settings-2-line',
          title: 'Under Maintenance',
        },
        {
          url: { path: '/pages/misc/page-not-found' },
          icon: 'ri-error-warning-line',
          title: 'Page Not Found - 404',
        },
        {
          url: { name: 'pages-misc-not-authorized' },
          icon: 'ri-group-line',
          title: 'Not Authorized - 401',
        },
        {
          url: { name: 'pages-authentication-login-v1' },
          icon: 'ri-login-box-line',
          title: 'Login V1',
        },
        {
          url: { name: 'pages-authentication-login-v2' },
          icon: 'ri-login-box-line',
          title: 'Login V2',
        },
        {
          url: { name: 'pages-authentication-register-v1' },
          icon: 'ri-user-add-line',
          title: 'Register V1',
        },
        {
          url: { name: 'pages-authentication-register-v2' },
          icon: 'ri-user-add-line',
          title: 'Register V2',
        },
        {
          icon: 'ri-mail-check-line',
          title: 'Verify Email V1',
          url: { name: 'pages-authentication-verify-email-v1' },
        },
        {
          icon: 'ri-mail-check-line',
          title: 'Verify Email V2',
          url: { name: 'pages-authentication-verify-email-v2' },
        },
        {
          url: { name: 'pages-authentication-forgot-password-v1' },
          icon: 'ri-lock-line',
          title: 'Forgot Password V1',
        },
        {
          url: { name: 'pages-authentication-forgot-password-v2' },
          icon: 'ri-lock-line',
          title: 'Forgot Password V2',
        },
        {
          url: { name: 'pages-authentication-reset-password-v1' },
          icon: 'ri-rotate-lock-line',
          title: 'Reset Password V1',
        },
        {
          url: { name: 'pages-authentication-reset-password-v2' },
          icon: 'ri-rotate-lock-line',
          title: 'Reset Password V2',
        },
        {
          icon: 'ri-macbook-line',
          title: 'Two Steps V1',
          url: { name: 'pages-authentication-two-steps-v1' },
        },
        {
          icon: 'ri-macbook-line',
          title: 'Two Steps V2',
          url: { name: 'pages-authentication-two-steps-v2' },
        },
        {
          url: { name: 'pages-dialog-examples' },
          icon: 'ri-square-line',
          title: 'Dialog Examples',
        },
        {
          url: { name: 'pages-authentication-register-multi-steps' },
          icon: 'ri-user-add-line',
          title: 'Register Multi-Steps',
        },
        {
          url: { name: 'wizard-examples-checkout' },
          icon: 'ri-shopping-cart-2-line',
          title: 'Wizard - Checkout',
        },
        {
          url: { name: 'wizard-examples-create-deal' },
          icon: 'ri-gift-line',
          title: 'Wizard - create deal',
        },
        {
          url: { name: 'wizard-examples-property-listing' },
          icon: 'ri-home-line',
          title: 'Wizard - Property Listing',
        },
        {
          url: { name: 'apps-roles' },
          icon: 'ri-shield-user-line',
          title: 'Roles',
        },
        {
          url: { name: 'permissions' },
          icon: 'ri-shield-user-line',
          title: 'Permissions',
        },
      ],
    },
    {
      title: 'User Interface',
      category: 'userInterface',
      children: [
        {
          url: { name: 'pages-typography' },
          icon: 'ri-font-size',
          title: 'Typography',
        },
        {
          url: { name: 'pages-icons' },
          icon: 'ri-apps-line',
          title: 'Icons',
        },
        {
          url: { name: 'pages-cards-card-basic' },
          icon: 'ri-square-line',
          title: 'Card Basic',
        },
        {
          url: { name: 'pages-cards-card-statistics' },
          icon: 'ri-bar-chart-box-line',
          title: 'Card Statistics',
        },
        {
          url: { name: 'pages-cards-card-gamification' },
          icon: 'ri-gamepad-line',
          title: 'Card Gamification',
        },
        {
          url: { name: 'pages-cards-card-actions' },
          icon: 'ri-keyboard-line',
          title: 'Card Actions',
        },
        {
          url: { name: 'pages-cards-card-widgets' },
          icon: 'ri-layout-grid-line',
          title: 'Card Widgets',
        },
        {
          url: { name: 'pages-cards-card-advance' },
          icon: 'ri-list-check-2',
          title: 'Card Advance',
        },
        {
          url: { name: 'components-alert' },
          icon: 'ri-alert-line',
          title: 'Alerts',
        },
        {
          url: { name: 'components-avatar' },
          icon: 'ri-user-smile-line',
          title: 'Avatars',
        },
        {
          url: { name: 'components-badge' },
          icon: 'ri-notification-4-line',
          title: 'Badges',
        },
        {
          url: { name: 'components-button' },
          icon: 'ri-square-line',
          title: 'Buttons',
        },
        {
          url: { name: 'components-chip' },
          icon: 'ri-checkbox-blank-line',
          title: 'Chips',
        },
        {
          url: { name: 'components-dialog' },
          icon: 'ri-square-line',
          title: 'Dialogs',
        },
        {
          url: { name: 'components-list' },
          icon: 'ri-list-unordered',
          title: 'List',
        },
        {
          url: { name: 'components-menu' },
          icon: 'ri-menu-line',
          title: 'Menu',
        },
        {
          url: { name: 'components-pagination' },
          icon: 'ri-skip-right-line',
          title: 'Pagination',
        },
        {
          url: { name: 'components-progress-circular' },
          icon: 'ri-donut-chart-line',
          title: 'Progress Circular',
        },
        {
          url: { name: 'components-progress-linear' },
          icon: 'ri-donut-chart-line',
          title: 'Progress Linear',
        },
        {
          url: { name: 'components-expansion-panel' },
          icon: 'ri-align-vertically',
          title: 'Expansion Panel',
        },
        {
          url: { name: 'components-snackbar' },
          icon: 'ri-message-line',
          title: 'Snackbar',
        },
        {
          url: { name: 'components-tabs' },
          icon: 'ri-window-2-line',
          title: 'Tabs',
        },
        {
          url: { name: 'components-timeline' },
          icon: 'ri-git-commit-line',
          title: 'Timeline',
        },
        {
          url: { name: 'components-tooltip' },
          icon: 'ri-chat-quote-line',
          title: 'Tooltip',
        },
        {
          url: { name: 'extensions-tour' },
          icon: 'ri-box-3-line',
          title: 'Tour',
        },
        {
          url: { name: 'extensions-swiper' },
          icon: 'ri-file-image-line',
          title: 'Swiper',
        },
      ],
    },
    {
      title: 'Forms & Tables',
      category: 'formsTables',
      children: [
        {
          url: { name: 'forms-textfield' },
          icon: 'ri-pencil-line',
          title: 'TextField',
        },
        {
          url: { name: 'forms-select' },
          icon: 'ri-list-check',
          title: 'Select',
        },
        {
          url: { name: 'forms-checkbox' },
          icon: 'ri-checkbox-line',
          title: 'Checkbox',
        },
        {
          url: { name: 'forms-radio' },
          icon: 'ri-radio-button-line',
          title: 'Radio',
        },
        {
          url: { name: 'forms-combobox' },
          icon: 'ri-checkbox-line',
          title: 'Combobox',
        },
        {
          url: { name: 'forms-date-time-picker' },
          icon: 'ri-calendar-todo-line',
          title: 'Date Time picker',
        },
        {
          url: { name: 'forms-textarea' },
          icon: 'ri-file-text-line',
          title: 'Textarea',
        },
        {
          url: { name: 'forms-switch' },
          icon: 'ri-toggle-line',
          title: 'Switch',
        },
        {
          url: { name: 'forms-file-input' },
          icon: 'ri-upload-2-line',
          title: 'File Input',
        },
        {
          url: { name: 'forms-editors' },
          icon: 'ri-file-edit-line',
          title: 'Editors',
        },
        {
          url: { name: 'forms-rating' },
          icon: 'ri-star-fill',
          title: 'Form Rating',
        },
        {
          url: { name: 'forms-slider' },
          icon: 'ri-equalizer-line',
          title: 'Slider',
        },
        {
          url: { name: 'forms-range-slider' },
          icon: 'ri-pencil-line',
          title: 'Range Slider',
        },
        {
          url: { name: 'forms-form-layouts' },
          icon: 'ri-box-3-line',
          title: 'Form Layouts',
        },
        {
          url: { name: 'forms-form-validation' },
          icon: 'ri-check-line',
          title: 'Form Validation',
        },
        {
          url: { name: 'forms-custom-input' },
          icon: 'ri-list-check-3',
          title: 'Custom Input',
        },
        {
          url: { name: 'forms-autocomplete' },
          icon: 'ri-align-left',
          title: 'Autocomplete',
        },
        {
          url: { name: 'tables-data-table' },
          icon: 'ri-window-2-line',
          title: 'Data Table',
        },
        {
          url: { name: 'tables-simple-table' },
          icon: 'ri-window-2-line',
          title: 'Simple Table',
        },
        {
          url: { name: 'forms-form-wizard-numbered' },
          icon: 'ri-align-center',
          title: 'Form Wizard Numbered',
        },
        {
          url: { name: 'forms-form-wizard-icons' },
          icon: 'ri-align-center',
          title: 'Form Wizard Icons',
        },
      ],
    },
    {
      title: 'Chart & Misc',
      category: 'chartsMisc',
      children: [
        {
          url: { name: 'charts-apex-chart' },
          icon: 'ri-line-chart-line',
          title: 'Apex Charts',
        },
        {
          url: { name: 'charts-chartjs' },
          icon: 'ri-bar-chart-grouped-fill',
          title: 'ChartJS',
        },
        {
          url: { name: 'access-control' },
          icon: 'ri-shield-line',
          title: 'Access Control (ACL)',
        },
      ],
    },
  ],
}
