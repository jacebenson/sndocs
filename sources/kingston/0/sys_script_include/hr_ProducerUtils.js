var hr_ProducerUtils = Class.create();
hr_ProducerUtils.prototype = Object.extendsObject(global.AbstractAjaxProcessor, {

	getCurrentHealthPlanByBenefitType: function(benefitType) {
		if (!benefitType)
			return '';

		var gr = new GlideRecordSecure('sn_hr_core_health_benefit');
		gr.addQuery('employee', gs.getUserID());
		gr.addQuery('plan.benefit_type.value', benefitType);
		gr.setLimit(2);
		gr.query();
		if (gr.getRowCount() == 1 && gr.next())
			return gr.getValue('plan');
		return '';
	},
	
	getCurrentRetirementPlan: function() {
		var gr = new GlideRecordSecure('sn_hr_core_retirement_benefit');
		gr.addQuery('employee', gs.getUserID());
		gr.addEncodedQuery('plan.benefit_type.valueINretirement_plan,benefit_401k');
		gr.setLimit(2);
		gr.query();
		if (gr.getRowCount() == 1 && gr.next())
			return gr.getValue('plan');
		return '';
	},
	
	// took this method from CSManagementUtils
	getGlideRecordData: function() {
		
		var result = this.getDocument().createElement("result");
		this.getRootElement().appendChild(result);
		var table_name = this.getParameter("sysparm_table_name");
		var sys_id = this.getParameter("sysparm_sys_id");
		var fields = this.getParameter("sysparm_fields") ? this.getParameter("sysparm_fields").split(",") : [];
		
		result.setAttribute("table_name", table_name);
		result.setAttribute("sys_id", sys_id);
		
		var gr = new GlideRecordSecure(table_name);
		if (!gr.get(sys_id)) {
			result.setAttribute("error", "NOT_FOUND");
			return;
		}
		
		result.setAttribute("label", gr.getLabel());
		result.setAttribute("display_value", gr.getDisplayValue());
		for(var i = 0; i < fields.length; i++) {
			var field = fields[i];
			if (!field)
				continue;
			
			try {
				var el = gr.getElement(field);
				if (el) {
					var item = this.getDocument().createElement("item");
					item.setAttribute("field", field);
					item.setAttribute("value", gr.getValue(field));
					item.setAttribute("display_value", gr.getDisplayValue(field));
					if (el.getED().isReference()) {
						item.setAttribute("isReference", "true");
						item.setAttribute("label", el.getRefRecord().getLabel());
						item.setAttribute("dependent", el.getReferenceTable());
					}
					result.appendChild(item);
				}
			} catch (ex) {
				gs.info("hr_ProducerUtils.getGlideRecordData exception : " + ex.message );
			}
		}
	},

    type: 'hr_ProducerUtils'
});