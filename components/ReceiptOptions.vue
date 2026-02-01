<template>
  <v-card class="my-5 border-accent" elevation="8">
    <v-card-text class="pa-4">
      <!-- User Avatar and Name -->
      <div class="d-flex align-center mb-4">
        <v-avatar size="48" class="mr-3">
          <v-img :src="user?.avatarmedium" :alt="user?.personaname" />
        </v-avatar>
        <div>
          <div class="text-subtitle-1 font-weight-bold">{{ user?.personaname }}</div>
          <div class="text-caption text-medium-emphasis">Steam User</div>
        </div>
      </div>

      <v-divider class="mb-4" />

      <h3 class="text-subtitle-1 mb-3 font-weight-bold">
        <v-icon size="20" class="mr-1">mdi-cog</v-icon>
        Receipt Options
      </h3>

      <!-- Receipt Type Selection -->
      <div class="mb-4">
        <label class="text-caption text-medium-emphasis d-block mb-2">Receipt Type</label>
        <v-btn-toggle
          v-model="selectedType"
          mandatory
          density="compact"
          color="accent"
          class="w-100"
        >
          <v-btn value="recent" size="small" class="flex-grow-1">
            <v-icon size="16" class="mr-1">mdi-clock-outline</v-icon>
            Recent
          </v-btn>
          <v-btn value="alltime" size="small" class="flex-grow-1">
            <v-icon size="16" class="mr-1">mdi-trophy</v-icon>
            All Time
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Game Limit -->
      <v-container class="mb-1">
        <v-row>
          <v-col cols="12">
            <label class="text-caption text-medium-emphasis d-block mb-7">
              Number of Items: {{ selectedLimit }}
            </label>
            <v-slider
              v-model="selectedLimit"
              :min="1"
              :max="25"
              :step="1"
              color="accent"
              thumb-label
              hide-details
            />
            <div class="d-flex justify-space-between text-caption text-medium-emphasis mt-1">
              <span>1</span>
              <span>25</span>
            </div>
          </v-col>

          <v-col cols="12" xl="4">
            <v-btn
              :color="showRemainingGames ? 'accent' : undefined"
              :variant="showRemainingGames ? 'elevated' : 'outlined'"
              size="large"
              block
              :disabled="isRemainingDisabled"
              @click="setShowRemainingGames(!showRemainingGames)"
              :prepend-icon="
                showRemainingGames ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'
              "
            >
              Show remaining
            </v-btn>
          </v-col>

          <v-col cols="6" xl="4" class="position-relative">
            <v-btn
              :color="hiddenGamesCount > 0 ? 'warning' : undefined"
              :variant="hiddenGamesCount > 0 ? 'elevated' : 'outlined'"
              size="large"
              block
              @click="hideGamesDialog = true"
              prepend-icon="mdi-eye-off"
            >
              Hide Games
            </v-btn>
            <span
              class="text-caption text-warning position-absolute text-no-wrap"
              style="left: 50%; transform: translateX(-50%); bottom: -16px"
              :style="{ visibility: hiddenGamesCount > 0 ? 'visible' : 'hidden' }"
            >
              {{ hiddenGamesCount }} game{{ hiddenGamesCount > 1 ? 's are' : ' is' }} hidden.
            </span>
          </v-col>

          <v-col cols="6" xl="4">
            <v-btn
              color="accent"
              variant="elevated"
              size="large"
              block
              :loading="isDownloading"
              :disabled="isDownloading"
              @click="downloadReceipt"
              prepend-icon="mdi-download"
            >
              Download
            </v-btn>
          </v-col>
        </v-row>
      </v-container>
    </v-card-text>
  </v-card>

  <!-- Hide Games Dialog -->
  <v-dialog v-model="hideGamesDialog" max-width="500" scrollable>
    <v-card>
      <v-card-title class="d-flex align-center">
        <v-icon class="mr-2">mdi-eye-off</v-icon>
        Hide Gamesa
      </v-card-title>
      <v-card-subtitle class="pb-0">
        Select games to hide from your receipt. Hidden games won't count towards totals.
      </v-card-subtitle>
      <v-divider class="mt-3" />
      <v-card-text class="pa-0" style="max-height: 400px">
        <v-list density="compact">
          <v-list-item
            v-for="game in allGamesInCategory"
            :key="game.appid"
            @click="toggleHiddenGame(game.appid)"
            class="px-4"
          >
            <template #prepend>
              <v-checkbox-btn
                :model-value="isGameHidden(game.appid)"
                @update:model-value="toggleHiddenGame(game.appid)"
                color="warning"
                hide-details
              />
            </template>
            <v-list-item-title
              :class="{
                'text-medium-emphasis text-decoration-line-through': isGameHidden(game.appid)
              }"
            >
              {{ game.name }}
            </v-list-item-title>
            <template #append>
              <span class="text-caption text-medium-emphasis">
                {{ formatPlaytime(getGamePlaytime(game)) }}
              </span>
            </template>
          </v-list-item>
        </v-list>
      </v-card-text>
      <v-divider />
      <v-card-actions>
        <v-chip v-if="hiddenGamesCount > 0" color="warning" size="small">
          {{ hiddenGamesCount }} game{{ hiddenGamesCount > 1 ? 's' : '' }} hidden
        </v-chip>
        <v-spacer />
        <v-btn variant="text" color="info" @click="clearHiddenGames">Show all games</v-btn>
        <v-btn variant="text" @click="hideGamesDialog = false">Close</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
  import html2canvas from 'html2canvas';
  import type { ReceiptType, RecentGame } from '~/types/steam';

  const {
    user,
    receiptOptions,
    receiptElement,
    showRemainingGames,
    totalGamesCount,
    allGamesInCategory,
    hiddenGamesCount,
    setReceiptType,
    setReceiptLimit,
    setShowRemainingGames,
    toggleHiddenGame,
    isGameHidden,
    clearHiddenGames
  } = useSteam();

  const selectedType = ref<ReceiptType>(receiptOptions.value.type);
  const selectedLimit = ref(10);
  const isDownloading = ref(false);
  const hideGamesDialog = ref(false);

  // Local computed for button disabled state to ensure reactivity
  const isRemainingDisabled = computed(() => selectedLimit.value >= totalGamesCount.value);

  // Get playtime for a game based on current receipt type
  function getGamePlaytime(game: RecentGame): number {
    return receiptOptions.value.type === 'recent'
      ? game.playtime_2weeks || 0
      : game.playtime_forever;
  }

  // Format playtime in hours and minutes
  function formatPlaytime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = String(minutes % 60).padStart(2, '0');
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  }

  async function downloadReceipt() {
    if (!receiptElement.value) {
      console.error('Receipt element not found');
      return;
    }

    isDownloading.value = true;

    try {
      const canvas = await html2canvas(receiptElement.value, {
        backgroundColor: null,
        scale: 2, // Higher resolution
        useCORS: true, // Allow cross-origin images
        logging: false,
        height: receiptElement.value.offsetHeight,
        windowHeight: receiptElement.value.offsetHeight
      });

      // Convert canvas to blob and download
      canvas.toBlob(blob => {
        if (!blob) {
          console.error('Failed to create image blob');
          return;
        }

        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `steam-receipt-${user.value?.personaname || 'user'}-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 'image/png');
    } catch (error) {
      console.error('Failed to capture receipt:', error);
    } finally {
      isDownloading.value = false;
    }
  }

  watch(selectedType, async newType => {
    await setReceiptType(newType);
    setShowRemainingGames(!isRemainingDisabled.value);
  });

  watch(selectedLimit, newLimit => {
    setReceiptLimit(newLimit);
  });

  // Disable showRemaining when limit covers all games
  watch([selectedLimit, totalGamesCount], ([limit, total]) => {
    if (limit >= total && showRemainingGames.value) {
      setShowRemainingGames(false);
    }
  });

  onBeforeMount(() => {
    // initialize with current options
    setReceiptType(selectedType.value);
    setReceiptLimit(selectedLimit.value);
    setShowRemainingGames(!isRemainingDisabled.value);
  });
</script>

<style scoped>
  .receipt-options {
    border: 1px solid rgba(102, 192, 244, 0.2);
  }
</style>
