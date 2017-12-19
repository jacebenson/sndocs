// Discovery class

/**
 * Formats hostnames according to property settings.
 * 
 * Tom Dilatush tom.dilatush@service-now.com & Aleck Lin aleck.lin@service-now.com
 */
var HostnameJS = Class.create();

HostnameJS.prototype = {
    initialize: function() {
        this.sysName = "";
        this.dnsDomain = "";
		this.logger = null;
    },

    format: function(hostname, source) {
        var sysName = hostname;
        if ((sysName == null) || (typeof sysName == 'undefined') || gs.nil(sysName))
            return null;

        // Check to see if the case of the hostname needs to be manipulated
        var change = gs.getProperty('glide.discovery.hostname.case', 'No change');
        if (change == 'Lower case')
            sysName = sysName.toLowerCase();
        else if (change == 'Upper case') 
            sysName = sysName.toUpperCase();

        var inc_domain = gs.getProperty('glide.discovery.hostname.include_domain', 'false');
		
        // Parse the name and parse the hostname and domain name apart if the format is something like abc.domain.com
        this._parseFQDN(sysName);
        var sysName = this.getSysName();
        var domainName = this.getDomainName();

        if (this._isLocalhost(sysName)) {
            if (inc_domain == "true")
                return sysName + ( JSUtil.notNil(domainName) ? ('.' + domainName) : '' ) 
                   + ( JSUtil.nil(source) ? '' : ('@' + source) );
            else
                return sysName + ( JSUtil.nil(source) ? '' : ('@' + source) );
        } 

        if (inc_domain == "true")
            return sysName + ( JSUtil.notNil(domainName) ? ('.' + domainName) : '' );      

        return sysName;
    },

    getSysName: function() {
        return this.sysName;
    },

    // This method gets called for retrieving dns domain name
    getDomainName: function() {
        return this.dnsDomain;
    },
	
	getFQDN: function() {
		if (JSUtil.nil(this.dnsDomain))
			return this.sysName;
		else
			return this.sysName + "." + this.dnsDomain;
	},

    _parseFQDN: function(sysName) {
        this.sysName = sysName		
			
		// A fully qualified domain name should never have spaces in it. If it does, then we can't really parse it.
		if (sysName.indexOf(" ") > -1)
			return;
			
        // If the hostname is an IP address, then there's really nothing to parse.
        if (SncIPAddressV4.getIPAddressV4Instance(sysName))
            return;

        // In order to parse FQDN, the name must have at least 2 dots in it, such as mac1.snc.com
        var parts = sysName.split('.');
        if (parts.length < 3)
            return;

        // Parse FQDN with regex. By default, we take the first one separated by dot as 
        // the host name and the rest of at least two as the domain name.
		try {
			var regexStr = gs.getProperty('glide.discovery.fqdn.regex', "^([^.]+)\\.((?:[^.]+\\.)+[^.]+)$");
			var fqdnRegex = new RegExp(regexStr);
			var groups = fqdnRegex.exec(sysName);
			if (groups.length != 3)
				return;
	
			this.sysName = groups[1];
			this.dnsDomain = groups[2];
		} catch (e) {
			this.log("FQDN parsing error! The regex " + regexStr + " was not able to parse '" + sysName + "'. The error is " + e.message, "warning");
		}
    },

	setLogger: function(logger) {
		this.logger = logger;
	},
	
	log: function(msg, type) {
		if (this.logger == null)
			gs.log(msg);
		else {
			if (type == "information")
				this.logger.info(msg);
			else if (type == "warning")
				this.logger.warn(msg);
			else if (type == "error")
				this.logger.error(msg);			
		}
	},
	
    /*
     *  If the name starts with localhost or 127.0.0.1, that means it hasn't been configured 
     *  and we should probably specially treat these because otherwise it become confusing.
     */
    
    _isLocalhost: function(sysName) {
        if (sysName.indexOf('localhost') > -1)
            return true;

        if (sysName.indexOf("127.0.0.1") > -1)
            return true;

        return false;
    },

    type: "HostnameJS"
};