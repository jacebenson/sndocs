var MIDServerSelector = Class.create();

MIDServerSelector.prototype = {
    initialize : function() {
        this.capabilities = null;
        this.errorMsg = "";
        this.warningMsg = "";
    },

    setCapabilities : function(capabilities) {
        this.capabilities = capabilities;
    },

    getWarning : function() {
        return this.warningMsg;
    },

    getError : function() {
        return this.errorMsg;
    },

    findAgent: function(target) {
        var midServerFinder = new MIDServerFinder();
        if (!gs.nil(target))
            midServerFinder.setRangesByIPOrHostname(target);
        
        if (this.capabilities)
            midServerFinder.setCapabilities(this.capabilities);

        var potentialServers = midServerFinder.getMIDServers();

        if (JSUtil.nil(potentialServers) || potentialServers.length == 0) {
            this.warningMsg = midServerFinder.getStatusMessage();
          
            var defaultMidServer = GlideProperties.get("mid.server.rba_default");

            if (!JSUtil.nil(defaultMidServer)) {
                var gr = new GlideRecord('ecc_agent');
                gr.addQuery('name', defaultMidServer);
                gr.query();

                if (!gr.next()) {
                    this.errorMsg = 'The configured default MID server (' + defaultMidServer + ') is not valid';
                    defaultMidServer = "";
                }
            } else
                this.errorMsg = 'There is no MID server configured to run this activity';

            return defaultMidServer;
        }

        // Randomly choose one
        var ms = new Date().getMilliseconds();
        var index = ms % potentialServers.length;
        return potentialServers[index];
    },
}