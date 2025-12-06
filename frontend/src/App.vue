<template>
  <v-app>
    <v-app-bar color="primary" elevation="0">
      <v-app-bar-title class="d-flex align-center">
        <AppLogo :size="28" color="white" class="mr-2" />
        Steam Receipts
      </v-app-bar-title>
      <template #append>
        <v-btn v-if="isAuthenticated" @click="logout" variant="text" prepend-icon="mdi-logout">
          Logout
        </v-btn>
      </template>
    </v-app-bar>

    <v-main class="main-content">
      <LoadingState v-if="isLoading" />

      <v-container v-else-if="isAuthenticated" fluid>
        <v-row class="justify-space-evenly">
          <v-col cols="12" md="7" lg="5">
            <ReceiptOptions />
          </v-col>

          <v-col cols="12" md="4" lg="4" class="d-flex justify-center">
            <SteamReceipt />
          </v-col>
        </v-row>
      </v-container>

      <v-container v-else class="fill-height" fluid>
        <LoginCard />
      </v-container>
    </v-main>

    <v-footer color="primary" class="pa-2 d-flex justify-center align-center flex-grow-0">
      <span class="text-caption text-medium-emphasis">
        Steam Receipts by renanzro © {{ new Date().getFullYear() }}
      </span>

      <v-btn
        icon="mdi-github"
        variant="text"
        href="https://github.com/renanzro/steam-receipts"
        target="_blank"
        class="ml-2"
      />
    </v-footer>
  </v-app>
</template>

<style scoped>
  .main-content {
    background: linear-gradient(135deg, #1b2838 0%, #171a21 100%);
  }
</style>

<script setup lang="ts">
  import { provideSteamContext } from './composables';
  import { SteamReceipt, LoginCard, LoadingState, ReceiptOptions, AppLogo } from './components';

  // Provide the Steam context at the app root
  const { isAuthenticated, logout, isLoading } = provideSteamContext();
</script>
