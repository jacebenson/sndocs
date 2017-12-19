// populate the 'data' variable
$sp.getValues(data, "color,glyph,kb_topic,title");
data.items = $sp.getKBTopicArticles(data.kb_topic);
