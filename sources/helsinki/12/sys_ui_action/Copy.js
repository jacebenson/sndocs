copy(current);
function copy(current) {
   current.name = "Copy of " + current.name;
   var gr = new GlideRecord('sys_transform_entry');
   gr.addQuery('map', current.sys_id);
   gr.query();
   var newMap = current.insert();
   while (gr.next()) {
     gr.map = newMap;
     gr.insert();
   }
}