<script setup lang="ts">
import ConnectImg from '@images/front-pages/landing-page/lets-contact.png'
import sectionTitleIcon from '@images/pages/section-title-icon.png'
import frontPageVectorImg from '@images/svg/front-page-vector.svg'
import type { ContactUsSectionType } from '@/types/landing-page'

const props = defineProps({
  data: {
    type: Object as PropType<ContactUsSectionType>,
  },
})

const getImg = computed(() => {
  if (props.data?.contact_us_card_image !== 'ConnectImg') {
    return props.data?.contact_us_card_image
  }
  return ConnectImg
})

const name = ref('')
const email = ref('')
const message = ref('')
</script>

<template>
  <VContainer id="contact-us">
    <!-- 👉 Headers  -->
    <div class="contact-us-section">
      <div class="headers d-flex justify-center flex-column align-center pb-15">
        <Component
          :is="frontPageVectorImg"
          class="front-page-vector"
        />
        <div class="d-flex gap-x-3 mb-6">
          <img
            :src="sectionTitleIcon"
            alt="section title icon"
            height="24"
            width="25"
          >
          <div class="text-body-1 text-high-emphasis font-weight-medium">
            CONTACT US
          </div>
        </div>

        <div class="mb-2 text-center gap-1">
          <Component
            :is="data?.contact_us_emphasized_title?.variant"
            v-if="data?.contact_us_emphasized_title"
            :style="{
              color: data?.contact_us_emphasized_title?.color,
              fontSize: `${data?.contact_us_emphasized_title?.font_size}px`,
              fontWeight: data?.contact_us_emphasized_title?.font_weight,
              textTransform: data?.contact_us_emphasized_title?.text_transform,
              textDecoration: data?.contact_us_emphasized_title?.text_decoration,
            }"
            class="d-inline-block mr-1"
          >
            {{ data?.contact_us_emphasized_title?.text }}
          </Component>

          <span class="text-h5 d-inline-block">{{ data?.contact_us_title }}</span>
        </div>

        <p v-for="(description, index) in data?.contact_us_title_desc" :key="index" class="text-body-1 font-weight-medium text-center mb-0">
          {{ description }}
        </p>
      </div>
      <div class="mb-15">
        <VRow class="match-height">
          <VCol
            cols="12"
            md="4"
            sm="6"
          >
            <VCard
              flat
              elevation="0"
              color="primary"
              theme="dark"
            >
              <VCardText class="pa-8">
                <h6 class="text-h6 mb-1">
                  {{ data?.contact_us_card_heading }}
                </h6>

                <component
                  :is="data?.contact_us_card_emphasized_heading?.variant"
                  v-if="data?.contact_us_card_emphasized_heading"
                  :style="{
                    color: data?.contact_us_card_emphasized_heading?.color,
                    fontSize: `${data?.contact_us_card_emphasized_heading?.font_size}px`,
                    fontWeight: data?.contact_us_card_emphasized_heading?.font_weight,
                    textTransform: data?.contact_us_card_emphasized_heading?.text_transform,
                    textDecoration: data?.contact_us_card_emphasized_heading?.text_decoration,
                  }"
                  class="card-heading"
                >
                  {{ data?.contact_us_card_emphasized_heading?.text }}
                </component>

                <VImg
                  :src="getImg"
                  class="my-5"
                />

                <div class="text-body-1">
                  {{ data?.contact_us_card_content }}
                </div>
              </VCardText>
            </VCard>
          </VCol>
          <VCol
            cols="12"
            md="8"
            sm="6"
          >
            <VCard>
              <VCardText>
                <div class="text-h5 mb-5">
                  Share your ideas
                </div>
                <VForm @submit.prevent="() => {}">
                  <VRow>
                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="name"
                        placeholder="John Doe"
                        label="Full Name"
                      />
                    </VCol>

                    <VCol
                      cols="12"
                      md="6"
                    >
                      <VTextField
                        v-model="email"
                        placeholder="johndoe@gmail.com"
                        label="Email address"
                      />
                    </VCol>

                    <VCol cols="12">
                      <VTextarea
                        v-model="message"
                        placeholder="Type Your message"
                        label="Message"
                      />
                    </VCol>

                    <VCol>
                      <VBtn type="submit">
                        Send Inquiry
                      </VBtn>
                    </VCol>
                  </VRow>
                </VForm>
              </VCardText>
            </VCard>
          </VCol>
        </VRow>
      </div>
    </div>
  </VContainer>
</template>

<style lang="scss" scoped>
.contact-us-section {
  position: relative;
  margin-block: 5.25rem;
}

.front-page-vector {
  position: absolute;
  inset-block-start: 0;
  inset-inline-start: 0;
}

.card-heading {
  line-height: 30px;
}
</style>
