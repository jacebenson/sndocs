(function() {

var units = {
		B: 1,
		K: 1000,
		M: 1000000,
		G: 1000000000,
		T: 1000000000000
	},
	gfc = {
		1062500000: 1,
		2125000000: 2,
		4250000000: 4,
		8500000000: 8,
		10518750000: 10,
		14025000000: 16,
		21037500000: 20,
		28500000000: 32
	};

/**
 * Converts data rates to Gbps.
 *
 * @since fuji
 * @author roy.laurie
 *
 * @param number|string rate
 * @param string unitOfMeasurement  Optional unit of measurement.  
 *
 * The parsing of units is pretty lax, by design.  'GFC' is special-cased using
 * the gfc table above.  Otherwise, the first character of the unit is converted
 * to upper case and we look for the multiplier in the 'units' table above.  This
 * means, for example, that anything that starts with 'm' is considers Megabits.
 *
 * This class previously translated between units.
 *
 * Note that DiscoveryDataRate is being assigned to an undeclared global variable
 * to export it from the closure.
 */
DiscoveryDataRate = function(rate, unit) {
	this.bytesPerSecond = getBps(rate, unit);
}

DiscoveryDataRate.prototype.to = function() {
	return DiscoveryDataRate.toGFC(this.bytesPerSecond);
}

DiscoveryDataRate.toGFC = function(rate, unit) {

	if (!rate)
		return 'Unknown';

	// The lazy man's way to round to 3 digits:
	// Get the rate (as a string) rounded to 3 digits
	rate = (getBps(rate, unit) / units.G).toFixed(3);

	// Parse the string back into a number, then re-convert
	// to a string to get rid of trailing 0s.
	return parseFloat(rate);
}

// Allowed units: B, K, M, G, T, GFC
// No unit, < 100 implies G, otherwise B
function getBps(rate, unit) {

	if (!unit && typeof rate == 'string')
		unit = rate.split(/\s+/)[1];

	unit = unit && unit.trim();

	rate = parseFloat(rate);

	// Special case for GFC.
	if (unit == 'GFC') {
		rate = gfc[rate] || rate;
		if (rate > 10000)
			rate /= 1062500000;

		unit = 'G'
	}

	if (!unit)
		unit = (rate < 10000) ? 'G' : 'B';

	unit = unit.charAt(0).toUpperCase();

	return rate * units[unit];
}

})();