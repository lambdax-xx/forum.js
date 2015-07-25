// helpers

global.helpers = {
	assign: function(o, obj) {
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
	},

	// multipart/form-data
	parseMultipart: function (text) {
		var sp = text.split("\r\n")[0];
		
		var kvs = text.split(sp).slice(1, -1);

		var data = {};

		var g = /name="(.*)"/;

		for (var i = 0; i < kvs.length; i++) {
			var kv = kvs[i];
			var r = g.exec(kv);
			if (!r) continue;

			var s = kv.search('\r\n\r\n') + 4;
			var l = kv.length - s - 2;

			data[r[1]] = kv.substr(s, l);
		}

		//console.log(text);
		//console.log(data);
		
		return data;
	}
}
