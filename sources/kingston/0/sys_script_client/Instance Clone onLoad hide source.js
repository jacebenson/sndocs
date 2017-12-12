//initial display
function onLoad() {
   try {
     var count = g_form.getControl('sys_select.clone_instance.source_instance').options.length;
     g_form.setDisplay('source_instance', count > 1);
	 var targetInstancePlaceHolderText = "Please specify a target instance for this clone";
	 var targetInstanceFieldName = "sys_display.clone_instance.target_instance";
	 var scheduledPlaceHolderText = "Please specify the target instance before entering the start time for your clone";
	 var scheduledFieldName = g_form.getControl('scheduled').name;
	 addDefaultPlaceHolder(targetInstanceFieldName,targetInstancePlaceHolderText);
	 addDefaultPlaceHolder(scheduledFieldName,scheduledPlaceHolderText);
   } catch(e) { } // hide any exceptions we get
}



function addDefaultPlaceHolder(fieldName,placeHolderText) {
	if (Prototype.Browser.IE) 
		fieldName.placeholder = placeHolderText;
	else 
		$(fieldName).writeAttribute('placeholder', placeHolderText);
		
}