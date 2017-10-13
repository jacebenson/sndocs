/*! RESOURCE: /scripts/lib/jquery/jquery_csrf.js */
(function($) {
  setToken();
  CustomEvent.observe('ck_updated', setToken);

  function setToken() {
    $.ajaxPrefilter(function(options) {
      if (!options.crossDomain) {
        if (!options.headers)
          options.headers = {};
        var token = window.g_ck || 'token_intentionally_left_blank';
        options.headers['X-UserToken'] = token;
      }
    });
  }
})(jQuery);;