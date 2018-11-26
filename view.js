var view = {};
view.animation = function(){

	
	if(canvas){
		canvas.width = canvas.width;
		if(ctx != "undefined"){
			ctx.lineWidth = 4;
			ctx.fillStyle = "lightgreen";
			drawLine(line,"black");
			drawLine(newLine,"lightgreen");
			if(seqOn){
				ctx.fillRect(playHeadX,0,4,canvas.height);
			}
		}
		requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.mozRequestAnimationFrame;//this will start calling the gameLoop 
	}
		requestAnimationFrame(view.animation);

};

setTimeout(function(){view.animation();},100);

function drawLine(line,color){
	ctx.strokeStyle = color;
	ctx.beginPath();
	if(line.length>1){
		ctx.moveTo(line[0].x,line[0].y);
		for(var i = 0;i<line.length;i++){
			ctx.lineTo(line[i].x,line[i].y);
		}
		ctx.stroke();
		ctx.closePath();
	}
}