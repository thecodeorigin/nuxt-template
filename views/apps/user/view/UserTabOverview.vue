<script lang="ts" setup>
import UserInvoiceTable from './UserInvoiceTable.vue'
import pdf from '@images/icons/project-icons/pdf.png'

// Images
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import figma from '@images/icons/project-icons/figma.png'
import html5 from '@images/icons/project-icons/html5.png'
import python from '@images/icons/project-icons/python.png'
import react from '@images/icons/project-icons/react.png'
import sketch from '@images/icons/project-icons/sketch.png'
import vue from '@images/icons/project-icons/vue.png'
import xamarin from '@images/icons/project-icons/xamarin.png'

// Project Table Header
const projectTableHeaders = [
  { title: 'PROJECT', key: 'name' },
  { title: 'TOTAL TASK', key: 'totalTask' },
  { title: 'PROGRESS', key: 'progress' },
  { title: 'HOURS', key: 'hours' },
]

const projects = [
  {
    logo: react,
    name: 'BGC eCommerce App',
    project: 'React Project',
    totalTask: '122/240',
    progress: 78,
    hours: '18:42',
  },
  {
    logo: figma,
    name: 'Falcon Logo Design',
    project: 'Figma Project',
    totalTask: '09/56',
    progress: 18,
    hours: '20:42',
  },
  {
    logo: vue,
    name: 'Dashboard Design',
    project: 'Vuejs Project',
    totalTask: '290/320',
    progress: 62,
    hours: '120:87',
  },
  {
    logo: xamarin,
    name: 'Foodista mobile app',
    project: 'Xamarin Project',
    totalTask: '290/320',
    progress: 8,
    hours: '120:87',
  },
  {
    logo: python,
    name: 'Dojo Email App',
    project: 'Python Project',
    totalTask: '120/186',
    progress: 49,
    hours: '230:10',
  },
  {
    logo: sketch,
    name: 'Blockchain Website',
    project: 'Sketch Project',
    totalTask: '99/109',
    progress: 92,
    hours: '342:41',
  },
  {
    logo: html5,
    name: 'Hoffman Website',
    project: 'HTML Project',
    totalTask: '98/110',
    progress: 88,
    hours: '12:45',
  },
]

const resolveUserProgressVariant = (progress: number) => {
  if (progress <= 25)
    return 'error'
  if (progress > 25 && progress <= 50)
    return 'warning'
  if (progress > 50 && progress <= 75)
    return 'primary'
  if (progress > 75 && progress <= 100)
    return 'success'

  return 'secondary'
}

const search = ref('')
</script>

