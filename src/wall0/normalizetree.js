define(['lib'],function($){
	return function(root) {
		if(!root) {
			return "";
		}
		var queue = [], original_queue = [], i, j, original_len, len, currentNode, currentOriginalNode, flagFloor1 = true, 
		tempNode, newTree = root.cloneNode(true),top,left,role;
		
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
				opt.html = '<div class="jb-media-touch">&#160;</div>';
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
				
				if(currentNode.childNodes[i].nodeName != "#text" && currentNode.childNodes[i].nodeName != "#comment") {
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
								if(currentNode.childNodes[i].nodeName.toLowerCase() != "div") {
									tempNode = currentNode.childNodes[i].cloneNode(true);
									tempNode = $.setNode().appendChild(tempNode).parentNode;
									tempNode = $.setNode({
										"role" : 'text',
										"style" : {"position":"absolute","top": currentOriginalNode.childNodes[j].offsetTop + "px",
												"left": currentOriginalNode.childNodes[j].offsetLeft + "px","overflow":"hidden"}
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
										"style" : {"position":"absolute","top": currentOriginalNode.childNodes[j].offsetTop + "px",
												"left": currentOriginalNode.childNodes[j].offsetLeft + "px","overflow":"hidden"}
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
			
			if(newTree.childNodes[i].nodeName == "#text") {
				if(/[\S]/ig.test(newTree.childNodes[i].nodeValue)) {					
					//build #text wrapper
					tempNode = $.setNode({
						tag : "div",
						"role" : "pre-text",
						"style" : "position:absolute;",
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
		for(i=0;i<len;i++){
			if(i > 0 && root.childNodes[i].getAttribute('role') == 'pre-text'){
				tempNode = root.childNodes[i-1];
				top = tempNode.offsetTop + tempNode.offsetHeight;
				//left = tempNode.offsetWidth + tempNode.offsetLeft;
				//if(left > document.width) 
				left = tempNode.offsetLeft;
				$.addStyle(root.childNodes[i], {'top': top+'px','left':left+'px'});
			}
		}
		return true;
	};
	
});