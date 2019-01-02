var gr = new GlideRecord("sys_dictionary");
gr.addQuery("name", "kb_knowledge");
gr.addQuery("element", "kb_knowledge_base");
gr.query();
gr.next();
if(gr.default_value == "dfc19531bf2021003f07e2c1ac0739ab"){
	gr.setValue("default_value" , "");
	gr.update();
}
