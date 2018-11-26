function sustainSynth() {
	var oscillators = [];
	var gains = [];
	var gainIds = [];

	var filter = atx.createBiquadFilter();//lowpass filter
	filter.connect(mainVol);
	filter.type = filter.LOWPASS;
	filter.frequency.setValueAtTime(1200, atx.currentTime);	
	
	for (i = 1; i < 8*12; i++){//create gain nodes for all notes
		gains[i] = atx.createGain();
		gains[i].connect(filter);
	}

	return {
		type: "square",
		lastOscOn: 'undefined',
		lastOscOff: 'undefined',
		trigger: envelope.execute,
		onRelease: envelope.execute,
		description: "sustainSynth for simple sustained notes.",
		start: envelope.start,//manages the synth attack
		stop: envelope.stop,//manages the synth release
		input: midi.input,//manages midi messages
		oscillators: oscillators,
		gains: gains,
		gainIds: gainIds,
		filter: filter,
		attack: 15,
		release: 75,
	};
}

var envelope = {//requirements: ARRAYS: gains, oscillators VARIABLES: 
	start: function(I,midiNumber){
		if(I.oscillators[midiNumber]){
			if(I.oscillators[midiNumber].status == 1 || I.oscillators[midiNumber].status == 2){//if previous note still playing or releasing
				I.gains[midiNumber].gain.cancelScheduledValues(atx.currentTime);
				I.oscillators[midiNumber].stop(0);
				I.oscillators[midiNumber].disconnect();
			}
		}
		I.gains[midiNumber].gain.setValueAtTime(0, atx.currentTime);
		I.gainIds[midiNumber] = I.gains[midiNumber].gain.linearRampToValueAtTime(1, atx.currentTime + I.attack/1000);
		
		I.oscillators[midiNumber] = atx.createOscillator();
		I.oscillators[midiNumber].frequency.value = midiToFrequency(midiNumber);
		I.oscillators[midiNumber].connect(I.gains[midiNumber]);
		if(I.type){I.oscillators[midiNumber].type = I.type;}
		I.lastOscOn = I.oscillators[midiNumber];
		I.oscillators[midiNumber].start(0);
		I.oscillators[midiNumber].status = 1;//playing
		envelope.execute(I.trigger);
		return I;
	},
	stop: function(I,midiNumber) {
		I.oscillators[midiNumber].status = 2;//releasing
		I.gains[midiNumber].gain.cancelScheduledValues(atx.currentTime);
		I.gains[midiNumber].gain.setValueAtTime(I.gains[midiNumber].gain.value, atx.currentTime);
		I.gains[midiNumber].gain.linearRampToValueAtTime(0, atx.currentTime + I.release/1000);
		I.lastOscOff = I.oscillators[midiNumber];
		envelope.execute(I.onRelease);
	},
	execute: function(command){
		if(command != 'undefined'){
			if (typeof command == 'function'){
				command();
			} else {
				eval(command);
			}
		}
	}
}


