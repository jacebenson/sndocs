(function processEvent(event) {
	
	recordsCleaner = new SNC.PARecordsCleaner();
	recordsCleaner.processIndicatorDelete(event.getValue('parm1'));
	
})(event);