gs.include("PrototypeServer");

var FormInfoHeader = Class.create();

FormInfoHeader.prototype = {
	initialize: function() {
	},

	addMessage: function(message) {
      var jr = new GlideJellyRunner();
      jr.setEscaping(false);
      jr.setVariable('jvar_text', message);
      var m = jr.runFromScript('<g:form_info_header/>');
      gs.addInfoMessage(m);
	}
};
