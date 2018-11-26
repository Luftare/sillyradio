var canvas,ctx;
setTimeout(function(){
	window.canvas = document.getElementById("canvas");
	
	window.ctx = canvas.getContext("2d");
	canvas.width = window.innerWidth/2;
	canvas.height = 300;
	window.mouseDown = false;
	canvas.addEventListener("mousedown",startNewLine,false);
	canvas.addEventListener("mousemove",continueLine,false);
	canvas.addEventListener("mouseup",function(){
		mouseDown = false;
		drawingDone = true;
	},false);
	canvas.addEventListener("touchstart",startNewLine,false);
	canvas.addEventListener("touchmove",continueLine,false);
	canvas.addEventListener("touchend",function(){
		mouseDown = false;
		drawingDone = true;
	},false);
},1000);

//LOOP
window.ctr = {};
ctr.step = 0.005;
ctr.then = Date.now();
ctr.looping = true;
ctr.updates = [];

ctr.mainLoop = function(){
	ctr.now = Date.now();//update what's the time now
	ctr.delta = ctr.now - ctr.then;//calculate how long it is since last cycle, result is "delta"
	ctr.step = ctr.delta / 1000;// || 0.001;//convert delta to seconds, is then called ctr.step which is global variable
	ctr.updates.forEach(function(update){
		update();
	});
	ctr.then = ctr.now;//update what's the new "now" after the function are executed
	if(ctr.looping){
		setTimeout(function(){ctr.mainLoop();},0);
	}
};

ctr.mainLoop();

//BUTTONS
setTimeout(function(){//timeout enables buttons to load first in the document
	window.button = {};
	button.lineY = document.getElementById("lineY");
	button.play = document.getElementById("play");
	button.lineY.value = 0;
	button.lineY.oninput = function(){
		for(var i = 0;i<line.length;i++){
			if(!line[i].translated){
				line[i].translated = true;
				line[i].originalY = line[i].y;
			} else {
				line[i].y = Math.min(300, Math.max(line[i].originalY - parseInt(this.value),0));
			}
		}
	}
	button.play.addEventListener("click",function(){
		if(!seqOn){
			playHeadX=0;
			currentStep = 0;
			seqCount = seqLength;
			seqOn = true;
			this.className = "buttonsActive"
			button.play.innerHTML = "stop";
		} else {
			this.className = "buttons"
			seqOn = false;
			button.play.innerHTML = "play";
			playHeadX=0;
			currentStep = 0;
		}
	},false);

/*	button.stop.addEventListener("click",function(){
		seqOn = false;
	},false);*/
	window.pads = [];
	function padClick(){
		if(this.selected){
			sequence[this.step].pop();
			this.selected = false;
			this.className = "buttons";
			this.innerHTML = "";
		} else {
			sequence[this.step].push(this.sound);
			this.selected = true;
			this.className = "buttonsActive";
			this.innerHTML = "<b>#</b>";
		}
	}
	
	for(var i = 0;i<seqSteps;i++){
		pads.push(document.createElement("div"));
		pads[pads.length-1].innerHTML = "&nbsp";
		pads[pads.length-1].addEventListener("click",padClick,false);
		pads[pads.length-1].id = "hat"+i;
		pads[pads.length-1].step = i;
		pads[pads.length-1].sound = drums.closedHihat;
		pads[pads.length-1].selected = false;
		pads[pads.length-1].classList.add("buttons");
		document.getElementById("content").appendChild(pads[pads.length-1]);
	}
	
	document.getElementById("content").appendChild(document.createElement("br"));//this creates a new line
	
	for(var i = 0;i<seqSteps;i++){
		pads.push(document.createElement("div"));
		pads[pads.length-1].innerHTML = "&nbsp";
		pads[pads.length-1].addEventListener("click",padClick,false);
		pads[pads.length-1].id = "snare"+i;
		pads[pads.length-1].step = i;
		pads[pads.length-1].sound = drums.snare;
		pads[pads.length-1].selected = false;
		pads[pads.length-1].classList.add("buttons");
		document.getElementById("content").appendChild(pads[pads.length-1]);
	}
	
	document.getElementById("content").appendChild(document.createElement("br"));//this creates a new line
	
	for(var i = 0;i<seqSteps;i++){
		pads.push(document.createElement("div"));
		pads[pads.length-1].innerHTML = "&nbsp";
		pads[pads.length-1].addEventListener("click",padClick,false);
		pads[pads.length-1].id = "kick"+i;
		pads[pads.length-1].step = i;
		pads[pads.length-1].sound = drums.kick;
		pads[pads.length-1].selected = false;
		pads[pads.length-1].classList.add("buttons");
		document.getElementById("content").appendChild(pads[pads.length-1]);
	}
},800);
