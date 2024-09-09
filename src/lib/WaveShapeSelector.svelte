<script lang=ts>
    import { WaveShape, type SyncedSynth } from "./model";
	import { document as getDoc } from "@automerge/automerge-repo-svelte-store"

	export let oscNumber: number = 1
	export let doc: ReturnType<typeof getDoc<SyncedSynth>>;
	function onChange(e: Event) {
		doc.change((d) => {
			if (oscNumber == 1) {
				d.osc1WaveShape = parseInt((e.target as HTMLSelectElement).value)
			} else if (oscNumber == 2) {
				d.osc2WaveShape = parseInt((e.target as HTMLSelectElement).value)
			} else {
				throw new TypeError(`Invalid oscNumber ${oscNumber}.`)
			}
		})
	}
</script>

<label>
	{#if $doc}
		<label>
			Osc {oscNumber}:
			{#if oscNumber == 1}
				<select value={$doc.osc1WaveShape} on:input={onChange}>
					<option value={WaveShape.Sawtooth}>Sawtooth</option>
					<option value={WaveShape.Square}>Square</option>
				</select>
			{:else}
				<select value={$doc.osc2WaveShape} on:input={onChange}>
					<option value={WaveShape.Sawtooth}>Sawtooth</option>
					<option value={WaveShape.Square}>Square</option>
				</select>
			{/if}
		</label>
	{/if}
</label>