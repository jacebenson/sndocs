var TeamDevLocalChangeBackoutVisible = Class.create();
TeamDevLocalChangeBackoutVisible.prototype = Object.extendsObject(AbstractUpdateUIActionUtil, {
    initialize: function() {
    },

	_userHasAccess: function(gr) {
		return (gr.getValue('instance').equals(GlideProperties.get('glide.apps.hub.current')) &&
				gr.getValue('state').equals('new'));
	},

    type: 'TeamDevLocalChangeBackoutVisible'
});