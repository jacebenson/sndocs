// populate the 'data' object
var t = new GlideRecord('sys_choice');
t.addQuery('name', 'kb_knowledge');
t.addQuery('element', 'topic');
t.query();

data.topics = [];
while (t.next()) {
  var articles = $sp.getKBTopicArticles(t.getValue('value'));
  if (articles.length == 0)
    continue;
  
  var topic = {
    'value' : t.getValue('value'),
    'label' : t.getValue('label')
  };
  data.topics.push(topic);
}