<script lang="ts">
  import { document as doc } from "@automerge/automerge-repo-svelte-store"
  import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
  import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
  import { isValidAutomergeUrl, Repo } from '@automerge/automerge-repo'
  import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
  import * as Tone from "tone";
  
  import { type SyncedSynth } from './lib/model'
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
  <h1>Synced Synth</h1>

  <div class="card">
    {#if ready}
      <p>Frequency: {$d.frequency}</p>
      <input type="number" value={$d.frequency} min="20" max="20000" step="1" on:input={changeFreq} >
    {:else}
      <p>Press button to start synthesizer.</p>
      <button on:click={start}>Start</button>
    {/if}
  </div>
</main>
