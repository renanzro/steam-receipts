<template>
  <v-card class="mx-auto text-center border-accent" max-width="400" elevation="8">
    <v-card-text class="pa-8">
      <AppLogo :size="80" color="rgb(var(--v-theme-accent))" class="mb-4" />

      <h1 class="text-h4 mb-2 font-weight-bold">Steam Receipts</h1>
      <p class="text-body-2 text-medium-emphasis mb-6">
        See your gaming activity in a receipt-style!
      </p>

      <v-btn
        color="accent"
        size="large"
        block
        :loading="isLoading"
        @click="handleLogin"
        prepend-icon="mdi-steam"
      >
        Sign in with Steam
      </v-btn>

      <p class="text-caption text-medium-emphasis mb-4">
        Steam profile and game details must be set to
        <strong>Public</strong>
      </p>

      <v-btn
        variant="outlined"
        color="grey"
        size="large"
        block
        :loading="isLoading"
        @click="handleDemo"
        prepend-icon="mdi-eye"
      >
        View Demo
      </v-btn>

      <v-alert v-if="error" type="error" class="mt-4" variant="tonal" closable>
        {{ error }}
      </v-alert>
    </v-card-text>

    <v-card-text class="py-2 text-caption text-medium-emphasis">
      <v-img :src="SingInThroughSteam" alt="Sign in through Steam" height="35" />
      <p>Your credentials are never shared with us.</p>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { useSteamContext } from '../composables';
  import AppLogo from './AppLogo.vue';
  import SingInThroughSteam from '../assets/sits_01.png';

  const { login, setMockData, isLoading, error } = useSteamContext();

  function handleLogin() {
    login();
  }

  function handleDemo() {
    setMockData();
  }
</script>
