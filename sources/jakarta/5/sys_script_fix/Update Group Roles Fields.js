var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "sys_group_has_role");
gr.addQuery("element", "IN", "role,group");
gr.query();
while (gr.next()) {
gr.setValue("mandatory", "true");
gr.update();
}