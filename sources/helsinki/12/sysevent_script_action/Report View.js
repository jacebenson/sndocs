recordReportView();

function recordReportView() {
   var gr = new GlideRecord("report_view");
   if (gr.isValid()) {
      gr.viewed = event.sys_created_on;
      gr.user = event.user_id;
      gr.report = event.instance;
	  if (event.parm2 != '') {
      	gr.source = "Homepage";
	  } else {
      	gr.source = "Report";
	  }
      gr.insert();
   }
}