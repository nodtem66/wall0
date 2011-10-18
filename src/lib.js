if(window.lib0 == undefined) {
	var _ = lib0 = {};
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
				element.attachEvent("on" + eventType, callback);
			}
		};
		
		_.removeEvent = function(element, eventType, callback) {
			eventType = eventType.toLowerCase();
			if(element.removeEventListener) {
				element.removeEventListener(eventType, callback, false);
			} else if(element.detachEvent) {
				element.detachEvent("on" + eventType, callback);
			}
		};
		_.onDomReady = function(callback) {
			_.addEvent(document.body, "load", callback);
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
			var classNames = [];
			if(element.className) {
				classNames = element.className.split(" ");
			}

			return classNames;
		};
		
		_.addClass = function(element, className) {
			var classNames = _.getArrayOfClassNames(element);
			classNames.push(className);
			element.className = classNames.join(" ");
			
		};
		
		_.removeClass = function(element, className) {
			var classNames = _.getArrayOfClassNames(element);
			var resultingClassNames = [];
			for(var index = 0; index < classNames.length; index++) {
				if(className != classNames[index]) {
					resultingClassNames.push(classNames[index]);
				}
			}
			element.className = resultingClassNames.join(" ");
			
		};
		
		_.hasClass = function(element, className) {
			var tester = new RegExp(className);
			return element.className && tester.test(element.className);
		};
		
		_.getObjectOfStyle = function(element) {
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
		
		_.setObjectOfStyle = function(element, objectStyle) {
			var listStyle = "", item;
			for(item in objectStyle) {
				if(item.substr(0, 1) != "_") {
					listStyle = listStyle.concat(item + ":" + objectStyle[item] + ";");
				}
			}
			element.setAttribute("style", listStyle);
		};
		
		_.addStyle = function(element, List) {
			var objStyle = _.getObjectOfStyle(element), item;
			for(item in List) {
				if(item.substr(0, 1) != "_") {
					objStyle[item] = List[item];
				}
			}
			_.setObjectOfStyle(element, objStyle);
		};
		
		_.removeStyle = function(element, List) {
			var objStyle = _.getObjectOfStyle(element), i, len;
			for( i = 0, len = List.length; i < len; i++) {
				if(objStyle[List[i]]) {
					delete objStyle[List[i]];
				}
			}
			_.setObjectOfStyle(element, objStyle);
		};
		
		_.setNode = function(element, List) {
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
				_.addEvent(element, listEvent.add, listEvent.fn);
			} else if(listEvent.remove) {
				_.removeEvent(element, listEvent.remove, listEvent.fn);
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
		
		_.request = function(objSetting,callback) {
			/*
			* Usage:
			* request({
			* url: "http://somewhere.com/somepage.php?key1=value",
			* method: "post",
			* somekey2: "somevalue2",
			* somekey3: "somevalue3",
			* lastkey: "lastvalue"
			* }, callback);
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
				if(dataKey.substr(0,1) != "_") {
					dataToSend += dataKey + "=" + objSetting[dataKey] + "&";
				}
			}
			//delete last &	 in string
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
						callback(xmlhttp.responseText);
					} else {
						callback();
					}
				}

			};
			if(method == "POST") {
				xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xmlhttp.setRequestHeader("Content-length", dataToSend.length);
				xmlhttp.send(encodeURI(dataToSend));

			} else {
				xmlhttp.send();
			}

		};
		
		_.detectMedia = function(element)
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
		/*Bind function 
	 @param
	 callback- [Function] function to call
	 scope	- [Object] value of "this" variable when call function
	 useThrottle - [Number] delay to run function
	 @return
	 Anonymous function

	 How to use :
	 1. Change scope of variables
	 2. Setting Static arguments
	 3. Limit speed to repeat the function :Prevent to Old Browser (such as IE) crash.

	 Example :
	 1.1 Change scope to "Jerboa" Object
	 lib0.bind(function,Jerboa,false)
	 1.2 Change scope to "window" Object
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
		
} else {
	console.log("\"lib0\" have been used.");
}

