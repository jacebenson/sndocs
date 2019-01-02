function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if(isLoading && newValue == ''){
		g_form.setDisplay('set_reminder',false);
		return;
	}
	setFields();
	
	function setFields(){
		var fields = ['set_reminder','email_template','when_to_send','interval'];
		if (!isLoading && newValue === ''){
			for(var f =0; f<=fields.length; f++){
				if(g_form.getValue(fields[f]))
					g_form.setValue(fields[f],'');
				g_form.setDisplay(fields[f],false);

			}
		}
		g_form.setDisplay('set_reminder',newValue!="");
	}
}