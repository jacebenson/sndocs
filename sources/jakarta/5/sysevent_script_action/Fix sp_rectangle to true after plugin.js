fixBooleanRectangleActive("sp_rectangle", "active", "true");

function fixBooleanRectangleActive(tablename, fieldname, value) {
    var gr = new GlideRecord(tablename);
    if (gr.isValid()) {
        gs.print("setting " + tablename + "." + fieldname + " Boolean to " + value + " where null due to upgrade of plugin: " + event.parm1);
        gr.addNullQuery(fieldname);
        gr.query();
        while (gr.next()) {
			gs.print("setting " + tablename + "." + fieldname + " Boolean to " + value + " for sys_id " + gr.getUniqueValue());
            gr.setValue(fieldname, value);
            gr.update();
        }
    }
}