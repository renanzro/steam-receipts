<template>
  <div class="card bg-base-200 shadow-xl border border-base-300 w-[400px]">
    <div class="card-body items-center text-center">
      <AppLogo :size="80" color="#66c0f4" class="mb-4" />

      <h1 class="card-title text-4xl font-bold mb-2">Steam Receipts</h1>
      <p class="text-sm text-base-content/60 mb-6">
        See your gaming activity in a receipt-style!
      </p>

      <button
        :disabled="isLoading"
        @click="handleLogin"
        class="btn btn-primary w-full"
      >
        <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
        <span v-else class="mdi mdi-steam"></span>
        Sign in with Steam
      </button>

      <p class="text-xs text-base-content/60 mb-4">
        Steam profile and game details must be set to
        <strong class="text-base-content/80">Public</strong>
      </p>

      <button
        :disabled="isLoading"
        @click="handleDemo"
        class="btn btn-outline btn-ghost w-full"
      >
        <span v-if="isLoading" class="loading loading-spinner loading-sm"></span>
        <span v-else class="mdi mdi-eye"></span>
        View Demo
      </button>

      <div v-if="error" role="alert" class="alert alert-error mt-4">
        <span class="mdi mdi-alert-circle"></span>
        <span class="text-sm">{{ error }}</span>
        <button @click="error = ''" class="btn btn-ghost btn-sm btn-circle">
          <span class="mdi mdi-close"></span>
        </button>
      </div>
    </div>

    <div class="pb-4 text-xs text-base-content/60 text-center">
      <img :src="signInThroughSteam" alt="Sign in through Steam" class="h-[35px] mx-auto" />
      <p class="mt-1">Your credentials are never shared with us.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import signInThroughSteam from '~/assets/sits_01.png';

  const { login, setMockData, isLoading, error } = useSteam();

  function handleLogin() {
    login();
  }

  function handleDemo() {
    setMockData();
  }
</script>
