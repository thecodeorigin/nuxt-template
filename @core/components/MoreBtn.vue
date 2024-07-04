<script lang="ts" setup>
interface Props {
  menuList?: unknown[]
  itemProps?: boolean
  iconSize?: string
  class?: string
}

const props = withDefaults(defineProps<Props>(), {
  class: 'text-disabled',
})
</script>

<template>
  <IconBtn
    size="small"
    :class="props.class"
  >
    <VIcon
      :size="iconSize"
      icon="ri-more-2-line"
    />

    <VMenu
      v-if="props.menuList"
      activator="parent"
    >
      <VList
        :items="props.menuList"
        :item-props="props.itemProps"
      />
    </VMenu>
  </IconBtn>
</template>
