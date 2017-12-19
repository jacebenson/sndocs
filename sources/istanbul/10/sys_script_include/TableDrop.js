var TableDrop = Class.create();

TableDrop.prototype = {
    initialize : function() {
    },
    
    drop : function(tableName) {
        if (!tableName)
            return;
        
        
        var base = GlideDBObjectManager.get().getAbsoluteBase(tableName);
        if (base != tableName) {
            GlideTransaction.get().setCannotCancel(true);
            var dm =  new GlideMultipleDelete(base);
            dm.addQuery('sys_class_name', tableName);
            dm.execute();
        }
        
		
		gs.print('removing modules for ' + tableName);
        var module = new GlideRecord('sys_app_module');
        module.setWorkflow(true);
        module.addQuery('name',tableName);
        module.query();
        while (module.next())
            module.deleteRecord();
		
        gs.print('dropping table ' + tableName);
        gs.dropTable(tableName);
        
        gs.print('removing gauges for ' + tableName);
        var gauge = new GlideRecord('sys_gauge');
        gauge.addQuery('tablename',tableName);
        gauge.query();
        while (gauge.next())
            gauge.deleteRecord();
        
        gs.print('removing forms for ' + tableName);
        var form = new GlideRecord('sys_ui_form');
        form.addQuery('name',tableName);
		form.query();
		while (form.next())
			form.deleteRecord();
        
        gs.print('removing styles for ' + tableName);
        var style = new GlideRecord('sys_ui_style');
        style.addQuery('name',tableName);
        style.query();
        while (style.next())
            style.deleteRecord();
        
        gs.print('removing forms sections for ' + tableName);
        var section = new GlideRecord('sys_ui_section');
        section.addQuery('name',tableName);
        section.query();
        while (section.next())
            section.deleteRecord();
        
        gs.print('removing lists for ' + tableName);
        var list = new GlideRecord('sys_ui_list');
        list.addQuery('name',tableName);
        list.query();
        while (list.next())
            list.deleteRecord();
        
        gs.print('removing related lists for ' + tableName);
        var related = new GlideRecord('sys_ui_related_list');
        related.addQuery('name',tableName);
        related.query();
        while (related.next())
            related.deleteRecord();
        
        gs.print('removing references to ' + tableName);
        var dict = new GlideRecord('sys_dictionary');
        dict.setWorkflow(true);
        dict.addQuery('reference',tableName);
        dict.query();
        while (dict.next())
            dict.deleteRecord();
		
        gs.print('removing dictionary entries for ' + tableName);
        dict.initialize();
        dict.setWorkflow(true);
        dict.addQuery('name',tableName);
        dict.query();
        while (dict.next())
            dict.deleteRecord();

		
        var acl = new GlideRecord('sys_security_acl');
        if (acl.isValid()) {
	   		gs.print('removing table-specific ACL entries for ' + tableName);
            acl.initialize();
	        acl.setWorkflow(true);
	        var aclCond = acl.addQuery('name', tableName);
	        aclCond.addOrCondition('name', 'STARTSWITH', tableName + '.');
	        acl.query();
	        while (acl.next())
	            acl.deleteRecord();
	    }
        

		var fileType = new GlideRecord('sys_app_file_type');
		if (fileType.isValid()) {
			fileType.addQuery('sys_source_table', tableName);
			fileType.query();
			while (fileType.next()) {
				gs.print('removing app file type for ' + tableName);
				fileType.deleteRecord();
			}
		}
		
		var sysWizardAnswer = new GlideRecord('sys_wizard_answer');
		if (sysWizardAnswer.isValid()) {
			sysWizardAnswer.addQuery("target_url", "STARTSWITH", tableName + ".do");
			sysWizardAnswer.query();
			while (sysWizardAnswer.next())
				sysWizardAnswer.deleteRecord();
		}

        gs.addInfoMessage('Table deleted');
        var notification = new UINotification('system_event');
        notification.setAttribute('event', 'refresh_nav');
        notification.send();
    }
}