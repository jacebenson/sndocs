// This script include has been deprecated for the /now/ui/page_timing REST API.

    var AJAXClientTiming = Class.create();

AJAXClientTiming.prototype =  Object.extendsObject(AbstractAjaxProcessor, {

  process: function() {
     var transId = this.getParameter("transaction_id");
     var transTime = this.getParameter("transaction_time");
     var serverTime = this.getParameter("server_time");
     var networkTime = this.getParameter("network_time");
     if (networkTime == "")
        networkTime = "0";
     var browserTime = this.getParameter("browser_time");
     var detail_string = this.getParameter("client_details");
     var tableName = this.getParameter('table_name');
     var viewId = this.getParameter('view_id');
     var formName = this.getParameter('form_name');
	 
     this._postStats(networkTime, browserTime);
	  
     var gr = new GlideRecord("syslog_transaction");
	 if (!gr.get(transId)) {
		 gs.log("syslog_transaction not found for AjaxClientTiming: sysId: " + transId + ", table: " + tableName + ", view: " + viewId + ", form: " + formName);
		 return;
	 }
	  
	 gr.client_transaction = true;	  
     gr.client_response_time = transTime;
     gr.client_network_time = networkTime;
     gr.browser_time = browserTime;
     gr.client_script_time = this.getParameter("cs_time");
     gr.ui_policy_time = this.getParameter("policy_time");
     gr.table = tableName;
     gr.view_id = viewId;
	 if (gs.nil(gr.type)) {
         if ('sys_form_template' == formName)
             gr.type = 'form';
         else if (formName.indexOf('list_template') >= 0)
            gr.type = 'list';
         else
            gr.type = 'other';
     }	  
     gr.updateLazy();
     // track statistics of the provided transaction log entry
     SNC.TransactionStatsScriptable.recordClientTransaction(transId, gr.client_response_time, gr.browser_time, gr.client_network_time, gr.client_script_time, gr.ui_policy_time);

     var details = new JSON().decode(detail_string + '');
     for (i = 0; i < details.length; i++) {
          var det = details[i];
          if (!det)
              continue;
              
          var grd = new GlideRecord("syslog_client_trans_det");
          grd.client_transaction = transId;
          grd.name = det.name;
          grd.duration = det.duration;
          grd.type = det.type_code;
          grd.order = i;
          grd.table = tableName;
          grd.insertLazy();
		  
		  if (det.sys_id) {
				SNC.ClientScriptStatsScriptable.recordClientScript(det.source_table, det.sys_id, det.script_detail, det.name, det.duration);
		  }
     }
  },

  _postStats: function(networkTime, browserTime) {
     try {
        var nt = parseInt(networkTime);
        var bt = parseInt(browserTime);
        GlideClientNetworkTimes.get().addSample(nt);
        GlideClientBrowserTimes.get().addSample(bt);
     } catch (e) {}
  },

  isPublic: function() {
    return false;
  },

  type: "AJAXClientTiming"
});