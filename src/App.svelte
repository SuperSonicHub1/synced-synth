<script lang="ts">
  import { document as doc } from "@automerge/automerge-repo-svelte-store"
  import { IndexedDBStorageAdapter } from "@automerge/automerge-repo-storage-indexeddb"
  import { BroadcastChannelNetworkAdapter } from '@automerge/automerge-repo-network-broadcastchannel'
  import { isValidAutomergeUrl, Repo } from '@automerge/automerge-repo'
  import { BrowserWebSocketClientAdapter } from "@automerge/automerge-repo-network-websocket"
  import * as Tone from "tone";
  
  import { defaultState, type SyncedSynth } from './lib/model'
  import { onDestroy } from 'svelte';
  import { Synthesizer } from "./lib/synth";
    import WaveShapeSelector from "./lib/WaveShapeSelector.svelte";
    import Step from "./lib/Step.svelte";
    import Bpm from "./lib/BPM.svelte";
    import FilterCutoff from "./lib/FilterCutoff.svelte";
    import FilterType from "./lib/FilterType.svelte";
    import { get } from "svelte/store";
  
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
    : repo.create<SyncedSynth>(defaultState()).url
  document.location.hash = trueUrl
  const d = doc<SyncedSynth>(trueUrl, repo)
  
  let synth = new Synthesizer(defaultState())
  
  let synthUnsubscribe: () => void
  let ready = false
  async function start() {
    await Tone.start()
    synth.start()

    synthUnsubscribe = d.subscribe(d => {
      if (d) synth.update(d)
    })

    ready = true
  }

  onDestroy(() => {
    if (synthUnsubscribe) synthUnsubscribe()
    synth.dispose()
    Tone.getTransport().stop()
  })
</script>

<main>
  <h1>Synced Synth</h1>

  <div class="card">
    {#if ready}
      <p>Playing!</p>
      <div class="grid">
        <section>
          <WaveShapeSelector oscNumber={1} doc={d} />
          <WaveShapeSelector oscNumber={2} doc={d} />
          <Bpm doc={d}/>
          <FilterType doc={d} />
          <FilterCutoff doc={d} />
        </section>
        <section class="grid" style="grid-template-columns: repeat(8, 1fr); grid-template-rows: repeat(2, 1fr)">
          {#each new Array(16).fill(0).map((_, i) => i) as index}
            <Step stepNumber={index} doc={d} />
          {/each}
        </section>       
      </div>
    {:else}
      <p>Press button to start synthesizer.</p>
      <button on:click={start}>Start</button>
    {/if}
  </div>
</main>

<style>
  .grid {
    display: grid;
  }
</style>
