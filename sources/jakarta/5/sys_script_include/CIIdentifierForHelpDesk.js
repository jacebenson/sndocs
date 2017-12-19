var CIIdentifierForHelpDesk = Class.create();

CIIdentifierForHelpDesk.prototype = {

    initialize: function() {
        this.logMessage = '';
    },

    findExistingRecord: function(ciDataJava) {
        var ciData = j2js(ciDataJava);
        var sys_id = null;
        if (JSUtil.nil(sys_id))
            sys_id = this.matchOnSerial(ciData.serial_number);
        if (JSUtil.nil(sys_id))
            sys_id = this.matchOnMacAddress(ciData.cmdb_ci_network_adapter, ciData.ignore_mac, ciData.serial_number);
        if (JSUtil.nil(sys_id))
           sys_id = this.matchOnName(ciData.name);
        return sys_id;
    },

    matchOnSerial: function(serial_number) {
        if (JSUtil.nil(serial_number))
           return null;           

        var gr = new GlideRecord("cmdb_ci_computer");
        gr.addQuery("serial_number", serial_number);
        gr.query();
        if (!gr.next())
            return null;

        this.logMessage = "WMI: Matched on serial number (" + serial_number + ") of " + gr.name + " (" + gr.getUniqueValue() + ")";
        gs.log(this.logMessage); 

        return gr.getUniqueValue();
    },   

    matchOnMacAddress: function(nics, ignore, serial_number) {
        if (ignore)
            return null;

        // due to VMWare not having unique mac addresses, we only
        // wanna match mac if we DONT have a serial number
        if (JSUtil.notNil(serial_number))
            return null;

        for (var i in nics) {
            var nic = nics[i];
            var mac = nic.mac_address;            

            if (JSUtil.nil(nic))
                continue;

            var gr = new GlideRecord("cmdb_ci_network_adapter");
            gr.addQuery("mac_address", mac);
            gr.addNotNullQuery("cmdb_ci");
            gr.addQuery("install_status", "!=", 100);
            gr.query();
            if (!gr.next())
                continue;

            this.logMessage = "WMI: Matched on MAC address (" + mac + ") of " + gr.cmdb_ci.name + " (" + gr.cmdb_ci.sys_id + ")";
            gs.log(this.logMessage); 

            return gr.cmdb_ci.toString();
        }

        return null;
    },

    matchOnName: function(name) {
        if (JSUtil.nil(name))
            return;

        var gr = new GlideRecord("cmdb_ci_computer");
        gr.addQuery("name", name);
        gr.query();
        if (!gr.next())
            return null;


        this.logMessage = "WMI: Matched on name of " + name + " (" + gr.getUniqueValue() + ")";
        gs.log(this.logMessage); 

        return gr.getUniqueValue();
    }, 

    getLogMessage: function() {
        return this.logMessage;
    }
}