var AjaxClientHelper = Class.create();

		AjaxClientHelper.prototype = Object.extendsObject(AbstractAjaxProcessor , {
			getValues: function() {
				gs.include('Template');
				var t = new Template(this.getParameter('sysparm_sys_id')+'');
				return t.getValues();
			},

			generateChoice: function() {
				gs.include("InternalTypeChoiceList");
				var t = new InternalTypeChoiceList();
				var selectedValue = this.getParameter('sysparm_selected_value');
				if (selectedValue != null) {
					t.setSelected(selectedValue);
				}
				return t.generate();
			},

			generateChoiceTable: function() {
				gs.include("TableChoiceList");
				var t = new TableChoiceList(this);
				return t.generate();
			},

			generateChoiceUpdateTable: function() {
				gs.include("UpdateTableChoiceList");
				var t = new UpdateTableChoiceList();
				return t.generate();
			},

			getDisplay: function() {
				return getDisplayValueOf(this.getParameter('sysparm_table'),this.getValue());
			}


		});