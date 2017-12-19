function UpdateSetAPI() {
    /* Gets the users active update set */
    function getCurrentUpdateSetID() {
        return new GlideUpdateSet().get();
    };

    /* Complete a specific update set */
    function completeUpdateSet(sysID) {
        sysID = sysID || getCurrentUpdateSetID();
        var gr = new GlideRecord('sys_update_set');
        if (!gr.get(sysID))
            return;
        gr.state = 'complete';
        gr.update();
    };

    /* Insert an update set */
    function insertUpdateSet(name) {
        var gr = new GlideRecord('sys_update_set');
        gr.initialize();
        gr.name = name;
        return gr.insert();
    };

    /* Insert an update set and set as my current update set */
    function insertUpdateSetAsCurrent(name) {
        var sysID = insertUpdateSet(name);
        new GlideUpdateSet().set(sysID);
    };

    return {
        getCurrentUpdateSetID: getCurrentUpdateSetID,
        completeUpdateSet: completeUpdateSet,
        insertUpdateSet: insertUpdateSet,
        insertUpdateSetAsCurrent: insertUpdateSetAsCurrent
    };
};