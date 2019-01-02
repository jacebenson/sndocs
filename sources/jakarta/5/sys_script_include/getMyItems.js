function getMyItems() {
	var result=[];
	var gr = new GlideRecord("sc_catalog");
	gr.addQuery('manager',gs.getUserID()).addOrCondition('editors', 'CONTAINS', gs.getUserID());
	gr.query();
	var i = 0;
	while(gr.next())
		result[i++] = gr.getUniqueValue();
	return result;
}