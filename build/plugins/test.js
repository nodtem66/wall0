/**
 * test 0.0.1
 * test plugin for wall0
 * url.com/path
 * 
 * Licensed under .... 
 * (c) YEAR YOURNAME
 * 
 * tabspace = 2, columnwidth = 80
 */
wall0.register('test', function(sandbox) {
	var w0 = wall0,
			someEvent = function() {
			console.log(sandbox);
		};
	w0.listen('test', someEvent);
	this.init = function() {
			console.log('init test');
		}
	this.destroy = function() {
			//clear listen
			w0.stop('test', someEvent);
		}
});