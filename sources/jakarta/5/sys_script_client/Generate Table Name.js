function onLoad() {
   var s = g_form.getControl('label');
   s.onkeyup = ctTableName;
}

function ctTableName() {
   var s = g_form.getControl('label');
   var t = g_form.getControl('name');
   
   if (s.value == "") {
      t.value = "";
      return;
   }
   
   var c = "u_" + s.value.toLowerCase().replace(/[^a-zA-Z0-9_]/g, '_');
   t.value = c;
}