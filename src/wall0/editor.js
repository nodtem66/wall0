/**
 * wall0 
 * a layout editor for WYSIWYG editor
 *
 * Licensed under the MIT license.
 * (c) 2011 Jirawat I.
 */
(function(window, undefined){ 
var document = window.document;
var elm = document.getElementsByTagName('script')
, path = elm[elm.length - 1].src.replace('editor.js','') //path in current directory
, history , $, editor, editor_area, textareaId, editorState, selectedNode
;

//shortcut to call
var wall0 = function(id){
	if(typeof id == 'string'){
		if(id == '')return;
		else if(id.slice(0,1) == '#') id = id.slice(1);
		return wall0.init(id);
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
		//resizeEditorEvent.w += e.pageX - resizeEditorEvent.x; 
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
		$.addStyle(editor,{height: resizeEditorEvent.h+'px'});
		$.addStyle(resizeEditorEvent.e, { top: (resizeEditorEvent.h-11)+'px'});
	} else {
		$.removeEvent(document,'mousemove',resizeEditorEvent);
		$.removeEvent(document,'mouseup',resizeEditorEvent);
		delete resizeEditorEvent.e;
	}
};
var normalizeTree = function(a){if(!a){return""}var b=[],c=[],d,e,f,g,h,i,j=true,k,l=a.cloneNode(true),m,n,o;b.push(l);c.push(a);var p=function(a,b,c){var d=b.cloneNode(true),e={role:a,style:{position:"absolute",top:c.offsetTop+"px",left:c.offsetLeft+"px",overflow:"hidden",height:c.offsetHeight+"px",width:c.offsetWidth+"px"}};if(a=="iframe"||a=="media"){e.html='<div class="jb-media-touch">&#160;</div>'}d=$.setNode(e).appendChild(d).parentNode;if(a=="media"&&d.childNodes[1].nodeName.toLowerCase()=="object"){d.childNodes[1].insertBefore($.setNode({tag:"param",name:"wmode",value:"opaque"}),d.childNodes[1].childNodes[0]);d.childNodes[1].lastChild.setAttribute("wmode","opaque")}l.appendChild(d)};while(b.length>0){h=b.pop();i=c.pop();if(h.childNodes.length===0){continue}for(d=0,e=0,f=i.childNodes.length,g=h.childNodes.length;d<g&&e<f;d++,e++){if(h.childNodes[d].nodeName!="#text"&&h.childNodes[d].nodeName!="#comment"){if(h.childNodes[d].getAttribute("role")){continue}o=$.detectMedia(h.childNodes[d]);switch(o){case"image":case"iframe":case"media":if(!j&&h.childNodes.length==1){k=h;while(k.parentNode.childNodes.length==1&&!$.hasClass(k.parentNode,"wall0-area")){k=k.parentNode}p(o,h.childNodes[d],i.childNodes[e]);k.parentNode.removeChild(k)}else{p(o,h.childNodes[d],i.childNodes[e]);h.removeChild(h.childNodes[d]);d--;g--}break;case"text":if(h.childNodes[d].innerHTML===""&&h.childNodes[d].nodeName.toLowerCase()!="div"){h.removeChild(h.childNodes[d]);d--;g--;continue}else if(j){if(h.childNodes[d].nodeName.toLowerCase()!="div"){k=h.childNodes[d].cloneNode(true);k=$.setNode().appendChild(k).parentNode;k=$.setNode({role:"text",style:{position:"absolute",top:i.childNodes[e].offsetTop+"px",left:i.childNodes[e].offsetLeft+"px",overflow:"hidden"}}).appendChild(k).parentNode;if(l.childNodes.length===0){l.appendChild(k)}else{l.insertBefore(k,l.childNodes[d]);l.removeChild(l.childNodes[d+1])}}else{$.setNode(l.childNodes[d],{role:"text",style:{position:"absolute",top:i.childNodes[e].offsetTop+"px",left:i.childNodes[e].offsetLeft+"px",overflow:"hidden"}})}}b.push(h.childNodes[d]);c.push(i.childNodes[e]);break;default:break}}}if(j){j=false}}for(d=0,g=l.childNodes.length;d<g;d++){if(l.childNodes[d].nodeName=="#text"){if(/[\S]/ig.test(l.childNodes[d].nodeValue)){k=$.setNode({tag:"div",role:"pre-text",style:"position:absolute;",html:"<div>"+l.childNodes[d].nodeValue+"</div>"});l.removeChild(l.childNodes[d]);l.appendChild(k)}else{l.removeChild(l.childNodes[d]);g--}d--;continue}$.addStyle(l.childNodes[d],{position:"absolute",overflow:"hidden",padding:0,margin:0,display:"inline-block"})}a.innerHTML=l.innerHTML;for(d=0;d<g;d++){if(d>0&&a.childNodes[d].getAttribute("role")=="pre-text"){k=a.childNodes[d-1];m=k.offsetTop+k.offsetHeight;n=k.offsetLeft;$.addStyle(a.childNodes[d],{top:m+"px",left:n+"px"})}}return true};
//include lib.js
$ = wall0.$ = (function(){var a=function(b,c){return a.setNode(b,c)},b=function(a){var b=getPropStyle(a,"display");if(b!="none")a._oldDisplay=b;a.style.display="none"},c=function(a){var b=getPropStyle(a,"display");if(a=="none"){if(a._oldDisplay=="none")a.style.display="block";else a.style.display=a._oldDisplay}};a.env={ie:/MSIE/i.test(navigator.userAgent),ie6:/MSIE 6/i.test(navigator.userAgent),ie7:/MSIE 7/i.test(navigator.userAgent),ie8:/MSIE 8/i.test(navigator.userAgent),firefox:/Firefox/i.test(navigator.userAgent),opera:/Opera/i.test(navigator.userAgent),webkit:/Webkit/i.test(navigator.userAgent),camino:/Camino/i.test(navigator.userAgent)};a.addEvent=function(a,b,c){b=b.toLowerCase();if(a.addEventListener){a.addEventListener(b,c,false)}else if(a.attachEvent){a.attachEvent("on"+b,c)}};a.removeEvent=function(a,b,c){b=b.toLowerCase();if(a.removeEventListener){a.removeEventListener(b,c,false)}else if(a.detachEvent){a.detachEvent("on"+b,c)}};a.getEvent=function(b){if(b.stopPropagation){b.stopPropagation()}else{b.cancelBubble=true}return{target:a.getTargetFromEvent(b),preventDefault:function(){if(b.preventDefault){b.preventDefault()}else{b.returnValue=false}}}};a.getTargetFromEvent=function(a){var b=a.srcElement||a.target;if(b.nodeType==3){b=b.parentNode}return b};a.getArrayOfClassNames=function(a){var b=[],c=[];if(a.className){c=a.className.split(" ")}for(var d=0;d<c.length;d++){if(c[d].length!=0)b.push(c[d])}return b};a.addClass=function(b,c){var d=a.getArrayOfClassNames(b),e={},f;for(f=0;f<d.length;f++){if(d[f]!="")e[d[f]]=true}c=c.split(" ");for(f=0;f<c.length;f++){if(c[f]!=""){if(!e[c[f]]){d.push(c[f]);e[c[f]]=true}}}b.className=d.join(" ")};a.removeClass=function(b,c){var d=a.getArrayOfClassNames(b),e={},f;for(f=0;f<d.length;f++){e[d[f]]=true}c=c.split(" ");for(f=0;f<c.length;f++){if(e[c[f]]){delete e[c[f]]}}d=[];for(var g in e){if(g.substr(0,1)!="_"){d.push(g)}}b.className=d.join(" ")};a.hasClass=function(a,b){var c,d=0;b.replace(/^\s+/,"");b.replace(/\s+$/,"");b=b.split(" ");for(var e=0;e<b.length;e++){if(b[e]!=""){d++;c=new RegExp(b[e]);if(c.test(a.className)==false)return false}}if(d>0)return true;else return false};a.getObjectOfStyle=function(a){var b=0,c=0,d={},e="",f;if(typeof a=="string"){f=a}else{f=a.getAttribute("style");if(f&&typeof f=="object"){f=f.cssText}}if(f){f=f.split(";");for(b=0,c=f.length;b<c;b++){if(f[b]){e=f[b].split(":");if(e.length>=2){if(e.length>2){e[1]=e.slice(1).join(":")}e[0]=e[0].replace(/^[\s]+/g,"").replace(/[\s]+$/g,"").toLowerCase();e[1]=e[1].replace(/^[\s]+/g,"").replace(/[\s]+$/g,"");d[e[0]]=e[1]}}}}return d};a.setObjectOfStyle=function(b,c){var d="",e;var f=a.env.ie;if(arguments.length==1)c=b;if(typeof c=="string"){d=objStyle}else{for(e in c){if(e.substr(0,1)!="_"){if(f){d=d.concat(e.toUpperCase()+":"+c[e]+";")}else{d=d.concat(e+":"+c[e]+";")}}}}if(arguments.length>1){b.style.cssText=d}return d};a.addStyle=function(b,c){var d=a.getObjectOfStyle(b),e;if(typeof c=="string"){c=a.getObjectOfStyle(c)}for(e in c){if(e.substr(0,1)!="_"){d[e]=c[e]}}a.setObjectOfStyle(b,d)};a.removeStyle=function(b,c){var d=a.getObjectOfStyle(b),e;for(e in c){if(e.substr(0,1)!="_"){delete d[e]}}a.setObjectOfStyle(b,d)};a.getPropStyle=function(a,b){if(a.style[b])return a.style[b];else if(a.currentStyle)return a.currentStyle[b];else if(document.defaultView&&document.defaultView.getComputedStyle){b=b.replace(/([A-Z])/g,"-$1").toLowerCase();var c=document.defaultView.getComputedStyle(a,"");return c&&c.getPropertyValue(b)}return null};a.getPageX=function(a){var b=0;while(a.offsetParent){b+=a.offsetLeft;a=a.offsetParent}return b+a.offsetLeft};a.getPageY=function(a){var b=0;while(a.offsetParent){b+=a.offsetTop;a=a.offsetParent}return b+a.offsetTop};a.getParentX=function(b){return b.parentNode==b.offsetParent?b.offsetLeft:a.getPageX(b)-a.getPageX(b.parentNode)};a.getParentY=function(b){return b.parentNode==b.offsetParent?b.offsetTop:a.getPageY(b)-a.getPageY(b.parentNode)};a.setNode=function(d,e){if(arguments.length===0||d==undefined){return document.createElement("div")}if(arguments.length==1||e==undefined){e=arguments[0];d=document.createElement(e.tag||e.Tag||"div");delete e.tag;delete e.Tag}if(typeof e=="string"){switch(e.toLowerCase()){case"hide":b(d);break;case"show":c(d);break;default:break}}else{for(var f in e){switch(f){case"event":case"Event":var g=e.event||e.Event||{};if(g.add){a.addEvent(d,g.add,g.fn)}else if(g.remove){a.removeEvent(d,g.remove,g.fn)}break;case"Attr":case"attr":var h=e.Attr||e.attr||{};for(var i in h){if(i.substr(0,1)!="_"){if(i=="style"){a.addStyle(d,h[i]);continue}d.setAttribute(i,h[i])}}break;case"html":case"HTML":d.innerHTML=e.html;break;default:if(f.substr(0,1)!="_"){if(f=="style"){a.addStyle(d,e[f])}else{d.setAttribute(f,e[f])}}break}}}return d};a.request=function(a,b){var c=null,d=a.method?a.method.toUpperCase():"GET",e=a.url,f="",g="";delete a.method;delete a.url;if(window.XMLHttpRequest){c=new XMLHttpRequest}else{c=new ActiveXObject("Microsoft.XMLHTTP")}for(f in a){if(f.substr(0,1)!="_"){g+=f+"="+a[f]+"&"}}g=g.substr(0,g.length-1);if(d=="GET"){if(/\?/.test(e)){e=e+"&"+g}else{e=e+"?"+g}}c.open(d,encodeURI(e),true);c.onreadystatechange=function(){if(c.readyState==4){if(c.status==200){b(c.responseText)}else{b()}}};if(d=="POST"){c.setRequestHeader("Content-type","application/x-www-form-urlencoded");c.setRequestHeader("Content-length",g.length);c.send(encodeURI(g))}else{c.send()}};a.detectMedia=function(a){var b={p:1,span:1,div:1},c={object:1,embed:1,video:1};if(typeof a==="object"||typeof a=="function"){if(a.nodeName.toLowerCase()=="div"&&a.getAttribute("role")){return a.getAttribute("role")}else if(a.nodeName.toLowerCase()=="img"){return"image"}else if(c[a.nodeName.toLowerCase()]||a.getAttribute("class")=="jb-media-touch"){return"media"}else if(a.nodeName.toLowerCase()=="iframe"){return"iframe"}else{return"text"}}else if(typeof a==="string"){if(/^<(\w+)[\s\w\=\"\']*>.*<\/\1>$/i.test(a)==false&&/^<(\w+)[\s\w\=\"\']*\/>$/i.test(a)==false){return undefined}else if(/^<img/i.test(a)){return"image"}else if(/^<iframe/i.test(a)){return"iframe"}else{for(var d in c){if((new RegExp("^<"+d,"i")).test(a)){return"media"}}}return"text"}};a.bind=function(a,b,c){var d=b||window,e=Array.prototype.slice.call(arguments,3);if(c){return function(){var b=arguments;if(a.tId==undefined){a.tId=setTimeout(function(){a.apply(d,e.concat(Array.prototype.slice.call(b,0)));delete a.tId},c)}}}else{return function(){return a.apply(b,e.concat(Array.prototype.slice.call(arguments,0)))}}};return a})();

wall0.init = function(id){
	var textarea = document.getElementById(id),h,w;
	if(textarea == null) {throw "wall0 > Not found id: "+id;return;}
	if(textareaId) wall0.destroy();
	
	//create fragment
	df = document.createDocumentFragment();
	
	//get Width and Height of textarea
	w = textarea.offsetWidth;
	h = textarea.offsetHeight;
	
	//build editor
	editor = $({'class':'wall0-editor','style':'position:relative;width:'+w+'px;height:'+h+'px;border:1px solid #069;cursor:default;'});
	
	//build content area
	editor_area = $.setNode({'class':'wall0-area','style':'position:relative;width:100%;height:100%;background:transparent;'});
	editor.appendChild(editor_area);
	
	//build editor resizer at the bottom
	editor.appendChild($({'style':'position:absolute;top:'+(h-11)+'px;width:100%;height:10px;cursor:s-resize;',event: {add: 'mousedown',fn: resizeEditorEvent}}));
	
	df.appendChild(editor);
	textarea.parentNode.appendChild(df);
	
	console.log('wall0 > create instance for id:'+id,path);
	textareaId = id;
	return wall0;
};
wall0.destroy = function(){
	console.log('wall0 > destroy instance for id:'+textareaId);
};
window.wall0 = wall0;
})(window);
