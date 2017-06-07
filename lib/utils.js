const fs = require('fs')

var helpers = {};

helpers.readFileString = (fileName) => {
	return new Promise(function(resolve, reject) {
		fs.readFile(fileName, (err, data) => {
			if (err) {
				return reject(err)
			}
			resolve(data.toString())
		})
	})
}

// -- Basic js utility methods
helpers.each = function(loopable, callback, self, reverse) {
	// Check to see if null or undefined firstly.
	var i, len;
	if (Array.isArray(loopable)) {
		len = loopable.length;
		if (reverse) {
			for (i = len - 1; i >= 0; i--) {
				callback.call(self, loopable[i], i);
			}
		} else {
			for (i = 0; i < len; i++) {
				callback.call(self, loopable[i], i);
			}
		}
	} else if (typeof loopable === 'object') {
		var keys = Object.keys(loopable);
		len = keys.length;
		for (i = 0; i < len; i++) {
			callback.call(self, loopable[keys[i]], keys[i]);
		}
	}
};
helpers.clone = function(obj) {
	var objClone = {};
	helpers.each(obj, function(value, key) {
		if (Array.isArray(value)) { 
			objClone[key] = value.slice(0);
		} else if (typeof value === 'object' && value !== null) {
			objClone[key] = helpers.clone(value);
		} else {
			objClone[key] = value;
		}
	});
	return objClone;
};
helpers.extend = function(base) {
	var setFn = function(value, key) {
		base[key] = value;
	};
	for (var i = 1, ilen = arguments.length; i < ilen; i++) {
		helpers.each(arguments[i], setFn);
	}
	return base;
};

module.exports = helpers
