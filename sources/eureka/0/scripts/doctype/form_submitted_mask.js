addLoadEvent(function() {
  var isDoctype = document.documentElement.getAttribute('data-doctype') == 'true';
  if (!isDoctype)
    return;
  CustomEvent.observe('glide:form_submitted', function() {
    $(document.body).addClassName('submitted');
    setTimeout(function() {
      CustomEvent.fireTop('glide:nav_form_stay', window);
    }, 750);
  })
  CustomEvent.observe('glide:nav_form_stay', function(originWindow) {
    var ga = new GlideAjax('AJAXFormLoad');
    ga.addParam('sysparm_name', 'canFormReload');
    ga.getXML(function() {
      enableFormControls(originWindow);
    })
  });

  function enableFormControls(originWindow) {
    if (originWindow != self)
      return;
    $(document.body).removeClassName('submitted');
    if (window.g_form)
      g_form.submitted = false;
    if (window.g_submitted)
      g_submitted = false;
  }
})