var DiscoveryUIActionUtils = Class.create();

DiscoveryUIActionUtils.prototype = {
    hasOlderDeviceHistory: function() {
        if (gs.nil(current.cmdb_ci))
            return false;

        var gr = new GlideRecord('discovery_device_history');
        gr.addQuery('cmdb_ci', current.cmdb_ci);
        gr.orderByDesc('sys_updated_on');
        gr.query();

        while (gr.next())
            if (gr.sys_id == current.sys_id)
                return gr.hasNext() ? true : false;

        return false;
    },

    hasNewerDeviceHistory: function() {
        if (gs.nil(current.cmdb_ci))
            return false;

        var gr = new GlideRecord('discovery_device_history');
        gr.addQuery('cmdb_ci', current.cmdb_ci);
        gr.orderBy('sys_updated_on');
        gr.query();

        while (gr.next())
            if (gr.sys_id == current.sys_id)
                return gr.hasNext() ? true : false;

        return false;
    }
};