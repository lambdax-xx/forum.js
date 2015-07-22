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

// all

function all(selector) {
	if (this === window)
		return new S(selector);

	if (typeof selector === 'string') {
		this.target = document.querySelectorAll(selector);
	} else {
		this.target = selector;
	}

	this.isArray = Array.isArray(this.target) || 
		this.target instanceof NodeList ||
		this.target instanceof HTMLCollection;
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