function onLoad() {
   try {
     var count = g_form.getControl('sys_select.clone_instance.source_instance').options.length;
     g_form.setDisplay('source_instance', count > 1);
   } catch(e) { } // hide any exceptions we get
}