define(function () {
	var my = function (element, opt) {
		return my.setNode(element, opt);
	},
	//Private function
		hide = function (element) {
			var display = getPropStyle(element, 'display');
			if (display !== 'none') {
				element.myoldDisplay = display;
			}
			element.style.display = 'none';
		},
		show = function (element) {
			var display = getPropStyle(element, 'display');
			if (display === 'none') {
				if (element.myoldDisplay === 'none') {
					element.style.display = 'block';
				} else {
					element.style.display = element.myoldDisplay;
				}
			}
		};
	//Public function
	my.env = {
		ie : /MSIE/i.test(navigator.userAgent),
		ie6 : /MSIE 6/i.test(navigator.userAgent),
		ie7 : /MSIE 7/i.test(navigator.userAgent),
		ie8 : /MSIE 8/i.test(navigator.userAgent),
		firefox : /Firefox/i.test(navigator.userAgent),
		opera : /Opera/i.test(navigator.userAgent),
		webkit : /Webkit/i.test(navigator.userAgent),
		camino : /Camino/i.test(navigator.userAgent)
	};

	my.addEvent = function (element, eventType, callback) {
		eventType = eventType.toLowerCase();
		if (element.addEventListener) {
			element.addEventListener(eventType, callback, false);
		} else if (element.attachEvent) {
			element.attachEvent('on' + eventType, callback);
		}
	};

	my.removeEvent = function (element, eventType, callback) {
		eventType = eventType.toLowerCase();
		if (element.removeEventListener) {
			element.removeEventListener(eventType, callback, false);
		} else if (element.detachEvent) {
			element.detachEvent('on' + eventType, callback);
		}
	};

	my.getEvent = function (event) {
		if (event.stopPropagation) {
			event.stopPropagation();
		} else {
			event.cancelBubble = true;
		}

		return {
			target : my.getTargetFromEvent(event),
			preventDefault : function () {
				if (event.preventDefault) {
					event.preventDefault();
				// W3C method
				} else {
					event.returnValue = false;
				// Internet Explorer method
				}
			}
		};
	};

	my.getTargetFromEvent = function (event) {
		var target = event.srcElement || event.target;
		if (target.nodeType === 3) {
			target = target.parentNode;
		}
		return target;
	};

	my.getArrayOfClassNames = function (element) {
		var ret = [], classNames = [], i;
		if (element.className) {
			classNames = element.className.split(' ');
		}
		for (i = 0; i < classNames.length; i++) {
			if (classNames[i].length !== 0) {
				ret.push(classNames[i]);
			}
		}

		return ret;
	};

	my.addClass = function (element, className) {
		var array = my.getArrayOfClassNames(element), table = {}, i;

		for (i = 0; i < array.length; i++) {
			if (array[i] !== '') {
				table[array[i]] = true;
			}
		}
		className = className.split(' ');
		for (i = 0; i < className.length; i++) {
			if (className[i] !== '') {
				if (!table[className[i]]) {
					array.push(className[i]);
					table[className[i]] = true;
				}
			}
		}
		element.className = array.join(' ');

	};

	my.removeClass = function (element, className) {
		var classNames = my.getArrayOfClassNames(element), table = {}, i, key;
		for (i = 0; i < classNames.length; i++) {
			table[classNames[i]] = true;
		}
		className = className.split(' ');
		for (i = 0; i < className.length; i++) {
			if (table[className[i]]) {
				delete table[className[i]];
			}
		}
		classNames = [];
		for (key in table) {
			if (table.hasOwnProperty(key)) {
				classNames.push(key);
			}
		}
		element.className = classNames.join(' ');

	};

	my.hasClass = function (element, className) {
		var tester, countClass = 0, i;
		//trim
		className.replace(/^\s+/, '');
		className.replace(/\s+$/, '');
		className = className.split(' ');
		for (i = 0; i < className.length; i++) {
			if (className[i] !== '') {
				countClass++;
				tester = new RegExp(className[i]);
				if (tester.test(element.className) === false) {
					return false;
				}
			}
		}
		if (countClass > 0) {
			return true;
		} else {
			return false;
		}
	};

	my.getObjectOfStyle = function (element) {
		var i = 0, len = 0, objectStyle = {}, cssValue = '', listStyle;

		if (typeof element === 'string') {
			listStyle = element;
		} else {
			listStyle = element.getAttribute('style');

			if (listStyle && typeof listStyle === 'object') {
				listStyle = listStyle.cssText;
			}
		}

		if (listStyle) {
			listStyle = listStyle.split(';');
			// example ['top:45px','left:67px',...]
			for (i = 0, len = listStyle.length; i < len; i++) {
				//each item = 'top:45px'
				if (listStyle[i]) {
					cssValue = listStyle[i].split(':');
					if (cssValue.length === 2) {
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

	my.setObjectOfStyle = function (element, objectStyle) {
		var listStyle = '', item;
		var isIE = my.env.ie;
		if (arguments.length === 1) {
			objectStyle = element;
		}
		if (typeof objectStyle === "string") {
			listStyle = objectStyle;
		} else {
			for (item in objectStyle) {
				if (objectStyle.hasOwnProperty(item)) {
					if (isIE) {
						listStyle = listStyle.concat(item.toUpperCase() + ':' + objectStyle[item] + ';');
					} else {
						listStyle = listStyle.concat(item + ':' + objectStyle[item] + ';');
					}
				}
			}
		}
		if (arguments.length > 1) {
			element.style.cssText = listStyle;
		}
		return listStyle;
	};

	my.addStyle = function (element, List) {
		var objStyle = my.getObjectOfStyle(element), item;
		if (typeof List === "string") {
			List = my.getObjectOfStyle(List);
		}

		for (item in List) {
			if (List.hasOwnProperty(item)) {
				objStyle[item] = List[item];
			}
		}
		my.setObjectOfStyle(element, objStyle);
	};

	my.removeStyle = function (element, List) {
		var objStyle = my.getObjectOfStyle(element), item;
		for (item in List) {
			if (List.hasOwnProperty(item)) {
				delete objStyle[item];
			}
		}
		my.setObjectOfStyle(element, objStyle);
	};
	my.getPropStyle = function (element, prop) {
		if (prop && element) {
			if (element.style[prop]) {
				return element.style[prop];
			} else if (element.currentStyle) {
				return element.currentStyle[prop];
			} else if (document.defaultView && document.defaultView.getComputedStyle) {
				prop = prop.replace(/([A-Z])/g, '-$1').toLowerCase();
				var style = document.defaultView.getComputedStyle(element, '');
				return style && style.getPropertyValue(prop);
			}
		}
		return null;
	};

	my.setNode = function (element, List) {
		var item, key;
		if (arguments.length === 0 || element === undefined) {
			return document.createElement('div');
		}
		if (arguments.length === 1 || List === undefined) {
			List = element;
			element = document.createElement(List.tag || List.Tag || 'div');
			delete List.tag;
			delete List.Tag;
		}
		if (typeof List === 'string') {
			switch (List.toLowerCase()) {
			case 'hide':
				hide(element);
				break;
			case 'show':
				show(element);
				break;
			default:
				break;
			}
		} else {
			for (item in List) {
				if (List.hasOwnProperty(item)) {
					switch (item) {
					case 'event':
					case 'Event':
						var listEvent = List.event || List.Event || {};
						//example event: {add: click,fn: function1}

						//Add event <tag onclick='function1'></tag>
						if (listEvent.add) {
							my.addEvent(element, listEvent.add, listEvent.fn);
						} else if (listEvent.remove) {
							my.removeEvent(element, listEvent.remove, listEvent.fn);
						}
						break;
					case 'Attr':
					case 'attr':
						var listAttr = List.Attr || List.attr || {};
						//example attr: {id: xxx,class: yyy}
						//Add attribute <tag attr1='value'></tag>
						for (key in listAttr) {
							if (listAttr.hasOwnProperty(key)) {
								if (key === 'style') {
									my.addStyle(element, listAttr[key]);
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
						if (List.hasOwnProperty(item)) {
							if (item === 'style') {
								my.addStyle(element, List[item]);
								continue;
							}
							element.setAttribute(item, List[item]);
						}
						break;
					}
				}
			}
		}
		return element;
	};

	my.request = function (objSetting, callback) {
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
		if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
			xmlhttp = new XMLHttpRequest();
		} else {// code for IE6, IE5
			xmlhttp = new ActiveXObject('Microsoft.XMLHTTP');
		}
		for (dataKey in objSetting) {
			if (objSetting.hasOwnProperty(dataKey)) {
				dataToSend += dataKey + '=' + objSetting[dataKey] + '&';
			}
		}
		//delete last &	 in string
		dataToSend = dataToSend.substr(0, dataToSend.length - 1);

		if (method === 'GET') {
			if (/\?/.test(url)) {
				url = url + '&' + dataToSend;
			} else {
				url = url + '?' + dataToSend;
			}
		}
		xmlhttp.open(method, encodeURI(url), true);
		xmlhttp.onreadystatechange = function () {
			if (xmlhttp.readyState === 4) {
				if (xmlhttp.status === 200) {
					callback(xmlhttp.responseText);
				} else {
					callback();
				}
			}

		};
		if (method === 'POST') {
			xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
			xmlhttp.setRequestHeader('Content-length', dataToSend.length);
			xmlhttp.send(encodeURI(dataToSend));

		} else {
			xmlhttp.send();
		}

	};

	my.detectMedia = function (element) {
		//TODO: Detect another kind of media
		var  listMediaTag = {
			'object' : 1,
			'embed' : 1,
			'video' : 1
		}, i;
		if (typeof element === 'object' || typeof element === 'function') {
			if (element.nodeName.toLowerCase() === 'div' && element.getAttribute('role')) {
				return element.getAttribute('role');
			} else if (element.nodeName.toLowerCase() === 'img') {
				return 'image';
			} else if (listMediaTag[element.nodeName.toLowerCase()]) {
				return 'media';
			} else if (element.nodeName.toLowerCase() === 'iframe') {
				return 'iframe';
			} else {
				return 'text';
			}
		} else if (typeof element === 'string') {
			if (/^<(\w+)[\s\w\=\"\']*>.*<\/\1>$/i.test(element) === false && /^<(\w+)[\s\w\=\"\']*\/>$/i.test(element) === false) {
				return undefined;
			} else if (/^<img/i.test(element)) {
				return 'image';
			} else if (/^<iframe/i.test(element)) {
				return 'iframe';
			} else {
				for (i in listMediaTag) {
					if (listMediaTag.hasOwnProperty(i) && (new RegExp('^<' + i, 'i')).test(element)) {
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
	my.bind = function (callback, scope, useThrottle) {
		var myscope = scope || window, argsStatic = Array.prototype.slice.call(arguments, 3);
		if (useThrottle) {
			return function () {
				var argsDynamic = arguments;

				if (callback.tId === undefined) {

					callback.tId = setTimeout(function () {
						callback.apply(myscope, argsStatic.concat(Array.prototype.slice.call(argsDynamic, 0)));
						delete callback.tId;

					}, useThrottle);
				}
			};
		} else {
			return function () {
				return callback.apply(scope, argsStatic.concat(Array.prototype.slice.call(arguments, 0)));
			};
		}
	};
	return my;
});