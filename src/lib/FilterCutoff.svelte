<script lang=ts>
    import { type SyncedSynth } from "./model";
	import { document as getDoc } from "@automerge/automerge-repo-svelte-store"

	export let doc: ReturnType<typeof getDoc<SyncedSynth>>;

	function onChange(e: Event) {
		doc.change((d) => {
			d.filterCutoff = parseFloat((e.target as HTMLInputElement).value) ?? d.filterCutoff
		})
	}
</script>

{#if $doc}
	<label>
		Filter Cutoff
		<input
			type="range"
			min={20} max={20000}
			name="cutoff"
			value={$doc.filterCutoff}
			on:input={onChange}>
	</label>
	<output name="cutoff">{$doc.filterCutoff} Hz</output>
{/if}
