var CustomPriceGenerator = Class.create();
CustomPriceGenerator.prototype = {
	initialize: function() {
	},
	
	fixProperty : function() {
		var fileNames = [
		    'sys_script_include_292768ba0a0a0b4400c27a5190b1c3be', // CatalogPriceCalculator
		    'sys_script_include_756351003701300054b6a3549dbe5dda'  // CatalogRecurringPriceCalculator
		];
		var hasCustomPriceGenerator = 'glide.sc.use_custom_pricegenerator';
		var updates = new GlideRecord('sys_update_xml');
		updates.addQuery('name', fileNames);
		updates.query();
		if (updates.next()) {
			var customisations = updates.name + "";
			while (updates.next()) {
				customisations += ", " + updates.name;
			}
			gs.setProperty(hasCustomPriceGenerator, 'true');
			gs.log("Customization found: [" + customisations + "]. Property: [" + hasCustomPriceGenerator + "] set to true");
		} else {
			gs.setProperty(hasCustomPriceGenerator, 'false');
			gs.log("No customization of price generation found. Property: [" + hasCustomPriceGenerator + "] has set to false");}
		},
		
		type: 'CustomPriceGenerator'
	}