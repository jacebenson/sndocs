function onLoad() {
    // If this record has one of the Property fields of interest, attach the onblur handler
    var control = validationHandler.findControl();
    if (control != null)
        control.onblur = validationHandler.validateAndReport;
}

// This object maintains some state. The findControl method finds the control of 
// interest and saves it. When onblur or submit occurs this object is used to validate
// the control contents. See the onSubmit client script for this table,
// "Exchange Activity Submit Validation".
var validationHandler = {
    /*
     * The list of control id's of interest. Each control ID is the ID of the
     * "Parameters" control on the GlideForm. Along with the control id is a
     * list of the Parameters that are at risk of being duplicate. E.g. these
     * valid Exchange Parameters are not allowed since they are already
     * specified in other activity variables.
     */
    controlEntries: [
        {controlId:'vars.var__m_bf27caa8c3211100ad408039dfba8fe7.parameters',  // Create mailbox
            inUseParms:['Name', 'FirstName', 'LastName', 'Alias', 'Identity', 'Password', 'Initials']},
        {controlId:'vars.var__m_41ff1c94c3711100ad408039dfba8fab.parameters',  // Delete mailbox
            inUseParms: ['Identity', 'Confirm']},
        {controlId:'vars.var__m_30c84e66c3611100ad408039dfba8f3a.parameters',  // Disable Mailbox
            inUseParms: ['Identity', 'Confirm']},
        {controlId:'vars.var__m_f0a89ea6c3611100ad408039dfba8fd0.parameters',  // Enable mailbox
            inUseParms: ['Identity', 'Confirm']},
        {controlId:'vars.var__m_1101d3ecc3211100ad408039dfba8f1c.parameters',  // Get Mailbox
            inUseParms: ['Identity', 'ResultSize']},
        {controlId:'vars.var__m_8c231341c3711100ad408039dfba8f6c.parameters',  // Set Mailbox
            inUseParms: ['Identity']},
        {controlId:'vars.var__m_368e5bf4c3321100ad408039dfba8f08.parameters',  // Create Address List
            inUseParms: ['Name']},
        {controlId:'vars.var__m_5d417e35c3321100ad408039dfba8fbd.parameters',  // Set Address List
            inUseParms: ['Identity']}
    ],
                 
    currentControlIndex: -1,
    currentControl: null,
                 
    findControl: function() {
        var control = null;
        for (var i=0; i<validationHandler.controlEntries.length; i++) {
            var controlEntry = validationHandler.controlEntries[i];
            control = g_form.getControl(controlEntry.controlId);
            if (control != null) {
                validationHandler.currentControlIndex = i;
                validationHandler.currentControl = control;
                break;
            }
        }
        return control;
    },

    getControlEntry: function() {
        var idx = validationHandler.currentControlIndex;
        if (idx < 0)
            return null;
        return validationHandler.controlEntries[idx];
    },
    
    validateAndReport: function() {
        var validationReport = validationHandler.validate();
        validationHandler.report(validationReport);
    },
    
    report: function(validationReport) {
        if (validationReport.length > 0) {
            var dialog = new GlideDialogWindow('glide_alert_standard', false);
            dialog.setTitle(getMessage('Error in Parameters field'));
            dialog.setPreference('title', validationReport);
            dialog.setPreference('warning', 'true');
            dialog.render();
        }
    },
    
    // return value of zero length string is a valid record, 
    // otherwise the return value is the error message
    validate: function() {
        var control = validationHandler.currentControl;
        if (control == null)
            return '';
        
        var v = control.getValue().trim();
        if (v.substr(0,2) == "${" || v.length == 0)
            return '';
        
        var v_json;
        try {
            v_json = v.evalJSON();
        } catch (e) {
            return getMessage('JSON parse error in Parameters field: ') + ' ' + e;
        }
        
        var parms = validationHandler.getControlEntry().inUseParms;
        var dupList = '';
        for (var i=0; i<parms.length; i++) {
            if (typeof v_json[parms[i]] != 'undefined') {
                if (dupList.length > 0)
                    dupList += ', ';
                dupList += parms[i];
            }
        }
        if (dupList.length > 0)
            return getMessage('The following Parameters are duplicates, please remove them: ') + ' ' + dupList;
        return '';
    }
}