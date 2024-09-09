<script lang=ts>
    import { type SyncedSynth } from "./model";
	import { document as getDoc } from "@automerge/automerge-repo-svelte-store"

	export let doc: ReturnType<typeof getDoc<SyncedSynth>>;

	function onChange(e: Event) {
		doc.change((d) => {
			d.bpm = parseFloat((e.target as HTMLInputElement).value) ?? d.bpm
		})
	}
</script>

{#if $doc}
	<label>
		BPM
		<input
			type="number"
			min={40} max={200} step={5}
			value={$doc.bpm}
			on:input={onChange}>
	</label>
{/if}
