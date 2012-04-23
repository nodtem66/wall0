define(['lib'], function ($) {
	return function (root) {
		if (!root) {
			return undefined;
		}
		var queue = [], originalmyqueue = [], i, j, originalmylen, len, currentNode, currentOriginalNode, flagFloor1 = true,
			tempNode, newTree = root.cloneNode(true), top, left, display, role;
		queue.push(newTree);
		originalmyqueue.push(root);
		//
		var addNewNode = function (role, node, original) {
			var temp = node.cloneNode(true),
				opt = {
					'role': role,
					'style': {
						'position': 'absolute',
						'top': original.offsetTop + 'px',
						'left': original.offsetLeft + 'px',
						'overflow': 'hidden',
						'height': original.offsetHeight + 'px',
						'width': original.offsetWidth + 'px'
					}
				};
			if (role === 'iframe' || role === 'media') {
				opt.html = '<div class="jb-media-mousemoveEvent">&#160;</div>';
			}
			temp = $.setNode(opt).appendChild(temp).parentNode;
			if (role === 'media' && temp.childNodes[1].nodeName.toLowerCase() === 'object') {
				temp.childNodes[1].insertBefore($.setNode({
					tag: 'param',
					'name': 'wmode',
					'value': 'opaque'
				}), temp.childNodes[1].childNodes[0]);
				temp.childNodes[1].lastChild.setAttribute('wmode', 'opaque');
			}
			newTree.appendChild(temp);
		};

		//Start BFS in 2 trees
		while (queue.length > 0) {
			currentNode = queue.pop();
			currentOriginalNode = originalmyqueue.pop();
			if (currentNode.childNodes.length === 0) {
				continue;
			}
			for (i = 0, j = 0, originalmylen = currentOriginalNode.childNodes.length, len = currentNode.childNodes.length;
					i < len && j < originalmylen;
					i++, j++) {

				if (currentNode.childNodes[i].nodeName === '#comment') {
					continue;
				}

				if (currentNode.childNodes[i].nodeName === '#text') {
					if (/[\S]/ig.test(newTree.childNodes[i].nodeValue)) {
						if (flagFloor1) {
							//build #text wrapper
							tempNode = $.setNode({
								tag: 'span',
								html: newTree.childNodes[i].nodeValue
							});
							newTree.insertBefore(tempNode, newTree.childNodes[i]);
							newTree.removeChild(newTree.childNodes[i + 1]);
							i--;
							j--;
						}
					} else {
						newTree.removeChild(newTree.childNodes[i]);
						i--;
						len--;
					}
				} else {

					if (currentNode.childNodes[i].getAttribute("role")) {
						continue;
					}
					role = $.detectMedia(currentNode.childNodes[i]);
					switch (role) {
					case "image":
					case "iframe":
					case "media":
						if (!flagFloor1 && currentNode.childNodes.length === 1) {
							//if current node has only one child, find a real root to remove this node
							tempNode = currentNode;

							//case: nested node with single child
							while (tempNode.parentNode.childNodes.length === 1 && !$.hasClass(tempNode.parentNode, "wall0-area")) {
								tempNode = tempNode.parentNode;
							}
							//now tempNode store node that has only one child
							addNewNode(role, currentNode.childNodes[i], currentOriginalNode.childNodes[j]);
							tempNode.parentNode.removeChild(tempNode);

						} else {
							//normally move to root of newTree
							addNewNode(role, currentNode.childNodes[i], currentOriginalNode.childNodes[j]);

							currentNode.removeChild(currentNode.childNodes[i]);
							i--;
							len--;
						}
						break;
					case "text":
						if (currentNode.childNodes[i].innerHTML === "" && currentNode.childNodes[i].nodeName.toLowerCase() !== "div") {
							currentNode.removeChild(currentNode.childNodes[i]);
							i--;
							len--;
							continue;
						} else if (flagFloor1) {
							left = top = 0;
							tempNode = currentOriginalNode.childNodes[j];
							if (tempNode.offsetTop) {
								top = tempNode.offsetTop;
								left = tempNode.offsetLeft;
							} else if (j > 0) {
								tempNode = currentOriginalNode.childNodes[j - 1];
								display = $.getPropStyle(tempNode, 'display');
								if (display && display.indexOf('inline') >= 0) { //display inline
									top = tempNode.offsetTop;
									left = tempNode.offsetLeft + tempNode.offsetWidth;
									if (left > document.offsetWidth) {
										top += tempNode.offsetHeight;
										left = 0;
									}
								} else { //display block
									top = tempNode.offsetTop + tempNode.offsetHeight +
										parseInt($.getPropStyle(tempNode, 'margin-top'), 10) +
										parseInt($.getPropStyle(tempNode, 'margin-bottom'), 10) +
										parseInt($.getPropStyle(tempNode, 'padding-top'), 10) +
										parseInt($.getPropStyle(tempNode, 'padding-bottom'), 10);
									left = 0;
								}

							}

							if (currentNode.childNodes[i].nodeName.toLowerCase() !== "div") {
								tempNode = currentNode.childNodes[i].cloneNode(true);
								tempNode = $.setNode().appendChild(tempNode).parentNode;
								tempNode = $.setNode({
									"role" : 'text',
									"style" : {"position": "absolute", "top": top + "px", "left": left + "px", "overflow": "hidden"}
								}).appendChild(tempNode).parentNode;

								if (newTree.childNodes.length === 0) {
									newTree.appendChild(tempNode);
								} else {
									newTree.insertBefore(tempNode, newTree.childNodes[i]);
									newTree.removeChild(newTree.childNodes[i + 1]);
								}
							} else {
								$.setNode(newTree.childNodes[i], {
									"role" : 'text',
									"style" : {"position": "absolute", "top": top + "px",
											"left": left + "px", "overflow": "hidden"}
								});
							}
						}
						queue.push(currentNode.childNodes[i]);
						originalmyqueue.push(currentOriginalNode.childNodes[j]);
						break;
					default:
						break;
					}
				}
			}
			if (flagFloor1) {
				flagFloor1 = false;
			}
		}

		for (i = 0, len = newTree.childNodes.length; i < len; i++) {

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

});