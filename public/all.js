// ajax

function ajax(method, url, data, responseType, callback) {
	if (arguments.length < 3)
		throw new Error('Arguments count error: ' + arguments.length + '.');

	if (arguments.length == 3) {
		callback = data;
		data = undefined;
	} else if (arguments.length == 4) {
		callback = responseType;
		responseType = undefined;
	}

	var http = new XMLHttpRequest();

	http.open(method, url, true);

	http.onload = function () {
		callback(undefined, http.response);
	}

	http.onerror = function (error) {
		callback(error);
	}

	if (responseType)
		http.responseType = responseType;

	http.send(data);
}

ajax.get = function(url, responseType, callback) {
	ajax.bind(this, 'get').apply(this, arguments); 
}

ajax.post = function(url, data, responseType, callback) {
	ajax.bind(this, 'post').apply(this, arguments); 
} 

// ajax.submit = function(form, responseType, callback) {
// 	if (form.method  && form.method.upperCase == 'POST') {
// 		throw new Error (To be implement);		
// 	}
// 	var params  = [];
// 	all(form, '*').forEach(item) {
// 		if (item instanceof HTMLInputElement) {
// 			if (item.name)
// 				params.push('' + item.name + '=' + encodeURIComponent(item.value));
// 		}
// 	}
// 	ajax.get(form.action + '?' + params.join('&'), responseType, callback);
// }

// all

function all(root, selector) {
	if (this === window)
		return new all(root, selector);

	if (!selector) {
		selector = root;
		root = document;
	}

	if (typeof selector === 'string') {
		this.target = root.querySelectorAll(selector);
	} else {
		this.target = selector;
	}

	this.isArray = Array.isArray(this.target) || 
		this.target instanceof NodeList ||
		this.target instanceof HTMLCollection;
}

function one(root, selector) {
	if (!selector) {
		selector = root;
		root = document;
	}

	var a = new all(null);

	if (typeof selector === 'string') {
		a.target = root.querySelector(selector);
	} else {
		a.target = selector;
	}
	
	return a;
}

all.prototype.forEach = function (handler) {
	if (this.isArray) {
		for (var i = 0; i < this.target.length; i++) {
			if (handler(this.target[i], i, this.target))
				break;
		}
	} else {
		handler(this.target, 0, [this.target]);
	}

	return this;
}


all.prototype.map =function (handler) {
	var targets = this.target;

	if (!this.isArray) {
		targets = [this.target];
	}

	var array = [];
	for (var i = 0; i < targets.length; i++) {
		array.push(handler(targets[i], i, targets));
	}

	return new any(array);
}

all.prototype.filter = function (handler) {
	var targets = this.target;

	if (!this.isArray) {
		targets = [this.target];
	}

	var array = [];
	for (var i = 0; i < targets.length; i++) {
		if (!handler(targets[i], i, targets))
			array.push(targets[i]);
	}

	return new any(array);
}

all.prototype.handle = function (handler) {
	if (this.isArray) {
		for (var i = 0; i < this.target.length; i++) {
			if (this.target[i])
				handler(this.target[i]);
		}
	} else {
		if (this.target)
			handler(this.target);
	}

	return this;
}

all.assign = function(o, obj) {
	if (!obj)
		return o;

	if ((typeof obj === 'object' || typeof obj === 'function') && 
		(typeof o === 'object' || typeof o === 'function')) {
		for (var n in obj) {
			if (obj.hasOwnProperty(n))
				o[n] = obj[n]; 
		}
	}
	return o;
}

all.prototype.assign = function(obj) {
	this.forEach(function(item) {
		all.assign(item, obj);
	});
}

all.string = function(fn) {
	return fn.toString().split('\n').slice(1, -1).join('\n');
}


function init_all() {
	init_menus();
}

// menu

function init_menus() {
	all('.menu').forEach(function (menu) {
		all(menu.children).forEach(function (item) {
			if (item instanceof HTMLLIElement) {
				item.openSubmenu = function () {
					one(this, '.submenu').handle(function (submenu) {
						submenu.classList.add("popup");
					});
				};
				item.closeSubmenu = function () {
					one(this, '.submenu').handle(function (submenu) {
						submenu.classList.remove("popup");
					});
				};
				if (item.dataset.autopopup) {
					item.onmouseenter = function () {
						this.openSubmenu();
					};
				}
				item.onmouseleave = function () {
					this.closeSubmenu();
				};
			}
		});
	});
}

// symbols

var symbols = {
	space: " ",
	waiting: "…",
	ok: "√",
	wrong: "×",
}

