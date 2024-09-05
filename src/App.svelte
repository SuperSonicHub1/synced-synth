<script lang="ts">
  import svelteLogo from './assets/svelte.svg'
  import viteLogo from '/vite.svg'
  
  import * as A from "@automerge/automerge/next"
  import { document as doc } from "@automerge/automerge-repo-svelte-store"
  import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
  import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
  import { isValidAutomergeUrl, Repo } from '@automerge/automerge-repo'
  import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
  import * as Tone from "tone";
  
  import { type SyncedSynth } from './lib/model'
    import { bubble } from 'svelte/internal';
    import { onDestroy } from 'svelte';
  
  const repo = new Repo({
    storage: new IndexedDBStorageAdapter("synced-synth"),
    network: [
      new BroadcastChannelNetworkAdapter(),
      new BrowserWebSocketClientAdapter('wss://sync.automerge.org'),
    ],
  })

  const rootDocUrl = document.location.hash.substring(1);
  let trueUrl = isValidAutomergeUrl(rootDocUrl)
    ? repo.find(rootDocUrl).url
    : repo.create<SyncedSynth>({ frequency: 440 }).url
  document.location.hash = trueUrl
  const d = doc<SyncedSynth>(trueUrl, repo)

  function changeFreq(e: Event) {
    d.change((d) => {
      d.frequency = parseFloat((e.target as HTMLInputElement).value)
    })
  }

  let ready = false


  let freqUnsubscribe: () => void

  async function start() {
    await Tone.start()
    
    const osc = new Tone.Oscillator($d.frequency, "sine")
      .toDestination()
      .start();

    freqUnsubscribe = d.subscribe(d => {
      console.log(d)
      if (d) {
        osc.frequency.value = d.frequency
      }
    })

    ready = true
  }

  onDestroy(() => {
    if (freqUnsubscribe) freqUnsubscribe()
    Tone.getTransport().stop()
  })
</script>

<main>
  <div>
    <a href="https://vitejs.dev" target="_blank" rel="noreferrer">
      <img src={viteLogo} class="logo" alt="Vite Logo" />
    </a>
    <a href="https://svelte.dev" target="_blank" rel="noreferrer">
      <img src={svelteLogo} class="logo svelte" alt="Svelte Logo" />
    </a>
  </div>
  <h1>Vite + Svelte</h1>

  <div class="card">
    {#if ready}
      <p>Frequency: {$d.frequency}</p>
      <input type="number" value={$d.frequency} min="20" max="20000" step="1" on:input={changeFreq} >
    {:else}
      <p>Press button to start synthesizer.</p>
      <button on:click={start}>Start</button>
    {/if}
  </div>

  <p>
    Check out <a href="https://github.com/sveltejs/kit#readme" target="_blank" rel="noreferrer">SvelteKit</a>, the official Svelte app framework powered by Vite!
  </p>

  <p class="read-the-docs">
    Click on the Vite and Svelte logos to learn more
  </p>
</main>

<style>
  .logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
  }
  .logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
  }
  .logo.svelte:hover {
    filter: drop-shadow(0 0 2em #ff3e00aa);
  }
  .read-the-docs {
    color: #888;
  }
</style>
