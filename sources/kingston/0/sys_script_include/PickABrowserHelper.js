gs.include("ClientTestRunnerBrowserInfo");
var PickABrowserHelper = Class.create();
PickABrowserHelper.prototype = Object.extendsObject(AbstractAjaxProcessor, {
	/**
	 * Parses the user agent string from the test runner
	 * If the customized user agent parser returns a non-null object, it is used
	 * If not, uses the OOB functions and parses the user agent string
	 * returns a ClientTestRunnerBrowserInfo object 
	 * containing the browser name, browser version and the OS
	 */
	parseUserAgent: function(userAgent) {
		var uaParser = new PickABrowserUserAgentParser();
		var browserInfo = uaParser.parseUserAgent(userAgent);
		if (browserInfo)
			return browserInfo;

		var name = this.getBrowserName(userAgent);
		return new ClientTestRunnerBrowserInfo(name, this.getBrowserVersion(userAgent, name), this.getOSName(userAgent), this.getOSVersion(userAgent));
	},

	getBrowserName: function(userAgent) {
		if (this.contains(userAgent, "Opera") || this.contains(userAgent, "OPR"))
			return "Opera";

		if (this.contains(userAgent, "Trident") || this.contains(userAgent, "MSIE"))
			return "IE";

		if (this.contains(userAgent, "Edge"))
			return "Edge";

		if (this.contains(userAgent, "Firefox"))
			return "Firefox";

		if (this.contains(userAgent, "Safari") && !this.contains(userAgent, "Chrome"))
			return "Safari";

		return "Chrome";
	},

	getBrowserVersion: function(userAgent, browser) {
		var pattern;

		if (browser == "IE")
			return this.getIEVersion(userAgent);
		else if (browser == 'Chrome')
			pattern = /Chrome\/([\d\.]{2,15})/;
		else if (browser == 'Firefox')
			pattern = /Firefox\/([\d\.]{2,15})/;
		else if (browser == 'Safari')
			pattern = /Version\/([\d\.]{3,10})/;
		else if (browser == 'Opera')
			pattern = /OPR\/([\d\.]{2})/;
		else if (browser == 'Edge')
			pattern = /Edge\/([\d\.]{2,10})/;

		var matched = pattern.exec(userAgent);
		if (matched && matched.length >= 2)
			return matched[1];

		return "";
	},

	getIEVersion: function(userAgent) {
		pattern = /(MSIE |rv:)([\d]{1,2})/;
		var matched = pattern.exec(userAgent);
		if (matched && matched.length >=3)
			return matched[2];

		return "";
	},

	/*
	 * Get the OS name from the user agent
	 */
	getOSName: function(userAgent) {
		if (this.contains(userAgent, "Windows"))
			return "Windows";
		else if (this.contains(userAgent, "Linux"))
			return this.getLinuxName(userAgent);
		else if (this.contains(userAgent, "Mac OS X"))
			return "Mac OS X";
		return "";
	},

	/*
	 * Get the OS version from the user agent
	 */
	getOSVersion: function(userAgent) {
		var pattern = /Windows NT ([\d\.]{1,4})/;
		var matched = pattern.exec(userAgent);

		if (matched && matched.length >=2) {
			return this.getWindowsVersion(matched[1]);
		} else if (this.contains(userAgent, "Windows 98")) {
			return "98";
		} else if (this.contains(userAgent, "Windows 95")) {
			return "95";
		} else if (this.contains(userAgent, "Windows CE")) {
			return "CE";
		} else if (this.contains(userAgent, "Linux")) {
			return this.getLinuxVersion(userAgent);
		} else {
			pattern = /Mac OS X\s*([\d\.?\_]*)/;
			matched = pattern.exec(userAgent);
			if (matched && matched.length >= 2)
				return matched[1];
		}
		return "";
	},

	/*
	 * Get the windows version from the useragent
	 */
	getWindowsVersion: function(version) {
		switch(version) {
			case "6.3":
				return "8.1";
			case "6.2":
				return "8";
			case "6.1":
				return "7";
			case "6.0":
				return "Vista";
			case "5.0":
				return "2000";
			case "5.01":
				return "2001(SP1)";
			case "5.1":
				return "XP";
			case "5.2":
				return "Server 2003";
			default:
				return version;
		}
	},

	/*
	 * Get the Linux distribution name from the user agent
	 */
	getLinuxName: function(userAgent) {
		if (this.contains(userAgent, "Ubuntu"))
			return "Ubuntu";
		if (this.contains(userAgent, "Fedora"))
			return "Fedora";
		if (this.contains(userAgent, "SUSE"))
			return "SUSE";
		if (this.contains(userAgent, "Gentoo"))
			return "Gentoo";
		if (this.contains(userAgent, "Debian"))
			return "Debian";
		if (this.contains(userAgent, "CentOS"))
			return "CentOS";
		if (this.contains(userAgent, "redhat"))
			return "Redhat";
		
		return "Linux";
	},

	/*
	 * Get the linux distribution version from user agent
	 */
	getLinuxVersion: function(userAgent) {
		var pattern;
		var matched;
		if (this.contains(userAgent, "Ubuntu")) {
			pattern = /Ubuntu\/([\d\.]{2,5})/;
			matched = pattern.exec(userAgent);
			if (matched && matched.length >= 2)
				return matched[1];
		} 
		if (this.contains(userAgent, "Fedora")) {
			pattern = /Fedora\/([\d\.]{1,3})/;
			matched = pattern.exec(userAgent);
			if (matched && matched.length >= 2)
				return matched[1];
		}
		if (this.contains(userAgent, "CentOS")) {
			pattern = /CentOS\/([\d\.]{1,3})/;
			matched = pattern.exec(userAgent);
			if (matched && matched.length >= 2)
				return matched[1];
		}
		if (this.contains(userAgent, "SUSE")) {
			pattern = /SUSE\/([\d\.]{1,3})/;
			matched = pattern.exec(userAgent);
			if (matched && matched.length >= 2)
				return matched[1];
		}
		if (this.contains(userAgent, "Debian")) {
			pattern = /Debian\-([\d\.]{1,5})/;
			matched = pattern.exec(userAgent);
			if (matched && matched.length >= 2)
				return matched[1];
		}
		return "";
	},

	/*
	 * Return true if stringToCheck contains substring
	 */
	contains: function(stringToCheck, substring) {
		return stringToCheck.indexOf(substring) != -1;
	},

    type: 'PickABrowserHelper'
});