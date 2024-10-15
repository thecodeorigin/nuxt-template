# Nuxt 3 template
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-1-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->
<!-- ALL-CONTRIBUTORS-BADGE:START - Do not remove or modify this section -->
[![All Contributors](https://img.shields.io/badge/all_contributors-5-orange.svg?style=flat-square)](#contributors-)
<!-- ALL-CONTRIBUTORS-BADGE:END -->

Nuxt 3 template is a opinionated template for Nuxt 3 project. It includes the following features:

- [UnoCSS](https://unocss.com) for utility-first CSS
- [Vuetify](https://vuetifyjs.com) for component library
- [Nuxt i18n](https://i18n.nuxtjs.org) for internationalization
- [Nuxt Auth](https://auth.sidebase.io) for authentication
- [Drizzle ORM](https://drizzle.dev) for Database communication
- [CASL](https://casl.js.org) for Access Control
- [Firebase Notification](https://firebase.google.com) for push notification

## Getting Started

### Prerequisites

- [PNPM](https://pnpm.io) - Fast, disk space efficient package manager
- [Node.js 20+](https://nodejs.org) - Recommend to be installed via PNPM standalone using `pnpm env use --global`

### Installation

1. Clone the repository

```bash
git clone git@github.com:thecodeorigin/nuxt-template.git
```

2. Install dependencies

```bash
pnpm install
```

3. Prepare the environment

Copy the `.env.example` file to `.env` and fill in the necessary information

```bash
cp .env.example .env
```

4. Prepare the Database with Docker

You can use a remote database and fill in all the environment variables in the `.env` file. Or you can use the provided docker-compose file to start a local database.

> Please be careful with your configured environment variables, you can accidentally execute the database commands on your production database.

```bash
pnpm db:start

pnpm db:migrate

pnpm db:seed
```

> Please checkout the `server/db/seeds` folder to review all the seed data, especially the `users.seed.ts` file to get the default user credentials.

You can stop or reset the database with the following commands:

```bash
# Stop the database
pnpm db:stop
# Reset the database
pnpm db:reset
```

5. Run the project

```bash
pnpm dev
```

### Usage with Doppler
You can use Doppler to manage your environment variables. To do this, you need to install the Doppler CLI and authenticate with your account.

1. Install the Doppler CLI

Please follow the instructions on the [official Doppler documentation](https://docs.doppler.com/docs/install-cli) to install the Doppler CLI.

2. Authenticate with Doppler

```bash
doppler login
```

3. Select the project from Doppler

```bash
doppler setup
```

4. Run the project with Doppler

> Please be careful with your configured environment variables, you can accidentally execute the database commands on your production database.

```bash
pnpm with-env dev
```

## Contribution

Thank you to all the people who already contributed to the Nuxt Template project!

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="https://github.com/NguyenDucTruyen"><img src="https://avatars.githubusercontent.com/u/118962054?v=4?s=100" width="100px;" alt="Nguyễn Đức Truyền"/><br /><sub><b>Nguyễn Đức Truyền</b></sub></a><br /><a href="#maintenance-NguyenDucTruyen" title="Maintenance">🚧</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

## License

[MIT](https://opensource.org/licenses/MIT)

Copyright (c) 2022-present, Nguyen Huu Nguyen Y

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):
<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->
<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!
