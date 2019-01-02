fixBooleanDefaultValue("sys_ui_policy", "global", "true");

function fixBooleanDefaultValue(tablename, fieldname, value) {
    var gr = new GlideRecord(tablename);
    if (gr.isValid()) {
        gs.print("setting " + tablename + "." + fieldname + " Boolean to " + value + " if null due to upgrade of plugin: " + event.parm1);
        gr.addNullQuery(fieldname);
        gr.query();
        while (gr.next()) {
            gr.setValue(fieldname, value);
            gr.update();
        }
    }
}