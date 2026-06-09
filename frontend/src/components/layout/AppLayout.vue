<template>
  <div class="app-layout">
    <AppSidebar />
    <AppTopbar :title="pageTitle" />
    <main class="app-main">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppSidebar from './AppSidebar.vue'
import AppTopbar  from './AppTopbar.vue'

const route = useRoute()
const pageTitle = computed(() => route.meta?.title || '')
</script>

<style scoped>
.app-layout {
  display: flex;
  min-height: 100vh;
}
.app-main {
  margin-right: var(--sidebar-width);
  margin-top: var(--topbar-height);
  padding: 1.5rem;
  flex: 1;
  min-height: calc(100vh - var(--topbar-height));
  animation: fadeIn .3s ease;
}

/* Page transition */
.fade-enter-active, .fade-leave-active { transition: opacity .2s ease; }
.fade-enter-from, .fade-leave-to       { opacity: 0; }
</style>
