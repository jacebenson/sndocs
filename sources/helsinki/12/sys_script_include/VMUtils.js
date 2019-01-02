var VMUtils = Class.create();

/**
 * Convert the UUID to a format that matches the original format in our system.  vCenter works with UUIDs
 * where the ESX Linux console worked with this format
 */
VMUtils.turnUuidToCorrelationId = function(uuid) {
    // The format of the uuid returned from vCenter is fixed to match this reg exp, according
    // to the documentation, so it should match, but verify anyway and return an empty string 
    // if it doesn't match
    var verify = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/i.exec(uuid);

    if (verify) {
        var stripped = uuid.replace(/\-/g, '');
        var pattern = /[0-9a-f]{2}/ig;

        var match = pattern.exec(stripped);
        var id = '';

        while (match) {
            if (id.length > 0)
                id += ' ';
            id += match;
            match = pattern.exec(stripped);
        }

        // Based on the expected format, currently will always be in the same spot 
        return id.substr(0, 23) + '-' + id.substr(24);
    }

    return '';
}

/**
 * Turn a correlation ID into a UUID for a virtual machine in our system
 */
VMUtils.turnCorrelationIdToUuid = function(correlation_id) {
    var verify = /^([0-9a-f]{2} ){7}[0-9a-f]{2}-[0-9a-f]{2}( [0-9a-f]{2}){7}$/i.exec(correlation_id);
    if (verify) {
        var collapsed = correlation_id.replace(/ /g, "");
        var uuid = collapsed.substr(0,8) + "-" + collapsed.substr(8,4) + "-" 
            + collapsed.substr(12,9) + "-" + collapsed.substr(21);
        return uuid;
    }

    return '';
}
	
	
VMUtils.isChangeRequestRequired = function(action) {
	
}
