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
      <div class="d-flex flex-column flex-sm-row align-sm-center ga-4">
        <div class="flex-grow-1">
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
        </div>
        <v-btn
          color="accent"
          variant="elevated"
          size="large"
          class="d-sm-inline-flex"
          :block="$vuetify.display.xs"
          :loading="isDownloading"
          :disabled="isDownloading"
          @click="downloadReceipt"
          prepend-icon="mdi-download"
        >
          Download
        </v-btn>
      </div>
    </v-card-text>
  </v-card>
</template>

<script setup lang="ts">
  import { ref, watch } from 'vue';
  import html2canvas from 'html2canvas';
  import { useSteamContext } from '../composables';
  import type { ReceiptType } from '../types';

  const { user, receiptOptions, receiptElement, setReceiptType, setReceiptLimit } =
    useSteamContext();

  const selectedType = ref<ReceiptType>(receiptOptions.value.type);
  const selectedLimit = ref(10);
  const isDownloading = ref(false);

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
  });

  watch(selectedLimit, newLimit => {
    setReceiptLimit(newLimit);
  });
</script>

<style scoped>
  .receipt-options {
    border: 1px solid rgba(102, 192, 244, 0.2);
  }
</style>
