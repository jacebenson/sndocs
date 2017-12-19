/**
 * Manipulates FC WWN (World Wide Names).
 * @author roy.laurie
 * @since fuji
 */
var StorageWWN = function(wwn) {
	this.wwn = StorageWWN.parse(wwn);
};


(function() {
	var noWWN = '00:00:00:00:00:00:00:00',
		header = /\\1.*$/,
		simple = /^[0-9a-f]{2}(?:\:[0-9a-f]{2}){7}(?:(?:\:[0-9a-f]{2}){8})?$/,
		prefixed = /^(?:0x|3)?(?:[0-9a-f]{16}){1,2}$/,
		splitter = /([0-9a-f]{2})/g;

StorageWWN.prototype.type = 'StorageWWN';

StorageWWN.parse = function(wwn) {
	var wwnParsed = noWWN;

	if (wwn)
		wwnParsed = (''+wwn).trim().toLowerCase() || wwnParsed;

	// remove header found from some SMI results
	// example: 2000002A6A7C8118\16846848\1
	wwnParsed = wwnParsed.replace(header, '');
	
	// handle various notations
	if (wwnParsed.match(simple) !== null) {
		// regex matches preferred format:
		//  20:00:00:2a:6a:7c:81:18
		// nothing to do here, default notation
	} else if (wwnParsed.match(prefixed) !== null) {
		// regex matches following formats:
		//   2000002a6a7c8118
		//   0x2000002a6a7c8118
		//   32000002a6a7c8118
		if (wwnParsed.charAt(1) == 'x' && wwnParsed.charAt(0) == '0')     // remove hex prefix
			wwnParsed = wwnParsed.substring(2);
		else if (wwnParsed.charAt(0) == '3') // remove scsi_id's prefix of 3
			wwnParsed = wwnParsed.substring(1);
		
		// split into pairs
		wwnParsed = wwnParsed.match(splitter).join(':');
	}
	
	return wwnParsed;
};

StorageWWN.prototype.getWWN = function() {
	return this.wwn;
};

StorageWWN.prototype.valueOf = function() {
	return this.wwn;
}

/**
 * Determines whether this WWN is lexicographically less than the provided WWN.
 * 
 * @param StorageWWN|string rhWWN WWN to compare to. Will be converted to StorageWWN if string.
 * @return boolean TRUE if this WWN is less than the right-hand WWN, FALSE otherwise.
 */
StorageWWN.prototype.lessThan = function(rhWWN) {
	if (!(rhWWN instanceof StorageWWN))
		rhWWN = new StorageWWN(rhWWN);
	
	var lh = this.getWWN();
	var rh = rhWWN.getWWN();
	return ( lh < rh );
};

/**
 * Determines whether this WWN is lexicographically greater than the provided WWN.
 * 
 * @param StorageWWN|string rhWWN WWN to compare to. Will be converted to StorageWWN if string.
 * @return boolean TRUE if this WWN is greater than the right-hand WWN, FALSE otherwise.
 */
StorageWWN.prototype.greaterThan = function(rhWWN) {
	if (!(rhWWN instanceof StorageWWN))
		rhWWN = new StorageWWN(rhWWN);
	
	var lh = this.getWWN();
	var rh = rhWWN.getWWN();
	return ( lh > rh );
};

StorageWWN.prototype.toString = function() {
	return this.wwn;
};

})();