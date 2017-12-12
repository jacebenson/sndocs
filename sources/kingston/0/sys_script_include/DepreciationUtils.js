var DepreciationUtils = Class.create();
DepreciationUtils.prototype = {
    initialize: function() {
    }, 
    
    calcDepreciation: function(gr) {
        var gc = GlideController;
        gc.putGlobal('asset', gr);
        var residual_value = gc.evaluateString(gr.depreciation.script);
        gr.residual = parseFloat(residual_value);
        gr.depreciated_amount = parseFloat(gr.cost)-parseFloat(residual_value);
        gr.residual_date = gs.now();
        gr.update();
    },
	
	calcAllDepreciation: function() {
		var gr = new GlideRecord('alm_asset');
		gr.addQuery('depreciation', '!=', '');
		gr.addQuery('depreciation_date', '!=', '');
		gr.query();
		while (gr.next())
			this.calcDepreciation(gr);
	},
    
    type: 'DepreciationUtils'
}