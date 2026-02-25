<template>
  <div class="min-h-screen flex flex-col bg-base-100 text-base-content">
    <!-- App Bar -->
    <div class="navbar bg-neutral px-5">
      <div class="flex-1 flex items-center">
        <AppLogo :size="30" color="white" class="mx-2" />
        <span class="text-xl font-medium">Steam Receipts</span>
      </div>

      <div>
        <button
          v-if="isAuthenticated"
          @click="logout"
          class="btn btn-ghost"
        >
          <span class="mdi mdi-logout" />
          Logout
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 main-content relative">
      <LoadingState v-if="isLoading" />

      <div v-else-if="isAuthenticated" class="pt-6">
        <div class="flex flex-wrap justify-evenly items-start gap-6">
          <div class="w-full md:w-6/12 lg:w-4/12">
            <ReceiptOptions />
          </div>

          <div class="w-full md:w-6/12 lg:w-4/12 flex justify-center">
            <SteamReceipt />
          </div>
        </div>
      </div>

      <div v-else class="absolute inset-0 flex items-center justify-center">
        <LoginCard />
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer footer-center bg-neutral p-4 ">
      <div class="flex items-center">
        <span class="text-sm text-neutral-content/60">
          Steam Receipts by renanzro © {{ new Date().getFullYear() }}
        </span>
        <a
          href="https://github.com/renanzro/steam-receipts"
          target="_blank"
          class="text-neutral-content/80 hover:text-neutral-content ml-2"
        >
          <span class="mdi mdi-github text-xl"></span>
        </a>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
  useHead({
    htmlAttrs: {
      'data-theme': 'steam'
    }
  });

  const { isAuthenticated, logout, isLoading, checkAuth, error } = useSteam();

  // Initialize auth on client-side mount
  onMounted(async () => {
    isLoading.value = true;
    if (import.meta.client) {
      const params = new URLSearchParams(window.location.search);

      if (params.get('login') === 'success') {
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
        // Check authentication status
        await checkAuth();
      } else if (params.get('error')) {
        error.value = `Login failed: ${params.get('error')}`;
        window.history.replaceState({}, '', window.location.pathname);
      } else {
        // Check if already authenticated
        await checkAuth();
      }
    }
    isLoading.value = false;
  });
</script>
