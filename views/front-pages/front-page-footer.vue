<script setup lang="ts">
import appleImg from '@images/front-pages/landing-page/apple-icon.png'
import googlePlayImg from '@images/front-pages/landing-page/google-play-icon.png'
import { VNodeRenderer } from '@layouts/components/VNodeRenderer'
import { themeConfig } from '@themeConfig'

interface Menu {
  name: string
  to: any
  isNew?: boolean
}

const menus: Menu[] = [
  { name: 'Pricing', to: { name: 'pricing' } },
  { name: 'Payment', to: { name: 'pricing' }, isNew: true }, // Check pages
  { name: 'Maintenance', to: { name: 'under-maintenance' } },
  { name: 'Comming Soon', to: { name: 'coming-soon' } },
]
</script>

<template>
  <div class="footer">
    <VSheet
      class="footer-top pt-8 pb-4"
      theme="dark"
    >
      <VContainer>
        <VRow>
          <!-- 👉 Footer  -->
          <VCol
            cols="12"
            md="5"
          >
            <div class="footer-form">
              <div class="d-flex gap-2 py-1 mb-6">
                <VNodeRenderer :nodes="themeConfig.app.logo" />
                <h1 class="footer-title">
                  {{ themeConfig.app.title }}
                </h1>
              </div>
              <div class="text-body-1 footer-text mb-6">
                Most Powerful & Comprehensive <span class="text-high-emphasis">🤩</span> Vuejs Admin Template with Elegant Material Design & Unique Layouts.
              </div>
              <VForm class="subscribe-form d-flex align-center gap-4">
                <VTextField
                  label="Subscribe to newsletter"
                  placeholder="john@email.com"
                  theme="dark"
                  density="compact"
                  class="footer-text"
                />
                <VBtn size="large">
                  Subscribe
                </VBtn>
              </VForm>
            </div>
          </VCol>

          <!-- 👉 Pages -->
          <VCol
            md="2"
            sm="4"
            xs="6"
          >
            <div class="footer-links">
              <div class="footer-heading mb-6">
                Pages
              </div>
              <ul style="list-style: none;">
                <li
                  v-for="(item, index) in menus"
                  :key="index"
                  class="mb-4"
                >
                  <NuxtLink
                    class="text-body-1 footer-text text-no-wrap"
                    :to="item.to"
                  >
                    <div class="d-flex align-center">
                      <div>
                        {{ item.name }}
                      </div>
                      <template v-if="item.isNew">
                        <VChip
                          color="primary"
                          variant="elevated"
                          size="small"
                          class="ms-2"
                        >
                          New
                        </VChip>
                      </template>
                    </div>
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- 👉 Products  -->
          <VCol
            md="2"
            sm="4"
            xs="6"
          >
            <div class="footer-links">
              <div class="footer-heading mb-6">
                Products
              </div>
              <ul>
                <li
                  v-for="(item, index) in ['Page Builder', 'Admin Dashboards', 'UI Kits', 'Illustrations']"
                  :key="index"
                  class="mb-4 text-body-1"
                  style="list-style: none;"
                >
                  <NuxtLink
                    to=""
                    class="footer-text text-no-wrap"
                  >
                    {{ item }}
                  </NuxtLink>
                </li>
              </ul>
            </div>
          </VCol>

          <!-- 👉 Download App -->
          <VCol
            cols="12"
            md="3"
            sm="4"
          >
            <div>
              <div class="footer-heading mb-6">
                Download our app
              </div>
              <div>
                <VBtn
                  v-for="(item, index) in [
                    { image: appleImg, store: 'App Store' },
                    { image: googlePlayImg, store: 'Google Play' },
                  ]"
                  :key="index"
                  color="#211B2C"
                  height="56"
                  size="large"
                  class="mb-4 d-block"
                >
                  <template #default>
                    <div class="d-flex gap-x-6 footer-logo-buttons align-center">
                      <div>
                        <VImg
                          :src="item.image"
                          height="34"
                          width="34"
                        />
                      </div>
                      <div class="d-flex flex-column align-start">
                        <div class="text-body-2 footer-text">
                          Download on the
                        </div>
                        <div class="text-body-1 font-weight-medium footer-heading">
                          {{ item.store }}
                        </div>
                      </div>
                    </div>
                  </template>
                </VBtn>
              </div>
            </div>
          </VCol>
        </VRow>
      </VContainer>
    </VSheet>

    <div class="footer-line w-100">
      <VContainer>
        <div class="d-flex justify-space-between flex-wrap gap-y-4">
          <span class="d-flex align-center text-body-2 footer-heading font-weight-regular">
            &copy;

            {{ new Date().getFullYear() }},
            Made with <span><VIcon
              icon="ri-heart-fill"
              color="#FF4D49"
            /></span> by <a
              href="https://pixinvent.com/"
              target="_blank"
              rel="noopener noreferrer"
              class="ms-1 footer-heading font-weight-regular"
              style="color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));"
            >Pixinvent</a>
          </span>
          <div class="d-flex gap-x-1">
            <template
              v-for="(item, index) in [
                { title: 'github', icon: 'bxl-github', href: 'https://github.com/pixinvent' },
                { title: 'facebook', icon: 'bxl-facebook', href: 'https://www.facebook.com/pixinvents/' },
                { title: 'twitter', icon: 'bxl-twitter', href: 'https://twitter.com/pixinvents' },
                { title: 'instagram', icon: 'bxl-linkedin', href: 'https://www.linkedin.com/company/pixinvent' },
              ]"
              :key="index"
            >
              <IconBtn
                :href="item.href"
                size="x-small"
                target="_blank"
                color="#fff"
                rel="noopener noreferrer"
              >
                <VIcon
                  :icon="item.icon"
                  size="16"
                  color="white"
                />
              </IconBtn>
            </template>
          </div>
        </div>
      </VContainer>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.footer-top {
  background: url("@images/front-pages/backgrounds/footer-bg.png") lightgray 50% / cover no-repeat;
}

.footer-heading {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-weight: 500;
  line-height: 22px;
}

.footer-text {
  color: rgba(255, 255, 255, var(--v-medium-emphasis-opacity));
}

.footer-title {
  color: rgba(255, 255, 255, var(--v-high-emphasis-opacity));
  font-size: 1.25rem;
  font-weight: 600;
  letter-spacing: 0.27px;
  line-height: 1.5rem;
  text-transform: capitalize;
}

.footer-line {
  background: #211b2c;
  color: rgba(255, 255, 255, var(--v-medium-emphasis-opacity));
  font-size: 13px;
  line-height: 20px;
}

.footer {
  color: rgba(255, 255, 255, 70%);
}

.footer-links {
  .footer-text:hover {
    color: #fff;
  }
}
</style>

<style lang="scss">
.footer {
  @media (min-width: 600px) and (max-width: 960px) {
    .v-container {
      padding-inline: 2rem !important;
    }

    .footer-logo-buttons {
      gap: 0.5rem;
    }
  }
}

.footer-form {
  @media (min-width: 1280px) {
    max-inline-size: 400px;
  }
}
</style>
