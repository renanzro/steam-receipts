<template>
  <div class="app-logo" :style="logoStyle" v-html="logoSvg" />
</template>

<style scoped>
  .app-logo {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    vertical-align: middle;
  }

  .app-logo :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }

  .app-logo :deep(g[fill]) {
    fill: v-bind(color) !important;
  }
</style>

<script setup lang="ts">
  import { computed } from 'vue';
  import logoSvg from '../assets/logo.svg?raw';

  const props = withDefaults(
    defineProps<{
      size?: number;
      color?: string;
    }>(),
    {
      size: 24,
      color: 'white'
    }
  );

  const logoStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`
  }));
</script>
