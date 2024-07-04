<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'

interface Props {
  isDialogVisible: boolean
}

interface Emit {
  (e: 'update:isDialogVisible', val: boolean): void
}

const props = defineProps<Props>()

const emit = defineEmits<Emit>()

const dialogVisibleUpdate = (val: boolean) => {
  emit('update:isDialogVisible', val)
}

type Permission = 'Owner' | 'Can Edit' | 'Can Comment' | 'Can View'

interface Member {
  avatar: string
  name: string
  email: string
  permission: Permission
}

const membersList: Member[] = [
  {
    avatar: avatar1,
    name: 'Lester Palmer',
    email: 'jerrod98@gmail.com',
    permission: 'Can Edit',
  },
  {
    avatar: avatar2,
    name: 'Mattie Blair',
    email: 'prudence.boehm@yahoo.com',
    permission: 'Owner',
  },
  {
    avatar: avatar3,
    name: 'Marvin Wheeler',
    email: 'rumet@jujpejah.net',
    permission: 'Can Comment',
  },
  {
    avatar: avatar4,
    name: 'Nannie Ford',
    email: 'negza@nuv.io',
    permission: 'Can View',
  },
  {
    avatar: avatar5,
    name: 'Julian Murphy',
    email: 'lunebame@umdomgu.net',
    permission: 'Can Edit',
  },
  {
    avatar: avatar6,
    name: 'Sophie Gilbert',
    email: 'ha@sugit.gov',
    permission: 'Can View',
  },
  {
    avatar: avatar7,
    name: 'Chris Watkins',
    email: 'zokap@mak.org',
    permission: 'Can Comment',
  },
  {
    avatar: avatar8,
    name: 'Adelaide Nichols',
    email: 'ujinomu@jigo.com',
    permission: 'Can Edit',
  },
]
</script>

<template>
  <VDialog
    :model-value="props.isDialogVisible"
    max-width="900"
    @update:model-value="dialogVisibleUpdate"
  >
    <VCard class="share-project-dialog pa-sm-11 pa-3">
      <!-- 👉 dialog close btn -->
      <DialogCloseBtn
        size="default"
        variant="text"
        @click="emit('update:isDialogVisible', false)"
      />
      <VCardText class="pt-5">
        <div class="text-center mb-6">
          <h4 class="text-h4 mb-2">
            Share Project
          </h4>
          <p class="text-body-1">
            Share project with the team members
          </p>
        </div>

        <div class="mb-6">
          <h5 class="text-h5 text-medium-emphasis mb-2">
            Add Members
          </h5>
          <VAutocomplete
            :items="membersList"
            item-title="name"
            item-value="name"
            density="compact"
            placeholder="Add project members..."
          >
            <template #item="{ props: listItemProp, item }">
              <VListItem v-bind="listItemProp">
                <template #prepend>
                  <VAvatar
                    :image="item.raw.avatar"
                    size="30"
                  />
                </template>
              </VListItem>
            </template>
          </VAutocomplete>
        </div>

        <h5 class="text-h5 mb-4">
          8 Members
        </h5>

        <VList class="card-list mb-6">
          <VListItem
            v-for="member in membersList"
            :key="member.name"
          >
            <template #prepend>
              <VAvatar
                :image="member.avatar"
                class="me-1"
              />
            </template>

            <VListItemTitle class="text-high-emphasis">
              {{ member.name }}
            </VListItemTitle>
            <VListItemSubtitle>
              {{ member.email }}
            </VListItemSubtitle>

            <template #append>
              <VBtn
                variant="text"
                color="secondary"
                :icon="$vuetify.display.xs"
              >
                <template v-if="!$vuetify.display.xs">
                  {{ member.permission }}
                </template>
                <VIcon
                  end
                  icon="ri-arrow-down-s-line"
                  size="16"
                  :class="$vuetify.display.xs ? 'ms-0' : ''"
                />

                <VMenu activator="parent">
                  <VList :selected="[member.permission]">
                    <VListItem
                      v-for="(item, index) in ['Owner', 'Can Edit', 'Can Comment', 'Can View']"
                      :key="index"
                      :value="item"
                    >
                      <VListItemTitle>{{ item }}</VListItemTitle>
                    </VListItem>
                  </VList>
                </VMenu>
              </VBtn>
            </template>
          </VListItem>
        </VList>

        <div class="d-flex justify-center justify-sm-space-between align-center flex-wrap gap-3">
          <div class="text-body-1 text-high-emphasis font-weight-medium d-flex align-center">
            <VIcon
              icon="ri-group-line"
              size="20"
              class="me-2"
            />
            <span>Public to Master - Pixinvent</span>
          </div>

          <VBtn prepend-icon="ri-link">
            Copy Project Link
          </VBtn>
        </div>
      </VCardText>
    </VCard>
  </VDialog>
</template>

<style lang="scss">
.share-project-dialog {
  .card-list {
    --v-card-list-gap: 1rem;
  }
}
</style>
