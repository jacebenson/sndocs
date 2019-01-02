var FunctionPolyfill;

// Simple home-grown polyfill for bind().
if (!Function.prototype.bind) {
	Function.prototype.bind = function(_this) {
		var fn = this,
			args = Array.prototype.slice.call(arguments, 1);

		return function() {
			return fn.apply(_this, args.concat(Array.prototype.slice.call(arguments)));
		};
	};
}
