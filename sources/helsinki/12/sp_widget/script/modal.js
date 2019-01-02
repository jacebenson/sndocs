// populate the 'data' object
// e.g., data.table = $sp.getValue('table');
(function(){
	var id = options.embeddedWidgetId || input.embeddedWidgetId;
	var opt = options.embeddedWidgetOptions || input.embeddedWidgetOptions;
	
  data.instance = $sp.getWidget(id, opt);
})()