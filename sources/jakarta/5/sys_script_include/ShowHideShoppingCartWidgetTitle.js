var ShowHideShoppingCartWidgetTitle = Class.create();
			ShowHideShoppingCartWidgetTitle.prototype = {
			    initialize: function() {
			    },
			
				updateUserPreference: function(shouldShow) {
					var gr = GlideRecord('sys_portal_preferences');
					gr.addQuery('name', 'type');
					gr.addQuery('value', 'cart');
					gr.query();
					var grPref;
					var portalSection;
					while (gr.next()) {
						portalSection = gr.getValue('portal_section');
						grPref = GlideRecord('sys_portal_preferences');
						grPref.addQuery('name', 'show_title');
						grPref.addQuery('portal_section', portalSection);
						grPref.query();
						while (grPref.next()) {
							grPref.setValue('value', shouldShow);
							grPref.update();
						}
					}
				},
				
			    type: 'ShowHideShoppingCartWidgetTitle'
			};