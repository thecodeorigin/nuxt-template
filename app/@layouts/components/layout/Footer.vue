<script setup lang="ts">
const { t } = useI18n()

const config = useRuntimeConfig()

function VNodeCredit() {
  return h('div', {
    class: 'd-flex align-center text-base',
    innerHTML: t(
      '© {year} Developed by {link}',
      {
        year: new Date().getFullYear(),
        link: `<a href="${config.public.appCreditURL}" target="_blank" rel="noopener noreferrer" class="text-primary ms-1">${config.public.appCredit}</a>`,
      },
    ),
  })
}
</script>

<template>
  <div class="h-100 d-flex align-center justify-space-between text-medium-emphasis">
    <!-- 👉 Footer: left content -->
    <VNodeCredit />
    <!-- 👉 Footer: right content -->
    <span class="d-md-flex gap-x-4 text-primary d-none">
      <a
        href="#"
        target="noopener noreferrer"
      >
        {{ $t('Introduction') }}
      </a>
    </span>
  </div>
</template>
