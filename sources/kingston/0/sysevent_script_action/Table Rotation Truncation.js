var rotation = new SncTableRotation(event.parm1);
var tables = event.parm2.split(",");
var currentTable = rotation.getTableName();
if (currentTable == tables[0])
   rotation.truncateTable(tables[1]);

cleanAttachments(event.parm1, tables[2]);

function cleanAttachments(t, d) {
  if (!d)
     return;

  var gdt = new GlideDateTime();
  gdt.setValue(d);
  var tc = new GlideTableCleaner(t, 86400 * 1000 *7, 'sys_created_on');
  tc.deleteAttachments(gdt);
}