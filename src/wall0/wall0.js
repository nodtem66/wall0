/**
 * wall0 0.0.101
 * a layout editor for WYSIWYG editor
 * github.com/nodtem66/wall0
 *
 * Licensed under the MIT license.
 * (c) 2011 Jirawat I.
 */
(function(window) {

var document = window.document,
		path = (function() {
			//Find absolute path for loading icons
			var url,elm;
			
			elm = document.getElementsByTagName('script');
			url = elm[elm.length - 1].src.replace('wall0.js', '');
			elm = window.location.href.split('/');
			elm.pop(); //delete the last entry
			url = url.replace(elm.join('/'), '');
			if (url.substr(0, 1) === '/') {
				url = url.substr(1);
			}
			return url;
		}()),
		$, //javascript lib
		editor, //DOM node of editor
		editormyarea, //DOM node of edited area in editor
		textareaId, //Id of bindeds textarea
		editorState, //current state of editor
		selectedNode, //current selected DOM node
		fn = {}, //function storage
		/*
		 * shortcut for call editor
		 * @export
		 * @param {!string} id Id of textarea or HTMLelement
		 * @return {!wall0} Singleton of wall0
		 */
		wall0 = function(id) {	
			if (typeof id === 'string') {
				if (id === '') {
					return null;
				} else if (id.slice(0, 1) === '#') {
					id = id.slice(1);
				}
				return wall0.init(id);
			}
		},
		/*
		 * wait until all images loaded
		 * @private
		 * @param {!HTMLelement} node HTMLelement that stores images
		 * @param {?function} callback Function, called when all images loaded
		 * @return {void}
		 */
		waitForMediaIn = function(node, callback) {
			var mediaTag = {
				'img': true, 'object': true, 'iframe': true, 'embed': true
				},
				totalmymedia = 0, queue = [], cur, i, len,
				onload = function() {
					totalmymedia--;
					if (totalmymedia === 0) {
						fn();
					}
				},
				fn = callback || function() {};
			queue.push(node);
			while (queue.length > 0) {
				cur = queue.pop();
				for (i = 0, len = cur.childNodes.length; i < len; i++) {
					if (cur.childNodes[i].childNodes &&
						cur.childNodes[i].childNodes.length > 0) {
						queue.push(cur.childNodes[i]);
					}
					if (mediaTag[cur.childNodes[i].nodeName.toLowerCase()]) {
						totalmymedia++;
						$.addEvent(cur.childNodes[i], 'load', onload);
					}
				}
			}
			return {
				then: function(callback) {
					fn = callback;
				},
				cancel: function() {
					totalmymedia = -1;
				}
			};
		},
		/* class History
		 * @private
		 * @param {!number} rawSize Max length of array
		 * @param {?function} callback Function to call after undo/redo
		 * @return {!History} History object
		 */
		history = IMPORT_HISTORY, 
		/* editor resize handler function
		 * @private
		 * @param {!event} event from mousedown, mousemove, and mouseup
		 * @return {void}
		 */
		resizeEditorEvent = function(e) {
			var event = $.getEvent(e);
			event.preventDefault();
			if (e.type === 'mousedown') {
				resizeEditorEvent.x = e.screenX;
				resizeEditorEvent.y = e.screenY;
				resizeEditorEvent.h = editor.offsetHeight;
				resizeEditorEvent.e = event.target;
				$.addEvent(document, 'mousemove', resizeEditorEvent);
				$.addEvent(document, 'mouseup', resizeEditorEvent);
			} else if (e.type === 'mousemove') {
				//resizeEditorEvent.w += e.screenX - resizeEditorEvent.x;
				resizeEditorEvent.h += e.screenY - resizeEditorEvent.y;
				resizeEditorEvent.x = e.screenX;
				resizeEditorEvent.y = e.screenY;
				if (resizeEditorEvent.h < 20) {
					resizeEditorEvent.h = 20;
					$.removeEvent(document, 'mousemove', resizeEditorEvent);
					$.removeEvent(document, 'mouseup', resizeEditorEvent);
					delete resizeEditorEvent.e;
					return;
				}
				editor.style.height = resizeEditorEvent.h + 'px';
				
			} else {
				$.removeEvent(document, 'mousemove', resizeEditorEvent);
				$.removeEvent(document, 'mouseup', resizeEditorEvent);
				delete resizeEditorEvent.e;
			}
		},
		/* Function to turn a general DOM tree to specific DOM Tree that is easy 
		 * 		to handler
		 * @private
		 * @param {HTMLElement} root of DOM Tree
		 * @return {void}
		 */
		normalizeTree = IMPORT_NORMALIZETREE,
		/* Drag event handler for element in editor
		 * @private
		 * @param {eventObject} e from DOM event
		 * @return {void}
		 */
		dragEvent = function(e) {
			//Controller of resize and drag element
			if (editorState === 'edit') {
				return false;
			}

			var data = dragEvent, event = $.getEvent(e), sizeBorder = 1, elm,
					diffX, diffY, classname;

			if (e.type === 'mousedown') {
				elm = event.target;
				while (elm) {
					if (elm.parentNode && elm.parentNode.getAttribute) {
						classname = elm.parentNode.getAttribute('class');
						if (classname && typeof classname === 'string' &&
								classname.indexOf('wall0-area') > -1) {
							break;
						}
					}
					elm = elm.parentNode;
				}
				if (!elm) {
					return;
				}
				event.preventDefault();
				//change editor state
				if (selectedNode !== elm) {
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
			} else if (e.type === 'mousemove') {

				event.preventDefault();
				diffX = e.screenX - data.x + data.left;
				diffY = e.screenY - data.y + data.top;
				if (0 > diffX) {
					diffX = 0;
				} else if (diffX > editor.offsetWidth - data.w) {
					diffX = editor.offsetWidth - data.w;
				}
				if (0 > diffY) {
					diffY = 0;
				} else if (diffY > editor.offsetHeight - data.h) {
					diffY = editor.offsetHeight - data.h;
				}

				selectedNode.style.top = diffY + 'px';
				selectedNode.style.left = diffX + 'px';
				data.left = diffX;
				data.top = diffY;
				data.x = e.screenX;
				data.y = e.screenY;

			} else if (e.type === 'mouseup') {
				$.removeEvent(document, 'mousemove', dragEvent);
				$.removeEvent(document, 'mouseup', dragEvent);
			}

		},
		/* Resize event handler for element in editor
		 * @private
		 * @param {!eventObject} e eventObject from DOM event
		 * @return {void}
		 */
		resizeEvent = function(e) {
			var event = $.getEvent(e), elm, classname, data = resizeEvent,
					diffX, diffY, top, left, width, height;
					
			if (e.type === 'mousedown') {
				elm = event.target;
				classname = elm.getAttribute('class');
				if (classname && typeof classname === 'string' &&
						classname.indexOf('wall0') > -1) {

					data.dir = classname.replace('wall0', '');
					data.x = e.screenX;
					data.y = e.screenY;
					data.top = selectedNode.offsetTop;
					data.left = selectedNode.offsetLeft;
					data.w = selectedNode.offsetWidth;
					data.h = selectedNode.offsetHeight;

					$.addEvent(document, 'mousemove', resizeEvent);
					$.addEvent(document, 'mouseup', resizeEvent);
					event.preventDefault();
				}
			} else if (e.type === 'mousemove') {
				event.preventDefault();
				diffY = e.screenY - data.y;
				diffX = e.screenX - data.x;

				if (data.dir.indexOf('t') > -1) {
					top = diffY + data.top;
					height = data.h - diffY;
				} else if (data.dir.indexOf('b') > -1) {
					height = diffY + data.h;
				}
				if (data.dir.indexOf('l') > -1) {
					left = diffX + data.left;
					width = data.w - diffX;
				} else if (data.dir.indexOf('r') > -1) {
					width = diffX + data.w;
				}
				if (0 >= top) {
					top = 0;
					height = data.h;
				} else if (height <= 0) {
					height = data.h;
					top = data.top;
				}
				if (0 >= left) {
					left = 0;
					width = data.w;
				} else if (width <= 0) {
					width = data.w;
					left = data.left;
				}

				//selectedNode.style.width = diffY + 'px';
				if (top) {
					selectedNode.style.top = top + 'px';
					data.top = top;
				}
				if (left) {
					selectedNode.style.left = left + 'px';
					data.left = left;
				}
				if (width) {
					selectedNode.style.width = width + 'px';
					data.w = width;
				}
				if (height) {
					selectedNode.style.height = height + 'px';
					data.h = height;
				}

				data.x = e.screenX;
				data.y = e.screenY;
			} else if (e.type === 'mouseup') {
				$.removeEvent(document, 'mousemove', resizeEvent);
				$.removeEvent(document, 'mouseup', resizeEvent);

			}

		},
		/* Function to turn editorstate to a normal condition
		 * @private
		 * @param {void}
		 * @return {void}
		 */
		restoreNormalState = function() {
			if (selectedNode) {
				if (editorState === 'edit') {
					selectedNode.firstChild.blur();
					selectedNode.firstChild.removeAttribute('contenteditable');
					//window.GENTICS.Aloha.unregisterEditable(selectedNode.firstChild);
					if (window.GENTICS) {
						window.GENTICS.Aloha.editables[0].destroy();
						window.GENTICS.Aloha.editables = [];
					}
					if ($.env.ie) {
						document.selection.empty();
					} else {
						window.getSelection().removeAllRanges();
					}
				}
				removeResizeUIFrom(selectedNode);
				selectedNode = null;
			}
			console.log('wall0 > unselected');
			editorState = 'normal';
		},
		clickEvent = function(e) {
			var event = $.getEvent(e), elm, classname;

			elm = event.target;
			while (elm) {
				if (elm.parentNode && elm.parentNode.getAttribute) {
					classname = elm.parentNode.getAttribute('class');
					if (classname && typeof classname === 'string') {
						if (classname.indexOf('wall0-area') > -1) {
							break;
						} else if (classname.indexOf('GENTICSmyfloatingmenu') > -1) {
							return false;
						}
					}
				}
				elm = elm.parentNode;
			}
			console.log('click' + (new Date()).getTime());
			if (!elm) {
				if (editorState !== 'normal') {
					restoreNormalState();
				}
				event.preventDefault();
				return false;

			} else if (selectedNode && selectedNode !== elm) {
				restoreNormalState();
				if (elm) {
					addResizeUITo(elm);
					editorState = 'move';
					selectedNode = elm;
				}
				event.preventDefault();
				return false;
			}
		},
		dbclickEvent = function(e) {
			var event = $.getEvent(e), elm, classname;

			elm = event.target;
			while (elm) {
				if (elm.parentNode && elm.parentNode.getAttribute) {
					classname = elm.parentNode.getAttribute('class');
					if (classname && typeof classname === 'string' &&
							classname.indexOf('wall0-area') > -1) {
						break;
					}
				}
				elm = elm.parentNode;
			}
			if (elm && elm.getAttribute('role') === 'text') {
				if (selectedNode !== elm) {
					restoreNormalState();
					addResizeUITo(elm);
					selectedNode = elm;
				}
				editorState = 'edit';
				elm.firstChild.setAttribute('contenteditable', 'true');
				elm.firstChild.style.outline = 'none';
				elm.firstChild.focus();
				if (window.GENTICS) {
					window.$(elm.firstChild).aloha();
				}
			}
			event.preventDefault();
		},
	/* var keydownEvent = function (e) {
		var event = $.getEvent(e), root, tempStage, mediaType;
		if (event.target.nodeName.toLowerCase() === "input") {
			return false;
		}
		if (e.keyCode === 27) {// Esc button
			restoreNormalState();
		} else if (e.metaKey || e.ctrlKey) {
			if (e.keyCode === 90) {//ctrl-z button
				sandbox.notify("keydown-normal-undo");
				restoreNormalState();
			} else if (e.keyCode === 89) {//ctrl-y button
				sandbox.notify("keydown-normal-redo");
				restoreNormalState();
			} else if (e.keyCode === 86 && !(/edit$/i.test(editorState))) {
				// ctrl-v button
				sandbox.notify("keydown-noediting-paste", e);
				restoreNormalState();
			}
		}
		if (/move$/i.test(editorState)) {
			if (e.metaKey || e.ctrlKey) {
				if (e.keyCode === 67) {// ctrl-c button
					sandbox.notify("keydown-move-copy");
					restoreNormalState();
				} else if (e.keyCode === 88) {// ctrl-x button
					sandbox.notify("keydown-move-copy");
					//stage.getLayer().removeChild(stage.currentEditingNode);
					restoreNormalState();
				}
			} else if ((e.keyCode === 8 || e.keyCode === 46)) {
				// delete or backspace button
				//stage.getLayer().removeChild(stage.currentEditingNode);
				//history.save(stage.getLayer().innerHTML);
				restoreNormalState();
			} else if (e.keyCode === 9) {// Tab button
				if (stage.currentEditingNode.nextSibling) {
					root = stage.currentEditingNode.nextSibling;
				} else {
					root = stage.getLayer().firstChild;
				}
				restoreNormalState();
				mediaType = $.detectMedia(root);
				stage.currentEditingNode = root;
				$.addClass(root, "jb-mousemoveEvent");
				$.addEvent(root, "mousedown", mousemoveEvent);
				editorState = mediaType + "move";
				sandbox.notify(mediaType + "move");
				tempStage = stage.getElement();
				cache.isMove = false;
				cache.screenmytop = tempStage.offsetTop;
				cache.screenmyleft = tempStage.offsetLeft;
				cache.screenmyw = tempStage.offsetWidth;
				cache.screenmyh = tempStage.offsetHeight;
				cache.top = root.offsetTop;
				cache.left = root.offsetLeft;
				cache.w = root.offsetWidth;
				cache.h = root.offsetHeight;
				event.preventDefault();
			}
		}
	};*/

		/* function to add resizer to element in editor
		 * @private
		 * @param {!HTMLElement} node Element that is going to be added
		 * @return {void}
		 */ 
		addResizeUITo = function(node) {
			var df = document.createDocumentFragment();
			node.style.overflow = 'visible';
			df.appendChild($({
				'class': 'wall0tl',
				'style': 'position:absolute;width:10px;height:10px;top:-8px;' +	
					'left:-8px;cursor:nw-resize;z-index:334;background:url(' + path +
					'icon.png);',
				event: {
					add: 'mousedown',
					fn: resizeEvent
					}
				}));
				
			df.appendChild($({
				'class': 'wall0t',
				'style': 'position:absolute;width:100%;height:2px;top:-4px;' +
					'left:0;z-index:333;border-top:2px solid #08F;'
				}));
				
			df.appendChild($({
				'class': 'wall0tr',
				'style': 'position:absolute;width:10px;height:10px;top:-8px;' +
					'right:-8px;cursor:ne-resize;z-index:334;background:url(' + path +
					'icon.png);',
				event: {
					add: 'mousedown',
					fn: resizeEvent
					}
				}));
				
			df.appendChild($({
				'class': 'wall0l',
				'style': 'position:absolute;width:2px;height:100%;top:0;' +
					'left:-4px;z-index:333;border-left:2px solid #08F;'
				}));
				
			df.appendChild($({
				'class': 'wall0r',
				'style':'position:absolute;width:2px;height:100%;top:0;' +
					'right:-4px;z-index:333;border-right:2px solid #08F;'
				}));
				
			df.appendChild($({
				'class': 'wall0bl',
				'style': 'position:absolute;width:10px;height:10px;bottom:-8px;' +
					'left:-8px;cursor:sw-resize;z-index:334;background:url(' + path +
					'icon.png);',
				event: {
					add: 'mousedown',
					fn: resizeEvent
					}
				}));
				
			df.appendChild($({
				'class': 'wall0b',
				'style': 'position:absolute;width:100%;height:2px;bottom:-4px;' +
					'left:0;z-index:333;border-bottom: 2px solid #08F;'
				}));
				
			df.appendChild($({
				'class': 'wall0br',
				'style': 'position:absolute;width:10px;height:10px;bottom:-8px;' +	
					'right:-8px;cursor:se-resize;z-index:334;background:url(' + path +
					'icon.png);',
				event: {
					add: 'mousedown',
					fn: resizeEvent
					}
				}));
				
			node.appendChild(df);
		},
		/* function remove resizer to element in editor
		 * @private
		 * @param {!HTMLElement} node ;as above
		 * @return {void}
		 */ 
		removeResizeUIFrom = function(node) {
			var i = 0, len = node.childNodes.length;
			node.style.overflow = 'hidden';
			while (i < 8) {
				len--;
				i++;
				node.removeChild(node.childNodes[len]);
			}
		};

/* Helper function v001
 * @type {object}
 * @author Jirawat I.
 * @export
 */ 
$ = wall0.$ = (IMPORT_LIB());
/* construct function for initiate editor
 * @export
 * @param {!string} id Id of textarea
 * @return {Object} wall0
 */
wall0.init = function(id) {
	var textarea = document.getElementById(id), h, w, i, len, df;
	if (textarea === null) {
		throw 'wall0 > Not found id: ' + id;
	}
	if (textareaId) {
		wall0.destroy();
	}
	//create fragment
	df = document.createDocumentFragment();
	//get Width and Height of textarea
	w = textarea.offsetWidth;
	h = textarea.offsetHeight;
	//build editor
	editor = $({
		'class': 'wall-editor',
		'style': 'position:relative;width:' + w + 'px;height:' + h +
			'px;border:1px solid #069;cursor:default;'
		});
	//build content area
	editormyarea = $.setNode({
		'class': 'wall0-area',
		'style': 'position:relative;width:100%;height:100%;' +
			'background:transparent;overflow:hidden;'
		});
	editormyarea.innerHTML = textarea.value || textarea.innerHTML;
	if ($.hasClass(editormyarea.firstChild, 'wall0-area')) {
		editormyarea.innerHTML = editormyarea.firstChild.innerHTML;
	}
	waitForMediaIn(editormyarea).then(function() {
		normalizeTree(editormyarea);
		console.log('wall0 > normalize complete');
	});
	editor.appendChild(editormyarea);

	//build editor resizer at the bottom
	editor.appendChild($({
		'style': 'position:absolute;bottom:0px;width:100%;height:10px;' +
			'cursor:s-resize;',
		event: {
			add: 'mousedown',
			fn: resizeEditorEvent
			}
		}));

	df.appendChild(editor);
	textarea.parentNode.appendChild(df);
	$.addEvent(document, 'click', clickEvent);
	$.addEvent(document, 'dblclick', dbclickEvent);
	$.addEvent(document, 'mousedown', dragEvent);

	editorState = 'normal';
	console.log('wall0 > create instance for id:' + id, path);
	textareaId = id;
	return wall0;
};
/* Deconstruct editor to original textarea
 * @export
 * @param {void}
 * @return {void}
 */
wall0.destroy = function() {
	console.log('wall0 > destroy instance for id:' + textareaId);
};
/* Event listener function
 * @export
 * @param {!string} eventName to assign a new custom event
 * @return {void}
 */ 
wall0.listen = function(eventName, callback) {
	var len;

	if (typeof eventName === 'string' && typeof callback === 'function') {
		eventName = eventName.replace(/\s /ig, '');
		if (!fn[eventName]) {
			fn[eventName] = [];
		}
		len = fn[eventName].length;
		fn[eventName][len] = callback;
	}
};
/* Event notifier function
 * @export
 * @param {string} eventName to fire a stored custom event
 * @return {void}
 */
wall0.notify = function(eventName) {
	var i, len, args;
	if (typeof eventName === 'string') {
		eventName = eventName.replace(/\s /ig, '');
		if (fn[eventName]) {
			args = Array.prototype.slice.call(arguments, 1);
			for (i = 0, len = fn[eventName].length; i < len; i++) {
				fn[eventName][i].apply(wall0, args);
			}
		}
	}
};
/* Function to send current HTMLtext of editor
 * @export
 * @param {void}
 * @return {HTMLtext} HTML of current editor area
 */
wall0.getContent = function() {
	return editormyarea.outerHTML;
};
window.wall0 = wall0;
}(window));
