# nuxt-template

## Build Setup

```bash
# prepare configurations
$ yarn prepare

# install dependencies
$ yarn install

# serve with hot reload at localhost:3000
$ yarn dev

# build for production and launch server
$ yarn build
$ yarn start

# generate static project
$ yarn generate
```

For detailed explanation on how things work, check out the [documentation](https://nuxtjs.org).

## Snippets

Checkout .vscode for code snippets

The project is setup with some simple i18n snippets:

```javascript
$t('');
$i18n.$t('');
i18n.t('');
```

```yaml
<i18n lang="yaml">
fr:
  Your code: Votre code
</i18n>
```

## Directories

You can create the following extra directories, some of which have special behaviors. Only `pages` is required; you can delete them if you don't want to use their functionality.

### `components`

The components directory contains your Vue.js components. Components make up the different parts of your page and can be reused and imported into your pages, layouts and even other components.

#### `components/base`

Components in this directory will be registered globally automatically by this configuration in `nuxt.config.js`:

```javascript
components: [
  { path: '@/components/base/' },
],
```

#### `components/layout`

The directory to store your common layout component, such as `Navbar`, `Sidebar`, `Header`, `Footer`, `etc`

#### `components/*`

Place your modules' components, good naming pratice should be something like:

```javascript
// components/products/Chart.vue
// components/blogs/BlogItem.vue
```

### `constants`

This directory should should contains your project's constants, enums Javascript doesn't support `ENUM` type so we can use `Object.freeze()` to create a true ENUM object.

### `core/config`

Our plugins' configuration should be in here, the `nuxt.config.js` file or in special dedicated files like `.eslintrc.js`, `.prettierrc.js`

### `core/layouts`

Layouts are a great help when you want to change the look and feel of your Nuxt app, whether you want to include a sidebar or have distinct layouts for mobile and desktop.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/layouts).

### `core/middleware`

The middleware directory contains your application middleware. Middleware lets you define custom functions that can be run before rendering either a page or a group of pages (layout).

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/middleware).

### `core/mixins`

This folder contains Vue mixins

We can declare a global mixin with:

```javascript
import Vue from 'vue';

Vue.mixin({
  created() {
    var myOption = this.$options.myOption;
    if (myOption) {
      console.log(myOption);
    }
  },
});
```

and import it as a plugin in `nuxt.config.js` or simple export an on-demand mixin in here:

```javascript
export const myHelpfulMixin = {
  created() {
    var myOption = this.$options.myOption;
    if (myOption) {
      console.log(myOption);
    }
  },
};
```

### `core/plugins`

The plugins directory contains JavaScript plugins that you want to run before instantiating the root Vue.js Application. This is the place to add Vue plugins and to inject functions or constants. Every time you need to use `Vue.use()`, you should create a file in `plugins/` and add its path to plugins in `nuxt.config.js`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/plugins).

### `core/styles`

This folder contains `css` and `scss` files, scss files, `variables`, `mixins` and `functions` also got imported to the project globally by using this configuration in `nuxt.config.js`:

```javascript
buildModules: [
  // https://www.npmjs.com/package/@nuxtjs/style-resources
  '@nuxtjs/style-resources',
],

styleResources: {
  scss: [
    '@/core/styles/scss/_colors.scss',
    '@/core/styles/scss/_mixins.scss',
    '@/core/styles/scss/_variables.scss',
  ],
  hoistUseStatements: true,
},
```

### `core/use`

This directory contains composables files for `composition API` For more information about Vue composition API, please check out the [Vue composition API documentation](https://v3.vuejs.org/guide/composition-api-introduction.html)

Notes:

- Yes, you can ignore Composition API if you like the original option API better.

```javascript
// Option API component:
export default {
  data() {
    return {
      blogs: 123,
      categories: 456,
    }
  },
  created() {},
  mounted() {},
}

// Composition API
export default {
  setup(props, context) {
    // No created hook, setup runs in server-side
    const dataBlog = reactive({
      blogs: 123,
    })

    const dataCategory = reactive({
      categories: 456,
    })

    onMounted(() => {
      // Do stuff when component mounted
    })

    return {
      dataBlog,
      dataCategory,
    }
  }
}
```

- Vue 2 and Vue 3 Composition API are "almost" the same.
- Nuxt has supercharged Vue Composition API with some cooler features, see [the documentation](https://composition-api.nuxtjs.org/getting-started/introduction).

### `core/utils`

This directory contains your helper functions, global mixins, global dicrectives and global filters

`/directives`, `/mixins` and `/filters` are automatically registered using Webpack's `require.context()`.

Files in `/functions` are imported manually when use to keep the type annotation

### `locale`

This directory contains your global localization and will be imported into `nuxt.config.js`. We're using `YAML` file because it has better syntax than `JSON`

Notes: We translate the website on the go by adding localization on component-level

```html
<template>
  <h1>{{ $t('Home page') }}</h1>
</template>

<script>
  import { useContext } from '@nuxtjs/composition-api';
  export default {
    // Composition API
    setup() {
      const { i18n } = useContext();

      console.log(i18n.t('Hello world!'));
    },

    // Option API
    mounted() {
      console.log(this.$t('Hello world!'));
    },
  };
</script>

<i18n lang="yaml">
  vi: Home page: Trang chủ Hello world!: Xin chào thế giới! Change language: Đổi
  ngôn ngữ
</i18n>
```

### `pages`

This directory contains your application views and routes. Nuxt will read all the `*.vue` files inside this directory and setup Vue Router automatically.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/get-started/routing).

### `server/*`

API Routes using Nuxt `serverMiddleware` so you can protect your original API

This using Nuxt.js server middleware and added in `nuxt.config.js`:

```javascript
serverMiddleware: [
  { path: '/api/v1', handler: '@/server' },
],
```

Read more about Nuxt.js server middleware in [the documentation](https://nuxtjs.org/docs/2.x/configuration-glossary/configuration-servermiddleware).

### `static`

This directory contains your static files. Each file inside this directory is mapped to `/`.

Example: `/static/robots.txt` is mapped as `/robots.txt`.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/static).

### `store`

This directory contains your Vuex store files. Creating a file in this directory automatically activates Vuex.

More information about the usage of this directory in [the documentation](https://nuxtjs.org/docs/2.x/directory-structure/store).

### `store-lazy`

This directory contains your dynamic modules for Vuex.

See more information about Vue Dynamic module registeration in [the documentation](https://vuex.vuejs.org/guide/modules.html#dynamic-module-registration).
