var CABRuntimeState = Class.create();

CABRuntimeState.get = CABRuntimeStateSNC.get;

CABRuntimeState.prototype = Object.extendsObject(CABRuntimeStateSNC, {
	initialize: function() {
		CABRuntimeStateSNC.prototype.initialize.apply(this, arguments);
	},

    type: 'CABRuntimeState'
});