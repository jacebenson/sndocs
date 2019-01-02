var DiffMergeUICheck = Class.create();
DiffMergeUICheck.prototype = Object.extendsObject(AbstractAjaxProcessor, {

	isUISupported : function() {
		return GlideMobileExtensions.getDeviceType() == 'doctype';
	},

    type: 'DiffMergeUICheck'
});