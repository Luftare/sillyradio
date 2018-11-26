/*
Web audio API sounds.js library

This provides simplified interface to produce sounds to your (musical?) projects.

NOTE!
In order to initiate this library, use the following command:
soundsInit();

*/
function soundsInit() {
  window.atx = new AudioContext();
  window.mainVol = atx.createGain();
  //window.mainReverb = FX.reverb();//this is taking alot of cpu
  //mainReverb.connect(mainVol);
  mainVol.connect(atx.destination);
  mainVol.gain.value = 0.5;
  window.globalWhiteNoise = newNoise(); //a bit of cpu intensive
}

function slideTo(osc, frq, time) {
  osc.frequency.linearRampToValueAtTime(osc.frequency.value, atx.currentTime);
  osc.frequency.linearRampToValueAtTime(frq, atx.currentTime + time / 1000);
}

function softGainTo(gain, newValue) {
  gain.gain.setValueAtTime(gain.gain.value, atx.currentTime);
  gain.gain.linearRampToValueAtTime(newValue, atx.currentTime + 10 / 1000);
}

function newNoise() {
  var bufferSize = 4096;
  var whiteNoise = atx.createScriptProcessor(bufferSize, 1, 1);
  whiteNoise.onaudioprocess = function(e) {
    var output = e.outputBuffer.getChannelData(0);
    for (var i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
  };
  return whiteNoise;
}
var sound = {};

sound.beeper = function(frq, att, rel) {
  //frequency, attack, release, frequency modulation amount multiplier, frequency modulation time
  if (!att) {
    att = 10;
  }
  if (!rel) {
    rel = 70;
  }
  var MSosc = atx.createOscillator();
  var MSgain = atx.createGain();
  var filter = atx.createBiquadFilter(); //lowpass filter
  MSosc.connect(MSgain);
  MSgain.connect(filter);
  filter.connect(mainVol);
  filter.type = filter.LOWPASS;

  filter.frequency.setValueAtTime(frq + 2000, atx.currentTime);
  filter.frequency.linearRampToValueAtTime(frq, atx.currentTime + rel / 1000);

  MSgain.gain.setValueAtTime(0, atx.currentTime);
  MSgain.gain.linearRampToValueAtTime(1, atx.currentTime + att / 1000);

  setTimeout(function() {
    MSgain.gain.setValueAtTime(1, atx.currentTime);
    MSgain.gain.linearRampToValueAtTime(0, atx.currentTime + rel / 1000);
  }, att + 1);

  MSosc.frequency.value = frq;
  MSosc.type = 'square';
  MSosc.start(0);
  setTimeout(function() {
    MSosc.stop(0);
    MSosc.disconnect();
    MSgain.disconnect();
  }, att + rel + 5);
  var returnable = {
    osc: MSosc,
    filter: filter,
    gain: MSgain
  };
  return returnable;
};

sound.buzz = function() {
  var release = 200;
  var mod = atx.createOscillator();
  mod.frequency.value = 200;
  var carrier = sound.beeper(440, 10, release);
  var modAmount = atx.createGain();
  modAmount.gain.value = 150;
  mod.connect(modAmount);
  modAmount.connect(carrier.osc.frequency);
  mod.start(0);
  setTimeout(function() {
    mod.stop(0);
    mod.disconnect();
    modAmount.disconnect();
  }, release + 15);
};

sound.lazer = function(frq, release, mod) {
  if (!mod) {
    mod = 10;
  }
  if (!release) {
    release = 200;
  }
  if (!frq) {
    frq = 1000;
  }
  var lazer = sound.beeper(frq, 10, release);
  slideTo(lazer.osc, lazer.osc.frequency.value * (1 / mod), release);
};

//FX
var FX = {
  reverb: function() {
    var effect = (function() {
      var bufferSize = 4096 / 8;
      var convolver = atx.createConvolver(),
        noiseBuffer = atx.createBuffer(2, 0.5 * atx.sampleRate, atx.sampleRate),
        left = noiseBuffer.getChannelData(0),
        right = noiseBuffer.getChannelData(1);
      for (var i = 0; i < noiseBuffer.length; i++) {
        left[i] = Math.random() * 2 - 1;
        right[i] = Math.random() * 2 - 1;
      }
      convolver.buffer = noiseBuffer;
      return convolver;
    })();
    return effect;
  }
};

soundsInit();
