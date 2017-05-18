Array.prototype.shuffle = function() {
	//  Chris Coyier, October 19, 2010 via https://css-tricks.com/snippets/javascript/shuffle-array/
	for(var j, x, i = this.length; i; j = parseInt(Math.random() * i), x = this[--i], this[i] = this[j], this[j] = x);
	return this;
};