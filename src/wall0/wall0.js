/**
 * wall0 0.0.101
 * a layout editor for WYSIWYG editor
 * github.com/nodtem66/wall0
 *
 * Licensed under the MIT license
 * (c) 2011 Jirawat I.
 * 
 * tabspace = 2, columnwidth = 80
 */
(function(window) {

/* core */
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
		editor_area, //DOM node of edited area in editor
		textareaId, //Id of bindeds textarea
		editorState, //current state of editor
		selectedNode, //current selected DOM node
		loader, //loader node
		vGuideLine, // UI vertical guideline
		hGuideLine, // UI horizontal guideline
		fn = {}, //function storage for events
		plugins = {}, //plugins storage
		pxSizeBorder = 2, //Size of border (px)
		pxRangeToShowGuideLine = 5, //range to show guideline (px)
		pxHeightTopMenu = 42, //height of top menu
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
				}
			};
		},
		/* Function to resize media inside the editor
		 * @private
		 * @param {!node} node Element to resize
		 * @param {!string} type Type of Element
		 * @param {!string} direction Direction to resize
		 * @return {!object} Resizer
		 */
		resizeNode = function(node) {
			var Resizer, myChildNodes, getChildNodesFromType, data;
			if (node && typeof node === 'object') {
				data = resizeEvent;
				/* Function to get childnodes of element to resize
				 * @private
				 * @param {!string} type Type of root element
				 * @return {!array<HTMLElement}>}
				 */
				getChildNodesFromType = function(type) {
					var returnArray = [];
					switch (type) {
					case 'image':
						returnArray[0] = node.childNodes[0];
						break;
					case 'media':
						returnArray[0] = node.childNodes[1];
						if (node.childNodes.length > 2) {
							returnArray[1] = node.getElementsByTagName('embed');
							if (returnArray[1]) {
								returnArray[1] = returnArray[1][0];
							} else {
								delete returnArray[1];
							}
						}
						break;
					case 'iframe':
						returnArray[0] = node.childNodes[1];
						break;
					default: break;
					}
					return returnArray;
				}
				Resizer = {
					/* Function to Set Additional node to resize
					 * @public
					 * @param {!string} typeNode Type of Element
					 * @return {!object} Resizer
					 */
					type: function(typeNode) {
						if (typeNode && typeof typeNode === 'string') {
							myChildNodes = getChildNodesFromType(typeNode);
						}
						return Resizer;
					},
					/* Function to change top of node 
					 * @public
					 * @param {!integer} x New value of top
					 * @return {!object} Resizer
					 */
					top: function(x) {
						var i,len;
						if (x && typeof x === 'number') {
							node.style.top = x + 'px';
							if (myChildNodes) {
								for (i = 0, len = myChildNodes.length; i < len; i++) {
									myChildNodes[i].style.top = x + 'px';
								}
							}
						}
						return Resizer;
					},
					/* Function to change left of node 
					 * @public
					 * @param {!integer} x New value of left
					 * @return {!object} Resizer
					 */
					left: function(x) {
						var i,len;
						if (x && typeof x === 'number') {
							node.style.left = x + 'px';
							if (myChildNodes) {
								for (i = 0, len = myChildNodes.length; i < len; i++) {
									myChildNodes[i].style.left = x + 'px';
								}
							}
						}
						return Resizer;
					},
					/* Function to change width of node 
					 * @public
					 * @param {!integer} x New value of width
					 * @return {!object} Resizer
					 */
					width: function(x) {
						var i,len;
						if (x && typeof x === 'number') {
							node.style.width = x + 'px';
							if (myChildNodes) {
								for (i = 0, len = myChildNodes.length; i < len; i++) {
									myChildNodes[i].style.width = x + 'px';
								}
							}
						}
						return Resizer;
					},
					/* Function to change height of node 
					 * @public
					 * @param {!integer} x New value of height
					 * @return {!object} Resizer
					 */
					height: function(x) {
						var i,len;
						if (x && typeof x === 'number') {
							node.style.height = x + 'px';
							if (myChildNodes) {
								for (i = 0, len = myChildNodes.length; i < len; i++) {
									myChildNodes[i].style.height = x + 'px';
								}
							}
						}
						return Resizer;
					}
				};
				return Resizer;
			} else {
				return null;
			}
		},
		/* Object to get/set data about guideline
		 * @private
		 * @param {void}
		 * @return {void}
		 */
		guideline = (function() {
			var arrayX = [], arrayY = [],
					freqX = {}, freqY = {},
					/* function to search n in listen
					 * @private
					 * @param {!number} number to search
					 * @return {!number} index of number
					 */
					binarySearch = function(n, list) {
						var left = 0, mid,
								right = list.length - 1;

						while (left < right) {
							
							mid = Math.floor((left + right) / 2);
							
							if (list[mid] === n) {
								return mid;
							} else if (list[mid] < n) {
								left = mid+1;
							} else {
								right = mid-1;
							}
						}
						if (!list[left]) {
							return undefined;
						}
						if ( n < list[left]) {
							if (left > 0) {
								mid = (list[left - 1] + list[left]) / 2;
								return (n < mid) ? left - 1 : left;
							} else {
								return 0;
							}
						} else {
							if (left+1 < list.length) {
								mid = (list[left] + list[left + 1]) / 2;
								return (n < mid) ? left : left + 1;
							} else {
								return left;
							}
						}
					};
			return {
				/* function to get nearest x of point(x,n)
				 * @public
				 * @param {!number} x from point(x,n)
				 * @return {!number} nearest x
				 */
				getNearestX: function(x) {
					return arrayX[binarySearch(x, arrayX)];
				},
				/* function to get nearest y of point(n,y)
				 * @public
				 * @param {!number} y from point(n,y)
				 * @return {!number} nearest y
				 */
				getNearestY: function(y) {
					return arrayY[binarySearch(y, arrayY)];
				},
				/* function to add position&size of node to guideline arrayX
				 * @public
				 * @param {!HTMLElement} node
				 * @return {void}
				 */
				addDataFromNode: function(node) {
					this.addDataX(node.offsetLeft);
					this.addDataX(node.offsetLeft + node.offsetWidth);
					this.addDataY(node.offsetTop);
					this.addDataY(node.offsetTop + node.offsetHeight);
				},
				/* function to add position&size of node to guideline arrayX
				 * @public
				 * @param {!HTMLElement} node
				 * @return {void}
				 */
				removeDataFromNode: function(node) {
					this.removeDataX(node.offsetLeft);
					this.removeDataX(node.offsetLeft + node.offsetWidth);
					this.removeDataY(node.offsetTop);
					this.removeDataY(node.offsetTop + node.offsetHeight);
				},
				/* function to add valueof x in point(x,n) to arrayX
				 * @public
				 * @param {!number} x number to add
				 * @return {void}
				 */
				addDataX: function(x) {
					var index = binarySearch(x, arrayX);
					if (index === undefined) {
						arrayX[0] = x;
						freqX[x] = 1;
					}
					else if (arrayX[index] === x) {
						freqX[x]++;
					}
					else if (arrayX[index] < x) {
						arrayX = arrayX.slice(0,index + 1)
								.concat(x)
								.concat(arrayX.slice(index + 1));
						freqX[x] = 1;
					}
					else if (arrayX[index] > x) {
						arrayX = arrayX.slice(0,index)
								.concat(x)
								.concat(arrayX.slice(index));
						freqX[x] = 1;
					} 
				},
				/* function to remove valueof x in point(x,n) to arrayX
				 * @public
				 * @param {!number} x number to remove
				 * @return {void}
				 */
				removeDataX: function(x) {
					var index = binarySearch(x, arrayX);
					if (index >= 0 && arrayX[index] === x) {
						freqX[x]--;
						if (freqX[x] === 0) {
							arrayX = arrayX.slice(0,index).concat(arrayX.slice(index + 1));
						}
					}
				},
				/* function to add valueof y in point(n,y) to arrayY
				 * @public
				 * @param {!number} y number to add
				 * @return {void}
				 */
				addDataY: function(y) {
					var index = binarySearch(y, arrayY);
					if (index === undefined) {
						arrayY[0] = y;
						freqY[y] = 1;
					}
					else if (arrayY[index] === y) {
						freqY[y]++;
					}
					else if (arrayY[index] < y) {
						arrayY = arrayY.slice(0,index + 1)
								.concat(y)
								.concat(arrayY.slice(index + 1));
						freqY[y] = 1;
					}
					else if (arrayY[index] > y) {
						arrayY = arrayY.slice(0,index)
								.concat(y)
								.concat(arrayY.slice(index));
						freqY[y] = 1;
					} 
				},
				/* function to remove valueof y in point(n,y) to arrayY
				 * @public
				 * @param {!number} y number to remove
				 * @return {void}
				 */
				removeDataY: function(y) {
					var index = binarySearch(y, arrayY);
					if (index >= 0 && arrayY[index] === y) {
						freqY[y]--;
						if (freqY[y] === 0) {
							arrayY = arrayY.slice(0,index).concat(arrayY.slice(index + 1));
						}
					}
				},
				/* function to clear data of guideline
				 * @public
				 * @param {void}
				 * @return {void}
				 */
				clear: function() {
					arrayX = [];
					arrayY = [];
					freqX = {};
					freqY = {};
				}
			};
		}()),
		/* class History
		 * @private
		 * @param {!number} rawSize Max length of array
		 * @param {?function} callback Function to call after undo/redo
		 * @return {!History} History object
		 */
		history = IMPORT_HISTORY,
		/* Function to turn a general DOM tree to specific DOM Tree that is easy 
		 * 		to handler
		 * @private
		 * @param {HTMLElement} root of DOM Tree
		 * @return {void}
		 */
		normalizeTree = IMPORT_NORMALIZETREE,
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
				guideline.removeDataY(editor_area.offsetHeight / 2);
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
					guideline.addDataY(editor_area.offsetHeight / 2);
					delete resizeEditorEvent.e;
					return;
				}
				editor.style.height = resizeEditorEvent.h + 'px';
				
			} else {
				$.removeEvent(document, 'mousemove', resizeEditorEvent);
				$.removeEvent(document, 'mouseup', resizeEditorEvent);
				guideline.addDataY(editor_area.offsetHeight / 2);
				delete resizeEditorEvent.e;
			}
		},
		/* Drag event handler for element in editor
		 * @private
		 * @param {eventObject} e from DOM event
		 * @return {void}
		 */
		dragEvent = function(e) {
			//Controller of resize and drag element
			if (editorState.indexOf('edit') > -1) {
				return false;
			}

			var data = dragEvent, event = $.getEvent(e), elm,
					diffX, diffY, classname;

			if (e.type === 'mousedown') {
				elm = event.target;
				while (elm) {
					if (elm.parentNode && elm.parentNode.getAttribute) {
						classname = elm.parentNode.getAttribute('class');
						if (classname && typeof classname === 'string') {
							if (classname.indexOf('wall0-area') > -1) {
								break;
							} else if (elm.getAttribute && elm.getAttribute('class') 
								&& classname.indexOf('wall0-area') > -1) {
								event.preventDefault();
								break;
							} else if (classname.indexOf('GENTICSmyfloatingmenu') > -1) {
								return false;
							}
						}
					}
					elm = elm.parentNode;
				}
				if (!elm) {
					if (editorState !== 'normal') {
						restoreNormalState();
					}
					return false;
				}
				if (selectedNode && selectedNode !== elm) {
					restoreNormalState();
				}
				console.log('wall0 > select');
				if (elm) {
					addResizeUITo(elm);
					editorState = $.detectMedia(elm)+'move';
					selectedNode = elm;
				}
				event.preventDefault();
				//collect essential infomation
				data.x = e.screenX;
				data.y = e.screenY;
				data.top = elm.offsetTop;
				data.left = elm.offsetLeft;
				data.w = elm.offsetWidth;
				data.h = elm.offsetHeight;

				guideline.removeDataFromNode(elm);
				$.addEvent(document, 'mousemove', dragEvent);
				$.addEvent(document, 'mouseup', dragEvent);
			} else if (e.type === 'mousemove') {

				event.preventDefault();
				diffX = e.screenX - data.x + data.left;
				diffY = e.screenY - data.y + data.top;
				if (diffX < pxSizeBorder) {
					diffX = pxSizeBorder;
				} else if (diffX > editor.offsetWidth - data.w - pxSizeBorder) {
					if (editor.offsetWidth - data.w < 0) {
						data.w = editor.offsetWidth - diffX - pxSizeBorder;
						selectedNode.style.width = data.w;
					} else {
						diffX = editor.offsetWidth - data.w - pxSizeBorder;
					}
				}
				if (diffY < pxSizeBorder) {
					diffY = pxSizeBorder;
				} else if (diffY > editor.offsetHeight - data.h - pxSizeBorder) {
					if (editor.offsetHeight - data.h < 0) {
						data.h = editor.offsetHeight - diffY - pxSizeBorder;
						selectedNode.style.height = data.h;
					} else {
						diffY = editor.offsetHeight - data.h - pxSizeBorder;
					}
				}

				//redraw document
				data.left = diffX;
				data.top = diffY;
				data.x = e.screenX;
				data.y = e.screenY;

				//show guideline
				diffX = guideline.getNearestX(diffX);
				diffY = guideline.getNearestY(diffY);
				if (Math.abs(diffX - data.left) <= pxRangeToShowGuideLine) {
					if (vGuideLine.visible === false) {
						$(vGuideLine, 'show');
					}
					vGuideLine.style.left = (diffX - 2 * pxSizeBorder) + 'px';
				} else {
					diffX = guideline.getNearestX(data.left + data.w);
					if (
							Math.abs(data.left + data.w - diffX) <= pxRangeToShowGuideLine) {
						if (vGuideLine.visible === false) {
							$(vGuideLine, 'show');
						}
						vGuideLine.style.left = (diffX + pxSizeBorder) + 'px';
						diffX -= data.w;
					} else {
						if (vGuideLine.visible === true) {
							$(vGuideLine, 'hide');
						}
						diffX = data.left;
					}
				}

				if (Math.abs(diffY - data.top) <= pxRangeToShowGuideLine) {
					if (hGuideLine.visible === false) {
						$(hGuideLine, 'show');
					}
					hGuideLine.style.top = (diffY - 2 * pxSizeBorder) + 'px';
				} else {
					diffY = guideline.getNearestY(data.top + data.h);
					if (
							Math.abs(data.top + data.h - diffY) <= pxRangeToShowGuideLine) {
						if (hGuideLine.visible === false) {
							$(hGuideLine, 'show');
						}
						hGuideLine.style.top = (diffY + pxSizeBorder) + 'px';
						diffY -= data.h;
					} else {
						if (hGuideLine.visible === true) {
							$(hGuideLine, 'hide');
						}
						diffY = data.top;
					}
				}
				selectedNode.style.left = diffX + 'px';
				selectedNode.style.top = diffY + 'px';

			} else if (e.type === 'mouseup') {

				$.removeEvent(document, 'mousemove', dragEvent);
				$.removeEvent(document, 'mouseup', dragEvent);

				//add new data to guideline
				guideline.addDataFromNode(selectedNode);

				//hide guideline
				if (vGuideLine.visible === true) {
					$(vGuideLine, 'hide');
				}
				if (hGuideLine.visible === true) {
					$(hGuideLine, 'hide');
				}
			}

		},
		/* Resize event handler for element in editor
		 * @private
		 * @param {!eventObject} e eventObject from DOM event
		 * @return {void}
		 */
		resizeEvent = function(e) {
			var event = $.getEvent(e), elm, classname, data = resizeEvent,
					diffX, diffY, diffMin, dx, dy, topInt, leftInt, widthInt,
					heightInt, typeNode, w, h;
					
			if (e.type === 'mousedown') {
				elm = event.target;
				classname = elm.getAttribute('class');
				if (classname && typeof classname === 'string' &&
						classname.indexOf('wall0') > -1) {

					data.dir = classname.replace('wall0', '');
					data.x = e.screenX;
					data.y = e.screenY;
					data.original_x = data.x;
					data.original_y = data.y;
					data.top = selectedNode.offsetTop;
					data.left = selectedNode.offsetLeft;
					data.w = selectedNode.offsetWidth;
					data.h = selectedNode.offsetHeight;
					guideline.removeDataFromNode(selectedNode);
					$.addEvent(document, 'mousemove', resizeEvent);
					$.addEvent(document, 'mouseup', resizeEvent);
					event.preventDefault();
				}
			} else if (e.type === 'mousemove') {
				event.preventDefault();
				diffY = e.screenY - data.original_y;
				diffX = e.screenX - data.original_x;
				
				//used in show of direction of mouse at any time
				dy = e.screenY - data.y;
				dx = e.screenX - data.x;
				data.y = e.screenY;
				data.x = e.screenX;
				
				//if resize with shift or ctrl;
				if (e.ctrlKey || e.shiftKey) {
					//if direction is not valid
					if (dx*dy <= 0) {
						return;
					}
					diffMin = Math.min(Math.abs(diffX), Math.abs(diffY));
					diffX *= diffMin / Math.abs(diffX);
					diffY *= diffMin / Math.abs(diffY);
				}
				//normal resize
				if (data.dir.indexOf('t') > -1) {
					topInt = diffY + data.top;
					heightInt = data.h - diffY;
				} else if (data.dir.indexOf('b') > -1) {
					heightInt = diffY + data.h;
				}
				if (data.dir.indexOf('l') > -1) {
					leftInt = diffX + data.left;
					widthInt = data.w - diffX;
				} else if (data.dir.indexOf('r') > -1) {
					widthInt = diffX + data.w;
				}
				//check that it's out of range?
				if (topInt < 0) {
					topInt = 0;
					//height is not changed
					heightInt = undefined; 
				} else if (heightInt <= 0) {
					topInt = data.top;
					heightInt = undefined;
				} else if (heightInt + (topInt || data.top) >= editor.offsetHeight) {
					heightInt = undefined;
				}
				if (leftInt < 0) {
					leftInt = 0;
					widthInt = undefined;
				} else if (widthInt <= 0) {
					leftInt = data.left;
					widthInt = undefined;
				} else if (widthInt + (leftInt || data.left) >= editor.offsetWidth) {
					widthInt = undefined;
				}
				//show guideline
				topInt = topInt || selectedNode.offsetTop;
				leftInt = leftInt || selectedNode.offsetLeft;
				widthInt = widthInt || selectedNode.offsetWidth;
				heightInt = heightInt || selectedNode.offsetHeight;
				diffX = guideline.getNearestX(leftInt);
				diffY = guideline.getNearestY(topInt);
				console.log('o',diffX,diffY,leftInt,topInt,widthInt,heightInt);
				if (Math.abs(diffX - leftInt) <= pxRangeToShowGuideLine) {
					if (vGuideLine.visible === false) {
						$(vGuideLine, 'show');
					}
					vGuideLine.style.left = (diffX - 2 * pxSizeBorder) + 'px';
					leftInt = diffX;
					if (data.dir.indexOf('r') == -1) {
						widthInt = data.w + data.left - diffX;
					}
				} else {
					diffX = guideline.getNearestX(leftInt + widthInt);
					if (
							Math.abs(leftInt + widthInt - diffX) <= pxRangeToShowGuideLine) {
						if (vGuideLine.visible === false) {
							$(vGuideLine, 'show');
						}
						vGuideLine.style.left = (diffX + pxSizeBorder) + 'px';
						widthInt = diffX - leftInt;
					} else {
						if (vGuideLine.visible === true) {
							$(vGuideLine, 'hide');
						}
					}
				}

				if (Math.abs(diffY - topInt) <= pxRangeToShowGuideLine) {
					if (hGuideLine.visible === false) {
						$(hGuideLine, 'show');
					}
					hGuideLine.style.top = (diffY - 2 * pxSizeBorder) + 'px';
					topInt = diffY;
					if (data.dir.indexOf('b') == -1) {
						heightInt = data.h + data.top - diffY;
					}
				} else {
					diffY = guideline.getNearestY(topInt + heightInt);
					if (
							Math.abs(topInt + heightInt - diffY) <= pxRangeToShowGuideLine) {
						if (hGuideLine.visible === false) {
							$(hGuideLine, 'show');
						}
						hGuideLine.style.top = (diffY + pxSizeBorder) + 'px';
						heightInt = diffY - topInt;
					} else {
						if (hGuideLine.visible === true) {
							$(hGuideLine, 'hide');
						}
					}
				}
				console.log('n',diffX,diffY,leftInt,topInt,widthInt,heightInt);
				typeNode = editorState.replace('move','').replace('edit','');
				resizeNode(selectedNode).type(typeNode).top(topInt).left(leftInt)
					.width(widthInt).height(heightInt);

			} else if (e.type === 'mouseup') {
				$.removeEvent(document, 'mousemove', resizeEvent);
				$.removeEvent(document, 'mouseup', resizeEvent);
				guideline.addDataFromNode(selectedNode);
				if (hGuideLine.visible === true) {
					$(hGuideLine, 'hide');
				}
				if (vGuideLine.visible === true) {
					$(vGuideLine, 'hide');
				}
			}

		},
		/* Function to turn editorstate to a normal condition
		 * @private
		 * @param {void}
		 * @return {void}
		 */
		restoreNormalState = function() {
			if (selectedNode) {
				if (editorState.indexOf('edit') > -1) {
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
				editorState = $.detectMedia(elm)+'edit';
				elm.firstChild.setAttribute('contenteditable', 'true');
				elm.firstChild.style.outline = 'none';
				elm.firstChild.focus();
				if (window.GENTICS) {
					window.$(elm.firstChild).aloha();
				}
			}
			event.preventDefault();
		},
		keydownEvent = function (e) {
			var event = $.getEvent(e), root, tempStage, mediaType;
			if (event.target.nodeName.toLowerCase() === "input") {
				return false;
			}
			if (e.keyCode === 27) {// Esc button
				restoreNormalState();
			} else if (e.metaKey || e.ctrlKey) {
				if (e.keyCode === 90) {//ctrl-z button
					wall0.notify("undo");
					restoreNormalState();
				} else if (e.keyCode === 89) {//ctrl-y button
					wall0.notify("redo");
					restoreNormalState();
				} else if (e.keyCode === 86 && editorState.indexOf('edit') == -1) {
					// ctrl-v button
					wall0.notify("paste", e);
					restoreNormalState();
				}
			}
			if (editorState.indexOf('move') > -1) {
				if (e.metaKey || e.ctrlKey) {
					if (e.keyCode === 67) {// ctrl-c button
						wall0.notify("copy");
						restoreNormalState();
					} else if (e.keyCode === 88) {// ctrl-x button
						wall0.notify("copy");
						editor_area.removeChild(selectedNode);
						restoreNormalState();
					}
				} else if (e.keyCode === 46) {
					// delete or backspace button
					//stage.getLayer().removeChild(stage.currentEditingNode);
					//history.save(stage.getLayer().innerHTML);
					editor_area.removeChild(selectedNode);
					selectedNode = null;
					restoreNormalState();
				} else if (e.keyCode === 9) {// Tab button
					if (selectedNode.nextSibling) {
						root = selectedNode.nextSibling;
					} else {
						root = editor_area.firstChild;
					}
					restoreNormalState();
					mediaType = $.detectMedia(root);
					selectedNode = root;
					addResizeUITo(selectedNode);
					//$.addClass(root, "jb-mousemoveEvent");
					//$.addEvent(root, "mousedown", mousemoveEvent);
					editorState = mediaType + "move";
					//sandbox.notify(mediaType + "move");
					event.preventDefault();
				}
			}
		},
		submitEvent = function(e) {
			var textarea = document.getElementById(textareaId);
			if (textarea.value) {
				textarea.value = wall0.getContent();
			} else if (textarea.innerHTML) {
				textarea.innerHTML = wall0.getContent();
			}
		},
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
					'icon.gif);',
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
					'icon.gif);',
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
					'icon.gif);',
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
					'icon.gif);',
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
		},
		/* Function to collect the actions of all elements in editorstate
		 * 		worked together with history, undo, and redo
		 * @private
		 * @param
		 * @return
		 */
		actionHandle = function() {
			
		},
		/* Function to hide loader
		 * @private
		 * @param {void}
		 * @return {void}
		 */
		onloaded = function() {
			$(loader, 'hide');
		},
		sandbox = {
			getEditor: function() {
					return editor;
				},
			getEditorState: function() {
					return editorState;
				},
			getEditorArea: function() {
					return editor_area;
				},
			getPath: function() {
					return path;
				},
			getTextAreaId: function() {
					return textareaId;
				},
			getSelection: function() {
					return selectedNode;
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
	var textarea = document.getElementById(id), h, w, t, l, i, len, df, hasNormalized = false;
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
	t = textarea.offsetTop;
	l = textarea.offsetLeft;
	//build editor
	editor = $({
		'class': 'wall-editor',
		'style': 'position:relative;width:' + w + 'px;height:' + h +
			'px;cursor:default;top:' + t + 'px;left:' + l + 
			'px;margin-bottom:' + t + 'px;'
		});
	//build content area
	editor_area = $.setNode({
		'class': 'wall0-area',
		'style': 'position:absolute;width:100%;height:100%;text-align:left;' +
			'background:#fff;overflow:hidden;z-index:998;box-shadow:0  0 10px #333;'
		});
	editor_area.innerHTML = textarea.value || textarea.innerHTML;
	if ($.hasClass(editor_area.firstChild, 'wall0-area')) {
		editor_area.innerHTML = editor_area.firstChild.innerHTML;
	}
	editor.appendChild(editor_area);
	editor.appendChild($({
			'style': 'position:fixed;width:' + $.viewport.width + 'px;height:' +
				$.viewport.height + 'px;background:#999;z-index:2;top:0;left:0;' +
				'background: rgba(0,0,0,0.6);'
		}));
	//build top menu
	/*editor.appendChild($({
			'style': 'position:absolute;top:-42px;left:-1px;background:#ddd;' +
				'border-top-left-radius:10px;border-top-right-radius:10px;' +
				'border:1px solid #999;width:100%;height:40px;z-index:9999;',
			html: '<div style="width:100%;height:41px;border-top:1px solid #fff;' +
				'border-radius:10px"></div>'
		}));*/
	//build guide line
	hGuideLine = $({
		'style': 'position:absolute;top:20px;left:0px;background:#08f;' +
			'width:100%;height:2px;display:none;z-index:999;'
		});
	hGuideLine.visible = false;
	editor.appendChild(hGuideLine);
	vGuideLine = $({
		'style': 'position:absolute;top:0px;left:20px;background:#08f;' +
			'width:2px;height:100%;display:none;z-index:999;'
		});
	vGuideLine.visible = false;
	editor.appendChild(vGuideLine);
	//build loader
	loader = $({
		'style': 'position:absolute;bottom:3px;right:10px;width:50px;' +
			'height:17px;background:url(' + path + 
			'/loader.gif) no-repeat;display:none;z-index:999;'
		});
	loader.visible = false;
	editor.appendChild(loader);

	//build editor resizer at the bottom
	editor.appendChild($({
		'style': 'position:absolute;bottom:0px;width:100%;height:10px;' +
			'cursor:s-resize;z-index:999;',
		event: {
			add: 'mousedown',
			fn: resizeEditorEvent
			}
		}));
	//format tree
	$(loader, 'show');
	waitForMediaIn(editor_area).then(function() {
		normalizeTree(editor_area);
		hasNormalized = true;
		console.log('wall0 > normalize complete');
		$(loader, 'hide');
	});
	setTimeout(function() {
		if (hasNormalized === false) {
			normalizeTree(editor_area);
			$(loader, 'hide');
			//console.log(editor_area,loader);
		}
	}, 3000);
	df.appendChild(editor);
	if (textarea.parentNode.childNodes.length > 1) {
		textarea.parentNode.insertBefore(df, textarea.nextSibling);
	} else {
		textarea.parentNode.appendChild(df);
	}
	$.addEvent(document, 'click', clickEvent);
	$.addEvent(document, 'dblclick', dbclickEvent);
	$.addEvent(document, 'mousedown', dragEvent);
	$.addEvent(document, 'keydown', keydownEvent);
	$.addEvent(document, 'submit', submitEvent);
	editorState = 'normal';
	history = history(100, actionHandle);
	guideline.addDataX(editor_area.offsetWidth / 2);
	guideline.addDataY(editor_area.offsetHeight / 2);
	console.log('wall0 > create instance for id:' + id, path);
	wall0.notify('init');
	textareaId = id;
	$(textarea, 'hide');
	return wall0;
};
/* Deconstruct editor to original textarea
 * @export
 * @param {void}
 * @return {void}
 */
wall0.destroy = function() {
	console.log('wall0 > destroy instance for id:' + textareaId);
	wall0.notify('destroy');
};
/* Event listener function
 * @export
 * @param {!string} eventName to assign a new custom event
 * @param {!function} callback to add
 * @return {void}
 */ 
wall0.listen = function(eventName, callback) {
	var len;

	if (typeof eventName === 'string') {
		if (typeof callback === 'function') {
			eventName = eventName.replace(/\s /ig, '');
			if (!fn[eventName]) {
				fn[eventName] = [];
			}
			len = fn[eventName].length;
			fn[eventName][len] = callback;
		} else if (!callback) {
			if (fn[eventName]) {
				delete fn[eventName];
			}
		}
	}
};
/* Event listener function
 * @export
 * @param {!string} eventName to assign a new custom event
 * @param {!function} callback to remove
 * @return {!bool}
 */
wall0.stop = function(eventName, callback) {
	if (eventName && typeof eventName === 'string' && callback) {
		var arrayFn = fn[eventName], index = arrayFn.indexOf(callback);
		fn[eventName] = arrayFn.slice(0, index).concat(arrayFn.slice(index+1))
		return true;
	}
	return false;
}
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
	restoreNormalState();
	return editor_area.outerHTML.replace('absolute','relative');
};
/* Function to insert text to editorState
 * @public
 * @param {!object}
 * @return {void}
 */
