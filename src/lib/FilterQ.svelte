<script lang=ts>
    import { type SyncedSynth } from "./model";
	import { document as getDoc } from "@automerge/automerge-repo-svelte-store"

	export let doc: ReturnType<typeof getDoc<SyncedSynth>>;

	function onChange(e: Event) {
		doc.change((d) => {
			d.filterQ = parseFloat((e.target as HTMLInputElement).value) ?? d.filterQ
		})
	}
</script>

{#if $doc}
	<label>
		Q
		<input
			type="range"
			min={0} max={10}
			step={0.01}
			name="cutoff"
			value={$doc.filterQ}
			on:input={onChange}>
	</label>
	<output name="cutoff">{$doc.filterQ}</output>
{/if}
