(function processEvent(event) {
	
	recordsCleaner = new SNC.PARecordsCleaner();
	recordsCleaner.processBreakdownDelete(event.getValue('parm1'));
	
})(event);