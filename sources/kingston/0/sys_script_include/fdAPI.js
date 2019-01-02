var fdAPI = Class.create();
fdAPI.prototype = {
	
    initialize: function($sp) {
		this.$sp = $sp;
    },
	
	getDecoratedForm: function (table, sys_id, encodedQuery, view, primary_only) {
		
		var portal = this.$sp.getPortalRecord();
		
		var form = this.$sp.getForm(table, sys_id, encodedQuery, view);
		
		form._directives = {};
		form._field_types = {};
		
		var heirarchy = new GlideTableHierarchy(table).getHierarchy(); 
		
		var gr = new GlideRecord('x_pisn_fd_decorator');
		gr.addQuery('applies_to', 'field')
			.addCondition('field.name', 'IN', heirarchy);
		gr.addNullQuery('portal')
			.addOrCondition('portal', portal.getUniqueValue());
		gr.query();
		
		var directive,
			fieldName,
			fieldType;
		
		while (gr.next()) {
			directive = gr.directive.getRefRecord();
			fieldName = gr.field.getRefRecord().element;

			if (typeof form._fields[fieldName] !== 'undefined') {
				form._fields[fieldName].directive = {
					spinal_case: directive.getValue('spinal_case'),
					name: directive.getValue('name')
				};
				
				addDirective(directive);
			}
		}
		
		var fieldTypes = [];
		
		for (var key in form._fields) {
			if (typeof form._fields[key].directive === 'undefined') {
				if (fieldTypes.indexOf(form._fields[key].type) === -1) {
					fieldTypes.push(form._fields[key].type);
				}
			}
		}
		
		gr = new GlideRecord('x_pisn_fd_decorator');
		gr.addQuery('applies_to', 'field_var_type');
		gr.addQuery('field_type.name', 'IN', fieldTypes.join(','));
		gr.addNullQuery('portal')
			.addOrCondition('portal', portal.getUniqueValue());
		gr.query();	
		
		while (gr.next()) {
			directive = gr.directive.getRefRecord();
			fieldType = gr.field_type.getRefRecord().name;
			
			form._field_types[fieldType] = {
					spinal_case: directive.getValue('spinal_case'),
					name: directive.getValue('name')
				};
			
			addDirective(directive);
		}
		
		function addDirective(directive) {
			form._directives[directive.getValue('name')] = {
				name: directive.getValue('name'),
				link: directive.getValue('link'),
				template: directive.getValue('template'),
				controller: directive.getValue('controller'),
				css: directive.getValue('css_scoped'),
				id: directive.getUniqueValue()
			};
		}
		
		
		
		if (primary_only) {
			form._ui_actions = form._ui_actions.filter(function(action) {
				return action.primary;
			});
		}
		
		return form;
	},

    type: 'fdAPI'
};