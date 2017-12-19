(function () {
  var gr = new GlideRecord('sp_theme');
  var sys_id = $sp.getParameter('sys_id')
  gr.get(sys_id);
  data.name = gr.getDisplayValue('name');
  data.sys_id = gr.getDisplayValue('sys_id');
})();