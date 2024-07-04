<script setup lang="ts">
const shortcuts = [
  {
    icon: 'ri-calendar-line',
    title: 'Calendar',
    subtitle: 'Appointments',
    to: { name: 'apps-calendar' },
  },
  {
    icon: 'ri-file-list-3-line',
    title: 'Invoice App',
    subtitle: 'Manage Accounts',
    to: { name: 'apps-invoice-list' },
  },
  {
    icon: 'ri-user-line',
    title: 'Users',
    subtitle: 'Manage Users',
    to: { name: 'apps-user-list' },
  },
  {
    icon: 'ri-computer-line',
    title: 'Role Management',
    subtitle: 'Permissions',
    to: { name: 'apps-roles' },
  },
  {
    icon: 'ri-pie-chart-2-line',
    title: 'Dashboard',
    subtitle: 'User Dashboard',
    to: { name: 'dashboards-analytics' },
  },
  {
    icon: 'ri-settings-4-line',
    title: 'Settings',
    subtitle: 'Account Settings',
    to: { name: 'pages-account-settings-tab', params: { tab: 'account' } },
  },

]
</script>

<template>
  <Shortcuts :shortcuts="shortcuts" />
</template>
