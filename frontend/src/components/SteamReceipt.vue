<template>
  <v-card
    ref="receiptCard"
    class="receipt-card"
    width="350"
    elevation="2"
    :style="{
      backgroundImage: `url(${wrinkledPaper})`,
      backgroundPosition: `${randomPosition}% 0`
    }"
  >
    <div class="receipt-content">
      <!-- Header -->
      <div class="text-center">
        <v-icon size="48" color="black" class="mb-2">mdi-steam</v-icon>
        <h1 class="receipt-title">STEAM RECEIPT</h1>
        <p class="receipt-subtitle">{{ receiptSubtitle }}</p>
        <p class="receipt-period">{{ formattedDate }} {{ periodLabel }}</p>
      </div>

      <!-- Games List -->
      <div class="games-list my-4">
        <div class="list-header d-flex justify-space-between px-2 mb-2">
          <span>GAME</span>
          <span>TIME</span>
        </div>

        <div
          v-for="(game, index) in displayedGames"
          :key="game.appid"
          class="game-item d-flex justify-space-between px-2 pb-1"
        >
          <div class="d-flex">
            <span class="game-rank mr-2">{{ index + 1 }}.</span>
            <span class="game-name">{{ game.name }}</span>
          </div>
          <span class="game-time">{{ formatPlaytime(getGamePlaytime(game)) }}</span>
        </div>
      </div>

      <!-- Total -->
      <div class="receipt-total d-flex justify-space-between px-2 mt-2">
        <span class="total-label">TOTAL PLAYTIME:</span>
        <span class="total-value">{{ formatPlaytime(totalPlaytime) }}</span>
      </div>

      <div class="receipt-divider my-3 text-center">════════════════════════════</div>

      <!-- Footer -->
      <div class="text-center">
        <p class="footer-text">Thank you for gaming!</p>
        <p v-if="origin" class="footer-subtext">{{ origin }}</p>
        <!-- use actual barcode font in future -->
        <v-img :src="barcodeImage" alt="Barcode" contain />
        <p class="steam-id">{{ user?.steamid }}</p>
      </div>
    </div>
  </v-card>
</template>

<script setup lang="ts">
  import { computed, ref, onMounted, onUnmounted } from 'vue';
  import { useSteamContext } from '../composables';
  import type { RecentGame } from '../types';
  const barcodeImage: string = new URL('../assets/barcode.png', import.meta.url).href;
  const wrinkledPaper: string = new URL('../assets/paper-texture-background.jpg', import.meta.url).href;

  const { user, receiptOptions, displayedGames, totalPlaytime, setReceiptElement } =
    useSteamContext();

  const origin = computed(() =>
    typeof window !== 'undefined' && window.location?.origin
      ? window.location.origin.split('//').pop()
      : undefined
  );

  const receiptCard = ref<{ $el: HTMLElement } | null>(null);

  onMounted(() => {
    if (receiptCard.value?.$el) {
      setReceiptElement(receiptCard.value.$el);
    }
  });

  onUnmounted(() => {
    setReceiptElement(null);
  });

  const randomPosition = Math.floor(Math.random() * 100);

  const receiptSubtitle = computed(() => {
    const name = user.value?.personaname || 'Gamer';
    switch (receiptOptions.value.type) {
      case 'recent':
        return `Recent Activity of ${name}`;
      case 'alltime':
        return `All-Time Top Games of ${name}`;
      default:
        return `Gaming Report of ${name}`;
    }
  });

  const periodLabel = computed(() => {
    switch (receiptOptions.value.type) {
      case 'recent':
        return '(Last 2 Weeks)';
      case 'alltime':
        return '(All Time)';
      default:
        return '';
    }
  });

  const formattedDate = computed(() => {
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  });

  function getGamePlaytime(game: RecentGame): number {
    return receiptOptions.value.type === 'recent'
      ? game.playtime_2weeks || 0
      : game.playtime_forever;
  }

  function formatPlaytime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) {
      return `${mins}m`;
    }
    return `${hours}h ${mins}m`;
  }
</script>

<style scoped>
  @font-face {
    font-family: 'Fake Receipt';
    src: url('../assets/Fake Receipt.otf') format('opentype');
    font-weight: normal;
    font-style: normal;
  }

  .receipt-content {
    padding: 24px 16px;
    font-family: 'Fake Receipt', monospace;
  }

  .receipt-title {
    font-size: 1.5rem;
    font-weight: bold;
    letter-spacing: 2px;
    margin: 0;
    color: #1a1a1a;
  }

  .receipt-subtitle {
    font-size: 0.75rem;
    color: #666;
    margin: 4px 0 0 0;
  }

  .receipt-divider {
    color: #666;
    font-size: 0.75rem;
    letter-spacing: -1px;
  }

  .receipt-period {
    font-size: 0.7rem;
    color: #666;
    margin: 2px 0 0 0;
  }

  .games-list {
    border-bottom: 1px dashed #666;
  }

  .list-header {
    font-size: 0.7rem;
    color: #666;
    border-bottom: 1px dashed #666;
    padding-bottom: 4px;
  }

  .game-item {
    font-size: 0.85rem;
  }

  .game-rank {
    color: #1a1a1a;
    min-width: 24px;
    flex-shrink: 0;
  }

  .game-name {
    color: #1a1a1a;
    word-break: break-word;
    flex: 1;
    padding-right: 8px;
  }

  .game-time {
    color: #333;
    font-weight: bold;
    flex-shrink: 0;
    text-align: right;
  }

  .receipt-total {
    font-size: 1rem;
    font-weight: bold;
  }

  .total-label {
    color: #1a1a1a;
  }

  .total-value {
    color: #1a1a1a;
  }

  .footer-text {
    font-size: 0.8rem;
    color: #666;
  }

  .footer-subtext {
    font-size: 0.7rem;
    color: #666;
  }

  .steam-id {
    font-size: 0.8rem;
    color: #666;
  }
</style>
