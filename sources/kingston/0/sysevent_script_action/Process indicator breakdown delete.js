(function processEvent(event) {
	
	recordsCleaner = new SNC.PARecordsCleaner();
	recordsCleaner.processIndicatorBreakdownDelete(event.getValue('parm1'), event.getValue('parm2'));
	
})(event);