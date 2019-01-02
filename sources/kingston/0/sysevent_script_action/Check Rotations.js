var rot = new GlideRecord('sys_table_rotation');
if (rot.isValid()) {
   var tu = new TableRotationUtil();
   if (tu)
      tu.synchronize();
}
