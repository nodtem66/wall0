/*
 * Javascript library (Additional Edition)
 * @original author Den Odell
 * @from Pro JavaScript RIA Techniques Best Practices, Performance, and Presentation
 */
var Jerboa = ( function(my) {
	my.lib = {};
	my.lib.env = {//{{{1
		ie : /MSIE/i.test(navigator.userAgent),
		ie6 : /MSIE 6/i.test(navigator.userAgent),
		ie7 : /MSIE 7/i.test(navigator.userAgent),
		ie8 : /MSIE 8/i.test(navigator.userAgent),
		firefox : /Firefox/i.test(navigator.userAgent),
		opera : /Opera/i.test(navigator.userAgent),
		webkit : /Webkit/i.test(navigator.userAgent),
		camino : /Camino/i.test(navigator.userAgent)
	};
	//}}}

	my.lib.onDomReady = function(callback) {//{{{1
		if(document.addEventListener) {
			//If Browser supports the DOMContentLoaded event
			document.addEventListener("DOMContentLoaded", callback, false);
		} else {
			//For IE
			if(document.body && document.body.lastChild) {
				callback();
			} else {
				//IE Hack
				setTimeout(function() {
					my.lib.onDomReady(callback);
				}, 50);
			}

		}
	};
	//}}}
	my.lib.addEvent = function(element, eventType, callback) {///{{{1
		eventType = eventType.toLowerCase();
		if(element.addEventListener) {
			element.addEventListener(eventType, callback, false);
		} else if(element.attachEvent) {
			element.attachEvent("on" + eventType, callback);
		}
	};
	// }}}
	my.lib.removeEvent = function(element, eventType, callback) {//{{{1
		eventType = eventType.toLowerCase();
		if(element.removeEventListener) {
			element.removeEventListener(eventType, callback, false);
		} else if(element.detachEvent) {
			element.detachEvent("on" + eventType, callback);
		}
	};
	//}}}
	my.lib.getEvent = function(event) {//{{{1
		if(event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}

		return {
			target : this.getTargetFromEvent(event),
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
	//}}}
	my.lib.getTargetFromEvent = function(event) {//{{{1
		var target = event.srcElement || event.target;
		if(target.nodeType == 3) {
			target = target.parentNode;
		}
		return target;
	};
	//}}}
	my.lib.getArrayOfClassNames = function(element) {//{{{1
		var classNames = [];
		if(element.className) {
			classNames = element.className.split(" ");
		}
		return classNames;
	};
	// }}}
	my.lib.addClass = function(element, className) {//{{{1
		var classNames = this.getArrayOfClassNames(element);
		classNames.push(className);
		element.className = classNames.join(" ");
	};
	//}}}
	my.lib.removeClass = function(element, className) {//{{{1
		var classNames = this.getArrayOfClassNames(element);
		var resultingClassNames = [];
		for(var index = 0; index < classNames.length; index++) {
			if(className != classNames[index]) {
				resultingClassNames.push(classNames[index]);
			}
		}
		element.className = resultingClassNames.join(" ");
	};
	//}}}
	my.lib.hasClass = function(element, className) {//{{{1
		var tester = new RegExp(className);
		return element.className && tester.test(element.className);
	};
	//}}}
	my.lib.getObjectOfStyle = function(element) {//{{{1
		var listStyle = element.getAttribute("style") || "", i = 0, len = 0, objectStyle = {}, cssValue = "";
		if(listStyle) {
			listStyle = listStyle.split(";");
			// example ["top:45px","left:67px",...]
			for( i = 0, len = listStyle.length; i < len; i++) {
				//each item = "top:45px"
				if(listStyle[i]) {
					cssValue = listStyle[i].split(":");
					if(cssValue.length == 2) {
						//Trim
						cssValue[0] = cssValue[0].replace(/^[\s]+/g, "");
						cssValue[1] = cssValue[1].replace(/^[\s]+/g, "");
						cssValue[0] = cssValue[0].replace(/[\s]+$/g, "");
						cssValue[1] = cssValue[1].replace(/[\s]+$/g, "");

						objectStyle[cssValue[0]] = cssValue[1];
					}
				}
			}

		}
		return objectStyle;
	};
	//}}}
	my.lib.setObjectOfStyle = function(element, objectStyle) {//{{{1
		var listStyle = "", item;
		for(item in objectStyle) {
			if(item.substr(0, 1) != "_") {
				listStyle = listStyle.concat(item + ":" + objectStyle[item] + ";");
			}
		}
		element.setAttribute("style", listStyle);
	};
	//}}}
	my.lib.addStyle = function(element, List) {//{{{1
		var objStyle = this.getObjectOfStyle(element), item;
		for(item in List) {
			if(item.substr(0, 1) != "_") {
				objStyle[item] = List[item];
			}
		}
		this.setObjectOfStyle(element, objStyle);
	};
	//}}}
	my.lib.removeStyle = function(element, List) {//{{{1
		var objStyle = this.getObjectOfStyle(element), i, len;
		for( i = 0, len = List.length; i < len; i++) {
			if(objStyle[List[i]]) {
				delete objStyle[List[i]];
			}
		}
		this.setObjectOfStyle(element, objStyle);
	};
	//}}}
	my.lib.setNode = function(element, List) {//{{{1
		if(arguments.length === 0) {
			return document.createElement("div");
		}
		if(arguments.length == 1) {
			List = arguments[0];
			element = document.createElement(List.tag || List.Tag || "div");
		}
		var listAttr = List.Attr || List.attr || {}, listEvent = List.event || List.Event || {};
		//example attr: {id: xxx,class: yyy}
		//example event: {add: click,fn: function1}

		//Add event <tag onclick="function1"></tag>
		if(listEvent.add) {
			this.addEvent(element, listEvent.add, listEvent.fn);
		} else if(listEvent.remove) {
			this.removeEvent(element, listEvent.remove, listEvent.fn);
		}
		//Add attribute <tag attr1="value"></tag>
		for(var key in listAttr) {
			if(key.substr(0, 1) != "_") {
				element.setAttribute(key, listAttr[key]);
			}
		}
		//Add innerHTML <tag>innerHTML</tag>
		if(List.html) {
			element.innerHTML = List.html;
		}

		return element;
	};
	//}}}
	my.lib.request = function(objSetting) {//{{{
		/*
		* Usage:
		* request({
		* url: "http://somewhere.com/somepage.php?key1=value",
		* method: "post",
		* somekey2: "somevalue2",
		* somekey3: "somevalue3",
		* lastkey: "lastvalue"
		* });
		*/

		//Build xhr objectStyle
		var xmlhttp = null, method = (objSetting.method) ? objSetting.method.toUpperCase() : "GET", url = objSetting.url, dataKey = "", dataToSend = "";
		delete objSetting.method;
		delete objSetting.url;
		if(window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
		}
		for(dataKey in objSetting) {
			if(dataKey.substr(0.1) != "_") {
				dataToSend += dataKey + "=" + objSetting[dataKey] + "&";
			}
		}
		dataToSend = dataToSend.substr(0, dataToSend.length - 1);
		if(method == "GET") {
			if(/\?/.test(url)) {
				url = url + "&" + dataToSend;
			} else {
				url = url + "?" + dataToSend;
			}
		}
		xmlhttp.open(method, encodeURI(url), true);
		xmlhttp.onreadystatechange = function() {
			if(xmlhttp.readyState == 4) {
				if(xmlhttp.status == 200) {
					//if(DEBUG) {console.log("Jerboa send complete");}
					alert("send");
				} else {
					//if(DEBUG) {console.log("Jerboa send fail");}
					alert("fail");
				}
			}

		};
		if(method == "POST") {
			xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
			xmlhttp.setRequestHeader("Content-length", dataToSend.split("&").length);
			xmlhttp.setRequestHeader("Connection", "close");
			xmlhttp.send(encodeURI(dataToSend));
		} else {
			xmlhttp.send();
		}

	};
	//}}}
	my.lib.detectMedia = function(element)//{{{1
	{
		//TODO: Detect another kind of media
		var listTextTag = {
			"p" : 1,
			"span" : 1,
			"div" : 1
		}, listMediaTag = {
			"object" : 1,
			"embed" : 1,
			"video" : 1
		};
		if( typeof element === "object") {
			if(element.nodeName.toLowerCase() == "div" && element.getAttribute("role")) {
				return element.getAttribute("role");
			} else if(element.nodeName.toLowerCase() == "img") {
				return "image";
			} else if(listMediaTag[element.nodeName.toLowerCase()] || element.getAttribute("class") == "jb-media-touch") {
				return "media";
			} else if(element.nodeName.toLowerCase() == "iframe") {
				return "iframe";
			} else {
				return "text";
			}
		} else if( typeof element === "string") {
			if(/^<img/i.test(element)) {
				return "image";
			} else if(/^<iframe/.test(element)) {
				return "iframe";
			} else {
				for(var i in listMediaTag) {
					if((new RegExp("^<" + i)).test(element)) {
						return "media";
					}
				}
			}
			return "text";
		}
	};
	//}}}
	/*Bind function {{{1
	 @author Nodtem66
	 @param
	 callback- [Function] function to call
	 scope	- [Object] value of "this" variable when call function
	 useThrottle - [Number] delay to run function
	 @return
	 Anomymous function

	 How to use :
	 1. Change scope of variables
	 2. Setting Static arguments
	 3. Limit speed to repeat the function :Prevent to Old Browser (such as IE) crash.

	 Example :
	 1.1 Change scope to "Jerboa" Object
	 lib.curry(function,Jerboa,false)
	 1.2 Change scope to "window" Object
	 lib.curry(function,window,false)
	 1.3 use default scope
	 lib.curry(function,null,false)
	 2. function foo(a,b,c) { alert(a+b-c); }
	 2.1 bar = lib.curry(foo,null,false,5)
	 bar(6,1)=> 10 (from 5+6-1)
	 2.2 bar = lib.curry(foo,null,false,5,8)
	 bar(9)	=>	4  (from 5+8-9)
	 3.1 Limit in 100 msec can run function in 1 time.
	 lib.curry(function,null,100)
	 3.2 Limit in 1000 msec can run function in 1 time.
	 lib.curry(function,null,1000)
	 3.3 No limit
	 lib.curry(function,null,0) OR lib.curry(function,null,false)
	 */
	my.lib.curry = function(callback, scope, useThrottle) {
		var _scope = scope || window, argsStatic = Array.prototype.slice.call(arguments, 3);
		if(useThrottle) {
			return function() {
				var argsDynamic = arguments;
				clearTimeout(callback.tId);
				callback.tId = setTimeout(function() {
					callback.apply(_scope, argsStatic.concat(Array.prototype.slice.call(argsDynamic, 0)));
				}, useThrottle);
			};
		} else {
			return function() {
				callback.apply(scope, argsStatic.concat(Array.prototype.slice.call(arguments, 0)));
			};
		}
	};
	//}}}

	return my;
}(Jerboa || {}));
//}}}
/*
 * Jerboa core
 * version: 0.001
 * @Author Jirawat Iamsam-ang
 */
var Jerboa = ( function(my) {
	var Interface = function(_name, _array) {//{{{ Interface function
		this.name = _name;
		this.methods = [];
		for(var i = 0, len = _array.length; i < len; i++) {
			if( typeof _array[i] !== "string") {
				throw new Error("Interface Error: Method names should be string.");
			}
			this.methods.push(_array[i]);
		}
	};
	function hasImplements(_object) {
		//var _interface,i,j,arglen;
		if(arguments.length < 2) {
			throw new Error("hasImplement Error: Please use hasImplement(Object, Interface1 [, Interface2, ...])");
		}
		for(var i = 1, arglen = arguments.length, j, intflen; i < arglen; i++) {
			var _interface = arguments[i];
			for( j = 0, intflen = _interface.methods.length; j < intflen; j++) {
				var _method = _interface.methods[j];
				if(!_object[_method]) {
					throw new Error("hasImplement Error: object did not implement " + _interface.name + " interface. Method " + _method + " was not found.");
				}
			}
		}
	}

	function extend(subclass, superclass) {
		var F = function() {
		};
		F.prototype = superclass.prototype;
		subclass.prototype = new F();
		subclass.prototype.constructor = subclass;
	}

	//}}}
	//{{{ Define Class
	var Panel = function(rawPanelName) {//{{{2
		var node, childs = {}, panelName = rawPanelName.toLowerCase();
		if(usedModule[panelName]) {
			throw new Error("Module " + panelName + " have been used");
		}
		node = lib.setNode({
			attr : {
				id : "jb-" + panelName.toLowerCase(),
				"class" : "jb-panel jb-ignore hide"
			}
		});
		usedModule[panelName.toLowerCase()] = true;
		this.getElement = function() {
			return node;
		};
		this.add = function(menuObject) {
			node.appendChild(menuObject.getElement());
			childs[menuObject.name] = menuObject;
			return node.children.length - 1;
		};
		this.remove = function(childId) {
			node.removeChild(this.getChild(childId));
		};
		this.getChild = function(childName) {
			if(childName) {
				return childs[childName];
			}
		};
		this.show = function() {
			if(lib.hasClass(node, "hide")) {
				lib.removeClass(node, "hide");
			}
		};
		this.hide = function() {
			if(!lib.hasClass(node, "hide")) {
				lib.addClass(node, "hide");
			}
		};
	};
	//}}}
	var Stage = function(eleTextArea) {//{{{2
		var textHTML = "", stage = null, layer = [], node, screen = {}, old_content, stageHeight = config.height || eleTextArea.offsetHeight, stageWidth = config.width || eleTextArea.offsetWidth;
		if(eleTextArea.nodeName.toLowerCase() == "textarea") {
			textHTML = eleTextArea.value.replace(/&lt;/ig, "<").replace(/&gt;/ig, ">");
			stage = lib.setNode({
				attr : {
					id : "jb-stage"
				},
				html : textHTML
			});
		} else {
			stage = eleTextArea;
			mode = "native";
		}
		// Detect Save file
		if(stage.children[0] && stage.children[0].className == "jb-ignore") {
			node = stage.children[0];
			old_content = node.innerHTML;
		} else {
			node = lib.setNode({
				tag : "div",
				attr : {
					"class" : "jb-ignore",
					"style" : "position:relative;top:0;left:0;padding:0;width:" + stageWidth + "px;height:" + stageHeight + "px;overflow:hidden;"
				}
			});
			old_content = stage.innerHTML;
			stage.innerHTML = "";
			stage.appendChild(node);
		}

		//construct Layer
		if(node.children[0] && lib.hasClass(node.children[0], "jb-layer")) {
			layer.push(node.children[0]);
		} else {
			layer.push(lib.setNode({
				attr : {
					"index" : 0,
					"class" : "jb-layer jb-ignore",
					"style" : "position:absolute;top:0;left:0;width:100%;height:100%;z-index:2000;"
				},
				html : old_content
			}));
			node.appendChild(layer[0]);
		}
		//Public method
		this.currentEditingNode = "";
		this.currentState = "";
		this.getElement = function() {
			return stage;
		};
		this.getLayer = function() {
			return layer[0];
		};
		this.setHeight = function(height) {
			lib.addStyle(node, {
				"height" : height + "px"
			});
		};
		this.autoHeight = function() {
			var height = 0, i;
			for( i = 0, len = layer[0].children.length; i < len; i++) {
				height += layer[0].children[i].offsetHeight;
			}
			//if(DEBUG) {console.log("Page height: "+height);}
			height = (height > 300) ? height : 300;
			this.setHeight(height);
			if(mode == "editor") {
				ui.option.setValue([height, 0, 0]);
			}
		};
		this.normalizeTree = function(_root) {// {{{3
			if(!_root) {
				return "";
			}
			var queue = [], queue2 = [], i, j, len2, len, currentNode, flagFloor1 = true, tempNode2, tempNode, newTree = _root.cloneNode(true);
			queue.push(newTree);
			queue2.push(_root);
			while(queue.length > 0) {
				currentNode = queue.pop();
				currentNode2 = queue2.pop();
				if(currentNode.childNodes.length === 0) {
					continue;
				}
				for( i = 0, j = 0, len2 = currentNode2.childNodes.length, len = currentNode.childNodes.length; i < len && j < len2; i++, j++) {
					if(currentNode.childNodes[i].nodeName != "#text" && currentNode.childNodes[i].nodeName != "#comment") {
						if(currentNode.childNodes[i].getAttribute("role")) {
							continue;
						}
						switch(lib.detectMedia(currentNode.childNodes[i])) {
							case "image":
								if(!flagFloor1 && currentNode.childNodes.length == 1) {
									tempNode = currentNode;
									while(tempNode.parentNode.childNodes.length == 1 && !lib.hasClass(tempNode.parentNode, "jb-ignore")) {
										tempNode = tempNode.parentNode;
									}
									tempNode2 = currentNode.childNodes[i].cloneNode(true);
									tempNode2 = lib.setNode({
										tag : "div",
										attr : {
											"role" : "image",
											"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
										}
									}).appendChild(tempNode2).parentNode;
									newTree.appendChild(tempNode2);
									tempNode.parentNode.removeChild(tempNode);
								} else {
									//move this element to root Element
									tempNode = currentNode.childNodes[i].cloneNode(true);
									tempNode = lib.setNode({
										tag : "div",
										attr : {
											"role" : "image",
											"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
										}
									}).appendChild(tempNode).parentNode;
									newTree.appendChild(tempNode);
									currentNode.removeChild(currentNode.childNodes[i]);
									i--;
									len--;
								}
								break;
							case "iframe":
								if(!flagFloor1 && currentNode.childNodes.length == 1) {
									tempNode = currentNode;
									while(tempNode.parentNode.childNodes.length == 1 && !tempNode.parentNode.getAttribute("index")) {
										tempNode = tempNode.parentNode;
									}
									tempNode2 = currentNode.childNodes[i].cloneNode(true);
									tempNode2 = lib.setNode({
										tag : "div",
										attr : {
											"role" : "iframe",
											"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
										},
										html : "<div class=\"jb-media-touch\">&#160;</div>"
									}).appendChild(tempNode2).parentNode;
									newTree.appendChild(tempNode2);
									tempNode.parentNode.removeChild(tempNode);
								} else {
									//move this element to root element
									tempNode = currentNode.childNodes[i].cloneNode(true);
									tempNode = lib.setNode({
										tag : "div",
										attr : {
											"role" : "iframe",
											"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
										},
										html : "<div class=\"jb-media-touch\">&#160;</div>"
									}).appendChild(tempNode).parentNode;
									newTree.appendChild(tempNode);
									currentNode.removeChild(currentNode.childNodes[i]);
									i--;
									len--;
								}
								break;
							case "media":
								if(!flagFloor1 && currentNode.childNodes.length == 1) {
									tempNode = currentNode;
									while(tempNode.parentNode.childNodes.length == 1 && !tempNode.parentNode.getAttribute("index")) {
										tempNode = tempNode.parentNode;
									}
									tempNode2 = currentNode.childNodes[i].cloneNode(true);
									tempNode2 = lib.setNode({
										tag : "div",
										attr : {
											"role" : "media",
											"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
										},
										html : "<div class=\"jb-media-touch\">&#160;</div>"
									}).appendChild(tempNode2).parentNode;
									newTree.appendChild(tempNode2);
									tempNode.parentNode.removeChild(tempNode);
									if(tempNode2.childNodes[1].nodeName.toLowerCase() == "object") {
										tempNode2.childNodes[1].insertBefore(lib.setNode({
											tag : "param",
											attr : {
												"name" : "wmode",
												"value" : "opaque"
											}
										}), tempNode.childNodes[1].childNodes[0]);
										tempNode2.childNodes[1].lastChild.setAttribute("wmode", "opaque");
									}
								} else {
									//move this element to root element
									tempNode = currentNode.childNodes[i].cloneNode(true);
									tempNode = lib.setNode({
										tag : "div",
										attr : {
											"role" : "media",
											"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
										},
										html : "<div class=\"jb-media-touch\">&#160;</div>"
									}).appendChild(tempNode).parentNode;
									if(tempNode.childNodes[1].nodeName.toLowerCase() == "object") {
										tempNode.childNodes[1].insertBefore(lib.setNode({
											tag : "param",
											attr : {
												"name" : "wmode",
												"value" : "opaque"
											}
										}), tempNode.childNodes[1].childNodes[0]);
										tempNode.childNodes[1].lastChild.setAttribute("wmode", "opaque");
									}
									newTree.appendChild(tempNode);
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
									if(currentNode.childNodes[i].nodeName.toLowerCase() != "div") {
										tempNode = currentNode.childNodes[i].cloneNode(true);
										tempNode = lib.setNode().appendChild(tempNode).parentNode;
										tempNode = lib.setNode({
											tag : "div",
											attr : {
												"role" : "text",
												"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
											}
										}).appendChild(tempNode).parentNode;
										if(newTree.childNodes.length === 0) {
											newTree.appendChild(tempNode);
										} else {
											newTree.insertBefore(tempNode, newTree.childNodes[i]);
											newTree.removeChild(newTree.childNodes[i + 1]);
										}
									} else {
										lib.setNode(newTree.childNodes[i], {
											attr : {
												"role" : "text",
												"style" : "position:absolute;top:" + currentNode2.childNodes[j].offsetTop + "px;left:" + currentNode2.childNodes[j].offsetLeft + "px;overflow:hidden;"
											}
										});
									}
								}
								queue.push(currentNode.childNodes[i]);
								queue2.push(currentNode2.childNodes[j]);
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
				if(newTree.childNodes[i].nodeName == "#text") {
					if(/[\S]/ig.test(newTree.childNodes[i].nodeValue)) {
						tempNode = lib.setNode({
							tag : "div",
							attr : {
								"role" : "text",
								"style" : "position:absolute;top:" + newTree.childNodes[i].offsetTop + "px;left:" + newTree.childNodes[i].offsetLeft + "px;"
							},
							html : "<div>" + newTree.childNodes[i].nodeValue + "</div>"
						});
						newTree.removeChild(newTree.childNodes[i]);
						newTree.appendChild(tempNode);
					} else {
						newTree.removeChild(newTree.childNodes[i]);
						len--;
					}
					i--;
					continue;
				}
				lib.addStyle(newTree.childNodes[i], {
					"position" : "absolute",
					"overflow" : "hidden",
					"padding" : 0,
					"margin" : 0,
					"display" : "inline-block"
				});
			}

			_root.innerHTML = newTree.innerHTML;
			return true;
		};
		//}}}
		var self = this;
		setTimeout(function() {
			self.autoHeight();
			self.normalizeTree(layer[0]);
			history.save(layer[0].innerHTML);
		}, 100);
	};
	//}}}
	var History = function(rawSize, callback) {//{{{2
		var circularList = [], self = this, index = -1, flen = 0, blen = 0, enable = true;
		size = rawSize || 10;
		this.save = function(data) {
			if(!enable) {
				return false;
			}
			if(blen != size) {
				blen++;
			}
			index = (index + 1) % size;
			flen = 1;
			circularList[index] = data;
			//if(DEBUG) {console.log("history: save");}

		};
		this.undo = function() {
			if(!enable) {
				return false;
			}
			if(blen - 1 > 0) {
				index = (index - 1 >= 0) ? index - 1 : size - 1;
				blen--;
				flen++;
				callback(circularList[index]);
				//if(DEBUG) {console.log("history: undo");}
				//if(DEBUG) console.log("("+circularList[index]+")",blen,index,flen);
			}
		};
		this.redo = function() {
			if(!enable) {
				return false;
			}
			if(flen - 1 > 0) {
				index = (index + 1) % size;
				blen++;
				flen--;
				callback(circularList[index]);
				//if(DEBUG) {console.log("history: redo");}
				//if(DEBUG) console.log("("+circularList[index]+")",blen,index,flen);
			}
		};
		this.clear = function() {
			circularList = [];
			flen = 0;
			blen = 0;
			index = -1;
		};
		this.freeze = function(msec) {
			enable = false;
		};
		this.unfreeze = function() {
			enable = true;
		};
	};
	//}}}
	var BoxManager = function() {//{{{2
		var node = lib.setNode({
			attr : {
				id : "jb-box",
				"class" : "jb-ignore hide"
			}
		}), childrenBox = {}, currentBox = "";
		this.getElement = function() {
			return node;
		};
		this.add = function(objBox) {
			hasImplements(objBox, BoxInterface);
			childrenBox[objBox.name] = objBox;
			node.appendChild(objBox.getElement());
		};
		this.remove = function(nameBox) {
			if(childrenBox[nameBox]) {
				node.removeChild(childrenBox[nameBox]);
				delete childrenBox[nameBox];
			}
		};
		this.getBox = function(nameBox) {
			if(childrenBox[nameBox]) {
				return childrenBox[nameBox];
			}
		};
		this.show = function(nameBox) {
			currentBox = nameBox;
			lib.removeClass(node, "hide");
			lib.removeClass(childrenBox[nameBox].getElement(), "hide");
			var boxTop = Math.min(document.body.clientHeight, document.documentElement.clientHeight), boxLeft = Math.min(document.body.clientWidth, document.documentElement.clientWidth);
			boxTop = (boxTop - node.offsetHeight > 0) ? (boxTop - node.offsetHeight) / 2 : 0;
			boxLeft = (boxLeft - node.offsetWidth > 0) ? (boxLeft - node.offsetWidth) / 2 : 0;
			lib.setNode(node, {
				attr : {
					"style" : "top:" + boxTop + "px;left:" + boxLeft + "px;"
				}
			});
		};
		this.hide = function() {
			lib.addClass(node, "hide");
			lib.addClass(childrenBox[currentBox].getElement(), "hide");
		};
	};
	//}}}
	var Box = function(name) {//{{{2
		if(!name) {
			throw new Error("name of Box missing");
		}
		name = name.toLowerCase();
		var node = lib.setNode({
			attr : {
				id : "jb-" + name,
				"class" : "jb-ignore hide"
			}
		}), children = [];
		this.name = name;
		this.getElement = function() {
			return node;
		};
		this.getValue = function() {
			var returnValue = [];
			for(var i = 0, len = children.length; i < len; i++) {
				returnValue.push(children[i].getValue());
			}
			return returnValue;
		};
		this.setValue = function(_array) {
			if(_array.length == children.length) {
				for(var i = 0, len = _array.length; i < len; i++) {
					children[i].setValue(_array[i]);
				}
			}
		};
		this.add = function(objUI) {
			children.push(objUI);
			node.appendChild(objUI.getElement());
			return children[children.length - 1];
		};
		this.remove = function(indexUI) {
			if(children[indexUI]) {
				node.removeChild(children[indexUI]);
				delete children[indexUI];
			}
		};
	};
	//}}}
	var Button = function(label, name, className) {//{{{2
		var node = lib.setNode({
			attr : {
				"class" : "jb-button jb-ignore " + ((className) ? className : "")
			},
			html : label,
			event : {
				add : "click",
				fn : function(e) {
					sandbox.notify("click-button-" + name, e);
				}
			}
		});
		this.name = name;
		this.getValue = function() {
			return label;
		};
		this.setValue = function(name) {
			lib.setNode(node, {
				html : name
			});
		};
		this.getElement = function() {
			return node;
		};
	};
	//}}}
	var FlipSwitch = function(label, className) {//{{{2
		var wrapper = lib.setNode({
			attr : {
				"class" : "jb-flipswitch jb-ignore"
			}
		}), node = lib.setNode({
			attr : {
				"class" : "jb-button jerboa-ignore"
			}
		}), switchOn = lib.setNode({
			attr : {
				"class" : "hide"
			},
			html : "on"
		}), switchOff = lib.setNode({
			html : "off"
		}), labelnode = lib.setNode({
			tag : "label",
			attr : {
				"class" : "jb-ignore"
			},
			html : label
		}), value = false;
		wrapper.appendChild(labelnode);
		wrapper.appendChild(node);
		node.appendChild(switchOn);
		node.appendChild(switchOff);
		this.name = label;
		this.toggle = function(e) {
			if(e) {
				lib.getEvent(e).preventDefault();
			}
			if(value) {
				value = false;
				lib.removeClass(switchOff, "hide");
				lib.addClass(switchOn, "hide");
			} else {
				value = true;
				lib.removeClass(switchOn, "hide");
				lib.addClass(switchOff, "hide");
			}
			sandbox.notify("click-flipswitch-" + label, value);
		};
		this.getElement = function() {
			return wrapper;
		};
		this.getValue = function() {
			return value;
		};
		this.setValue = function(_value) {
			if(value != _value) {
				this.toggle();
			}
		};
		lib.setNode(node, {
			event : {
				add : "mousedown",
				fn : lib.curry(this.toggle, this)
			}
		});
	};
	//}}}
	var HLine = function(className) {//{{{2
		var node = lib.setNode({
			attr : {
				"class" : "hline " + ((className) ? className : "")
			}
		});
		this.name = "jb-hline" + Date();
		this.getElement = function() {
			return node;
		};
		this.getValue = function() {
			return "";
		};
		this.setValue = function() {
		};
	};
	//}}}
	var TextField = function(label, text, className) {//{{{2
		var wrapper = lib.setNode(), node = lib.setNode({
			tag : "input",
			attr : {
				"value" : (text) ? text : "",
				"type" : "text",
				"class" : (className) ? className : ""
			}
		}), labelnode = lib.setNode({
			tag : "label",
			html : label
		});
		wrapper.appendChild(labelnode);
		wrapper.appendChild(node);
		this.name = label;
		this.setClass = function(className) {
			lib.setNode(node, {
				attr : {
					"class" : className
				}
			});
		};
		this.getValue = function() {
			return node.value;
		};
		this.setValue = function(value) {
			node.value = value;
		};
		this.getElement = function() {
			return wrapper;
		};
	};
	//}}}
	var TextArea = function(label, text, className) {//{{{2
		var wrapper = lib.setNode(), node = lib.setNode({
			tag : "textarea",
			attr : {
				"class" : (className) ? className : ""
			},
			html : (text) ? text : ""
		}), labelnode = lib.setNode({
			tag : "label",
			html : label
		});
		wrapper.appendChild(labelnode);
		wrapper.appendChild(node);
		this.name = label;
		this.setClass = function(className) {
			lib.setNode(node, {
				attr : {
					"class" : className
				}
			});
		};
		this.getValue = function() {
			return node.innerHTML;
		};
		this.setValue = function(value) {
			node.innerHTML = value;
		};
		this.getElement = function() {
			return wrapper;
		};
	};
	//}}}
	var SelectBox = function(label, arrayData, styleMain, styleDropdown, className) {//{{{2
		label = label || "selectbox";
		className = className && " " + className || "";
		var node = lib.setNode({
			attr : {
				"class" : "jb-selectbox" + className,
				style : styleMain
			},
			html : "<span>" + label + "</span>"
		}), dropdownNode = lib.setNode({
			attr : {
				"class" : "hide",
				style : styleDropdown
			}
		}), value = "", self = this;
		if(arrayData) {
			for(var i = 0, len = arrayData.length; i < len; i++) {
				dropdownNode.appendChild(lib.setNode({
					tag : "span",
					html : arrayData[i]
				}));
			}
			node.appendChild(dropdownNode);
		}
		this.name = label;
		this.getElement = function() {
			return node;
		};
		this.toggle = function() {
			if(lib.hasClass(dropdownNode, "hide")) {
				lib.removeClass(dropdownNode, "hide");
			} else {
				lib.addClass(dropdownNode, "hide");
			}
		};
		this.getValue = function() {
			return _value;
		};
		this.setValue = function(data) {
			_value = data;
			sandbox.notify("change-selectbox-" + label, data);
		};
		lib.setNode(node, {
			event : {
				add : "mousedown",
				fn : function(e) {
					var event = lib.getEvent(e);
					event.preventDefault();
					self.toggle();
					if(event.target.innerHTML != label) {
						self.setValue(event.target.innerHTML);
					}
				}
			}
		});
	};
	//}}}
	var Input = function(config) {//{{{2
		if(!config) {
			throw new Error("Using UI({....})");
		}
		var typeUI = config.type.toLowerCase() || "button", randomNum = new Date().getTime(), className = config["class"] || config.align;
		switch(typeUI) {
			case "button":
				return new Button(config.label || "button", config.name || "button" + randomNum, className);
			case "flipswitch":
				return new FlipSwitch(config.label || "FlipSwitch", className);
			case "textfield":
				return new TextField(config.label || "TextField", config.text || config.value, className);
			case "textarea":
				return new TextArea(config.label || "TextArea", config.text || config.value, className);
			case "hline":
				return new HLine(className);
			case "selectbox":
				return new SelectBox(config.label, config.text || config.value, config.styleMain, config.styleDropdown, className);
			default:
				throw new Error("check \"type\" in UI({....})");
		}
	};
	//}}}
	var SandBox = function() {//{{{2
		var events = {};
		this.lib = lib;
		this.Class = function(nameClass) {
			var allowClass = {
				"Panel" : 1,
				"Button" : 1,
				"FlipSwitch" : 1,
				"Hline" : 1,
				"TextField" : 1,
				"TextArea" : 1,
				"History" : 1,
				"Input" : 1
			};
			if(!allowClass[nameClass]) {
				throw new Error("sandbox: not found " + nameClass + " in Class");
			}
			return eval(nameClass);
		};
		this.getPath = function() {
			return path;
		};
		this.getHistory = function() {
			return history;
		};
		this.getStage = function() {
			return stage;
		};
		this.getUI = function(nameUI) {
			if(!ui[nameUI]) {
				throw new Error("sandbox: not found " + nameUI + " in UI");
			}
			return ui[nameUI];
		};
		this.addPanel = function(namePanel) {
			var panelObject = new Panel(namePanel);
			ui.panelbar.appendChild(panelObject.getElement());
			return panelObject;
		};
		this.notify = function(eventName, eventData) {
			var data = eventName.split("-"), i, len;
			data = {
				"event" : data[0] || "",
				"subevent" : data[1] || "",
				"name" : data[2] || "",
				"data" : eventData
			};
			if(events[eventName]) {
				for( i = 0, len = events[eventName].length; i < len; i++) {
					events[eventName][i](data);
				}
			}
			if(events[data.event + "-" + data.ui]) {
				for( i = 0, len = events[data.event + "-" + data.ui].length; i < len; i++) {
					events[data.event+"-"+data.ui][i](data);
				}
			}
			if(events[data.event]) {
				for( i = 0, len = events[data.event].length; i < len; i++) {
					events[data.event][i](data);
				}
			}
			//if(DEBUG) {console.log(eventName);}
		};
		this.listen = function(arrayEventName, callback, scope) {
			if( typeof arrayEventName === "string") {
				if(!events[arrayEventName]) {
					events[arrayEventName] = [];
				}
				events[arrayEventName].push(lib.curry(callback, scope));
			}
			for(var i = 0, len = arrayEventName.length; i < len; i++) {
				if(!events[arrayEventName[i]]) {
					events[arrayEventName[i]] = [];
				}
				events[arrayEventName[i]].push(lib.curry(callback, scope));
			}
		};
		this.hasModule = function(nameModule) {
			if(modules[nameModule]) {
				return true;
			}
			return false;
		};
		this.insertHTML = function(html) {
			var returnNode;
			if(/^<div role/i.test(html)) {
				returnNode = lib.setNode({html:html}).children[0];
			} else {
				typeMedia = lib.detectMedia(html);
				if(typeMedia == "media" || typeMedia == "iframe") {
					html = "<div class=\"jb-media-touch\"> </div>" + html;
				}
				returnNode = lib.setNode({
					html : html,
					attr : {
						"role" : typeMedia,
						"style" : "position:absolute;top:0px;left:0px;overflow:hidden;"
					}
				});
			}
			stage.getLayer().appendChild(returnNode);
		};
	};
	//}}}
	//}}}
	//{{{ Private members
	var Library = new Interface("Library", ["onDomReady", "addEvent", "removeEvent", "getEvent", "addClass", "removeClass", "hasClass", "addStyle", "removeStyle", "setNode", "curry", "request", "detectMedia"]), //{{{2
	Module = new Interface("Module", ["init", "destroy"]), BoxInterface = new Interface("Box", ["add", "remove", "getValue", "setValue", "getElement", "name"]), UI = new Interface("UI", ["getValue", "setValue", "name"]);
	hasImplements(my.lib, Library);
	//}}}
	var lib = my.lib;
	delete my.lib;
	//{{{2
	var path = my.path;
	delete my.path;
	//var DEBUG = true;
	var usedModule = {}, ui = {}, config = {}, modules = {}, stage = null, textarea = null, cache = {}, box = new BoxManager(), history = new History(10, function(data) {
		stage.getLayer().innerHTML = data;
	}), sandbox = new SandBox(), mode = "editor";
	//}}}
	//}}}
	//{{{ Public members
	my.version = 0.001;
	//}}}
	my.register = function(moduleName, moduleCreator) {//{{{
		var moduleObject = new moduleCreator(sandbox);
		hasImplements(moduleObject, Module);
		moduleName = moduleName.toLowerCase();
		if(modules[moduleName]) {
			throw new Error("Duplicate Module: " + moduleName);
		}
		modules[moduleName] = moduleObject;
		if(ui.core) {
			modules[moduleName].init(config[moduleName]);
		}
	};
	for(var i = 0, len = my.tempRegister.length; i < len; i++) {
		my.register.apply(null, my.tempRegister[i]);
	}
	delete my.tempRegister;
	//}}}
	my.apply = function(domId, _config) {//{{{
		var _;
		if(!( _ = document.getElementById(domId))) {
			return false;
		}
		textarea = _;
		if(_config) {
			config = _config;
		}
		init();
	};
	//}}}
	my.dismiss = function() {//{{{
		destroy();
		history.clear();
		mode = "editor";
		usedModule = {};
		ui = {};
		config = {};
		modules = {};
		stage = null;
		textarea = null;
		cache = {};
	};
	//}}}
	my.getContent = function() {//{{{
		var returnHTML = "";
		returnHTML = stage.getElement().innerHTML;
		return returnHTML;
	};
	//}}}
	var startModule = function(moduleName) {//{{{
		if(!modules[moduleName]) {
			throw new Error("Not Found " + moduleName + " Module");
		}
		modules[moduleName].init();
	};
	//}}}
	var stopModule = function(moduleName) {//{{{
		if(!modules[moduleName]) {
			throw new Error("Not found " + moduleName + " Module");
		}
		modules[moduleName].destroy();
	};
	//}}}
	var touch = function(e) {//{{{
		//Controller of resize and drag element
		var data = cache, event = lib.getEvent(e), sizeBorder = 1;
		//px
		if(stage.currentState != "textedit") {
			event.preventDefault();
		}
		if(e.type == "mousedown") {
			if(stage.currentState != "textedit" || (e.shiftKey)) {
				event.preventDefault();
				data.x = e.pageX;
				data.y = e.pageY;
				data.isMove = false;
				lib.addEvent(document, "mousemove", touch);
				lib.addEvent(document, "mouseup", touch);
			}
		} else if(e.type == "mousemove") {
			data.isMove = true;
			if(e.shiftKey) {
				data.root_w += e.pageX - data.x;
				data.root_h += e.pageY - data.y;
			} else if(/move$/i.test(stage.currentState)) {
				data.root_left += e.pageX - data.x;
				data.root_top += e.pageY - data.y;
			}
			if(data.root_top + data.root_h + 2 * sizeBorder > data.screen_h) {
				if(e.shiftKey) {
					data.root_h = data.screen_h - data.root_top - (2 * sizeBorder);
				} else {
					data.root_top -= e.pageY - data.y;
				}
			} else if(data.root_top < 0) {
				data.root_top -= e.pageY - data.y;
			}
			if(data.root_left + data.root_w + 2 * sizeBorder > data.screen_w) {
				if(e.shiftKey) {
					data.root_w = data.screen_w - data.root_left - (2 * sizeBorder);
				} else {
					data.root_left -= e.pageX - data.x;
				}
			} else if(data.root_left < 0) {
				data.root_left -= e.pageX - data.x;
			}

			if(e.shiftKey) {
				lib.addStyle(stage.currentEditingNode, {
					width : data.root_w + "px",
					height : data.root_h + "px"
				});
				if(/^image/i.test(stage.currentState)) {
					lib.addStyle(stage.currentEditingNode.children[0], {
						width : data.root_w + "px",
						height : data.root_h + "px"
					});
				} else if(/^media/i.test(stage.currentState) && stage.currentEditingNode.children.length >= 2) {
					lib.addStyle(stage.currentEditingNode.children[1], {
						width : data.root_w + "px",
						height : data.root_h + "px"
					});
					lib.setNode(stage.currentEditingNode.children[1], {
						attr : {
							width : data.root_w,
							height : data.root_h
						}
					});
					lib.addStyle(stage.currentEditingNode.getElementsByTagName("embed")[0], {
						width : data.root_w + "px",
						height : data.root_h + "px"
					});
				} else if(/^iframe/i.test(stage.currentState)) {
					lib.setNode(stage.currentEditingNode.children[1], {
						attr : {
							width : data.root_w,
							height : data.root_h
						}
					});
					lib.addStyle(stage.currentEditingNode.children[1], {
						width : data.root_w + "px",
						height : data.root_h + "px"
					});
				}
			} else if(/move$/i.test(stage.currentState)) {
				lib.addStyle(stage.currentEditingNode, {
					top : data.root_top + "px",
					left : data.root_left + "px"
				});
			}
			data.x = e.pageX;
			data.y = e.pageY;

		} else if(e.type == "mouseup") {
			if(data.isMove) {
				history.save(stage.getLayer().innerHTML);
			}
			lib.removeEvent(document, "mousemove", touch);
			lib.removeEvent(document, "mouseup", touch);
		}

	};
	//}}}
	var restoreNormalState = function()//{{{
	{
		if(!stage.currentState) {
			var childNode = stage.getLayer().children;
			for(var i = 0, len = childNode.length; i < len; i++) {
				if(lib.hasClass(childNode[i], "jb-touch")) {
					lib.removeClass(childNode[i], "jb-touch");
				}
			}
			return false;
		}
		lib.removeClass(stage.currentEditingNode, "jb-touch");
		lib.removeEvent(stage.currentEditingNode, "mousedown", touch);
		switch(stage.currentState) {
			case "textmove":
				break;
			case "textedit":
				var textNode = stage.currentEditingNode.children[0];
				textNode.setAttribute("contenteditable", "false");
				textNode.blur();
				window.getSelection().removeAllRanges();
				history.save(stage.getLayer().innerHTML);
				//Jerboa.toggle.menu.call(Jerboa,"text");
				break;
			case "imagemove":
				break;
			case "imageedit":
				break;
			default:
				break;
		}
		stage.currentEditingNode = null;
		stage.currentState = "";
		sandbox.notify("restorestate");
	};
	//}}}
	var click = function(e) {//{{{
		var event = lib.getEvent(e), mediaType = "", tempStageStage = null, exit = false;
		if(event.target.nodeName.toLowerCase() == "html") {restoreNormalState();
			return false;
		}
		if(stage.currentState == "textedit") {
			if(lib.hasClass(event.target, "jb-ignore")) {
				restoreNormalState();
			}
		}
		if(!lib.hasClass(event.target, "jb-ignore")) {
			//TODO: Detect another kind of media
			var _root = event.target;
			if(!_root.parentNode) {
				exit = true;
			} else {
				while(!(_root.parentNode.getAttribute("class") && lib.hasClass(_root.parentNode, "jb-ignore"))) {
					if(_root.parentNode.nodeName && _root.parentNode.getAttribute("id") == "jb-a") {
						restoreNormalState();
						event.preventDefault();
						return false;
					}
					if(!_root.parentNode.nodeName || _root.parentNode.nodeName.toLowerCase() == "html" || _root.parentNode.nodeName.toLowerCase() == "body") {
						restoreNormalState();
						exit = true;
						break;
					}
					_root = _root.parentNode;
					if(!_root.parentNode) {
						restoreNormalState();
						exit = true;
						break;
					}
				}
			}
			if(!exit) {
				event.preventDefault();
			}
			if(!_root.parentNode.getAttribute("index")) {
				return false;
			}
			if(stage.currentEditingNode == _root) {
				return false;
			}
			if(!exit) {
				if(stage.currentEditingNode !== null) {restoreNormalState();
				}
				mediaType = lib.detectMedia(_root);
				stage.currentEditingNode = _root;
				lib.addClass(_root, "jb-touch");
				lib.addEvent(_root, "mousedown", touch);
				stage.currentState = mediaType + "move";
				sandbox.notify(mediaType + "move");
				tempStage = stage.getElement();
				cache.isMove = false;
				cache.screen_top = tempStage.offsetTop;
				cache.screen_left = tempStage.offsetLeft;
				cache.screen_w = tempStage.offsetWidth;
				cache.screen_h = tempStage.offsetHeight;
				cache.root_top = _root.offsetTop;
				cache.root_left = _root.offsetLeft;
				cache.root_w = _root.offsetWidth;
				cache.root_h = _root.offsetHeight;
				return false;
			}
		}
		restoreNormalState();
	};
	//}}}
	var dbclick = function(e) {//{{{
		var event = lib.getEvent(e), exit = false;
		if(event.target.nodeName.toLowerCase() == "html") {restoreNormalState();
			return false;
		}
		if(!lib.hasClass(event.target, "jb-ignore")) {
			var _root = event.target;
			if(!_root.parentNode) {
				exit = true;
			} else {
				while(!(_root.parentNode.getAttribute("class") && lib.hasClass(_root.parentNode, "jb-ignore"))) {
					if(_root.parentNode.nodeName && _root.parentNode.getAttribute("id") == "jb-a") {
						restoreNormalState();
						event.preventDefault();
						return false;
					}
					if(!_root.parentNode.nodeName || _root.parentNode.nodeName.toLowerCase() == "html" || _root.parentNode.nodeName.toLowerCase() == "body") {
						restoreNormalState();
						exit = true;
						break;
					}
					_root = _root.parentNode;
					if(!_root.parentNode) {
						restoreNormalState();
						exit = true;
						break;
					}
				}
			}
			if(!exit) {
				event.preventDefault();
			}
			if(!_root.parentNode.getAttribute("index")) {
				return false;
			}
			if(!exit) {
				switch(lib.detectMedia(_root)) {
					case "text":
						//Find the Root to start edit mode
						if(stage.currentEditingNode == _root && stage.currentState == "textedit") {
							return false;
						}
						if(stage.currentEditingNode !== null) {restoreNormalState();
						}
						stage.currentEditingNode = _root;
						lib.addClass(_root, "jb-touch");
						lib.addEvent(_root, "mousedown", touch);
						//$.Events.add(_root,"blur",Jerboa.restoreNormalState);

						//Jerboa.toggle.menu.call(Jerboa,"text");
						if(_root.childNodes.length != 1) {
							_root.innerHTML = "<div>" + _root.innerHTML + "</div>";
						}
						_root.childNodes[0].setAttribute("contenteditable", "true");
						_root.childNodes[0].focus();
						stage.currentState = "textedit";
						sandbox.notify("textedit");
						break;
					case "image":
						break;
					default:
						break;
				}
				return false;
			}
		}
	};
	//}}}
	var keyboard = function(e) {//{{{
		var event = lib.getEvent(e), _root, tempStage;
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
			} else if(e.keyCode == 86 && !(/edit$/i.test(stage.currentState))) {// ctrl-v button
				sandbox.notify("keydown-noediting-paste", e);
				restoreNormalState();
			}
		}
		if(/move$/i.test(stage.currentState)) {
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
				mediaType = lib.detectMedia(_root);
				stage.currentEditingNode = _root;
				lib.addClass(_root, "jb-touch");
				lib.addEvent(_root, "mousedown", touch);
				stage.currentState = mediaType + "move";
				sandbox.notify(mediaType + "move");
				tempStage = stage.getElement();
				cache.isMove = false;
				cache.screen_top = tempStage.offsetTop;
				cache.screen_left = tempStage.offsetLeft;
				cache.screen_w = tempStage.offsetWidth;
				cache.screen_h = tempStage.offsetHeight;
				cache.root_top = _root.offsetTop;
				cache.root_left = _root.offsetLeft;
				cache.root_w = _root.offsetWidth;
				cache.root_h = _root.offsetHeight;
				event.preventDefault();
			}
		}
	};
	//}}}
	var onSubmit = function() {//{{{
		textarea.value = my.getContent();
	};
	//}}}
	var init = function() {//{{{
		var documentFragment = document.createDocumentFragment(), tempNode, uicoreWidth = config.width || textarea.offsetWidth - 2;
		stage = new Stage(textarea);
		if(mode == "native") {
			tempNode = null;
			//console.log("native");
		} else {
			//construct UI
			ui.core = lib.setNode({
				attr : {
					id : "jb-a",
					"style" : "width:" + uicoreWidth + "px;"
				},
				event : {
					add : "mousedown",
					fn : function(e) {
						//Prevent SelectText in Stage or UI panel
						lib.getEvent(e).preventDefault();
						return false;
					}
				}
			});
			ui.panelbar = lib.setNode({
				attr : {
					id : "jb-b"
				}
			});

			ui.bottom = lib.setNode({
				attr : {
					"class" : "jb-hline"
				},
				event : {
					add : "click",
					fn : function() {
						box.show("option");
					}
				}
			});
			ui.core.appendChild(ui.panelbar);
			ui.core.appendChild(stage.getElement());
			ui.core.appendChild(ui.bottom);
			ui.option = new Box("option");
			ui.option.add(new Input({
				type : "TextField",
				label : "Height <span>input the height which you want</span>",
				align : "last bigger"
			}));
			ui.option.add(new Input({
				type : "hline"
			}));
			ui.option.add(new Input({
				type : "button",
				label : "Set Height",
				name : "option",
				align : "right bottom"
			}));
			box.add(ui.option);

			ui.mainmenu = sandbox.addPanel("mainmenu");
			tempNode = ui.mainmenu.getElement();
			tempNode.appendChild(lib.setNode().appendChild(lib.setNode({
				tag : "button",
				html : "<span style=\"background: url(" + path + "/img/inserttextbox.png) no-repeat\">Insert TextBox</span>",
				event : {
					add : "click",
					fn : function() {
						restoreNormalState();
						stage.getLayer().appendChild(lib.setNode({
							attr : {
								role : "text",
								"style" : "position:absolute;top:0;left:0;"
							},
							html : "<div>Insert Text Here</div>"
						}));
						history.save(stage.getLayer().innerHTML);
					}
				}
			})).parentNode);
			ui.mainmenu.show();
			//Init Modules
			for(var plugin in modules) {
				if(plugin.substr(0, 1) != "_") {
					modules[plugin].init(config[plugin]);
				}
			}
			sandbox.listen("click-button-option", function() {
				var _height = ui.option.getValue()[0];
				if(!isNaN(_height)) {
					stage.setHeight(_height);
				}
				box.hide();
			});
			lib.addEvent(document, "submit", onSubmit);
			//Disable textarea
			lib.addClass(textarea, "hide");
			documentFragment.appendChild(ui.core);
			textarea.parentNode.insertBefore(documentFragment, textarea);
			document.body.appendChild(box.getElement());
		}
		//Register Events
		sandbox.listen("keydown-normal-undo", function() {
			history.undo();
		});
		sandbox.listen("keydown-normal-redo", function() {
			history.redo();
		});
		lib.addEvent(document, "click", click);
		lib.addEvent(document, "dblclick", dbclick);
		lib.addEvent(document, "keydown", keyboard);
	};
	//}}}
	var destroy = function() {//{{{
		restoreNormalState();
		ui.core.parentNode.removeChild(ui.core);
		if(mode == "editor") {
			lib.removeEvent(document, "submit", onSubmit);
		}
		document.body.removeChild(box.getElement());
		if(mode == "editor") {
			textarea.value = my.getContent();
		} else {
			textarea.innerHTML = my.getContent();
		}
		lib.removeClass(textarea, "hide");
		lib.removeEvent(document, "click", click);
		lib.removeEvent(document, "dblclick", dbclick);
		lib.removeEvent(document, "keydown", keyboard);
	};
	//}}}
	if(my.tempApply) {
		my.apply(my.tempApply[0], my.tempApply[1]);
	}
	delete my.tempApply;
	return my;
}(Jerboa || {}));
