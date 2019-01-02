/*! RESOURCE: /scripts/classes/GlideUIDefault.js */
var GlideUIDefault = {
  init: function() {},
  display: function(htmlTextOrOptions) {
    if (typeof htmlTextOrOptions == 'string')
      new NotificationMessage({
        text: htmlTextOrOptions
      });
    else
      new NotificationMessage(htmlTextOrOptions);
  }
};
if (GlideUI.get())
  Object.extend(GlideUI.get(), GlideUIDefault).init();;