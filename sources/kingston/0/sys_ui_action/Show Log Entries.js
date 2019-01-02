// create the URL for the ui_page to display the log data
var maxRows = 2000;
var time = current.sys_created_on.getDisplayValue();
var diff = current.response_time.toString();
var seconds = ((diff / 1000) + 5) * -1;

var url = "ui_page_process.do?name=log_file_browser";
url += "&start_time=" + time;
url += "&time_diff=" + seconds;
url += "&max_rows=" + maxRows;
url += "&filter_session=" + current.session;

gs.setRedirect(url);

