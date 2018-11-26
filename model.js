
var seqLength = 0.1;//in seconds
var seqCount = seqLength;
var seqOn = false;
var blurCount = 0;
var currentStep = 0;
var seqSteps = 8;
var sequence = [];

function initSeq(){
	for(var i = 0;i<seqSteps;i++){
		sequence[i] = [];
	}
}

initSeq();

function sequencer(){
	if(seqOn){
		if(seqCount>=seqLength){
			executeStep();
			seqCount-=seqLength;
		}
	seqCount+=ctr.step;
	}
}

ctr.updates.push(sequencer);

function executeStep(){
	if(currentStep==0){
		if(drawingDone && !handOverDone && !mouseDown){
			switchLine();
			handOverDone = true;
		}
		resetPlayHead();
		
	}
	var plays = false;
	sequence[currentStep].forEach(function(note){
		note();
		//if(note == drums.kick){blurCount = 5;}//if there's POWER in your processor!!!
		plays = true;
	});
	currentStep = (currentStep+1)%seqSteps;
}
