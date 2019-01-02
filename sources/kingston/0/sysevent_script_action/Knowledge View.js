knowledgeView();
function knowledgeView() {
  var kv = new GlideRecord("kb_use");
  kv.initialize();
  kv.viewed = true;
  kv.user.setValue(event.parm2);
  kv.article = event.instance;
  var params = JSON.parse(event.parm1);
  kv.session_id = params.glideSessionId;
  if(params.hasOwnProperty("ts_query_id")){
	  kv.search_id = params.ts_query_id;
  }
  kv.insert();
  
}