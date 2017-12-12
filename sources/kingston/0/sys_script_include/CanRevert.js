var CanRevert = Class.create();
CanRevert.prototype = {
	current: null,

	initialize: function(cur) {
		this.current = cur;
	},

	// condition ensures current is sys_metadata, if desired
	canRevertToStoreApp: function() {
		if (!this.current.isInStoreScope())
			return false;

		return this._canRevertTo('sys_store_app');
	},

	// condition ensures current is sys_metadata, if desired
	canRevertToOutOfBox: function() {
		return this._canRevertTo('sys_upgrade_history');
	},

	// returns true if there's an appropriate version to revert to, 
	// and it's not already current.
	_canRevertTo: function(sourceTable) {
		// Look at current's last-updated UpdateVersion from the soureTable
		var gr = new GlideRecord('sys_update_version');
		gr.addQuery('name', this.current.sys_update_name);
		gr.addQuery('source_table', sourceTable);
		gr.orderByDesc('sys_updated_on');
		gr.setLimit(1);
		gr.query();
		if (!gr.next())
			return false; // none found, customer created it

		if (gr.state.toString() === 'current')
			return false; // it's already current, no need for revert

		return true;
	},

	type: 'CanRevert'
}