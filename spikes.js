function Round (redius){
	this.redius =redius;
	this.a=this.area();
	// this.b =this.parameter();
}

Round.prototype={
	area:function(){return 3.14*this.redius*this.redius;},
	parameter:function(s){return 2*(s+s)}
}

var r= new Round()
console.log(r.parameter(6));
// {}.round