wall0.insertHTML = function(obj) {
	var returnNode;
	if (typeof obj === 'string') {
		if (/^<div[\S\D]*role=/i.test(obj)) {
			returnNode = $({'html': obj}).childNodes[0];
		} else {
			typeMedia = $.detectMedia(obj);

			if (typeMedia === 'media' || typeMedia === 'iframe') {
				obj = '<div style="width:100%;height:100%;position: absolute;"> </div>' + obj;
			}
			returnNode = $({'html': obj,'role': typeMedia,
					'style':'position:absolute;top:0px;left:0px;overflow:hidden;'
					});
			if (typeMedia === 'iframe') {
				$(loader, 'show');
				$.addEvent(returnNode.childNodes[1], 'load', onloaded);
			}
		}
		editor_area.appendChild(returnNode);
	} else if (obj && obj.outerHTML) {
		returnNode = $({'html': obj.outerHTML});
		normalizeTree(returnNode);
		editor_area.appendChild(returnNode.childNodes[0]);
	}
}
/* Function to register plugins
 * @public
 * @param {!string} pluginName
 * @param {!function} class of plugin
 * @return {void}
 */
wall0.register = function(pluginName, pluginClass) {
	if (plugins[pluginName]) {
		if (plugins[pluginName].destroy) {
			plugins[pluginName].destroy();
		}
	}
	plugins[pluginName] = new pluginClass(sandbox);
	if (plugins[pluginName].init) {
		wall0.listen('init', plugins[pluginName].init);
	}
	if (plugins[pluginName].destroy) {
		wall0.listen('destroy', plugins[pluginName].destroy);
	}
}
window.wall0 = wall0;
}(window));
