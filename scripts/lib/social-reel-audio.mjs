// Original procedural score: no samples, film audio, lyrics or external services.
export function originalReelAudio(duration, cuts = []) {
	if (!Number.isFinite(duration) || duration < 1 || duration > 60) throw new Error('Audio original: duración de 1–60 segundos.');
	const rate = 48000;
	const count = Math.round(duration * rate);
	const samples = new Float32Array(count * 2);
	let seed = 0x43504f53;
	let peak = 0;
	const bassNotes = [36,36,39,34,36,43,39,34];
	for (let frame = 0; frame < count; frame++) {
		const t = frame / rate;
		const beat = t * 2; // 120 BPM, aligned with half-second cuts.
		const phase = (beat % 1) / 2;
		seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
		const noise = (seed >>> 0) / 0xffffffff * 2 - 1;
		const kick = 0.52 * Math.sin(2*Math.PI*(48*phase + 6*(1-Math.exp(-35*phase)))) * Math.exp(-22*phase);
		const snare = Math.floor(beat)%2 ? noise * 0.19 * Math.exp(-35*phase) : 0;
		const hatPhase = (t*4)%1/4;
		const hat = noise * 0.055 * Math.exp(-95*hatPhase);
		const frequency = 440 * 2 ** ((bassNotes[Math.floor(beat)%bassNotes.length]-69)/12);
		const bass = (Math.sin(2*Math.PI*frequency*t)+0.2*Math.sin(4*Math.PI*frequency*t)) * 0.12 * Math.exp(-4*phase);
		const tickPhase = (t*8)%1/8;
		const tick = Math.sin(2*Math.PI*1700*t)*0.025*Math.exp(-140*tickPhase);
		let transition = 0;
		for (const cut of cuts) {
			const distance = t-cut;
			if(distance>=-0.22 && distance<0) transition += noise*0.1*(1+distance/0.22);
			if(distance>=0 && distance<0.18) transition += Math.sin(2*Math.PI*(820*distance+900*distance*distance))*0.07*Math.exp(-24*distance);
		}
		const fade = Math.min(1,t/0.025,(duration-t)/0.7);
		const value = Math.tanh((kick+snare+hat+bass+tick+transition)*1.3)*fade;
		samples[frame*2] = value;
		samples[frame*2+1] = value + hat*0.12*fade;
		peak = Math.max(peak,Math.abs(samples[frame*2]),Math.abs(samples[frame*2+1]));
	}
	const bytes = Buffer.alloc(44+count*4);
	bytes.write('RIFF',0);bytes.writeUInt32LE(bytes.length-8,4);bytes.write('WAVEfmt ',8);
	bytes.writeUInt32LE(16,16);bytes.writeUInt16LE(1,20);bytes.writeUInt16LE(2,22);
	bytes.writeUInt32LE(rate,24);bytes.writeUInt32LE(rate*4,28);bytes.writeUInt16LE(4,32);bytes.writeUInt16LE(16,34);
	bytes.write('data',36);bytes.writeUInt32LE(count*4,40);
	for(let index=0;index<samples.length;index++) bytes.writeInt16LE(Math.round(samples[index]/Math.max(1,peak/0.88)*32767),44+index*2);
	return bytes;
}
