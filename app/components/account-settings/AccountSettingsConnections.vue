<script setup lang="ts">
import asana from '@base/images/icons/brands/asana.png'
import behance from '@base/images/icons/brands/behance.png'
import dribbble from '@base/images/icons/brands/dribbble.png'
import facebook from '@base/images/icons/brands/facebook.png'
import github from '@base/images/icons/brands/github.png'
import google from '@base/images/icons/brands/google.png'
import linkedin from '@base/images/icons/brands/linkedin.png'
import mailchimp from '@base/images/icons/brands/mailchimp.png'
import slack from '@base/images/icons/brands/slack.png'
import twitter from '@base/images/icons/brands/twitter.png'

const config = useRuntimeConfig()

const connectedAccounts = ref([
  {
    logo: google,
    name: 'Google',
    subtitle: 'Calendar and contacts',
    connected: true,
  },
  {
    logo: slack,
    name: 'Slack',
    subtitle: 'Communication',
    connected: false,
  },
  {
    logo: github,
    name: 'GitHub',
    subtitle: 'Manage your Git repositories',
    connected: true,
  },
  {
    logo: mailchimp,
    name: 'MailChimp',
    subtitle: 'Email marketing service',
    connected: true,
  },
  {
    logo: asana,
    name: 'Asana',
    subtitle: 'Task management',
    connected: false,
  },

])

const socialAccounts = ref([
  {
    logo: facebook,
    name: 'Facebook',
    connected: false,
  },
  {
    logo: dribbble,
    name: 'Dribbble',
    connected: false,

  },
  {
    logo: behance,
    name: 'Behance',
    connected: false,
  },
])
</script>

<template>
  <!-- 👉 Connected Accounts -->
  <VCard>
    <VRow>
      <VCol
        cols="12"
        md="6"
        class="pe-md-0 pb-0 pb-md-3"
      >
        <VCard flat>
          <VCardItem class="pb-6">
            <VCardTitle>
              Connected Accounts
            </VCardTitle>
            <VCardSubtitle>Display content from your connected accounts on your site</VCardSubtitle>
          </VCardItem>

          <VCardText>
            <VList class="card-list">
              <VListItem
                v-for="item in connectedAccounts"
                :key="item.logo"
              >
                <template #prepend>
                  <VAvatar
                    start
                    size="32"
                    rounded
                    class="me-1"
                  >
                    <img
                      :src="item.logo"
                      height="32"
                      width="32"
                    >
                  </VAvatar>
                </template>

                <VListItemTitle>
                  <h6 class="text-h6">
                    {{ item.name }}
                  </h6>
                </VListItemTitle>

                <VListItemSubtitle>
                  {{ item.subtitle }}
                </VListItemSubtitle>

                <template #append>
                  <VListItemAction>
                    <VSwitch
                      v-model="item.connected"
                      density="compact"
                      class="me-1"
                    />
                  </VListItemAction>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>

      <!-- 👉 Social Accounts -->
      <VCol
        cols="12"
        md="6"
        class="ps-md-0 pt-0 pt-md-3"
      >
        <VCard flat>
          <VCardItem class="pb-6">
            <VCardTitle>
              Social Accounts
            </VCardTitle>
            <VCardSubtitle>Display content from social accounts on your site</VCardSubtitle>
          </VCardItem>
          <VCardText>
            <VList class="card-list">
              <VListItem
                v-for="item in socialAccounts"
                :key="item.logo"
              >
                <template #prepend>
                  <VAvatar
                    start
                    rounded="0"
                    size="32"
                    class="me-1"
                  >
                    <img
                      :src="item.logo"
                      height="32"
                      width="32"
                    >
                  </VAvatar>
                </template>

                <VListItemTitle>
                  <h6 class="text-h6">
                    {{ item.name }}
                  </h6>
                </VListItemTitle>
                <VListItemSubtitle
                  v-if="item.links?.link"
                  tag="a"
                  target="_blank"
                  rel="noopener noreferrer"
                  :href="item.links?.link"
                  class="text-primary"
                  style="opacity: 1;"
                >
                  {{ item.links?.username }}
                </VListItemSubtitle>

                <VListItemSubtitle v-else>
                  Not Connected
                </VListItemSubtitle>
                <template #append>
                  <VListItemAction>
                    <VBtn
                      icon
                      variant="outlined"
                      :color="item.connected ? 'error' : 'secondary'"
                      rounded
                    >
                      <VIcon :icon="item.connected ? 'ri-delete-bin-line' : 'ri-link' " />
                    </VBtn>
                  </VListItemAction>
                </template>
              </VListItem>
            </VList>
          </VCardText>
        </VCard>
      </VCol>
    </VRow>
  </VCard>
</template>

<style lang="scss">
.card-list {
  --v-card-list-gap: 1rem;
}
</style>
