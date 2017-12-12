var Flow = Class.create();
Flow.prototype = {
    initialize: function(flowSysID) {
		
		var gr = new GlideRecord('x_pisn_guii_flow');
		gr.get(flowSysID);
		
		this._gr = gr;
    },
	
	/**
	 * Get the SysID of the flow
	 *
	 * @returns {string} The SysID of the current session
	 */
	getID: function () {
		
		return this._gr.getUniqueValue();
	},
	
	getName: function () {
		return this._gr.getValue('name');
	},
	
	getFinalAction: function () {
		
		// TODO: get the final action
		
	},
	
	getLoadingWidget: function () {
		return this._gr.loading_widget.getRefRecord().getValue('id');
	},

    type: 'Flow'
};