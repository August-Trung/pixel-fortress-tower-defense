<template>
  <div class="home-container d-flex align-center justify-center fill-height">
    <div class="pixel-card py-8 px-10 text-center main-card">
      <h1 class="font-game game-title mb-4 blink">PIXEL FORTRESS</h1>
      <p class="subtitle mb-8 text-grey text-uppercase font-weight-bold">Fantasy Medieval Tower Defense</p>
      
      <div class="input-container mb-6">
        <label class="font-game label d-block mb-3">ENTER YOUR NAME</label>
        <input 
          type="text" 
          v-model="nameInput"
          placeholder="HERO..."
          maxlength="50"
          class="pixel-input text-center py-3 px-4"
          @keyup.enter="playGame"
        />
        <div v-if="errorMsg" class="error-msg text-red font-game mt-2">{{ errorMsg }}</div>
      </div>
      
      <div class="actions d-flex flex-column align-stretch">
        <button 
          class="pixel-btn mb-4" 
          :disabled="loading"
          @click="playGame"
        >
          {{ loading ? 'ENTER THE FORTRESS...' : 'PLAY GAME' }}
        </button>
        <button 
          class="pixel-btn secondary"
          @click="goRanking"
        >
          LEADERBOARD
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '../stores/playerStore.js';

const nameInput = ref('');
const errorMsg = ref('');
const loading = ref(false);

const router = useRouter();
const playerStore = usePlayerStore();

async function playGame() {
  const name = nameInput.value.trim();
  if (!name) {
    errorMsg.value = 'NAME IS REQUIRED!';
    return;
  }
  
  if (name.length > 50) {
    errorMsg.value = 'MAX 50 CHARACTERS!';
    return;
  }
  
  errorMsg.value = '';
  loading.value = true;
  try {
    await playerStore.loginOrCreate(name);
    router.push('/game');
  } catch (err) {
    console.error(err);
    errorMsg.value = 'SERVER OFFLINE. REDIRECTING...';
    // Fallback: log in locally to allow offline play
    playerStore.player = { id: 999, name: name };
    setTimeout(() => {
      router.push('/game');
    }, 1000);
  } finally {
    loading.value = false;
  }
}

function goRanking() {
  router.push('/ranking');
}
</script>

<style scoped>
.home-container {
  height: 100vh;
  background: radial-gradient(circle, #1a2332 0%, #080c12 100%);
  display: flex;
}
.main-card {
  max-width: 480px;
  width: 90%;
  border-color: #1f2833;
}
.game-title {
  font-size: 26px;
  color: #ff6b35;
  text-shadow: 3px 3px 0 #000;
  letter-spacing: 1px;
}
.subtitle {
  font-size: 11px;
  color: #c5c6c7;
  letter-spacing: 1.5px;
}
.label {
  font-size: 9px;
  color: #c5c6c7;
}
.pixel-input {
  font-family: 'Press Start 2P', monospace;
  font-size: 11px;
  background-color: #0b0c10;
  border: 3px solid #333;
  color: #fff;
  width: 100%;
  box-shadow: inset 0 0 5px rgba(0,0,0,0.8);
  outline: none;
  text-transform: uppercase;
}
.pixel-input:focus {
  border-color: #ff6b35;
}
.error-msg {
  font-size: 8px;
}
</style>
