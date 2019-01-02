var script       = g_request.getParameter( "mid_script"   );
var mid_server   = g_request.getParameter( "mid_server"   );
var ecc_queue_id = g_request.getParameter( "ecc_queue_id" );
var run          = g_request.getParameter( "run"          );
var run_script   = g_request.getParameter( "run_script"   );
var edit_script  = g_request.getParameter( "edit_script"  );
var have_params  = g_request.getParameter( "have_params"  );

if (run)
   launchScript(script, mid_server);
else if (ecc_queue_id)
   showOutput(ecc_queue_id);
else if (run_script) 
   handleRunScript(run_script, have_params, mid_server);
else if (edit_script)
   handleEditScript(edit_script);

function handleRunScript(run_script, have_params, mid_server) {
   var gr = new GlideRecord('ecc_agent_script_param');
   gr.addQuery('script', run_script);
   gr.query();
   var need_params = gr.hasNext();
   if (need_params && !have_params) {
      gs.getSession().putProperty('mid_server', mid_server);
      gs.getSession().putProperty('run_script', run_script);
      g_response.sendRedirect('mid_tools_params.do');
      return;
   }
   var sgr = new GlideRecord('ecc_agent_script');
   sgr.get(run_script);
   var our_script = sgr.getValue('script');
   if (need_params) {
      while (gr.next()) {
         var pname = gr.getValue('name');
         var pvalue = '' + g_request.getParameter(pname);
         pvalue = pvalue.replace(/"/g, '\\"');
         var varline = 'var ' + pname + ' = "' + pvalue + '";\n';
         our_script = varline + our_script; 
      }
   }
   launchScript(our_script, mid_server);
}

function handleEditScript(edit_script) {
   g_response.sendRedirect('ecc_agent_script.do?sys_id=' + edit_script);
}

function showOutput(ecc_queue_id) {
   var gr = new GlideRecord('ecc_queue');
   gr.addQuery('response_to', ecc_queue_id);
   gr.query();
   gr.next();
   gs.log(gr.payload);
   var payload = new XMLHelper(gr.payload).toObject();
   gs.getSession().putProperty('result', payload.result.output);
   g_response.sendRedirect('mid_tools_result.do');
}

function launchScript(script, mid_server) {
   var doc = new XMLDocument('<parameters/>');
   doc.setCurrent(doc.getDocumentElement());
   doc.setCurrent(doc.createElement('parameter'));
   doc.setStripInvalidChars(true);
   doc.setAttribute('name','script');
   doc.setAttribute('value', script);
   var payload = doc.toString();

   var gr = new GlideRecord('ecc_queue');
   gr.initialize();
   gr.setValue('payload', payload);
   gr.setValue('agent', 'mid.server.' + mid_server);
   gr.setValue('topic', 'SystemCommand');
   gr.setValue('source', 'script');
   gr.setValue('state', 'ready');
   gr.setValue('queue', 'output');
   var ecc_queue_id = gr.insert();
   gs.getSession().putProperty('ecc_queue_id', ecc_queue_id);
   gs.log('ecc_queue_id: ' + gs.getSession().getProperty('ecc_queue_id'));
   g_response.sendRedirect('mid_tools_progress_page.do');
}
