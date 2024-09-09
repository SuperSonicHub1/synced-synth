<script lang=ts>
    import { type SyncedSynth } from "./model";
	import { document as getDoc } from "@automerge/automerge-repo-svelte-store"

	export let stepNumber: number = 0
	export let doc: ReturnType<typeof getDoc<SyncedSynth>>;
	function onNoteOnChange(e: Event) {
		doc.change((d) => {
			d.noteOn[stepNumber] = (e.target as HTMLInputElement).checked ?? d.noteOn[stepNumber]
		})
	}

	function onNoteValueChange(e: Event) {
		doc.change((d) => {
			d.noteValue[stepNumber] = parseInt((e.target as HTMLInputElement).value) ?? d.noteValue[stepNumber]
		})
	}
</script>

{#if $doc}
	<div>
		<p><em>{stepNumber + 1}</em></p>
		<label>
			On?
			<input
				type="checkbox"
				checked={$doc.noteOn[stepNumber]}
				on:input={onNoteOnChange}>
		</label>
		<label>
			Scale Pitch
			<input
				type="number"
				min={-8} max={8} step={1}
				value={$doc.noteValue[stepNumber]}
				on:input={onNoteValueChange}>
		</label>
	</div>
{/if}
