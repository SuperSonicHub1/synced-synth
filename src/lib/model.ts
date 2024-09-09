import * as A from "@automerge/automerge/next"

export enum WaveShape {
	Sawtooth,
	Square,
}

export enum FilterType {
	LowPass,
	HighPass,
	BandPass,
}

// https://stackoverflow.com/a/52489294
type Tuple<T, N extends number> = N extends N ? number extends N ? T[] : _TupleOf<T, N, []> : never;
type _TupleOf<T, N extends number, R extends unknown[]> = R['length'] extends N ? R : _TupleOf<T, N, [T, ...R]>;

export type SyncedSynth = {
	osc1WaveShape: WaveShape,
	osc2WaveShape: WaveShape,
	osc1Mix: number,
	osc2Mix: number,
	
	filterType: FilterType,
	filterCutoff: number,
	filterQ: number,
	// TODO: Tone.Filter lacks a resonance knob
	// filterResonance: number,

	vcaAttack: number,
	vcaDecay: number,
	vcaSustain: number,
	vcaRelease: number,

	scale: string,
	baseOctave: number
	noteOn: Tuple<boolean, 16>,
	noteValue: Tuple<number, 16>,

	bpm: number,
	// TODO: Subdivision can only be set in the constructor of Tone.Sequence
	// notesPerBeat: number,
	on: boolean,
}

export function defaultState(): SyncedSynth {
	return {
		osc1WaveShape: WaveShape.Sawtooth,
		osc2WaveShape: WaveShape.Square,
		osc1Mix: 0.5,
		osc2Mix: 0.5,
		
		filterType: FilterType.LowPass,
		filterCutoff: 5000,
		filterQ: 1,
	
		vcaAttack: 0.1,
		vcaDecay: 0.5,
		vcaSustain: 0.75,
		vcaRelease: 0.5,
	
		scale: "C major",
		baseOctave: 3,
		noteOn: new Array<boolean>(16).fill(true) as Tuple<boolean, 16>,
		noteValue: new Array<number>(16).fill(0).map((_, i) => i % 8 + 1) as Tuple<number, 16>,
	
		bpm: 170,
		on: true,
	}
}
