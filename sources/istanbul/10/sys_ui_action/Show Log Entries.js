// create the URL for the ui_page to display the log data
var maxRows = 2000;
var dualTime = new GlideDateTime(current.sys_created_on);

var url = "ui_page_process.do?name=log_file_browser";
url += "&end_time=" + dualTime.getDisplayValue();
dualTime.subtract(5000);
url += "&start_time=" + dualTime.getDisplayValue();
url += "&max_rows=" + maxRows;

gs.setRedirect(url);

