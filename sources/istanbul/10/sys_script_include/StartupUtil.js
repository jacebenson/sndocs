var StartupUtil = Class.create();

StartupUtil.prototype = {
    initialize : function() {
        this._start_date = GlideServlet.getServlet().getStartTime();
    },
  
    // returns Java Date instance...
    start_time: function() {
        return this._start_date;
    },
    
    // returns milliseconds since system start...
    ms_since_start: function() {
        var now = Packages.java.lang.System.currentTimeMillis();
        var start = this._start_date.getTime();
        return now - start;
    },
    
    // returns true if we've safely gotten past any upgrade...
    past_upgrade: function() {
        // if we're within two minutes of starting up, we may not have run upgrade yet, so assume we're not safe...
        var start_upgrade_time = 2 * 60 * 1000;  
        if (this.ms_since_start() < start_upgrade_time) {
            //gs.log('PAST_UPGRADE: Within 2 minutes of startup');
            return false;
        }
            
        // if we're paused, then upgrade is running...
        if (gs.isPaused()) {
            //gs.log('PAST_UPGRADE: Upgrading');
            return false;
        }
            
        // ok, now it's safe to assume that any upgrade has run and completed...
        //gs.log('PAST_UPGRADE: All is ok');
        return true;
    },

    type: 'StartupUtil'
}