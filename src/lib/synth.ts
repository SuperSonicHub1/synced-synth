import { FilterType, WaveShape, type SyncedSynth } from "./model"
import * as Tone from "tone";
import { Scale } from "tonal"

// @ts-ignore
window.Tone = Tone

const FILTER_BIJECTION = new Map<FilterType, BiquadFilterType>([
	[FilterType.LowPass, "lowpass"],
	[FilterType.HighPass, "highpass"],
	[FilterType.BandPass, "bandpass"],
])

function stateToSequnece(state: SyncedSynth): Tone.Unit.Frequency[] {
	const [name, tonic] = Scale.tokenize(state.scale)
	const concreteScale = `${name}${state.baseOctave} ${tonic}`
	return state.noteValue.map((value, index) =>
		state.noteOn[index] ? Scale.degrees(concreteScale)(value) : 0)
}

export class Synthesizer {
	osc1Sawtooth: Tone.Oscillator
	osc2Sawtooth: Tone.Oscillator
	osc1Square: Tone.Oscillator
	osc2Square: Tone.Oscillator
	osc1SawtoothMultiply: Tone.Multiply
	osc2SawtoothMultiply: Tone.Multiply
	osc1SquareMultiply: Tone.Multiply
	osc2SquareMultiply: Tone.Multiply
	osc1Add: Tone.Add
	osc2Add: Tone.Add
	osc1Gain: Tone.Gain
	osc2Gain: Tone.Gain
	oscAdd: Tone.Add

	filter: Tone.Filter

	vcaEnvelope: Tone.AmplitudeEnvelope

	notes: Tone.Unit.Frequency[]
	sequencer: Tone.Sequence<number>

	constructor(initial: SyncedSynth) {
		// Initialization

		this.osc1Sawtooth = new Tone.Oscillator("C3", "sawtooth")
		this.osc2Sawtooth = new Tone.Oscillator("C3", "sawtooth")
		this.osc1Square = new Tone.Oscillator("C3", "square")
		this.osc2Square = new Tone.Oscillator("C3", "square")

		this.osc1SawtoothMultiply = new Tone.Multiply()
		this.osc2SawtoothMultiply = new Tone.Multiply()
		this.osc1SquareMultiply = new Tone.Multiply()
		this.osc2SquareMultiply = new Tone.Multiply()

		this.osc1Add = new Tone.Add()
		this.osc2Add = new Tone.Add()

		this.osc1Gain = new Tone.Gain(initial.osc1Mix).toDestination()
		this.osc2Gain = new Tone.Gain(initial.osc2Mix).toDestination()

		this.oscAdd = new Tone.Add()

		this.filter = new Tone.Filter(initial.filterCutoff, FILTER_BIJECTION.get(initial.filterType) as any)

		this.vcaEnvelope = new Tone.AmplitudeEnvelope({
			attack: initial.vcaAttack,
			decay: initial.vcaDecay,
			sustain: initial.vcaSustain,
			release: initial.vcaRelease,
		})

		this.sequencer = new Tone.Sequence((time, index) => {
				const note = this.notes[index]
				this.osc1Sawtooth.frequency.value = note
				this.osc2Sawtooth.frequency.value = note
				this.osc1Square.frequency.value = note
				this.osc2Square.frequency.value = note
				this.vcaEnvelope.triggerAttackRelease("4n", time)
			},
			new Array(16).fill(0).map((_, i) => i),
			"4n",
		)

		// Connections

		this.osc1Sawtooth.connect(this.osc1SawtoothMultiply)
		this.osc2Sawtooth.connect(this.osc2SawtoothMultiply)
		this.osc1Square.connect(this.osc1SquareMultiply)
		this.osc2Square.connect(this.osc2SquareMultiply)

		this.osc1SawtoothMultiply.connect(this.osc1Add)
		this.osc1SquareMultiply.connect(this.osc1Add.addend)
		this.osc2SawtoothMultiply.connect(this.osc2Add)
		this.osc2SquareMultiply.connect(this.osc2Add.addend)

		this.osc1Add.connect(this.osc1Gain)
		this.osc2Add.connect(this.osc2Gain)

		this.osc1Gain.connect(this.oscAdd)
		this.osc2Gain.connect(this.oscAdd.addend)

		this.oscAdd.connect(this.filter)

		this.filter.connect(this.vcaEnvelope)

		this.vcaEnvelope.toDestination()
		
		// Bootup

		this.update(initial)
	}

	update(state: SyncedSynth) {
		this.setOscillators(state)
		this.setFilter(state)
		this.setAmp(state)
		this.setTransport(state)
		this.setSequencer(state)
	}

	setOscillators(state: SyncedSynth) {
		this.osc1Gain.set({
			gain: state.osc1Mix,
		})
		this.osc2Gain.set({
			gain: state.osc2Mix,
		})
		this.osc1SawtoothMultiply.factor.value = +(state.osc1WaveShape == WaveShape.Sawtooth)
		this.osc1SquareMultiply.factor.value = +(state.osc1WaveShape == WaveShape.Square)
		this.osc2SawtoothMultiply.factor.value = +(state.osc2WaveShape == WaveShape.Sawtooth)
		this.osc2SquareMultiply.factor.value = +(state.osc2WaveShape == WaveShape.Square)
	}

	setFilter(state: SyncedSynth) {
		this.filter.type = FILTER_BIJECTION.get(state.filterType) as any
		this.filter.set({
			Q: state.filterQ,
			frequency: state.filterCutoff,
		})
	}

	setAmp(state: SyncedSynth) {
		this.vcaEnvelope.set({
			attack: state.vcaAttack,
			decay: state.vcaDecay,
			sustain: state.vcaSustain,
			release: state.vcaRelease,
		})
	}

	setTransport(state: SyncedSynth) {
		Tone.getTransport().bpm.value = state.bpm
	}

	setSequencer(state: SyncedSynth) {
		this.notes = stateToSequnece(state)
		// this.sequencer.set({
		// 	mute: !state.on,
		// })
	}

	start() {
		this.osc1Sawtooth.start()
		this.osc2Sawtooth.start()
		this.osc1Square.start()
		this.osc2Square.start()
		this.sequencer.start(0)
		Tone.getTransport().start()
	}

	dispose() {
		this.osc1Sawtooth.dispose()
		this.osc2Sawtooth.dispose()
		this.osc1Square.dispose()
		this.osc2Square.dispose()
		this.osc1SawtoothMultiply.dispose()
		this.osc2SawtoothMultiply.dispose()
		this.osc1SquareMultiply.dispose()
		this.osc2SquareMultiply.dispose()
		this.osc1Add.dispose()
		this.osc2Add.dispose()
		this.osc1Gain.dispose()
		this.osc2Gain.dispose()
		this.oscAdd.dispose()
		this.filter.dispose()
		this.vcaEnvelope.dispose()
		this.sequencer.dispose()
	}
}