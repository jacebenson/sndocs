// - we want to create categories only within the  same Default Knowledge
// - also the topic should be top level kb_category and category should be the next level
var target = new GlideRecord('kb_knowledge');
target.addQuery('kb_knowledge_base', 'dfc19531bf2021003f07e2c1ac0739ab');
target.query();

while (target.next()) {
	gs.log(target.short_description);
	if(target.kb_category){
		gs.log("Kb Category already exists");
		continue;
	}
	var topic = target.topic;
	var category = target.category;
	gs.log(topic+" => " + category);
	
	// ---- check if topic & category is present in category
	var catRec = lookupTopicAndCategory(topic,category);
	target.kb_category = catRec.sys_id;
	target.update();
}

// -----------------------------
function lookupCategory(category, parentSysId) {
	gs.log("===================== lookup category: " + category + " ========================");
	var target = new GlideRecord('kb_category');
	var q = "value=" + category + "^parent_id=" + parentSysId;
	gs.log(q);
	target.addEncodedQuery(q);
	target.query();
	while(target.next()) {
		gs.log(target.sys_id + " -- " + target.value + " -- " + target.label);
		return target;
	}
	return undefined;
}

function lookupTopicAndCategory(topic, category) {
	gs.log("===================== lookup " + topic + "," + category + " ========================");
	if(!topic || topic.trim().length <= 0)
		return;
	var defaultKB = 'dfc19531bf2021003f07e2c1ac0739ab';
	var topicRec = lookupCategory(topic, defaultKB);
	// if no topic, lets create one
	if(!topicRec) {
		topicRec=createCategory(topic,topic, defaultKB, 'kb_knowledge_base');
	}
	gs.log(topicRec.sys_id);
	gs.log(topicRec.parent_id);
	gs.log(topicRec.label);
	
	if(!category || category.trim().length <= 0){
		return topicRec;
	}
	// lets check the category - second level
	var catRec = lookupCategory(category, topicRec.sys_id);
	if(!catRec) {
		catRec = createCategory(category, category, topicRec.sys_id, 'kb_category');
	}
	return catRec;
}

function createCategory(lbl, val, parentSysId, type) {
	gs.log("==> Create " + lbl + ", val:"+val+", sys_id:"+parentSysId);
	if(!lbl || !val || lbl.trim().length<=0 || val.trim().length<=0) return;
		var gr = new GlideRecord('kb_category');
	gr.initialize();
	gr.setValue('label',lbl);
	gr.setValue('value', val);
	gr.setValue('parent_id', parentSysId);
	gr.setValue('parent_table', type);
	gr.insert();
	gs.log("----------- created ----- " + gr.sys_id + "  ------------------ " + gr.parent_id);
	return gr;
}


