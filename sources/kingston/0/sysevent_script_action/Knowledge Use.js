knowledgeView();
function knowledgeView() {
  var kv = new GlideRecord("kb_use");
  kv.initialize();
  kv.used = true;
  kv.user.setValue(event.parm2);
  kv.article = event.instance;
  var params = JSON.parse(event.parm1);
  kv.session_id = params.glideSessionId;
  if(params.hasOwnProperty("ts_query_id")){
	  kv.search_id = params.ts_query_id;
  }
  kv.insert();
  incrementUseCount(event.instance);
}

function incrementUseCount(article){
	var gr = new GlideRecord('kb_knowledge');
	if(gr.get(article)){
		var currentCount = gr.getValue('use_count');
		if(!currentCount)
			currentCount = 0;
		gr.setValue('use_count',parseInt(currentCount)+1);
		gr.setSystem(true);
		gr.update();
	}
}