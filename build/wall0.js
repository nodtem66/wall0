(function(n){var k=n.document,x=function(){var d,a;a=k.getElementsByTagName("script");d=a[a.length-1].src.replace("wall0.js","");a=n.location.href.split("/");a.pop();d=d.replace(a.join("/"),"");d.substr(0,1)==="/"&&(d=d.substr(1));return d}(),f,r,s,z,u,i,v={},p=function(d){if(typeof d==="string"){if(d==="")return null;else d.slice(0,1)==="#"&&(d=d.slice(1));return p.init(d)}},B=function(d,a){var c={img:true,object:true,iframe:true,embed:true},b=0,g=[],e,m,h,k=function(){b--;b===0&&i()},i=a||function(){};
for(g.push(d);g.length>0;){e=g.pop();for(m=0,h=e.childNodes.length;m<h;m++)e.childNodes[m].childNodes&&e.childNodes[m].childNodes.length>0&&g.push(e.childNodes[m]),c[e.childNodes[m].nodeName.toLowerCase()]&&(b++,f.addEvent(e.childNodes[m],"load",k))}return{then:function(a){i=a},cancel:function(){b=-1}}},l=function(d){var a=f.getEvent(d);a.preventDefault();d.type==="mousedown"?(l.x=d.screenX,l.y=d.screenY,l.h=r.offsetHeight,l.e=a.target,f.addEvent(k,"mousemove",l),f.addEvent(k,"mouseup",l)):d.type===
"mousemove"?(l.h+=d.screenY-l.y,l.x=d.screenX,l.y=d.screenY,l.h<20?(l.h=20,f.removeEvent(k,"mousemove",l),f.removeEvent(k,"mouseup",l),delete l.e):r.style.height=l.h+"px"):(f.removeEvent(k,"mousemove",l),f.removeEvent(k,"mouseup",l),delete l.e)},C=function(d){if(d){var a=[],c=[],b,g,e,m,h,i,l=true,j,o=d.cloneNode(true),q,n;a.push(o);c.push(d);for(var p=function(a,b,c){b=b.cloneNode(true);c={role:a,style:{position:"absolute",top:c.offsetTop+"px",left:c.offsetLeft+"px",overflow:"hidden",height:c.offsetHeight+
"px",width:c.offsetWidth+"px"}};if(a==="iframe"||a==="media")c.html='<div class="jb-media-mousemoveEvent">&#160;</div>';b=f.setNode(c).appendChild(b).parentNode;a==="media"&&b.childNodes[1].nodeName.toLowerCase()==="object"&&(b.childNodes[1].insertBefore(f.setNode({tag:"param",name:"wmode",value:"opaque"}),b.childNodes[1].childNodes[0]),b.childNodes[1].lastChild.setAttribute("wmode","opaque"));o.appendChild(b)};a.length>0;)if(h=a.pop(),i=c.pop(),h.childNodes.length!==0){for(b=0,g=0,e=i.childNodes.length,
m=h.childNodes.length;b<m&&g<e;b++,g++)if(h.childNodes[b].nodeName!=="#comment")if(h.childNodes[b].nodeName==="#text")/[\S]/ig.test(o.childNodes[b].nodeValue)?l&&(j=f.setNode({tag:"span",html:o.childNodes[b].nodeValue}),o.insertBefore(j,o.childNodes[b]),o.removeChild(o.childNodes[b+1]),b--,g--):(o.removeChild(o.childNodes[b]),b--,m--);else if(!h.childNodes[b].getAttribute("role"))switch(q=f.detectMedia(h.childNodes[b]),q){case "image":case "iframe":case "media":if(!l&&h.childNodes.length===1){for(j=
h;j.parentNode.childNodes.length===1&&!f.hasClass(j.parentNode,"wall0-area");)j=j.parentNode;p(q,h.childNodes[b],i.childNodes[g]);j.parentNode.removeChild(j)}else p(q,h.childNodes[b],i.childNodes[g]),h.removeChild(h.childNodes[b]),b--,m--;break;case "text":if(h.childNodes[b].innerHTML===""&&h.childNodes[b].nodeName.toLowerCase()!=="div"){h.removeChild(h.childNodes[b]);b--;m--;continue}else if(l){n=q=0;j=i.childNodes[g];if(j.offsetTop)q=j.offsetTop,n=j.offsetLeft;else if(g>0)j=i.childNodes[g-1],q=
f.getPropStyle(j,"display"),q.indexOf("inline")>=0?(q=j.offsetTop,n=j.offsetLeft+j.offsetWidth,n>k.offsetWidth&&(q+=j.offsetHeight,n=0)):(q=j.offsetTop+j.offsetHeight+parseInt(f.getPropStyle(j,"margin-top"),10)+parseInt(f.getPropStyle(j,"margin-bottom"),10)+parseInt(f.getPropStyle(j,"padding-top"),10)+parseInt(f.getPropStyle(j,"padding-bottom"),10),n=0);h.childNodes[b].nodeName.toLowerCase()!=="div"?(j=h.childNodes[b].cloneNode(true),j=f.setNode().appendChild(j).parentNode,j=f.setNode({role:"text",
style:{position:"absolute",top:q+"px",left:n+"px",overflow:"hidden"}}).appendChild(j).parentNode,o.childNodes.length===0?o.appendChild(j):(o.insertBefore(j,o.childNodes[b]),o.removeChild(o.childNodes[b+1]))):f.setNode(o.childNodes[b],{role:"text",style:{position:"absolute",top:q+"px",left:n+"px",overflow:"hidden"}})}a.push(h.childNodes[b]);c.push(i.childNodes[g])}l&&(l=false)}for(b=0,m=o.childNodes.length;b<m;b++)f.addStyle(o.childNodes[b],{position:"absolute",overflow:"hidden",padding:0,margin:0,
display:"inline-block"});d.innerHTML=o.innerHTML;return true}},w=function(d){if(u==="edit")return false;var a=w,c=f.getEvent(d),b,g;if(d.type==="mousedown"){for(b=c.target;b;){if(b.parentNode&&b.parentNode.getAttribute&&(g=b.parentNode.getAttribute("class"))&&typeof g==="string"&&g.indexOf("wall0-area")>-1)break;b=b.parentNode}if(b)c.preventDefault(),i!==b&&(y(),A(b),i=b,u="move"),a.x=d.screenX,a.y=d.screenY,a.top=b.offsetTop,a.left=b.offsetLeft,a.w=b.offsetWidth,a.h=b.offsetHeight,f.addEvent(k,"mousemove",
w),f.addEvent(k,"mouseup",w)}else d.type==="mousemove"?(c.preventDefault(),c=d.screenX-a.x+a.left,b=d.screenY-a.y+a.top,0>c?c=0:c>r.offsetWidth-a.w&&(c=r.offsetWidth-a.w),0>b?b=0:b>r.offsetHeight-a.h&&(b=r.offsetHeight-a.h),i.style.top=b+"px",i.style.left=c+"px",a.left=c,a.top=b,a.x=d.screenX,a.y=d.screenY):d.type==="mouseup"&&(f.removeEvent(k,"mousemove",w),f.removeEvent(k,"mouseup",w))},t=function(d){var a=f.getEvent(d),c,b=t,g,e,m,h;if(d.type==="mousedown"){if(c=a.target,(c=c.getAttribute("class"))&&
typeof c==="string"&&c.indexOf("wall0")>-1)b.dir=c.replace("wall0",""),b.x=d.screenX,b.y=d.screenY,b.top=i.offsetTop,b.left=i.offsetLeft,b.w=i.offsetWidth,b.h=i.offsetHeight,f.addEvent(k,"mousemove",t),f.addEvent(k,"mouseup",t),a.preventDefault()}else if(d.type==="mousemove"){a.preventDefault();g=d.screenY-b.y;a=d.screenX-b.x;b.dir.indexOf("t")>-1?(c=g+b.top,h=b.h-g):b.dir.indexOf("b")>-1&&(h=g+b.h);b.dir.indexOf("l")>-1?(e=a+b.left,m=b.w-a):b.dir.indexOf("r")>-1&&(m=a+b.w);if(0>=c)c=0,h=b.h;else if(h<=
0)h=b.h,c=b.top;if(0>=e)e=0,m=b.w;else if(m<=0)m=b.w,e=b.left;if(c)i.style.top=c+"px",b.top=c;if(e)i.style.left=e+"px",b.left=e;if(m)i.style.width=m+"px",b.w=m;if(h)i.style.height=h+"px",b.h=h;b.x=d.screenX;b.y=d.screenY}else d.type==="mouseup"&&(f.removeEvent(k,"mousemove",t),f.removeEvent(k,"mouseup",t))},y=function(){if(i){if(u==="edit"){i.firstChild.blur();i.firstChild.removeAttribute("contenteditable");if(n.GENTICS)n.GENTICS.Aloha.editables[0].destroy(),n.GENTICS.Aloha.editables=[];f.env.ie?
k.selection.empty():n.getSelection().removeAllRanges()}var d=i,a=0,c=d.childNodes.length;for(d.style.overflow="hidden";a<8;)c--,a++,d.removeChild(d.childNodes[c]);i=null}console.log("wall0 > unselected");u="normal"},D=function(d){var d=f.getEvent(d),a,c;for(a=d.target;a;){if(a.parentNode&&a.parentNode.getAttribute&&(c=a.parentNode.getAttribute("class"))&&typeof c==="string")if(c.indexOf("wall0-area")>-1)break;else if(c.indexOf("GENTICSmyfloatingmenu")>-1)return false;a=a.parentNode}console.log("click"+
(new Date).getTime());if(a){if(i&&i!==a)return y(),a&&(A(a),u="move",i=a),d.preventDefault(),false}else return u!=="normal"&&y(),d.preventDefault(),false},E=function(d){var d=f.getEvent(d),a,c;for(a=d.target;a;){if(a.parentNode&&a.parentNode.getAttribute&&(c=a.parentNode.getAttribute("class"))&&typeof c==="string"&&c.indexOf("wall0-area")>-1)break;a=a.parentNode}if(a&&a.getAttribute("role")==="text")i!==a&&(y(),A(a),i=a),u="edit",a.firstChild.setAttribute("contenteditable","true"),a.firstChild.style.outline=
"none",a.firstChild.focus(),n.GENTICS&&n.$(a.firstChild).aloha();d.preventDefault()},A=function(d){var a=k.createDocumentFragment();d.style.overflow="visible";a.appendChild(f({"class":"wall0tl",style:"position:absolute;width:10px;height:10px;top:-8px;left:-8px;cursor:nw-resize;z-index:334;background:url("+x+"icon.png);",event:{add:"mousedown",fn:t}}));a.appendChild(f({"class":"wall0t",style:"position:absolute;width:100%;height:2px;top:-4px;left:0;z-index:333;border-top:2px solid #08F;"}));a.appendChild(f({"class":"wall0tr",
style:"position:absolute;width:10px;height:10px;top:-8px;right:-8px;cursor:ne-resize;z-index:334;background:url("+x+"icon.png);",event:{add:"mousedown",fn:t}}));a.appendChild(f({"class":"wall0l",style:"position:absolute;width:2px;height:100%;top:0;left:-4px;z-index:333;border-left:2px solid #08F;"}));a.appendChild(f({"class":"wall0r",style:"position:absolute;width:2px;height:100%;top:0;right:-4px;z-index:333;border-right:2px solid #08F;"}));a.appendChild(f({"class":"wall0bl",style:"position:absolute;width:10px;height:10px;bottom:-8px;left:-8px;cursor:sw-resize;z-index:334;background:url("+
x+"icon.png);",event:{add:"mousedown",fn:t}}));a.appendChild(f({"class":"wall0b",style:"position:absolute;width:100%;height:2px;bottom:-4px;left:0;z-index:333;border-bottom: 2px solid #08F;"}));a.appendChild(f({"class":"wall0br",style:"position:absolute;width:10px;height:10px;bottom:-8px;right:-8px;cursor:se-resize;z-index:334;background:url("+x+"icon.png);",event:{add:"mousedown",fn:t}}));d.appendChild(a)};f=p.$=function(){var d=function(a,c){return d.setNode(a,c)};d.env={ie:/MSIE/i.test(navigator.userAgent),
ie6:/MSIE 6/i.test(navigator.userAgent),ie7:/MSIE 7/i.test(navigator.userAgent),ie8:/MSIE 8/i.test(navigator.userAgent),firefox:/Firefox/i.test(navigator.userAgent),opera:/Opera/i.test(navigator.userAgent),webkit:/Webkit/i.test(navigator.userAgent),camino:/Camino/i.test(navigator.userAgent)};d.addEvent=function(a,c,b){c=c.toLowerCase();a.addEventListener?a.addEventListener(c,b,false):a.attachEvent&&a.attachEvent("on"+c,b)};d.removeEvent=function(a,c,b){c=c.toLowerCase();a.removeEventListener?a.removeEventListener(c,
b,false):a.detachEvent&&a.detachEvent("on"+c,b)};d.getEvent=function(a){a.stopPropagation?a.stopPropagation():a.cancelBubble=true;return{target:d.getTargetFromEvent(a),preventDefault:function(){a.preventDefault?a.preventDefault():a.returnValue=false}}};d.getTargetFromEvent=function(a){a=a.srcElement||a.target;if(a.nodeType===3)a=a.parentNode;return a};d.getArrayOfClassNames=function(a){var c=[],b=[];a.className&&(b=a.className.split(" "));for(a=0;a<b.length;a++)b[a].length!==0&&c.push(b[a]);return c};
d.addClass=function(a,c){var b=d.getArrayOfClassNames(a),g={},e;for(e=0;e<b.length;e++)b[e]!==""&&(g[b[e]]=true);c=c.split(" ");for(e=0;e<c.length;e++)c[e]!==""&&!g[c[e]]&&(b.push(c[e]),g[c[e]]=true);a.className=b.join(" ")};d.removeClass=function(a,c){var b=d.getArrayOfClassNames(a),g={},e,f;for(e=0;e<b.length;e++)g[b[e]]=true;c=c.split(" ");for(e=0;e<c.length;e++)g[c[e]]&&delete g[c[e]];b=[];for(f in g)g.hasOwnProperty(f)&&b.push(f);a.className=b.join(" ")};d.hasClass=function(a,c){var b,d=0,e;
c.replace(/^\s+/,"");c.replace(/\s+$/,"");c=c.split(" ");for(e=0;e<c.length;e++)if(c[e]!==""&&(d++,b=RegExp(c[e]),b.test(a.className)===false))return false;return d>0?true:false};d.getObjectOfStyle=function(a){var c=0,b=0,d={},e="";if(typeof a!=="string"&&(a=a.getAttribute("style"))&&typeof a==="object")a=a.cssText;if(a){a=a.split(";");for(c=0,b=a.length;c<b;c++)a[c]&&(e=a[c].split(":"),e.length===2&&(e[0]=e[0].replace(/^[\s]+/g,""),e[1]=e[1].replace(/^[\s]+/g,""),e[0]=e[0].replace(/[\s]+$/g,""),
e[1]=e[1].replace(/[\s]+$/g,""),d[e[0].toLowerCase()]=e[1]))}return d};d.setObjectOfStyle=function(a,c){var b="",g,e=d.env.ie;arguments.length===1&&(c=a);if(typeof c==="string")b=c;else for(g in c)c.hasOwnProperty(g)&&(b=e?b.concat(g.toUpperCase()+":"+c[g]+";"):b.concat(g+":"+c[g]+";"));if(arguments.length>1)a.style.cssText=b;return b};d.addStyle=function(a,c){var b=d.getObjectOfStyle(a),g;typeof c==="string"&&(c=d.getObjectOfStyle(c));for(g in c)c.hasOwnProperty(g)&&(b[g]=c[g]);d.setObjectOfStyle(a,
b)};d.removeStyle=function(a,c){var b=d.getObjectOfStyle(a),g;for(g in c)c.hasOwnProperty(g)&&delete b[g];d.setObjectOfStyle(a,b)};d.getPropStyle=function(a,c){if(c&&a)if(a.style[c])return a.style[c];else if(a.currentStyle)return a.currentStyle[c];else if(k.defaultView&&k.defaultView.getComputedStyle){var c=c.replace(/([A-Z])/g,"-$1").toLowerCase(),b=k.defaultView.getComputedStyle(a,"");return b&&b.getPropertyValue(c)}return null};d.setNode=function(a,c){var b,g;if(arguments.length===0||a===void 0)return k.createElement("div");
if(arguments.length===1||c===void 0)c=a,a=k.createElement(c.tag||c.Tag||"div"),delete c.tag,delete c.Tag;if(typeof c==="string")switch(c.toLowerCase()){case "hide":b=a;g=getPropStyle(b,"display");if(g!=="none")b.myoldDisplay=g;b.style.display="none";break;case "show":if(b=a,getPropStyle(b,"display")==="none")b.style.display=b.myoldDisplay==="none"?"block":b.myoldDisplay}else for(b in c)if(c.hasOwnProperty(b))switch(b){case "event":case "Event":var e=c.event||c.Event||{};e.add?d.addEvent(a,e.add,e.fn):
e.remove&&d.removeEvent(a,e.remove,e.fn);break;case "Attr":case "attr":e=c.Attr||c.attr||{};for(g in e)e.hasOwnProperty(g)&&(g==="style"?d.addStyle(a,e[g]):a.setAttribute(g,e[g]));break;case "html":case "HTML":a.innerHTML=c.html;break;default:if(c.hasOwnProperty(b)){if(b==="style"){d.addStyle(a,c[b]);continue}a.setAttribute(b,c[b])}}return a};d.request=function(a,c){var b=null,d=a.method?a.method.toUpperCase():"GET",e=a.url,f="",h="";delete a.method;delete a.url;b=n.XMLHttpRequest?new XMLHttpRequest:
new ActiveXObject("Microsoft.XMLHTTP");for(f in a)a.hasOwnProperty(f)&&(h+=f+"="+a[f]+"&");h=h.substr(0,h.length-1);d==="GET"&&(e=/\?/.test(e)?e+"&"+h:e+"?"+h);b.open(d,encodeURI(e),true);b.onreadystatechange=function(){b.readyState===4&&(b.status===200?c(b.responseText):c())};d==="POST"?(b.setRequestHeader("Content-type","application/x-www-form-urlencoded"),b.setRequestHeader("Content-length",h.length),b.send(encodeURI(h))):b.send()};d.detectMedia=function(a){var c={object:1,embed:1,video:1},b;if(typeof a===
"object"||typeof a==="function")return a.nodeName.toLowerCase()==="div"&&a.getAttribute("role")?a.getAttribute("role"):a.nodeName.toLowerCase()==="img"?"image":c[a.nodeName.toLowerCase()]?"media":a.nodeName.toLowerCase()==="iframe"?"iframe":"text";else if(typeof a==="string"&&!(/^<(\w+)[\s\w\=\"\']*>.*<\/\1>$/i.test(a)===false&&/^<(\w+)[\s\w\=\"\']*\/>$/i.test(a)===false)){if(/^<img/i.test(a))return"image";else if(/^<iframe/i.test(a))return"iframe";else for(b in c)if(c.hasOwnProperty(b)&&RegExp("^<"+
b,"i").test(a))return"media";return"text"}};d.bind=function(a,c,b){var d=c||n,e=Array.prototype.slice.call(arguments,3);return b?function(){var c=arguments;if(a.tId===void 0)a.tId=setTimeout(function(){a.apply(d,e.concat(Array.prototype.slice.call(c,0)));delete a.tId},b)}:function(){return a.apply(c,e.concat(Array.prototype.slice.call(arguments,0)))}};return d}();p.init=function(d){var a=k.getElementById(d),c;if(a===null)throw"wall0 > Not found id: "+d;z&&p.destroy();c=k.createDocumentFragment();
r=f({"class":"wall-editor",style:"position:relative;width:"+a.offsetWidth+"px;height:"+a.offsetHeight+"px;border:1px solid #069;cursor:default;"});s=f.setNode({"class":"wall0-area",style:"position:relative;width:100%;height:100%;background:transparent;overflow:hidden;"});s.innerHTML=a.value||a.innerHTML;if(f.hasClass(s.firstChild,"wall0-area"))s.innerHTML=s.firstChild.innerHTML;B(s).then(function(){C(s);console.log("wall0 > normalize complete")});r.appendChild(s);r.appendChild(f({style:"position:absolute;bottom:0px;width:100%;height:10px;cursor:s-resize;",
event:{add:"mousedown",fn:l}}));c.appendChild(r);a.parentNode.appendChild(c);f.addEvent(k,"click",D);f.addEvent(k,"dblclick",E);f.addEvent(k,"mousedown",w);u="normal";console.log("wall0 > create instance for id:"+d,x);z=d;return p};p.destroy=function(){console.log("wall0 > destroy instance for id:"+z)};p.listen=function(d,a){var c;if(typeof d==="string"&&typeof a==="function")d=d.replace(/\s /ig,""),v[d]||(v[d]=[]),c=v[d].length,v[d][c]=a};p.notify=function(d){var a,c,b;if(typeof d==="string"&&(d=
d.replace(/\s /ig,""),v[d])){b=Array.prototype.slice.call(arguments,1);for(a=0,c=v[d].length;a<c;a++)v[d][a].apply(p,b)}};p.getContent=function(){return s.outerHTML};n.wall0=p})(window);
