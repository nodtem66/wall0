define(function(){
	var _ = {},
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
			var styleObject = element.getAttribute('style');
			
			if(_.env.ie8)
				listStyle = styleObject;
			else if(_.env.ie)
				listStyle = styleObject.cssText;
			else
				listStyle = styleObject;
			
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
		if(element.style[prop])
			return element.style[prop];
		else if(element.currentStyle)
			return element.currentStyle[prop];
		else if(document.defaultView && document.defaultView.getComputedStyle){
			prop = prop.replace(/([A-Z])/g,'-$1').toLowerCase();
			var style = document.defaultView.getComputedStyle(element, '');
			return style && style.getPropertyValue(prop);
		}
		return null;
	};
	_.getPageX = function(element){
		var x = 0;
		while(element.offsetParent){
			x += element.offsetLeft;
			element = element.offsetParent;
		}
		return x + element.offsetLeft;
	};
	_.getPageY = function(element){
		var y = 0;
		while(element.offsetParent){
			y += element.offsetTop;
			element = element.offsetParent;
		}
		return y + element.offsetTop;
	};
	_.getParentX = function(element) {
		return element.parentNode == element.offsetParent? 
			element.offsetLeft :
			_.getPageX(element) - _.getPageX(element.parentNode);
	};
	_.getParentY = function(element) {
		return element.parentNode == element.offsetParent?
			element.offsetTop :
			_.getPageY(element) - _.getPageY(element.parentNode);
	};
	_.setNode = function(element, List) {
		if(arguments.length === 0) {
			return document.createElement('div');
		}
		if(arguments.length == 1) {
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
							if(key == "style") {
								_.addStyle(element, listAttr[key]);
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
			} else if(listMediaTag[element.nodeName.toLowerCase()] || element.getAttribute('class') == 'jb-media-touch') {
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
});