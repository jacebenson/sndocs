gs.include("PrototypeServer");

var Template = Class.create();

Template.prototype = {
	initialize: function(sysID) {
		this.sys_id = sysID;
	},
	getValues: function(tableName, elementName) {
		var t = GlideTemplate.get(this.sys_id);
		if (t == null)
			return t;

		var xml = new GlideXMLDocument("template_values");
		t.setApplyChildren(false);
		var target = t.apply();
		var list = t.getTemplateElements();
		for (var i = 0; i < list.size(); i++) {
			var ge = target.getElement(list.get(i));
			if (ge.getED().isVirtual())
				continue;

			var name = ge.getName();
			var value = this.getValue(ge);
			var label = this.getLabel(ge);
			var listRef = this.getRef(ge);
			var displayVal;
			// Format display value for List fields.
			if (listRef) {
				var valArray = value.split(',');
				for (var n=0; n<valArray.length; n++){
					if (valArray[n].indexOf("@") > -1 && !displayVal){
						displayVal = valArray[n];
						continue;
					}
					else if (valArray[n].indexOf("@") > -1 && displayVal){
						displayVal += ", " + valArray[n];
						continue;
					}
					var gr = new GlideRecord(listRef);
					gr.addQuery('sys_id', valArray[n]);
					gr.query();
					if (gr.next()){
						if (!displayVal)
							displayVal = gr.getDisplayValue();
						else
							displayVal += ", " + gr.getDisplayValue();
					}
				}
			}
			var e = xml.createElement("item", null);
			e.setAttribute("displayVal", displayVal);
			e.setAttribute("name", name);
			e.setAttribute("value", value);
			e.setAttribute('label', label);
			var dep = ge.getDependent();
			if (dep)
				e.setAttribute('dependent', dep);
		}
		var document =  xml.getDocument();
		answer = document;
		return document;
	},
	getValue: function(ge) {
		var ed = ge.getED();

		if (!ge.isObject())
			return ge + '';

		if (ed.isJournal())
			return ge + '';

		if (ed.isChoiceTable())
			return ge.getChoiceValue() == null ? '' : ge + '';

		//Domain types are same as the reference types for this purpose
		if (ed != null && ed.getInternalType() == 'domain_id')
			return ge + '';

		if (ed.isDateType())
			return ge.getDisplayValue();
		
		if (ed.getInternalType() == 'glide_duration' || ed.getInternalType() == 'timer')
			return ge.getDurationValue();

		return ge.getValue();
	},
	getLabel: function(ge){
		return ge.getLabel();
	},
	getRef: function(ge){
		if (ge.getED().isList())
			return ge.getED().getReference();
		else
			return null;
	}
};
