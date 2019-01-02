function showResponse(){
	var id = g_form.getUniqueValue();
	var type = g_form.getReference('metric_type');
	var url = 'assessment_take2.do?sysparm_assessable_sysid=' + id + '&sysparm_assessable_type=' + type + '&sysparm_reader_view=true';

	var d = new GlideOverlay({
		title: "User's Response",
		iframe: url,
		width:'80%',
		height: '100%',
		onAfterLoad: function() {
			var iframe = d.getIFrameElement();
			setTimeout(function(){
				iframe.height = parseInt(iframe.height)+1;
			},0);
        }
	});
	d.render();
}