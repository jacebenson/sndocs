// Discovery class

/**
 * Handles all the details of formatting windows OS name
 * 
 * Aleck Lin aleck.lin@service-now.com
 */
var WindowsOSNameHelper = Class.create();

WindowsOSNameHelper.prototype = {
    formatWindowsOSName: function(name) {
        // do not classify this as a Windows computer if OS name is not found
        if (JSUtil.nil(name))
			return null;

        var newName = this.osCleanupName(name);
        OSChoice.reconcile(newName);
        return newName;
    },

    osCleanupName: function(name) {
        //Strip out the first word "Microsoft"
        var sp = name.indexOf(" ");
        var value = name.substring(sp + 1);

        var replaceArr = [];
        replaceArr.push({'Â®': ""});           // For fixing Windows 2008 DC (ie. Windows ServerÂ® 2008 Datacenter)
        replaceArr.push({"\\(R\\)"  : ""});
        replaceArr.push({"Windowsr" : "Windows"});
        replaceArr.push({"Serverr"  : ""});
        replaceArr.push({"Server"   :  ""});
        replaceArr.push({"WINDOWS"  : "Windows"});
        replaceArr.push({"â¢"     : ""});            // For fixing Vista (ie. "Vistaâ¢")
        replaceArr.push({"VistaT"   : "Vista"});
        replaceArr.push({" Edition" : ""});
        replaceArr.push({","        : ""});            // Replace anything like "2003, Standard" with just "2003 Standard"

        for(var i=0; i<replaceArr.length; i++) {
            replaceObj = replaceArr[i];

            for(var name in replaceObj) {
                var re = new RegExp(name, "g");
	        value = value.replace(re, replaceObj[name]);
            }
        }		

        //Remove any spaces more than one (ie. "Windows  2008" should be "Windows 2008")
        value = value.replace(/\s\s+/g, " ");

        // Remove any leading and trailing spaces...
        value = value.trim();

        return value;
    },

	/**
	 * Deprecated. Use OSChoice.reconcile()
	 */
    makeOSChoiceValid: function(value) {
        OSChoice.reconcile(value);
    },
    
    type: "WindowsOSNameHelper"
}
