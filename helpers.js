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
}
