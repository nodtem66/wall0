define(function(){
	return function(rawSize, callback){
		var circularList = [], index = -1, flen = 0, blen = 0, enable = true;
		var size = rawSize || 10;

		return {
			init: function(data){
				this.save(data);
				this.init = function(){};
				console.log(data);
			},
			save: function(data) {
				if(!enable) {return null;}
				if(blen != size){blen++;}
				index = (index + 1) % size;
				flen = 1;
				circularList[index] = data;
			},
			undo: function() {
				if(!enable) {
					return null;
				}
				
				if(blen - 1 > 0) {
					index = (index - 1 >= 0) ? index - 1 : size - 1;
					blen--;
					flen++;
					console.log('undo',blen,flen);
					return callback(circularList[index]);
				}
				console.log('undo undefined');
				return undefined;
			},
			redo: function() {
				if(!enable) {
					return null;
				}
				
				if(flen - 1 > 0) {
					index = (index + 1) % size;
					blen++;
					flen--;
					console.log('redo',blen,flen);
					return callback(circularList[index]);
				}
				console.log('redo undefined');
			},
			clear: function() {
				circularList = [];
				flen = 0;
				blen = 0;
				index = -1;
				enable = true;
				console.log('clear');
			},
			freeze: function(msec) {
				enable = null;
				if(typeof msec == 'number') window.setTimeout(this.unfreeze, msec);
			},
			unfreeze: function() {
				enable = true;
			}
		};
	}
});