var RiskCalculatorSNC = Class.create();
RiskCalculatorSNC.prototype = {

	initialize: function(changeRequestGr) {
		this.riskRecord = changeRequestGr;
		this.riskList = this.getRiskList();
	},

	calculateRisk: function() {
		if (!this.riskList.hasValue)
			return "";
		return this.riskList;
	},

	getRiskList: function() {
		var riskList = {};
		var match = false;
		var rc = new GlideRecord("risk_conditions");
		rc.addActiveQuery();
		rc.orderBy("order");
		rc.query();
		this.riskRecord.putCurrent();
		while (rc.next() && !match) {
			if (rc.use_advanced_condition)
				match = GlideRhinoHelper.evaluateAsBoolean(rc.advanced_condition);
			else {
				var filter = GlideFilter;
				match = filter.checkRecord(this.riskRecord, rc.condition);
			}

			if (match) {
				riskList.hasValue = true;
				riskList.name = rc.name + "";
				riskList.order = rc.order + 0;
				riskList.description = rc.description + "";

				if (rc.use_script_values) {
					GlideRhinoHelper.evaluateAsString(rc.script_values);
					riskList.useScriptValues = true;
					riskList.risk = this.riskRecord.risk + "";
					riskList.label = this.riskRecord.risk.getDisplayValue() + "";
					riskList.impact = this.riskRecord.impact + "";
					riskList.impactLabel = this.riskRecord.impact.getDisplayValue() + "";
				} else {
					riskList.useScriptValues = false;
					riskList.risk = rc.risk + "";
					riskList.label = rc.risk.getDisplayValue() + "";
					riskList.impact = rc.impact + "";
					riskList.impactLabel = rc.impact.getDisplayValue() + "";
				}
			}
		}
		this.riskRecord.popCurrent();
		if (!match)
			gs.addInfoMessage(gs.getMessage("No matching Risk Conditions - Risk and Impact unchanged"));		
		return riskList;
	},

	type: "RiskCalculatorSNC"
};