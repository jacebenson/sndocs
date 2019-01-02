var CABDefinitionAjax = Class.create();
CABDefinitionAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
    updateDefinition: function() {
		var fields = this.getParameter('sysparm_fields');
		var meetId = this.getParameter('sysparm_meeting');
		
		var meetingGr = new GlideRecord('cab_meeting');
		
		if (meetingGr.get(meetId)) {
			var definitionGr = meetingGr.cab_definition.getRefRecord();
			if (definitionGr) {
				var definitionSpanGr = meetingGr.cmn_schedule_span_origin.getRefRecord();
			
				var fieldsObject = new global.JSON().decode(fields);
				
				for (var field in fieldsObject) {
					var fld = field.replace('cab_meeting.', '');
					if ((fld != 'start') && (fld != 'end'))
						definitionGr.setValue(fld, fieldsObject[field]);
					else {
						if (!meetingGr.cmn_schedule_span_exclude.nil()) {
							var spanGr = meetingGr.cmn_schedule_span_exclude.getRefRecord();
							spanGr.deleteRecord();
						}
						
						var sdt = new GlideScheduleDateTime(new GlideDateTime(fieldsObject[field]));
						definitionSpanGr.setValue(fld + '_date_time', sdt.getValue());
					}
				}
				definitionGr.update();
				definitionSpanGr.update();
			}
		}
      return true;
    },
	
	isDefinitionManager: function() {
		var meetId = this.getParameter('sysparm_meeting');
		var managerId = this.getParameter('sysparm_manager');
		var meetingGr = new GlideRecord('cab_meeting');
		
		if (meetingGr.get(meetId)) {
			var definitionGr = meetingGr.cab_definition.getRefRecord();
			
			if (definitionGr && definitionGr.getValue('manager') == managerId)
				return true;
		}
      return false;
	},
	
    type: 'CABDefinitionAjax'
});