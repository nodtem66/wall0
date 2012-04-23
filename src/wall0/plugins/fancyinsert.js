/**
 * fancyinsert 0.0.1
 * Ctrl-V insertion plugin for wall0
 * github.com/nodtem66/wall0
 * 
 * Licensed under the MIT license
 * (c) 2011 Jirawat I.
 * 
 * tabspace = 2, columnwidth = 80
 */
wall0.register('FancyInsert', function(sandbox) {
	var w0 = wall0, self = this,
			Clipboard = function() {
				var node = w0.$({
							'contenteditable':'true',
							'style':'position:absolute;top:0;display:inline-block;' + 
									'overflow:hidden;width:1px;height:1px;'
							}),
						oldData = '',
						clipboardData = null;
						
				this.getElement = function(){
					return node;
				};
				this.getValue = function() {
					node.blur();

					if (!clipboardData) {
						return node.innerHTML;
					}
					if (node.innerHTML === oldData || oldData === '') {
						var attrs = clipboardData.attributes, returnHTML = '<div';
						for (var i = 0, len = attrs.length; i < len; i++) {
							returnHTML += " " + attrs[i].name + '="' + attrs[i].value + '"'; 
						}
						returnHTML += '>' + clipboardData.innerHTML + '</div>';
						return returnHTML;
					}
					clipboardData = null;
					return node.innerHTML
				};
				this.setValue = function(text) {
					node.innerHTML = text;
				};
				this.setClipboardData = function(elementCopy) {
					clipboardData = elementCopy;
				};
				this.focus = function() {
					oldData = node.innerHTML;
					node.innerHTML = '';
					node.focus();
				};
			},
			clipboard = new Clipboard(); 
			
	this.sendDecorateNode = function(text){
		var cropText='', typeMedia, returnNode,
				listImg = {'png':1,'jpg':1,'gif':1},
				listGView = {'pdf':1,'ppt':1,'pptx':1,'tiff':1};
		if (text) {
			//crop Text
			cropText = text.replace(/<meta[^>]+>/i, '');
			if (/<span[^>]*Apple-style-span[^>]+>/i.test(cropText)) {
				cropText = cropText.replace(/<span[^>]*Apple-style-span[^>]+>/i, '')
						.replace(/<\/span>$/i, '');
			}
			
			//check URI pattern
			if (/^<a href="([^>]+)">\1<\/a>$/i.test(cropText)) {
				cropText = cropText.replace(/^<a href="([^>]+)">/i, '')
						.replace(/<\/a>$/i, '');
			}
			if (/^http/i.test(cropText)) {
				var tail = cropText.split('.');
				tail = tail[tail.length-1];
				if (listImg[tail]) {
					cropText = '<img src="' + cropText + '" />';
				}
				if (listGView[tail]) {
					cropText = '<iframe src="http://docs.google.com/viewer?url=' +
							cropText + '&embedded=true" frameborder="0" width="400"' +
							'height="100"></iframe>';
				}
			}

			//check flash object
			if (/^\&lt;object/i.test(cropText)) {
				cropText = cropText.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>');
				cropText = cropText.replace(/><param/i,
						'><param wmode="opaque"></param><param');
				cropText = cropText.replace(/<embed/i, '<embed wmode="opaque"');
				//cropText = cropText.replace(/<\/embed>/i, '</embed><!-- kill -->');
				//cropText = cropText.replace(/<!-- kill -->.*</object>/ig, '');
			}
			//check flash object
			if (/^\&lt;embed/i.test(cropText)) {
				cropText = cropText.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>');
				cropText = cropText.replace(/<embed/i, '<embed wmode="opaque"');
				//cropText = cropText.replace(/<\/embed>/i, '</embed><!-- kill -->');
				//cropText = cropText.replace(/<!-- kill -->.*/ig, '');
			}

			if (/^\&lt;iframe[\D\S]*src=["']/i.test(cropText)) {
				cropText = cropText.replace(/&lt;/ig, '<').replace(/&gt;/ig, '>');
			}
		} else {
			cropText = 'Insert Text here';
		}
		w0.insertHTML(cropText);
	};
	this.init = function() {
		sandbox.getEditor().appendChild(clipboard.getElement());
		w0.listen('paste', function() {
				clipboard.focus();
				setTimeout(function() {
						self.sendDecorateNode(clipboard.getValue());
						//sandbox.getHistory().save(sandbox.getStage().getLayer().innerHTML);
					}, 100);
			});
		w0.listen('copy', function(){
				clipboard.setClipboardData(sandbox.getSelection());
			});
	};
	this.destroy = function(){
		sandbox.getEditor().removeChild(clipboard.getElement());
	};
});