var drums = {//run drums.load(); before use
	loaded: false,
	load: function() {
		this.snareGain = atx.createGain();
		this.kickGain = atx.createGain();
		this.hihatGain = atx.createGain();
		this.tomsGain = atx.createGain();
		this.HPFGain = atx.createGain();//for the hihat noise
		this.LPFGain = atx.createGain();//for the snare crack
		this.LPFilter = atx.createBiquadFilter();
		this.HPFilter = atx.createBiquadFilter(); 
		
		this.snareGain.gain.value = 0.6;
		this.hihatGain.gain.value = 0.7;
		
		this.HPFGain.gain.value = 0;
		this.LPFGain.gain.value = 0;
		this.LPFilter.type = "lowpass";//Lowpass
		this.LPFilter.frequency.value = 6000;
		this.HPFilter.type = "highpass";//Highpass
		this.HPFilter.frequency.value = 4000;
		globalWhiteNoise.connect(this.LPFGain);
		globalWhiteNoise.connect(this.HPFGain);
		this.LPFGain.connect(this.LPFilter);
		this.HPFGain.connect(this.HPFilter);
		
		this.LPFilter.connect(this.snareGain);
		this.HPFilter.connect(this.hihatGain);
		
		this.snareGain.connect(mainVol);
		this.kickGain.connect(mainVol);
		this.tomsGain.connect(mainVol);
		this.hihatGain.connect(mainVol);
		this.loaded = true;
	},
	kick: function () {//frequency, attack, release, frequency modulation amount multiplier, frequency modulation time,output Node
		modSynth(55,17,120,19,8,drums.kickGain);
	},
	snare: function () {
		modSynth(260,15,50,2.5,15,drums.snareGain);
		drums.LPFGain.gain.linearRampToValueAtTime(0.4, atx.currentTime);
		drums.LPFGain.gain.linearRampToValueAtTime(0, atx.currentTime + 50/1000);
	},
	rim: function(){
		modSynth(660,20,25,5,20,drums.snareGain);		
		drums.LPFGain.gain.linearRampToValueAtTime(0.2, atx.currentTime);
		drums.LPFGain.gain.linearRampToValueAtTime(0, atx.currentTime + 35/1000);
	},
	closedHihat: function () {
		drums.HPFGain.gain.cancelScheduledValues(atx.currentTime);
		drums.HPFGain.gain.linearRampToValueAtTime(0.5, atx.currentTime);
		drums.HPFGain.gain.linearRampToValueAtTime(0, atx.currentTime + 20/1000);
	},
	openHihat: function () {
		drums.HPFGain.gain.cancelScheduledValues(atx.currentTime);
		drums.HPFGain.gain.linearRampToValueAtTime(0.5, atx.currentTime);
		drums.HPFGain.gain.linearRampToValueAtTime(0, atx.currentTime + 160/1000);
	},
	highTom: function(){
		modSynth(200,10,100,2,120,drums.tomsGain);
	},
	midTom: function(){
		modSynth(150,10,100,2,120,drums.tomsGain);
	},
	lowTom: function(){
		modSynth(100,10,100,2,120,drums.tomsGain);
	}
}

drums.load();//not the best solution here

function modSynth(frq,att,rel,fModAmount,fModTime,output) {//frequency, attack, release, frequency modulation amount multiplier, frequency modulation time, volume
	var output = output || mainVol;
	var MSosc = atx.createOscillator();
	var MSgain = atx.createGain();
	MSosc.connect(MSgain);
	MSgain.connect(output);
		
	setTimeout(function() {
		MSgain.gain.setValueAtTime(1, atx.currentTime);
		MSgain.gain.linearRampToValueAtTime(0, atx.currentTime + rel/1000);
	}, att+5);
	MSgain.gain.setValueAtTime(0, atx.currentTime);
	
	MSosc.start(0);
	MSosc.frequency.setValueAtTime(frq*fModAmount,atx.currentTime);
	MSosc.frequency.linearRampToValueAtTime(frq, atx.currentTime + fModTime/1000);
	
	MSgain.gain.linearRampToValueAtTime(1, atx.currentTime + att/1000);

	setTimeout(function() {
		MSosc.stop(0);
		MSosc.disconnect();
		MSgain.disconnect();
	}, att+rel+20);
	return MSosc;
}

function beeper(frq,att,rel) {//frequency, attack, release, frequency modulation amount multiplier, frequency modulation time
	var MSosc = atx.createOscillator();
	var MSgain = atx.createGain();
	var filter = atx.createBiquadFilter();//lowpass filter 
	MSosc.connect(MSgain);
	MSgain.connect(filter);
	filter.connect(mainVol);
	filter.type = filter.LOWPASS;
	
	filter.frequency.setValueAtTime(frq+2000, atx.currentTime);
	filter.frequency.linearRampToValueAtTime(frq, atx.currentTime + rel/1000);
	
	MSgain.gain.setValueAtTime(0, atx.currentTime);
	MSgain.gain.linearRampToValueAtTime(1, atx.currentTime + att/1000);
	
	setTimeout(function() {
		MSgain.gain.setValueAtTime(1, atx.currentTime);
		MSgain.gain.linearRampToValueAtTime(0, atx.currentTime + rel/1000);
	}, att+1);
	
	MSosc.frequency.value = frq;
	MSosc.type = "square";
	MSosc.start(0);
	setTimeout(function() {
		MSosc.stop(0);
		MSosc.disconnect();
		MSgain.disconnect();
	}, att+rel+5);
	var returnable = {
		osc: MSosc,
		filter: filter,
		gain: MSgain
	};
	return returnable;
}