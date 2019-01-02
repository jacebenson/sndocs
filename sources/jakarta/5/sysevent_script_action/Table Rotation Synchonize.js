gs.log("***********************SYNCHRONIZE FOR: " + event.parm1);
var rot = new GlideRecord('sys_table_rotation');
if (rot.isValid()) {
      var tu = new TableRotation(event.parm1);
      if (tu.isValid())
           tu.synchronize();
      else
           gs.log("********NOT A VALID ROTATION*********");
}