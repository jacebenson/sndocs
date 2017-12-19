var FixedAssetUtils = Class.create();
FixedAssetUtils.prototype = {
    initialize: function() {
    },
    
    rollupCosts: function(fixed_asset, field) {
        var gr = new GlideAggregate('m2m_fixed_asset_to_asset');
        gr.addQuery('fixed_asset', fixed_asset.sys_id);
        gr.addAggregate('SUM', 'asset.' + field);
		gr.groupBy('fixed_asset');
        gr.query();
		gs.log(gr.getRowCount());
        if (gr.next())
            return gr.getAggregate('SUM', 'asset.' + field);
        return 0;
    },
    
    rollupAllResidual: function() {
        var gr = new GlideRecord('alm_fixed_assets');
        gr.query();
        while (gr.next()) {
            gr.residual = this.rollupCosts(gr, 'residual');
            gr.total_cost = this.rollupCosts(gr, 'cost');
			gr.total_depreciation = gr.total_cost - gr.residual;
			gr.update();
		}
    },
    
    type: 'FixedAssetUtils'
}