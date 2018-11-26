/****** TOOLS ******/
var PI = Math.PI;

function lineIntersectingRect(ls,le,r){//vectors ls = line start, le = line end, r = rect with properties: x,y,width,height
	var lt = {x:r.x,y:r.y};//left top ...
	var rt = {x:r.x+r.width,y:r.y};
	var lb = {x:r.x,y:r.y+r.height};
	var rb = {x:r.x+r.width,y:r.y+r.height};//... right bottom
	if(
	linesIntersecting(ls,le,lt,rt) 
	|| linesIntersecting(ls,le,rt,rb) 
	|| linesIntersecting(ls,le,lb,rb)
	|| linesIntersecting(ls,le,lb,lt)
	){
		return true;
	} else {
		return false;
	}
}

function linesIntersecting(s1,e1,s2,e2) {
	var p0_x = s1.x;
	var p0_y = s1.y;
	var p1_x = e1.x;
	var p1_y = e1.y;
	var p2_x = s2.x;
	var p2_y = s2.y;
	var p3_x = e2.x;
	var p3_y = e2.y;
 
    var s1_x, s1_y, s2_x, s2_y;
    s1_x = p1_x - p0_x;
    s1_y = p1_y - p0_y;
    s2_x = p3_x - p2_x;
    s2_y = p3_y - p2_y;
 
    var s, t;
    s = (-s1_y * (p0_x - p2_x) + s1_x * (p0_y - p2_y)) / (-s2_x * s1_y + s1_x * s2_y);
    t = ( s2_x * (p0_y - p2_y) - s2_y * (p0_x - p2_x)) / (-s2_x * s1_y + s1_x * s2_y);
 
    if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
    {
        // Collision detected
        return true;
    }
 
    return false; // No collision
}

function rectCircleColliding(rect,circle){//var rect={x:100,y:100,width:40,height:100}; var circle={x:100,y:290,r:10};
    var distX = Math.abs(circle.x - rect.x-rect.width/2);
    var distY = Math.abs(circle.y - rect.y-rect.height/2);

    if (distX > (rect.width/2 + circle.r)) { return false;}
    if (distY > (rect.height/2 + circle.r)) { return false;}

    if (distX <= (rect.width/2)) {return true;} 
    if (distY <= (rect.height/2)) {return true;}

    var dx=distX-rect.width/2;
    var dy=distY-rect.height/2;
    return (dx*dx+dy*dy<=(circle.r*circle.r));
}

function rectCollidingRect(re,R){
	if(re.x+re.width>R.x
	&& re.y+re.height > R.y
	&& re.y < R.y+R.height
	&& re.x < R.x+R.width){//is colliding, now determining which side of the first rect is hitting
		var dR = re.x + re.width - R.x;
		var dL = R.x + R.width - re.x;
		var dT = R.y + R.height - re.y;
		var dB = re.y + re.height - R.y;
		if(dR<dL&&dR<dT&&dR<dB){
			return "r";
		}
		if(dL<dR&&dL<dT&&dL<dB){
			return "l";
		}
		if(dT<dR&&dT<dL&&dT<dB){
			return "t";
		}
		if(dB<dR&&dB<dL&&dB<dT){
			return "b";
		}
		return true;
	}
}

function pointInRect(p,R){//is point p inside rect R
	if(p.x>R.x
	&& p.x<R.x+R.width
	&& p.y>R.y
	&& p.y<R.y+R.height){
		return true;
	} else {
		return false;
	}
}

function pointCircleColliding(p,c){//var point = {x: 4,y: 200}; var circle = {x:2,y:66,r:150};
	if(pointDistance(p,c)<=p.r){
		return true;
	} else {
		return false;
	}
}

function circlesColliding(a,b){
	if(pointDistance(a,b)<= a.r+b.r){
		return true;
	} else {
		return false;
	}
}

function sqr(a){
	return a*a;
}

function pointDistance(a,b){
	a.z = a.z || 0;
	b.z = b.z || 0;
	if(a.x==b.x && a.y == b.y && a.z == b.z){
		return 0;
	} else {
		return Math.sqrt(sqr(a.x-b.x)+sqr(a.y-b.y)+sqr(a.z-b.z));
	}
}



function newPointAt(p,dir,dis){//p = point, dir = direction, dis = distance
	return {
		x: p.x+Math.sin(dir)*dis,
		y: p.y+Math.cos(dir)*dis
	};
}

function directionAt(a,b){
	var dir = PI/2-Math.atan((a.y-b.y)/(a.x-b.x));
	if(b.x<=a.x){
		dir-=PI;
	}
	return dir;
}

