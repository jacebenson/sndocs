knowledgeView();
function knowledgeView() {
  var kv = new GlideRecord("kb_use");
  kv.viewed = true;
  kv.user.setValue(event.parm2);
  kv.article = event.instance;
  kv.insert();
  
}