<script setup lang="ts">
import avatar1 from '@images/avatars/avatar-1.png'
import avatar2 from '@images/avatars/avatar-2.png'
import avatar3 from '@images/avatars/avatar-3.png'
import avatar4 from '@images/avatars/avatar-4.png'
import avatar5 from '@images/avatars/avatar-5.png'
import avatar6 from '@images/avatars/avatar-6.png'
import avatar7 from '@images/avatars/avatar-7.png'
import avatar8 from '@images/avatars/avatar-8.png'
import figma from '@images/icons/project-icons/figma.png'
import html5 from '@images/icons/project-icons/html5.png'
import python from '@images/icons/project-icons/python.png'
import react from '@images/icons/project-icons/react.png'
import sketch from '@images/icons/project-icons/sketch.png'
import vue from '@images/icons/project-icons/vue.png'
import xamarin from '@images/icons/project-icons/xamarin.png'

// Project Table Header
const projectTableHeaders = [
  { title: 'PROJECT', key: 'project' },
  { title: 'LEADER', key: 'leader' },
  { title: 'Team', key: 'team' },
  { title: 'PROGRESS', key: 'progress' },
  { title: 'Action', key: 'Action', sortable: false },
]

const projects = [
  {
    logo: react,
    name: 'BGC eCommerce App',
    project: 'React Project',
    leader: 'Eileen',
    progress: 78,
    hours: '18:42',
    team: [avatar1, avatar8, avatar6],
    extraMembers: 3,
  },
  {
    logo: figma,
    name: 'Falcon Logo Design',
    project: 'Figma Project',
    leader: 'Owen',
    progress: 25,
    hours: '20:42',
    team: [avatar5, avatar2],
  },
  {
    logo: vue,
    name: 'Dashboard Design',
    project: 'Vuejs Project',
    leader: 'Keith',
    progress: 62,
    hours: '120:87',
    team: [avatar8, avatar2, avatar1],
  },
  {
    logo: xamarin,
    name: 'Foodista mobile app',
    project: 'Xamarin Project',
    leader: 'Merline',
    progress: 8,
    hours: '120:87',
    team: [avatar3, avatar4, avatar7],
    extraMembers: 8,
  },
  {
    logo: python,
    name: 'Dojo Email App',
    project: 'Python Project',
    leader: 'Harmonia',
    progress: 51,
    hours: '230:10',
    team: [avatar4, avatar3, avatar1],
    extraMembers: 5,
  },
  {
    logo: sketch,
    name: 'Blockchain Website',
    project: 'Sketch Project',
    leader: 'Allyson',
    progress: 92,
    hours: '342:41',
    team: [avatar1, avatar8],
  },
  {
    logo: html5,
    name: 'Hoffman Website',
    project: 'HTML Project',
    leader: 'Georgie',
    progress: 80,
    hours: '12:45',
    team: [avatar1, avatar8, avatar6],
  },
]

const moreList = [
  { title: 'Download', value: 'Download' },
  { title: 'Delete', value: 'Delete' },
  { title: 'View', value: 'View' },
]
</script>

<template>
  <VCard
    title="Project List"
    class="projectList"
  >
    <!-- 👉 User Project List Table -->

    <!-- SECTION Datatable -->
    <VDataTable
      :headers="projectTableHeaders"
      :items="projects"
      hide-default-footer
      show-select
      item-value="name"
    >
      <!-- projects -->
      <template #item.project="{ item }">
        <div class="d-flex align-center gap-x-3">
          <VAvatar
            :size="34"
            :image="item.logo"
          />
          <div>
            <h6 class="text-h6 text-no-wrap">
              {{ item.name }}
            </h6>
            <div class="text-body-2">
              {{ item.project }}
            </div>
          </div>
        </div>
      </template>

      <template #item.leader="{ item }">
        <div class="text-base text-high-emphasis">
          {{ item.leader }}
        </div>
      </template>

      <!-- Team -->
      <template #item.team="{ item }">
        <div class="d-flex">
          <div class="v-avatar-group">
            <VAvatar
              v-for="(data, index) in item.team"
              :key="index"
              size="30"
            >
              <VImg :src="data" />
            </VAvatar>
            <VAvatar
              v-if="item.extraMembers"
              :color="$vuetify.theme.current.dark ? '#383B55' : '#F0EFF0'"
              :size="30"
            >
              <div class="text-caption text-high-emphasis">
                +{{ item.extraMembers }}
              </div>
            </VAvatar>
          </div>
        </div>
      </template>

      <!-- Progress -->
      <template #item.progress="{ item }">
        <div class="d-flex align-center gap-3">
          <div class="flex-grow-1">
            <VProgressLinear
              :height="6"
              :model-value="item.progress"
              rounded
            />
          </div>
          <div class="text-high-emphasis">
            {{ item.progress }}%
          </div>
        </div>
      </template>

      <!-- Action -->
      <template #item.Action>
        <MoreBtn
          :menu-list="moreList"
          class="text-medium-emphasis"
        />
      </template>

      <!-- TODO Refactor this after vuetify provides proper solution for removing default footer -->
      <template #bottom />
    </VDataTable>
    <!-- !SECTION -->
  </VCard>
</template>
