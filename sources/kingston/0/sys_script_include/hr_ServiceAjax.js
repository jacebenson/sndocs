var hr_ServiceAjax = Class.create();
hr_ServiceAjax.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {
	
    initialize : function(request, responseXML, gc) {
		global.AbstractAjaxProcessor.prototype.initialize.call(this, request, responseXML, gc);
	},
	
	/**
	* @param sysparm_composite: a table name with dotwalked fields. For example, an input of:
	* sn_hr_core_case.assigned_to.building.sys_created_by
	* will result in a return value of:
	* Assigned to Building Created by
	* @return The composite label
	*/
	getFullLabelForCompositeElement : function() {
		var name = this.getParameter('sysparm_composite');

		var display = [];
		var names = name.split('.');
		if (names && names.length >= 2) {
			var g = new GlideRecord(names[0]);
			g.initialize();
			if (g.isValid()) {
				for (var i = 1; i < names.length; i++) {
					var ele = g.getElement(names[i]);
					display.push(ele.getLabel() + '');
					if (ele.getED().getInternalType() == "reference") {
						g = new GlideRecord(ele.getReferenceTable());
						g.initialize();
						if (!g.isValid())
							break;
					} else 
						break;
				}
			}
		}
		return display.join(" ");
	},

    type: 'hr_ServiceAjax'
});