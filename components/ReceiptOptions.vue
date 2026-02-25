<template>
  <div class="card bg-base-200 shadow-xl border border-base-300 my-5">
    <div class="card-body p-4">
      <!-- User Avatar and Name -->
      <div class="flex items-center mb-4">
        <div class="avatar mr-3">
          <div class="w-12 rounded-full">
            <img :src="user?.avatarmedium" :alt="user?.personaname" />
          </div>
        </div>
        <div>
          <div class="text-base font-bold">{{ user?.personaname }}</div>
          <div class="text-xs text-base-content/60">Steam User</div>
        </div>
      </div>

      <div class="divider my-0"></div>

      <h3 class="text-base mb-3 font-bold flex items-center">
        <span class="mdi mdi-cog text-xl mr-1"></span>
        Receipt Options
      </h3>

      <!-- Receipt Type Selection -->
      <div class="mb-4">
        <label class="text-xs text-base-content/60 block mb-2">Receipt Type</label>
        <div class="join w-full">
          <button
            @click="selectedType = 'recent'"
            :class="[
              'btn join-item flex-1 btn-sm',
              selectedType === 'recent'
                ? 'btn-primary'
                : 'btn-ghost border border-base-content/20'
            ]"
          >
            <span class="mdi mdi-clock-outline"></span>
            Recent
          </button>
          <button
            @click="selectedType = 'alltime'"
            :class="[
              'btn join-item flex-1 btn-sm',
              selectedType === 'alltime'
                ? 'btn-primary'
                : 'btn-ghost border border-base-content/20'
            ]"
          >
            <span class="mdi mdi-trophy"></span>
            All Time
          </button>
        </div>
      </div>

      <!-- Game Limit -->
      <div class="mb-4">
        <div class="mb-6">
          <label class="text-xs text-base-content/60 block mb-2">
            Number of Items: {{ selectedLimit }}
          </label>
          <input
            v-model="selectedLimit"
            type="range"
            min="1"
            max="25"
            step="1"
            class="range range-primary range-sm w-full"
          />
          <div class="flex justify-between text-xs text-base-content/60 mt-1">
            <span>1</span>
            <span>25</span>
          </div>
        </div>

        <div class="grid grid-cols-1 xl:grid-cols-3 gap-3">
          <button
            :disabled="isRemainingDisabled"
            @click="setShowRemainingGames(!showRemainingGames)"
            :class="[
              'btn w-full h-auto py-2',
              showRemainingGames
                ? 'btn-primary shadow-lg'
                : 'btn-outline border-base-content/20 text-base-content/80 hover:bg-base-content/10 hover:border-base-content/20',
              isRemainingDisabled && 'btn-disabled'
            ]"
          >
            <span
              class="mdi"
              :class="showRemainingGames ? 'mdi-checkbox-marked' : 'mdi-checkbox-blank-outline'"
            ></span>
            Show remaining
          </button>

          <div class="relative col-span-1" :class="hiddenGamesCount > 0 ? 'mb-4 xl:mb-0' : ''">
            <button
              @click="openHideGamesDialog"
              :class="[
                'btn w-full h-auto py-2',
                hiddenGamesCount > 0
                  ? 'btn-warning shadow-lg'
                  : 'btn-outline border-base-content/20 text-base-content/80 hover:bg-base-content/10 hover:border-base-content/20'
              ]"
            >
              <span class="mdi mdi-eye-off"></span>
              Hide Games
            </button>

            <span
              v-if="hiddenGamesCount > 0"
              class="text-xs text-warning absolute left-1/2 -translate-x-1/2 -bottom-4 whitespace-nowrap"
            >
              {{ hiddenGamesCount }} game{{ hiddenGamesCount > 1 ? 's are' : ' is' }} hidden.
            </span>
          </div>

          <button
            :disabled="isDownloading"
            @click="downloadReceipt"
            class="btn btn-primary w-full h-auto py-2 shadow-lg"
          >
            <span v-if="isDownloading" class="loading loading-spinner loading-sm"></span>
            <span v-else class="mdi mdi-download"></span>
            Download
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- Hide Games Dialog -->
  <dialog ref="hideGamesDialogEl" class="modal modal-bottom sm:modal-middle">
    <div class="modal-box bg-base-200 border border-base-300 max-w-[500px] p-0">
      <div class="p-4 border-b border-base-content/10">
        <h2 class="text-lg font-bold flex items-center">
          <span class="mdi mdi-eye-off mr-2"></span>
          Hide Games
        </h2>
        <p class="text-sm text-base-content/60 mt-1">
          Select games to hide from your receipt. Hidden games won't count towards totals.
        </p>
      </div>

      <div class="overflow-y-auto max-h-[400px]">
        <ul class="divide-y divide-base-content/10">
          <li
            v-for="game in allGamesInCategory"
            :key="game.appid"
            @click="toggleHiddenGame(game.appid)"
            class="flex items-center px-4 py-2 hover:bg-base-content/5 cursor-pointer"
          >
            <input
              type="checkbox"
              :checked="isGameHidden(game.appid)"
              @click.stop="toggleHiddenGame(game.appid)"
              class="checkbox checkbox-warning checkbox-sm mr-3"
            />
            <span
              :class="[
                'flex-1',
                isGameHidden(game.appid) && 'text-base-content/60 line-through'
              ]"
            >
              {{ game.name }}
            </span>
            <span class="text-xs text-base-content/60 ml-2">
              {{ formatPlaytime(getGamePlaytime(game)) }}
            </span>
          </li>
        </ul>
      </div>

      <div class="modal-action p-3 border-t border-base-content/10">
        <span
          v-if="hiddenGamesCount > 0"
          class="badge badge-warning"
        >
          {{ hiddenGamesCount }} game{{ hiddenGamesCount > 1 ? 's' : '' }} hidden
        </span>
        <div class="flex-1"></div>
        <button
          @click="clearHiddenGames"
          class="btn btn-ghost btn-sm text-primary"
        >
          Show all games
        </button>
        <form method="dialog">
          <button class="btn btn-ghost btn-sm">Close</button>
        </form>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button>close</button>
    </form>
  </dialog>
</template>

<script setup lang="ts">
  import { ref, watch, computed } from 'vue';
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
  const hideGamesDialogEl = ref<HTMLDialogElement | null>(null);

  function openHideGamesDialog() {
    hideGamesDialogEl.value?.showModal();
  }

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

  async function buildFontEmbedCSS(): Promise<string> {
    async function toBase64(url: string): Promise<string> {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      const bytes = new Uint8Array(buffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
      return btoa(binary);
    }

    const [receiptFontB64, mdiFontB64] = await Promise.all([
      toBase64('/fonts/FakeReceipt.otf'),
      toBase64('/fonts/materialdesignicons-webfont.woff2')
    ]);

    return `
      @font-face {
        font-family: 'Fake Receipt';
        src: url('data:font/opentype;base64,${receiptFontB64}') format('opentype');
      }
      @font-face {
        font-family: 'Material Design Icons';
        src: url('data:font/woff2;base64,${mdiFontB64}') format('woff2');
        font-weight: normal;
        font-style: normal;
      }
    `;
  }

  async function downloadReceipt() {
    if (!receiptElement.value) {
      console.error('Receipt element not found');
      return;
    }

    isDownloading.value = true;

    try {
      const { toPng } = await import('html-to-image');

      const fontEmbedCSS = await buildFontEmbedCSS();
      const dataUrl = await toPng(receiptElement.value, {
        pixelRatio: 2,
        cacheBust: true,
        fontEmbedCSS
      });

      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = `steam-receipt-${user.value?.personaname || 'user'}-${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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