function Vector(x,y,z){
	var v = {};
	v.x = x || 0;
	v.y = y || 0;
	v.z = z || 0;
	v.length = pointDistance({x:0,y:0,z:0},v);
	v.zAngle = directionAt({x:0,y:0},v);
	v.yAngle = directionAt({x:0,y:0},{x:v.x,y:v.z});//PURKKA!
	v.zero = function(){
		v.x = 0;
		v.y = 0;
		v.z = 0;
		v.calculate();
		return v;
	}
	v.random = function(range){
		if(!range){range = 1;}
		v.x = (Math.random()-0.5)*range*2;
		v.y = (Math.random()-0.5)*range*2;
		v.z = (Math.random()-0.5)*range*2;
		v.calculate();
		return v;
	};
	v.normalize = function(){
			v.x = v.x/v.length;
			v.y = v.y/v.length;
			v.z = v.z/v.length;
			v.calculate();
			return v;
	};
	v.mirror = function(){
		v.x*=-1;
		v.y*=-1;
		v.z*=-1;
		return v;
	};
	v.add = function(u){
		if(u.x && u.y){
			v.x+=u.x;
			v.y+=u.y;
			v.z+=u.z;
			v.calculate();
		}
		return v;
	};
	v.substract = function(u){
		if(u.x && u.y){
			v.x-=u.x;
			v.y-=u.y;
			v.z-=u.z;
			v.calculate();
		}
		return v;
	};
	v.scale = function(s){
		v.x*=s;
		v.y*=s;
		v.z*=s;
		v.calculate();
		return v;
	};
	v.draw = function(){
		ctx.strokeStyle = "blue";
		ctx.moveTo(0,0);
		ctx.lineTo(v.x,v.y);
		ctx.stroke();
	};
	v.calculate = function(){
		v.length = pointDistance({x:0,y:0,z:0},v);
		v.zAngle = directionAt({x:0,y:0},v);
		v.yAngle = directionAt({x:0,y:0},{x:v.x,y:v.z});//PURKKA!
	};
	v.alignWith = function(u){
		v = vectorToAngle(v,u.zAngle);
	}
	v.alignTo = function(a){
		v = vectorToAngle(v,a);
	}
	return v;
}

function vectorToAngle(v,a){//in radians in x-y
	v.calculate();
	var length = v.length;
	result = new Vector(Math.sin(a),Math.cos(a));
	result.normalize();
	return scaleVector(result,length);
}

function vectorsAngle(v,u){
	return v.zAngle-u.zAngle;
}

function normalize(v){
	v.x = v.x/v.length;
	v.y = v.y/v.length;
}

function scaleVector(v,s){
	var result = new Vector();
	result.x=v.x*s;
	result.y=v.y*s;
	result.calculate();
	return result;
}

function substractVectors(v,u){
	var result = new Vector();
	result.x = v.x-u.x;
	result.y = v.y-u.y;
	result.calculate();
	return result;
}

function randomVector(range){
	var v = new Vector();
	v.x = (Math.random()-0.5)*range*2;
	v.y = (Math.random()-0.5)*range*2;
	v.z = (Math.random()-0.5)*range*2;
	v.calculate();
	return v;
}

function addVectors(a,b,c,d,e){
	var result = new Vector();
	result.x = a.x+b.x;
	result.y = a.y+b.y;
	if(c instanceof Vector){
		result.x+=c.x;
		result.y+=c.y;
	}
	if(d instanceof Vector){
		result.x+=d.x;
		result.y+=d.y;
	}
	if(e instanceof Vector){
		result.x+=e.x;
		result.y+=e.y;
	}
	result.calculate();
	return result;
}

function minusVector(v){
	var result = new Vector();
	result.x = -1*v.x;
	result.y = -1*v.y;
	result.calculate();
	return result;
}

function cloneVector(u){
	var result = Vector(u.x,u.y);
	result.calculate();
	return result;
}

function rotateVector(v,rot){//does not change the original vector
	var result = new Vector(v.x,v.y,v.z);
	var length = v.length;
	var startRot = directionAt({x:0,y:0},v);
	var newPoint = newPointAt({x:0,y:0},startRot+rot,length);
	result.x = newPoint.x;
	result.y = newPoint.y;
	result.z = v.z;//does not change as it's the axis
	result.calculate();
	return result;
}

function vectorInBounds(v,b){
	if(v.x < b.x || v.y < b.y || v.x > b.x+b.width || v.y > b.y+b.height){
		return false;
	} else {
		return true;
	}
}