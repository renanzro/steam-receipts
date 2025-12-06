<template>
  <div class="loading-container d-flex flex-column align-center justify-center">
    <v-progress-circular :size="80" :width="10" color="accent" indeterminate />
    <p class="mt-4 text-h6 text-accent">Loading your Steam data...</p>
    <p class="text-body-2 text-medium-emphasis">Fetching your recent games</p>
  </div>
</template>

<style scoped>
  .loading-container {
    position: absolute;
    inset: 0;
  }
</style>
