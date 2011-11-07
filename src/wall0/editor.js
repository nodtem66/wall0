/**
 * wall0 
 * a layout editor for WYSIWYG editor
 * github.com/nodtem66/wall0
 * 
 * Licensed under the MIT license.
 * (c) 2011 Jirawat I.
 */
(function(window, undefined){ 
var document = window.document;
var elm = document.getElementsByTagName('script') //temp
,path = elm[elm.length - 1].src.replace('editor.js','') //path in current directory
,history //history object
,$ //javascript lib
,editor //DOM node of editor 
,editor_area //DOM node of edited area in editor 
,textareaId //Id of bindeds textarea
,editorState //current state of editor
,selectedNode //current selected DOM node 
,fn = {} //function listen
;

//Find absolute path for loading icons
elm = window.location.href.split('/');
elm.pop(); //delete last element
path = path.replace(elm.join('/'),'');
if(path.substr(0,1) == '/') path = path.substr(1);

//shortcut to call
var wall0 = function(id){
	if(typeof id == 'string'){
		if(id == '')return;
		else if(id.slice(0,1) == '#') id = id.slice(1);
		return wall0.init(id);
	}
};
var waitForMediaIn = function(node,callback){
	var mediaTag = {'img':true,'object':true,'iframe':true,'embed':true},
		total_media= 0, queue=[],cur,
		onload = function(){
			total_media--; 
			if(total_media == 0){
				fn();
			}
		},
		fn = callback || function(){};
		
	queue.push(node);
	while(queue.length > 0){
		cur = queue.pop();
		for(i=0,len=cur.childNodes.length; i<len ; i++){
			if(cur.childNodes[i].nodeName == '#text' || cur.childNodes[i].nodeName == '#comment') continue;
			if( mediaTag[ cur.childNodes[i].nodeName.toLowerCase() ] ){
				total_media++;
				$.addEvent(cur.childNodes[i],'load',onload);
				continue;
			}
			if(cur.childNodes[i].childNodes.length > 0) queue.push(cur.childNodes[i]);
		}
	}
	return {
		then: function(callback){
			fn = callback;
		},
		cancel: function(){
			total_media = -1;
		}
	};
};
var addResizeUITo = function(node){
	var df = document.createDocumentFragment();
	node.style.overflow = 'visible';
	df.appendChild($({'class':'wall0tl','style':'position:absolute;width:10px;height:10px;top:-8px;left:-8px;cursor:nw-resize;z-index:334;background:url('+path+'icon.png);',event: {add: 'mousedown',fn: resizeEvent}}));
	df.appendChild($({'class':'wall0t','style':'position:absolute;width:100%;height:2px;top:-4px;left:0;z-index:333;border-top:2px solid #08F;'}));
	df.appendChild($({'class':'wall0tr','style':'position:absolute;width:10px;height:10px;top:-8px;right:-8px;cursor:ne-resize;z-index:334;background:url('+path+'icon.png);',event: {add: 'mousedown',fn: resizeEvent}}));
	df.appendChild($({'class':'wall0l','style':'position:absolute;width:2px;height:100%;top:0;left:-4px;z-index:333;border-left:2px solid #08F;'}));
	df.appendChild($({'class':'wall0r','style':'position:absolute;width:2px;height:100%;top:0;right:-4px;z-index:333;border-right:2px solid #08F;'}));
	df.appendChild($({'class':'wall0bl','style':'position:absolute;width:10px;height:10px;bottom:-8px;left:-8px;cursor:sw-resize;z-index:334;background:url('+path+'icon.png);',event: {add: 'mousedown',fn: resizeEvent}}));
	df.appendChild($({'class':'wall0b','style':'position:absolute;width:100%;height:2px;bottom:-4px;left:0;z-index:333;border-bottom: 2px solid #08F;'}));
	df.appendChild($({'class':'wall0br','style':'position:absolute;width:10px;height:10px;bottom:-8px;right:-8px;cursor:se-resize;z-index:334;background:url('+path+'icon.png);',event: {add: 'mousedown',fn: resizeEvent}}));
	node.appendChild(df);
};
var removeResizeUIFrom = function(node){
	var i=0,len = node.childNodes.length;
	node.style.overflow = 'hidden';
	while(i < 8){
		len--; i++;
		node.removeChild(node.childNodes[len]);
	}
};
var resizeEditorEvent = function(e){
	var _e = $.getEvent(e);
	_e.preventDefault();
	if(e.type == 'mousedown'){
		resizeEditorEvent.x = e.screenX;
		resizeEditorEvent.y = e.screenY;
		resizeEditorEvent.h = editor.offsetHeight;
		resizeEditorEvent.e = _e.target;
		
		//$.removeEvent(this,'mousedown',resizeEditorEvent);
		$.addEvent(document,'mousemove',resizeEditorEvent);
		$.addEvent(document,'mouseup',resizeEditorEvent);
	} else if(e.type == 'mousemove'){
		//resizeEditorEvent.w += e.screenX - resizeEditorEvent.x; 
		resizeEditorEvent.h += e.screenY - resizeEditorEvent.y; 
		resizeEditorEvent.x = e.screenX;
		resizeEditorEvent.y = e.screenY;
		if( resizeEditorEvent.h < 20) {
			resizeEditorEvent.h = 20;
			$.removeEvent(document,'mousemove',resizeEditorEvent);
			$.removeEvent(document,'mouseup',resizeEditorEvent);
			delete resizeEditorEvent.e;
			return;
		}
		editor.style.height = resizeEditorEvent.h+'px';
		//$.addStyle(resizeEditorEvent.e, { top: (resizeEditorEvent.h-11)+'px'});
	} else {
		$.removeEvent(document,'mousemove',resizeEditorEvent);
		$.removeEvent(document,'mouseup',resizeEditorEvent);
		delete resizeEditorEvent.e;
	}
};
var normalizeTree =  function(root) {
		if(!root) {
			return "";
		}
		var queue = [], original_queue = [], i, j, original_len, len, currentNode, currentOriginalNode, flagFloor1 = true, 
		tempNode, newTree = root.cloneNode(true),top,left,display,role;
		
		queue.push(newTree); 
		original_queue.push(root);
		//
		var addNewNode = function(role,node,original){
			var temp = node.cloneNode(true),
			opt = {
				"role" : role,
				"style" : {"position":"absolute","top": original.offsetTop + "px",
						"left": original.offsetLeft + "px","overflow":"hidden",
						"height": original.offsetHeight+"px","width": original.offsetWidth+"px"
						}
			};
			if(role == 'iframe' || role == 'media'){
				opt.html = '<div class="jb-media-mousemoveEvent">&#160;</div>';
			}
			temp = $.setNode(opt).appendChild(temp).parentNode;
			
			if(role == 'media' && temp.childNodes[1].nodeName.toLowerCase() == "object") {
				temp.childNodes[1].insertBefore($.setNode({
					tag : "param",
					"name" : "wmode",
					"value" : "opaque"
				}), temp.childNodes[1].childNodes[0]);
				temp.childNodes[1].lastChild.setAttribute("wmode", "opaque");
			}
			newTree.appendChild(temp);
		};
		
		//Start BFS in 2 trees
		while(queue.length > 0) {
			currentNode = queue.pop();
			currentOriginalNode = original_queue.pop();
			if(currentNode.childNodes.length === 0) {
				continue;
			}
			for( i = 0, j = 0, original_len = currentOriginalNode.childNodes.length, len = currentNode.childNodes.length;
				i < len && j < original_len;
				i++, j++) {

				if(currentNode.childNodes[i].nodeName == '#comment') continue;
				
				if(currentNode.childNodes[i].nodeName == '#text'){
					if(/[\S]/ig.test(newTree.childNodes[i].nodeValue)) {
						if(flagFloor1)
						{
							//build #text wrapper
							tempNode = $.setNode({
								tag: 'span',
								html: newTree.childNodes[i].nodeValue
							});
							newTree.insertBefore(tempNode, newTree.childNodes[i]);
							newTree.removeChild(newTree.childNodes[i+1]);
							i--; j--;
						}
					} else {
						newTree.removeChild(newTree.childNodes[i]);
						i--; len--;
					}
				} else {
					
					if(currentNode.childNodes[i].getAttribute("role")) {
						continue;
					}
					role = $.detectMedia(currentNode.childNodes[i]);
					switch(role) {
						case "image":
						case "iframe":
						case "media":
							if(!flagFloor1 && currentNode.childNodes.length == 1) {
								//if current node has only one child, find a real root to remove this node
								tempNode = currentNode;
								
								//case: nested node with single child
								while(tempNode.parentNode.childNodes.length == 1 && !$.hasClass(tempNode.parentNode, "wall0-area")) {
									tempNode = tempNode.parentNode;
								}
								//now tempNode store node that has only one child
								addNewNode(role,currentNode.childNodes[i],currentOriginalNode.childNodes[j]);
								tempNode.parentNode.removeChild(tempNode);
								
							} else {
								//normally move to root of newTree
								addNewNode(role,currentNode.childNodes[i],currentOriginalNode.childNodes[j]);
								
								currentNode.removeChild(currentNode.childNodes[i]);
								i--;
								len--;
							}
							break;
						case "text":
							if(currentNode.childNodes[i].innerHTML === "" && currentNode.childNodes[i].nodeName.toLowerCase() != "div") {
								currentNode.removeChild(currentNode.childNodes[i]);
								i--;
								len--;
								continue;
							} else if(flagFloor1) {
								left=top=0;
								tempNode = currentOriginalNode.childNodes[j]
								if(tempNode.offsetTop){
									top = tempNode.offsetTop;
									left = tempNode.offsetLeft;
								} else if(j>0) {
									tempNode = currentOriginalNode.childNodes[j-1];
									display = $.getPropStyle(tempNode,'display');
									if(display.indexOf('inline') >= 0){ //display inline
										top = tempNode.offsetTop;
										left = tempNode.offsetLeft + tempNode.offsetWidth; 
										if(left > document.offsetWidth){
											top += tempNode.offsetHeight;
											left = 0;
										}
									} else { //display block
										top = tempNode.offsetTop + tempNode.offsetHeight
											+ parseInt($.getPropStyle(tempNode,'margin-top')) 
											+ parseInt($.getPropStyle(tempNode,'margin-bottom'))
											+ parseInt($.getPropStyle(tempNode,'padding-top'))
											+ parseInt($.getPropStyle(tempNode,'padding-bottom'));
										left = 0;
									}
									
								}
								
								if(currentNode.childNodes[i].nodeName.toLowerCase() != "div") {
									tempNode = currentNode.childNodes[i].cloneNode(true);
									tempNode = $.setNode().appendChild(tempNode).parentNode;
									tempNode = $.setNode({
										"role" : 'text',
										"style" : {"position":"absolute","top": top + "px","left": left + "px","overflow":"hidden"}
									}).appendChild(tempNode).parentNode;

									if(newTree.childNodes.length === 0) {
										newTree.appendChild(tempNode);
									} else {
										newTree.insertBefore(tempNode, newTree.childNodes[i]);
										newTree.removeChild(newTree.childNodes[i + 1]);
									}
								} else {
									$.setNode(newTree.childNodes[i], {
										"role" : 'text',
										"style" : {"position":"absolute","top": top + "px",
												"left": left + "px","overflow":"hidden"}
									});
								}
							}
							queue.push(currentNode.childNodes[i]);
							original_queue.push(currentOriginalNode.childNodes[j]);
							break;
						default:
							break;
					}
				}
			}
			if(flagFloor1) {
				flagFloor1 = false;
			}
		}

		for( i = 0, len = newTree.childNodes.length; i < len; i++) {
			
			$.addStyle(newTree.childNodes[i], {
				"position" : "absolute",
				"overflow" : "hidden",
				"padding" : 0,
				"margin" : 0,
				"display" : "inline-block"
			});
		}

		root.innerHTML = newTree.innerHTML;
		//loop for pre text
		return true;
	};
var dragEvent = function(e) {
	//Controller of resize and drag element
	if(editorState === 'edit'){return false;}
	
	var data = dragEvent, event = $.getEvent(e), sizeBorder = 1, elm, diffX, diffY,classname;
	
	if(e.type == 'mousedown'){
		elm = event.target;
		
		while(elm){
			if(elm.parentNode && elm.parentNode.getAttribute){
				classname = elm.parentNode.getAttribute('class');
				if(classname && typeof classname === 'string' && classname.indexOf('wall0-area') > -1 ) break;
			}
			elm = elm.parentNode;
		}
		if(!elm) return;
		event.preventDefault();
		//change editor state
		if(selectedNode !== elm){
			restoreNormalState();
			addResizeUITo(elm);
			selectedNode = elm;
			editorState = 'move';
		}
		//collect essential infomation
		data.x = e.screenX;
		data.y = e.screenY;
		data.top = elm.offsetTop;
		data.left = elm.offsetLeft;
		data.w = elm.offsetWidth;
		data.h = elm.offsetHeight;
		
		$.addEvent(document, 'mousemove', dragEvent);
		$.addEvent(document, 'mouseup', dragEvent);
	} else if(e.type == 'mousemove'){
		
		event.preventDefault();
		diffX = e.screenX - data.x + data.left;
		diffY = e.screenY - data.y + data.top;
		if( 0 > diffX){
			diffX = 0;
		} else if( diffX > editor.offsetWidth - data.w) {
			diffX = editor.offsetWidth - data.w;
		}
		if( 0 > diffY){
			diffY = 0;
		} else if( diffY > editor.offsetHeight - data.h){
			diffY = editor.offsetHeight - data.h;
		}
		
		selectedNode.style.top = diffY + 'px';
		selectedNode.style.left = diffX + 'px';
		data.left = diffX;	
		data.top = diffY;
		data.x = e.screenX;
		data.y = e.screenY;
		
	} else if(e.type == 'mouseup') {
		$.removeEvent(document, 'mousemove', dragEvent);
		$.removeEvent(document, 'mouseup', dragEvent);
	}

};
var resizeEvent = function(e){
	var event = $.getEvent(e),elm,classname,data = resizeEvent,diffX,diffY,top,left,width,height;
	if(e.type === 'mousedown')
	{
		elm = event.target;
		classname = elm.getAttribute('class');
		if(classname && typeof classname === 'string' && classname.indexOf('wall0') > -1){
			
			data.dir = classname.replace('wall0','');
			data.x = e.screenX;
			data.y = e.screenY;
			data.top = selectedNode.offsetTop;
			data.left = selectedNode.offsetLeft;
			data.w = selectedNode.offsetWidth;
			data.h = selectedNode.offsetHeight;
			
			$.addEvent(document,'mousemove',resizeEvent);
			$.addEvent(document,'mouseup',resizeEvent);
			event.preventDefault();	
		}
	} else if(e.type === 'mousemove') {
		event.preventDefault();
		diffY = e.screenY - data.y;
		diffX = e.screenX - data.x;

		if(data.dir.indexOf('t') > -1){
			top = diffY + data.top;
			height = data.h - diffY;
		} else if(data.dir.indexOf('b') > -1) {
			height = diffY + data.h;
		}
		if(data.dir.indexOf('l') > -1){
			left = diffX + data.left;
			width = data.w - diffX;
		} else if(data.dir.indexOf('r') > -1){
			width = diffX + data.w;
		}
		if( 0 >= top) {top = 0;height = data.h;}
		else if(height <= 0) {height = data.h;top = data.top;}
		if( 0 >= left) {left = 0;width = data.w;}
		else if(width <= 0) {width = data.w;left = data.left;}
		
		//selectedNode.style.width = diffY + 'px';
		if(top) {selectedNode.style.top = top + 'px';data.top = top;}
		if(left) {selectedNode.style.left = left + 'px';data.left = left;}
		if(width) {selectedNode.style.width = width + 'px'; data.w = width;}
		if(height) {selectedNode.style.height = height + 'px'; data.h = height;}
				
		data.x = e.screenX;
		data.y = e.screenY;
	} else if(e.type === 'mouseup') {
		$.removeEvent(document,'mousemove',resizeEvent);
		$.removeEvent(document,'mouseup',resizeEvent);
		
	}

}
var restoreNormalState = function(){
	if(selectedNode){
		switch(editorState){
			case 'edit':
				selectedNode.firstChild.blur();
				selectedNode.firstChild.removeAttribute('contenteditable');
				//window.GENTICS.Aloha.unregisterEditable(selectedNode.firstChild);
				if(window.GENTICS){window.GENTICS.Aloha.editables[0].destroy();window.GENTICS.Aloha.editables = [];}
				if($.env.ie)
					document.selection.empty();
				else
					window.getSelection().removeAllRanges();
				
				break;
			default: break;
		}
		removeResizeUIFrom(selectedNode);
		selectedNode = null;
	}
	console.log('wall0 > unselected');
	editorState = "normal";
};
var clickEvent = function(e) {

	var event = $.getEvent(e),elm;
	
	elm = event.target;
	
	while(elm){
		if(elm.parentNode && elm.parentNode.getAttribute){
			classname = elm.parentNode.getAttribute('class');
			if(classname && typeof classname === 'string'){
				if(classname.indexOf('wall0-area') > -1 ) break;
				else if(classname.indexOf('GENTICS_floatingmenu') > -1) return false;
			}
		}
		elm = elm.parentNode;
	}
	console.log('click'+ (new Date()).getTime());	
	if(!elm) {
		if(editorState !== 'normal')
			restoreNormalState();
		event.preventDefault();	
		return false;
		
	} else if(selectedNode && selectedNode !== elm){
		restoreNormalState();
		if(elm){
			addResizeUITo(elm);
			editorState = 'move';
			selectedNode = elm;
		}
		event.preventDefault();	
		return false;
	}
	
	
};

var dbclickEvent = function(e) {
	var event = $.getEvent(e), elm;
	
	elm = event.target;
	while(elm){
		if(elm.parentNode && elm.parentNode.getAttribute){
			classname = elm.parentNode.getAttribute('class');
			if(classname && typeof classname === 'string' && classname.indexOf('wall0-area') > -1 ) break;
		}
		elm = elm.parentNode;
	}
	if(elm && elm.getAttribute('role') === 'text'){
		if(selectedNode !== elm) {
			restoreNormalState();
			addResizeUITo(elm);
			selectedNode = elm;
		}
		editorState = 'edit';
		elm.firstChild.setAttribute('contenteditable','true');
		elm.firstChild.style.outline = 'none';
		elm.firstChild.focus();
		if(window.GENTICS) window.$(elm.firstChild).aloha();
	}
		
	event.preventDefault();
};

var keydownEvent = function(e) {
	var event = $.getEvent(e), _root, tempStage;
	if(event.target.nodeName.toLowerCase() == "input") {
		return false;
	}
	if(e.keyCode == 27) {// Esc button
		restoreNormalState();
	} else if(e.metaKey || e.ctrlKey) {
		if(e.keyCode == 90) {//ctrl-z button
			sandbox.notify("keydown-normal-undo");
			restoreNormalState();
		} else if(e.keyCode == 89) {//ctrl-y button
			sandbox.notify("keydown-normal-redo");
			restoreNormalState();
		} else if(e.keyCode == 86 && !(/edit$/i.test(editorState))) {// ctrl-v button
			sandbox.notify("keydown-noediting-paste", e);
			restoreNormalState();
		}
	}
	if(/move$/i.test(editorState)) {
		if(e.metaKey || e.ctrlKey) {
			if(e.keyCode == 67) {// ctrl-c button
				sandbox.notify("keydown-move-copy");
				restoreNormalState();
			} else if(e.keyCode == 88) {// ctrl-x button
				sandbox.notify("keydown-move-copy");
				stage.getLayer().removeChild(stage.currentEditingNode);
				restoreNormalState();
			}
		} else if((e.keyCode == 8 || e.keyCode == 46)) {// delete or backspace button
			stage.getLayer().removeChild(stage.currentEditingNode);
			history.save(stage.getLayer().innerHTML);
			restoreNormalState();
		} else if(e.keyCode == 9) {// Tab button
			if(stage.currentEditingNode.nextSibling) {
				_root = stage.currentEditingNode.nextSibling;
			} else {
				_root = stage.getLayer().firstChild;
			}
			restoreNormalState();
			mediaType = $.detectMedia(_root);
			stage.currentEditingNode = _root;
			$.addClass(_root, "jb-mousemoveEvent");
			$.addEvent(_root, "mousedown", mousemoveEvent);
			editorState = mediaType + "move";
			sandbox.notify(mediaType + "move");
			tempStage = stage.getElement();
			cache.isMove = false;
			cache.screen_top = tempStage.offsetTop;
			cache.screen_left = tempStage.offsetLeft;
			cache.screen_w = tempStage.offsetWidth;
			cache.screen_h = tempStage.offsetHeight;
			cache.top = _root.offsetTop;
			cache.left = _root.offsetLeft;
			cache.w = _root.offsetWidth;
			cache.h = _root.offsetHeight;
			event.preventDefault();
		}
	}
};

//include $.js
$ = wall0.$ = (function(){
	var _ = function(element,opt){
		return _.setNode(element,opt);
	},
	//Private function
	hide = function(element){
		var display = getPropStyle(element, 'display');
		if(display != 'none')
			element._oldDisplay = display;
		element.style.display = 'none';
	},
	show = function(element) {
		var display = getPropStyle(element, 'display');
		if(element == 'none' ){
			if(element._oldDisplay == 'none')
				element.style.display = 'block';
			else
				element.style.display = element._oldDisplay;
		}
			
	};
	
	//Public function
	_.env = {
		ie : /MSIE/i.test(navigator.userAgent),
		ie6 : /MSIE 6/i.test(navigator.userAgent),
		ie7 : /MSIE 7/i.test(navigator.userAgent),
		ie8 : /MSIE 8/i.test(navigator.userAgent),
		firefox : /Firefox/i.test(navigator.userAgent),
		opera : /Opera/i.test(navigator.userAgent),
		webkit : /Webkit/i.test(navigator.userAgent),
		camino : /Camino/i.test(navigator.userAgent)
	};
	
	
	_.addEvent = function(element, eventType, callback) {
		eventType = eventType.toLowerCase();
		if(element.addEventListener) {
			element.addEventListener(eventType, callback, false);
		} else if(element.attachEvent) {
			element.attachEvent('on' + eventType, callback);
		}
	};

	_.removeEvent = function(element, eventType, callback) {
		eventType = eventType.toLowerCase();
		if(element.removeEventListener) {
			element.removeEventListener(eventType, callback, false);
		} else if(element.detachEvent) {
			element.detachEvent('on' + eventType, callback);
		}
	};
	
	_.getEvent = function(event) {
		if(event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}

		return {
			target : _.getTargetFromEvent(event),
			preventDefault : function() {
				if(event.preventDefault) {
					event.preventDefault();
				// W3C method
				} else {
					event.returnValue = false;
				// Internet Explorer method
				}
			}
		};
	};

	_.getTargetFromEvent = function(event) {
		var target = event.srcElement || event.target;
		if(target.nodeType == 3) {
			target = target.parentNode;
		}
		return target;
	};

	_.getArrayOfClassNames = function(element) {
		var ret = [], classNames = [];
		if(element.className) {
			classNames = element.className.split(' ');
		}
		for(var i = 0; i < classNames.length; i++) {
			if(classNames[i].length != 0)
				ret.push(classNames[i]);
		}

		return ret;
	};

	_.addClass = function(element, className) {
		var array = _.getArrayOfClassNames(element), table = {}, i;

		for( i = 0; i < array.length; i++) {
			if(array[i] != '')
				table[array[i]] = true;
		}
		className = className.split(' ');
		for( i = 0; i < className.length; i++) {
			if(className[i] != '') {
				if(!table[className[i]]) {
					array.push(className[i]);
					table[className[i]] = true;
				}
			}
		}
		element.className = array.join(' ');

	};

	_.removeClass = function(element, className) {
		var classNames = _.getArrayOfClassNames(element), table = {}, i;
		for( i = 0; i < classNames.length; i++) {
			table[classNames[i]] = true;
		}
		className = className.split(' ');
		for( i = 0; i < className.length; i++) {
			if(table[className[i]]) {
				delete table[className[i]];
			}
		}
		classNames = [];
		for(var key in table) {
			if(key.substr(0, 1) != '_') {
				classNames.push(key);
			}
		}
		element.className = classNames.join(' ');

	};

	_.hasClass = function(element, className) {
		var tester, countClass = 0;
		//trim
		className.replace(/^\s+/, '');
		className.replace(/\s+$/, '');
		className = className.split(' ');
		for(var i = 0; i < className.length; i++) {
			if(className[i] != '') {
				countClass++;
				tester = new RegExp(className[i]);
				if(tester.test(element.className) == false)
					return false;
			}
		}
		if(countClass > 0)
			return true;
		else
			return false;
	};

	_.getObjectOfStyle = function(element) {
		var i = 0, len = 0, objectStyle = {}, cssValue = '', listStyle;
		
		if(typeof element == 'string')
		{
			listStyle = element;
		} else {
			var listStyle = element.getAttribute('style');

			if(listStyle && typeof listStyle == 'object'){
				listStyle = listStyle.cssText;
			}
		}
		
		if(listStyle) {
			listStyle = listStyle.split(';');
			// example ['top:45px','left:67px',...]
			for( i = 0, len = listStyle.length; i < len; i++) {
				//each item = 'top:45px'
				if(listStyle[i]) {
					cssValue = listStyle[i].split(':');
					if(cssValue.length == 2) {
						//Trim
						cssValue[0] = cssValue[0].replace(/^[\s]+/g, '');
						cssValue[1] = cssValue[1].replace(/^[\s]+/g, '');
						cssValue[0] = cssValue[0].replace(/[\s]+$/g, '');
						cssValue[1] = cssValue[1].replace(/[\s]+$/g, '');

						objectStyle[cssValue[0].toLowerCase()] = cssValue[1];
					}
				}
			}

		}
		return objectStyle;
	};

	_.setObjectOfStyle = function(element, objectStyle) {
		var listStyle = '', item;
		var isIE = _.env.ie;
		if(arguments.length == 1)
			objectStyle = element;
		if(typeof objectStyle == "string") {
			listStyle = objStyle;
		} else {
			for(item in objectStyle) {
				if(item.substr(0, 1) != '_') {
					if(isIE) {
						listStyle = listStyle.concat(item.toUpperCase() + ':' + objectStyle[item] + ';');
					} else {
						listStyle = listStyle.concat(item + ':' + objectStyle[item] + ';');
					}
				}
			}
		}
		if(arguments.length > 1)
		{
			/*if(_.env.ie8)
				element.setAttribute('style', listStyle);
			else if(isIE)*/
				element.style.cssText = listStyle;
			/*else
				element.setAttribute('style', listStyle);*/
		}
		return listStyle;
	};

	_.addStyle = function(element, List) {
		
		var objStyle = _.getObjectOfStyle(element), item;
		if(typeof List == "string") {
			List = _.getObjectOfStyle(List);
		}

		for(item in List) {
			if(item.substr(0, 1) != '_') {
				objStyle[item] = List[item];
			}
		}		
		
		_.setObjectOfStyle(element, objStyle);
	};

	_.removeStyle = function(element, List) {
		var objStyle = _.getObjectOfStyle(element), item;
		for(item in List) {
			if(item.substr(0, 1) != '_') {
				delete objStyle[item];
			}
		}
		_.setObjectOfStyle(element, objStyle);
	};
	_.getPropStyle = function(element, prop){
		if(prop && element){			
			if(element.style[prop])
				return element.style[prop];
			else if(element.currentStyle)
				return element.currentStyle[prop];
			else if(document.defaultView && document.defaultView.getComputedStyle){
				prop = prop.replace(/([A-Z])/g,'-$1').toLowerCase();
				var style = document.defaultView.getComputedStyle(element, '');
				return style && style.getPropertyValue(prop);
			}
		}
		return null;
	};
	
	_.setNode = function(element, List) {
	
		if(arguments.length === 0 || element == undefined) {
			return document.createElement('div');
		}
		if(arguments.length == 1 || List == undefined) {
			List = arguments[0];
			element = document.createElement(List.tag || List.Tag || 'div');
			delete List.tag;
			delete List.Tag;
		}
		if(typeof List == 'string'){
			switch(List.toLowerCase()){
				case 'hide':
					hide(element);
					break;
				case 'show':
					show(element);
					break;
				default:break;
			}
		} else {
			for(var item in List) {
				switch(item) {
					case 'event':
					case 'Event':
						var listEvent = List.event || List.Event || {};
						//example event: {add: click,fn: function1}

						//Add event <tag onclick='function1'></tag>
						if(listEvent.add) {
							_.addEvent(element, listEvent.add, listEvent.fn);
						} else if(listEvent.remove) {
							_.removeEvent(element, listEvent.remove, listEvent.fn);
						}
						break;
					case 'Attr':
					case 'attr':
						var listAttr = List.Attr || List.attr || {};
						//example attr: {id: xxx,class: yyy}
						//Add attribute <tag attr1='value'></tag>
						for(var key in listAttr) {
							if(key.substr(0, 1) != '_') {
								if(key == "style") {
									_.addStyle(element, listAttr[key]);
									continue;
								}
								element.setAttribute(key, listAttr[key]);
							}
						}
						break;
					case 'html':
					case 'HTML':
						//Add innerHTML <tag>innerHTML</tag>
						element.innerHTML = List.html;
						break;
					default:
						if(item.substr(0, 1) != '_') {
							if(item == "style") {
								_.addStyle(element, List[item]);
								continue;
							}
							element.setAttribute(item, List[item]);
						}
						break;
				}
			}
		}
		return element;
	};

	_.request = function(objSetting, callback) {
		/*
		* Usage:
		* request({
		* url: 'http://somewhere.com/somepage.php?key1=value',
		* method: 'post',
		* somekey2: 'somevalue2',
		* somekey3: 'somevalue3',
		* lastkey: 'lastvalue'
		* }, callback);
		*/

		//Build xhr objectStyle
		var xmlhttp = null, method = (objSetting.method) ? objSetting.method.toUpperCase() : 'GET', url = objSetting.url, dataKey = '', dataToSend = '';
		delete objSetting.method;
		delete objSetting.url;
		if(window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		}
		for(dataKey in objSetting) {
			if(dataKey.substr(0, 1) != '_') {
				dataToSend += dataKey + '=' + objSetting[dataKey] + '&';
			}
		}
		//delete last &	 in string
		dataToSend = dataToSend.substr(0, dataToSend.length - 1);

		if(method == 'GET') {
			if(/\?/.test(url)) {
				url = url + '&' + dataToSend;
			} else {
				url = url + '?' + dataToSend;
			}
		}
		xmlhttp.open(method, encodeURI(url), true);
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4) {
				if(xmlhttp.status == 200) {
					callback(xmlhttp.responseText);
				} else {
					callback();
				}
			}

		};
		if(method == 'POST') {
			xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xmlhttp.setRequestHeader('Content-length', dataToSend.length);
			xmlhttp.send(encodeURI(dataToSend));

		} else {
			xmlhttp.send();
		}

	};

	_.detectMedia = function(element) {
		//TODO: Detect another kind of media
		
		var listTextTag = {
			'p' : 1,
			'span' : 1,
			'div' : 1
		}, listMediaTag = {
			'object' : 1,
			'embed' : 1,
			'video' : 1
		};
		if( typeof element === 'object' || typeof element == 'function') {
			if(element.nodeName.toLowerCase() == 'div' && element.getAttribute('role')) {
				return element.getAttribute('role');
			} else if(element.nodeName.toLowerCase() == 'img') {
				return 'image';
			} else if(listMediaTag[element.nodeName.toLowerCase()]) {
				return 'media';
			} else if(element.nodeName.toLowerCase() == 'iframe') {
				return 'iframe';
			} else {
				return 'text';
			}
		} else if( typeof element === 'string') {
			if(/^<(\w+)[\s\w\=\"\']*>.*<\/\1>$/i.test(element) == false && /^<(\w+)[\s\w\=\"\']*\/>$/i.test(element) == false) {
				return undefined;
			} else if(/^<img/i.test(element)) {
				return 'image';
			} else if(/^<iframe/i.test(element)) {
				return 'iframe';
			} else {
				for(var i in listMediaTag) {
					if((new RegExp('^<' + i, 'i')).test(element)) {
						return 'media';
					}
				}
			}
			return 'text';
			}
			
		};
	/*Bind function
	 @param	 callback - [Function] function to call
	 @param  scope	- [Object] value of 'this' variable when call function
	 @param  useThrottle - [Number] delay to run function
	 @return
	 Anonymous function

	 How to use :
	 1. Change scope of variables
	 2. Setting Static arguments
	 3. Limit speed to repeat the function :Prevent to Old Browser (such as IE) crash.

	 Example :
	 1.1 Change scope to 'Jerboa' Object
	 lib0.bind(function,Jerboa,false)
	 1.2 Change scope to 'window' Object
	 lib0.bind(function,window,false)
	 1.3 use default scope
	 lib0.bind(function,null,false)
	 2. function foo(a,b,c) { alert(a+b-c); }
	 2.1 bar = lib0.bind(foo,null,false,5)
	 bar(6,1)=> 10 (from 5+6-1)
	 2.2 bar = lib0.bind(foo,null,false,5,8)
	 bar(9)	=>	4  (from 5+8-9)
	 3.1 Limit in 100 msec can run function in 1 time.
	 lib0.bind(function,null,100)
	 3.2 Limit in 1000 msec can run function in 1 time.
	 lib0.bind(function,null,1000)
	 3.3 No limit
	 lib0.bind(function,null,0) OR lib0.bind(function,null,false)
	 */
	_.bind = function(callback, scope, useThrottle) {
		var _scope = scope || window, argsStatic = Array.prototype.slice.call(arguments, 3);
		if(useThrottle) {
			return function() {
				var argsDynamic = arguments;

				if(callback.tId == undefined) {

					callback.tId = setTimeout(function() {
						callback.apply(_scope, argsStatic.concat(Array.prototype.slice.call(argsDynamic, 0)));
						delete callback.tId;

					}, useThrottle);
				}
			};
		} else {
			return function() {
				return callback.apply(scope, argsStatic.concat(Array.prototype.slice.call(arguments, 0)));
			};
		}
	};
	return _;
})();

wall0.init = function(id){
	var textarea = document.getElementById(id),h,w,i,len;
	if(textarea == null) {throw "wall0 > Not found id: "+id;return;}
	if(textareaId) wall0.destroy();
	
	//create fragment
	df = document.createDocumentFragment();
	
	//get Width and Height of textarea
	w = textarea.offsetWidth;
	h = textarea.offsetHeight;
	
	//build editor
	editor = $({'class':'wall-editor','style':'position:relative;width:'+w+'px;height:'+h+'px;border:1px solid #069;cursor:default;'});
	
	//build content area
	editor_area = $.setNode({'class':'wall0-area','style':'position:relative;width:100%;height:100%;background:transparent;overflow:hidden;'});
	editor_area.innerHTML = textarea.value ? textarea.value : textarea.innerHTML;
	if($.hasClass(editor_area.firstChild,'wall0-area')) editor_area.innerHTML = editor_area.firstChild.innerHTML;
	waitForMediaIn(editor_area).then(function(){normalizeTree(editor_area);console.log('wall0 > normalize complete')});
	editor.appendChild(editor_area);
	
	//build editor resizer at the bottom
	editor.appendChild($({'style':'position:absolute;bottom:0px;width:100%;height:10px;cursor:s-resize;',event: {add: 'mousedown',fn: resizeEditorEvent}}));
	
	df.appendChild(editor);
	textarea.parentNode.appendChild(df);
	$.addEvent(document, 'click', clickEvent);
	$.addEvent(document, 'dblclick', dbclickEvent);
	$.addEvent(document, 'mousedown', dragEvent);
	
	editorState = 'normal';
	console.log('wall0 > create instance for id:'+id,path);
	textareaId = id;
	return wall0;
};
wall0.destroy = function(){
	console.log('wall0 > destroy instance for id:'+textareaId);
};
wall0.listen = function(eventName,callback){
	var len;
	
	if(typeof eventName === 'string' && typeof callback === 'function'){
		
		eventName = eventName.replace(/\s /ig,'');
		if(!fn[eventName]) fn[eventName] = [];
		len = fn[eventName].length;
		fn[eventName][len] = callback;
	}
};
wall0.notify = function(eventName){
	var i,len,args;
	if(typeof eventName === 'string'){	
		eventName = eventName.replace(/\s /ig,'');
		if(fn[eventName]){
			args = Array.prototype.slice.call(arguments,1);
			for(i=0,len = fn[eventName].length; i<len ; i++){
				fn[eventName][i].apply(wall0,args);
			}
		}
	}
}
wall0.getContent = function(){
	return editor_area.outerHTML; 
}
window.wall0 = wall0;

})(window);
