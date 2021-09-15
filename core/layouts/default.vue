<template>
  <div :class="$style.layoutWrapper">
    <MySidebar />
    <div :class="$style.layoutInner">
      <MyNavbar />
      <div :class="$style.layoutPageWrapper">
        <nuxt />
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent } from '@nuxtjs/composition-api';
import MyNavbar from '@/components/layout/MyNavbar/MyNavbar.vue';
import MySidebar from '@/components/layout/MySidebar/MySidebar.vue';

export default defineComponent({
  name: 'DefaultLayout',
  components: {
    MyNavbar,
    MySidebar,
  },
  setup() {},
});
</script>

<style lang="scss" module>
.layoutWrapper {
  display: flex;
  flex-direction: row;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.layoutInner {
  display: flex;
  flex: 1; // Horizontal spread
  height: 100vh;
  flex-direction: column;
  overflow: hidden;
}

.layoutPageWrapper {
  flex: 1;
  overflow: auto;
  padding: 1rem;
}

</style>
