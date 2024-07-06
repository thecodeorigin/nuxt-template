<script setup lang="ts">
import type { FaqCategory } from '@db/pages/faq/types'
import faqIllustration from '@images/illustrations/faq-illustration.png'

const faqSearchQuery = ref('')

const faqs = ref<FaqCategory[]>([])

const fetchFaqs = async () => {
  const data = await $api('/pages/faq', {
    query: {
      q: faqSearchQuery.value,
    },
  }).catch(err => console.log(err))

  faqs.value = data
}

const activeTab = ref('Payment')
const activeQuestion = ref(1)

watch(activeTab, () => activeQuestion.value = 0)
watch(faqSearchQuery, fetchFaqs, { immediate: true })

const contactUs = [
  {
    icon: 'ri-phone-line',
    via: '+ (810) 2548 2568',
    tagLine: 'We are always happy to help!',
  },
  {
    icon: 'ri-mail-line',
    via: 'hello@help.com',
    tagLine: 'Best way to get answer faster!',
  },
]
</script>

<template>
  <section>
    <!-- 👉 Search -->
    <AppSearchHeader
      v-model="faqSearchQuery"
      custom-class="mb-6"
    >
      <template #default>
        <h4 class="text-h4 text-primary mb-2">
          Hello, how can we help?
        </h4>

        <p class="text-body-1 mb-7">
          or choose a category to quickly find the help you need
        </p>

        <!-- 👉 Search Input -->
        <VTextField
          placeholder="search articles..."
          class="search-header-input mx-auto my-4"
        >
          <template #prepend-inner>
            <VIcon
              icon="ri-search-line"
              size="18"
            />
          </template>
        </VTextField>
      </template>
    </AppSearchHeader>

    <!-- 👉 Faq sections and questions -->
    <VRow>
      <VCol
        v-show="faqs.length"
        cols="12"
        md="3"
        sm="5"
        class="position-relative"
      >
        <!-- 👉 Tabs -->
        <VTabs
          v-model="activeTab"
          direction="vertical"
          class="v-tabs-pill"
        >
          <VTab
            v-for="faq in faqs"
            :key="faq.faqTitle"
            :value="faq.faqTitle"
          >
            <VIcon
              :icon="faq.faqIcon"
              start
            />
            {{ faq.faqTitle }}
          </VTab>
        </VTabs>
        <VImg
          height="195"
          :src="faqIllustration"
          class="d-none d-sm-block mt-4"
        />
      </VCol>

      <VCol
        cols="12"
        md="9"
        sm="7"
      >
        <!-- 👉 Windows -->
        <VWindow
          v-model="activeTab"
          class="faq-v-window disable-tab-transition"
        >
          <VWindowItem
            v-for="faq in faqs"
            :key="faq.faqTitle"
            :value="faq.faqTitle"
          >
            <div class="d-flex align-center mb-4 gap-x-4">
              <VAvatar
                rounded="lg"
                color="primary"
                variant="tonal"
                size="50"
              >
                <VIcon
                  :size="30"
                  :icon="faq.faqIcon"
                />
              </VAvatar>

              <div>
                <h5 class="text-h5">
                  {{ faq.faqTitle }}
                </h5>
                <div class="text-body-1">
                  {{ faq.faqSubtitle }}
                </div>
              </div>
            </div>

            <VExpansionPanels
              v-model="activeQuestion"
              multiple
            >
              <VExpansionPanel
                v-for="item in faq.faqs"
                :key="item.question"
                :title="item.question"
                :text="item.answer"
              />
            </VExpansionPanels>
          </VWindowItem>
        </VWindow>
      </VCol>

      <VCol
        v-show="!faqs.length"
        cols="12"
        :class="!faqs.length ? 'd-flex justify-center align-center' : ''"
      >
        <VIcon
          icon="ri-question-line"
          start
          size="20"
        />
        <span class="text-base font-weight-medium">
          No Results Found!!
        </span>
      </VCol>
    </VRow>

    <!-- 👉 You still have a question? -->
    <div class="text-center mt-6">
      <div class="py-6">
        <VChip
          color="primary"
          size="small"
        >
          Question
        </VChip>
        <h4 class="text-h4 my-2">
          You still have a question?
        </h4>
        <p class="text-body-1 mb-0">
          If you cannot find a question in our FAQ, you can always contact us. We will answer to you shortly!
        </p>
      </div>

      <!-- contacts -->
      <VRow class="mt-3">
        <VCol
          v-for="contact in contactUs"
          :key="contact.icon"
          sm="6"
          cols="12"
        >
          <VCard
            flat
            color="rgba(var(--v-theme-on-surface), var(--v-hover-opacity))"
          >
            <VCardText class="pa-6">
              <VAvatar
                rounded
                color="primary"
                variant="tonal"
                size="50"
                class="mb-4"
              >
                <VIcon
                  :icon="contact.icon"
                  size="30"
                />
              </VAvatar>

              <h5 class="text-h5 mb-1">
                {{ contact.via }}
              </h5>
              <div class="text-body-1">
                {{ contact.tagLine }}
              </div>
            </VCardText>
          </VCard>
        </VCol>
      </VRow>
    </div>
  </section>
</template>

<style lang="scss">
.faq-v-window {
  .v-window__container {
    z-index: 0;
  }
}
</style>
