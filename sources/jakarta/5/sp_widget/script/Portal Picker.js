(function () {
	data.sys_id = $sp.getParameter('sys_id') || gs.getUser().getPreference("sp.portal");
  var gr = new GlideRecord('sp_portal');
  gr.get(data.sys_id);
	data.title = data.name = gr.getDisplayValue('title');
})();