<template>
  <VRow>
    <VCol cols="12">
      <VCard>
        <VCardItem>
          <div class="d-flex justify-space-between align-center flex-wrap gap-4">
            <VCardTitle>Project List</VCardTitle>
            <div style="inline-size: 15.625rem;">
              <VTextField
                v-model="search"
                placeholder="Search Project"
                density="compact"
                style="inline-size: 15.625rem;"
              />
            </div>
          </div>
        </VCardItem>
        <!-- 👉 User Project List Table -->

        <!-- SECTION Datatable -->
        <VDataTable
          :search="search"
          :headers="projectTableHeaders"
          :items="projects"
          item-value="name"
          class="text-no-wrap rounded-0"
        >
          <!-- projects -->
          <template #item.name="{ item }">
            <div class="d-flex align-center">
              <VAvatar
                :size="34"
                class="me-3"
                :image="item.logo"
              />
              <div>
                <h6 class="text-h6 mb-0">
                  {{ item.name }}
                </h6>
                <p class="text-sm text-medium-emphasis mb-0">
                  {{ item.project }}
                </p>
              </div>
            </div>
          </template>

          <!-- total task -->
          <template #item.totalTask="{ item }">
            <div class="text-high-emphasis">
              {{ item.totalTask }}
            </div>
          </template>

          <!-- Progress -->
          <template #item.progress="{ item }">
            <div class="text-high-emphasis text-body-1">
              {{ item.progress }}%
            </div>
            <VProgressLinear
              :height="6"
              :model-value="item.progress"
              rounded
              :color="resolveUserProgressVariant(item.progress)"
            />
          </template>

          <!-- remove footer -->
          <!-- TODO refactor this after vuetify community gives answer -->
          <template #bottom />
        </VDataTable>
        <!-- !SECTION -->
      </VCard>
    </VCol>

    <VCol cols="12">
      <!-- 👉 Activity timeline -->
      <VCard title="User Activity Timeline">
        <VCardText>
          <VTimeline
            side="end"
            align="start"
            line-inset="9"
            truncate-line="start"
            density="compact"
          >
            <!-- SECTION Timeline Item: Flight -->
            <VTimelineItem
              dot-color="primary"
              size="x-small"
            >
              <!-- 👉 Header -->
              <div class="d-flex justify-space-between align-center gap-2 flex-wrap mb-2">
                <span class="app-timeline-title">
                  12 Invoices have been paid
                </span>
                <span class="app-timeline-meta">12 min ago</span>
              </div>

              <!-- 👉 Content -->
              <div class="app-timeline-text mt-1">
                Invoices have been paid to the company
              </div>

              <div class="d-inline-flex align-center timeline-chip my-2">
                <img
                  :src="pdf"
                  height="20"
                  class="me-2"
                  alt="img"
                >
                <span class="app-timeline-text font-weight-medium">
                  invoices.pdf
                </span>
              </div>
            </VTimelineItem>
            <!-- !SECTION -->

            <!-- SECTION Timeline Item: Interview Schedule -->
            <VTimelineItem
              size="x-small"
              dot-color="success"
            >
              <!-- 👉 Header -->
              <div class="d-flex justify-space-between align-center flex-wrap mb-2">
                <div class="app-timeline-title">
                  Client Meeting
                </div>
                <span class="app-timeline-meta">45 min ago</span>
              </div>

              <div class="app-timeline-text mt-1">
                Project meeting with john @10:15am
              </div>

              <!-- 👉 Person -->
              <div class="d-flex justify-space-between align-center flex-wrap">
                <!-- 👉 Avatar & Personal Info -->
                <div class="d-flex align-center my-2">
                  <VAvatar
                    size="32"
                    class="me-2"
                    :image="avatar2"
                  />
                  <div class="d-flex flex-column">
                    <p class="text-sm font-weight-medium text-medium-emphasis mb-0">
                      Lester McCarthy (Client)
                    </p>
                    <span class="text-sm">CEO of Pixinvent</span>
                  </div>
                </div>
              </div>
            </VTimelineItem>
            <!-- !SECTION -->

            <!-- SECTION Design Review -->
            <VTimelineItem
              size="x-small"
              dot-color="info"
            >
              <!-- 👉 Header -->
              <div class="d-flex justify-space-between align-center flex-wrap mb-2">
                <span class="app-timeline-title">
                  Create a new project for client
                </span>
                <span class="app-timeline-meta">2 Day Ago</span>
              </div>

              <!-- 👉 Content -->
              <p class="app-timeline-text mt-1 mb-2">
                6 team members in a project
              </p>

              <div class="v-avatar-group demo-avatar-group">
                <VAvatar :size="40">
                  <VImg :src="avatar2" />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    John Doe
                  </VTooltip>
                </VAvatar>

                <VAvatar :size="40">
                  <VImg :src="avatar2" />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    Jennie Obrien
                  </VTooltip>
                </VAvatar>

                <VAvatar :size="40">
                  <VImg :src="avatar3" />
                  <VTooltip
                    activator="parent"
                    location="top"
                  >
                    Peter Harper
                  </VTooltip>
                </VAvatar>

                <VAvatar
                  :size="40"
                  :color="$vuetify.theme.current.dark ? '#383B55' : '#F0EFF0'"
                >
                  +3
                </VAvatar>
              </div>
            </VTimelineItem>
            <!-- !SECTION -->
          </VTimeline>
        </VCardText>
      </VCard>
    </VCol>

    <VCol cols="12">
      <UserInvoiceTable />
    </VCol>
  </VRow>
</template>
