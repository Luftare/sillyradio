var noteLines = [];
var playHeadX = 0;
var line = [];
var cycleTime = seqSteps*seqLength;
var playHeadSpeed;
var transponse = 30;
var newLine = [];
var drawingDone = true;
var handOverDone = false;
var dragStartPosition = new Vector(0,0);
var dragCurrentPosition = new Vector(0,0);

//s/t = v

function updatePlayHeadX(){
	if(seqOn){
		cycleTime = seqSteps*seqLength;
		playHeadSpeed = canvas.width/cycleTime;
		playHeadX+=playHeadSpeed*ctr.step;
		playLine(line);
	} else if(lineSound.playing){
		lineSound.end();
	}
}

function resetPlayHead(){
	playHeadX=0;
	line.forEach(function(node){
		node.done = false;
	});
}

ctr.updates.push(updatePlayHeadX);

var lineSound = {
	output: mainVol,
	att: 10,
	rel: 20,
	vol: 0.5,
	playing: false,
	envGain: atx.createGain(),
	osc: "undefined",
	start: function(frq){
		if(lineSound.playing){
			lineSound.osc.stop(0);
			lineSound.osc.disconnect();
		}
		lineSound.osc = atx.createOscillator();
		lineSound.osc.frequency.value = frq;
		lineSound.osc.connect(lineSound.envGain);
		lineSound.envGain.gain.setValueAtTime(0, atx.currentTime);
		lineSound.osc.start(0);
		lineSound.envGain.gain.linearRampToValueAtTime(lineSound.vol, atx.currentTime + lineSound.att/1000);
		lineSound.playing = true;
	},
	slideTo: function(frq,ms){
		lineSound.osc.frequency.cancelScheduledValues(atx.currentTime);
		lineSound.osc.frequency.setValueAtTime(lineSound.osc.frequency.value, atx.currentTime);
		lineSound.osc.frequency.linearRampToValueAtTime(frq, atx.currentTime + ms/1000);
	},
	end: function(){
		lineSound.envGain.gain.cancelScheduledValues(atx.currentTime);
		lineSound.envGain.gain.setValueAtTime(lineSound.envGain.gain.value, atx.currentTime);
		lineSound.envGain.gain.linearRampToValueAtTime(0, atx.currentTime + lineSound.rel/1000);
		setTimeout(function(){
			if(lineSound.playing){//note can be shut down multiple times
				lineSound.playing = false;
				lineSound.osc.stop(0);
				lineSound.osc.disconnect();
			}
		},(lineSound.rel+20));
	}
};
setTimeout(function(){
	lineSound.envGain.connect(mainVol);
},10);

//noteLines: [line,line,line];
//line: [Vector,Vector,Vector];
//Vector: {x: 5, y: 10};
function startNewLine(e){//event handler for mousedown and touchstart
	drawingIsDone = false;
	handOverDone = false;
	mouseDown = true;
	drawLineNode(e);
}

function continueLine(e){//event handler for mousemove and touchmove
	e.preventDefault();
	if(mouseDown){
		var bound = canvas.getBoundingClientRect();
		if(e.touches){
			var tX = e.touches[0].pageX-bound.left;
			var tY = e.touches[0].pageY-bound.top;
		} else {
			var tX = e.pageX-bound.left;
			var tY = e.pageY-bound.top;
		}
		if(newLine.length>0){
			if(tX>newLine[newLine.length-1].x+10){//resolution=50 pixels
				newLine.push(new Vector(tX,tY));
				newLine[newLine.length-1].done = false;
			}
		}
	}
}

function drawLineNode(e){
	modSynth(1,1,1,1,1);
	e.preventDefault();
	var bound = canvas.getBoundingClientRect();
	if(e.touches){
		var tX = e.touches[0].pageX-bound.left;
		var tY = e.touches[0].pageY-bound.top;
	} else {
		var tX = e.pageX-bound.left;
		var tY = e.pageY-bound.top;
	}
	newLine.push(new Vector(tX,tY));
}

function canvasYToFrq(y){
	return 30*Math.pow(2,6*(canvas.height-y)/canvas.height);//4 = octaves, 30 = lowest note
}

function playLine(line){
	for(var i = 0;i<line.length;i++){
		if(line[i].x < playHeadX && !line[i].done && line.length>1){
			line[i].done = true;//sets the node (=osc) as done meaning it has been started already
			if(i == 0){//first node of the chain
				var frq = canvasYToFrq(line[i].y);
				var frq2 = canvasYToFrq(line[i+1].y);
				lineSound.start(frq);
				lineSound.slideTo(frq2,cycleTime*1000*(line[i+1].x-line[i].x)/canvas.width);
			} else if(i >= line.length-1){//last node of the chain
				lineSound.end();
			} else {//Node in the middle of the chain
				var frq = canvasYToFrq(line[i].y);
				lineSound.slideTo(frq,cycleTime*1000*(line[i+1].x-line[i].x)/canvas.width);
			}
		}
	}
}

function switchLine(){
	line = newLine;
	newLine = [];
	button.lineY.value = 0;
}

//interruption of ongoing ramp
/*
image, canvas {
    user-select: none;
    -ms-user-select: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-drag: none;
}
*/


