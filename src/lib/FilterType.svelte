<script lang=ts>
    import { FilterType, type SyncedSynth } from "./model";
	import { document as getDoc } from "@automerge/automerge-repo-svelte-store"

	export let doc: ReturnType<typeof getDoc<SyncedSynth>>;
	function onChange(e: Event) {
		doc.change((d) => {
			d.filterType = parseInt((e.target as HTMLSelectElement).value) ?? d.filterType
		})
	}
</script>

{#if $doc}
	<label>
		Filter:
		<select value={$doc.filterType} on:input={onChange}>
			<option value={FilterType.LowPass}>Low-Pass</option>
			<option value={FilterType.HighPass}>High-Pass</option>
			<option value={FilterType.BandPass}>Band-Pass</option>
		</select>
	</label>
{/if}
