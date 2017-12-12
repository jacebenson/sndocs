var IdentificationRuleValidator = Class.create();
IdentificationRuleValidator.prototype = {
	initialize: function(ruleSysId) {
		this.ruleId = ruleSysId;
		
		this.InvalidField = 'InvalidField';
		this.InvalidTable = 'InvalidTable';
		this.problematicIdentifier = [];
		this.problematicRule = [];
		this.problematicDesc = [];
		this.showConsolidatedMsg = true;
		this._validate();
	},
	
	_validate: function () {
		this.problematicRule = j2js(SNC.CMDBUtil.getInvalidEntryIDs());
		this.problematicIdentifier = j2js(SNC.CMDBUtil.getInvalidEntryIdentifiers());
		this.problematicDesc = j2js(SNC.CMDBUtil.getInvalidEntryDescs());
		
		if (this.ruleId) { // dealing with single rule entry
			var rule = [];
			var identifier = [];
			var desc = [];
			for (var i=0; i<this.problematicRule.length; i++) {
				if (this.problematicRule[i] == this.ruleId) {
					rule.push(this.problematicRule[i]);
					identifier.push(this.problematicIdentifier[i]);
					desc.push(this.problematicDesc[i]);
				}
			}
			this.problematicRule = rule;
			this.problematicIdentifier = identifier;
			this.problematicDesc = desc;
		}
	},
	
	valid: function () {
		if (this.problematicIdentifier.length!=0)
			return false;
		else
			return true;
	},
	
	validate: function (formGr) {
		if (this.problematicIdentifier.length!=0) {
			var identifier = formGr? formGr.applies_to : null;
			var usedMsgs = [];
			var au = new ArrayUtil();
			
			for (var i=0; i<this.problematicIdentifier.length; i++) {
				// only show warning on Form view of vialating identifiers
				if (identifier && this.problematicIdentifier[i] != identifier)
					continue;
				
				var entryDesc = 'Rule entry ' +
				(this.showConsolidatedMsg? '' : this.problematicRule[i]);
				var msg = entryDesc + ' under ' + this.problematicIdentifier[i] +
				' identifier using non-existent ' +
				(this.problematicDesc[i] == this.InvalidField?'field' : 'table') +
				' is ignored during identification!';
				
				if (!au.contains(usedMsgs, msg) && !gs.getErrorMessages().contains(msg)) {
					gs.addErrorMessage(msg);
					usedMsgs.push(msg);
				}
			}
			return usedMsgs;
		}
		return "";
	},
	
	type: 'IdentificationRuleValidator'
};