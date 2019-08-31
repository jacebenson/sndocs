/*! RESOURCE: /scripts/doctype/accessibility/ariaLiveService.js */
(function(window, document) {
  window.NOW = window.NOW || {};

  function ariaLivePolite(text, delay) {
    setTimeout(_ariaLiveMessage, delay || 0, text, false);
  }

  function ariaLiveAssertive(text, delay) {
    setTimeout(_ariaLiveMessage, delay || 0, text, true);
  }

  function _ariaLiveMessage(text, assertive) {
    var ariaLiveId = !!assertive ?
      'html_page_aria_live_assertive' :
      'html_page_aria_live_polite';
    var ariaLive = document.getElementById(ariaLiveId);
    if (!ariaLive)
      return;
    if (window.NOW.ariaLiveDisabled)
      return;
    if (ariaLive.children.length > 50 || (ariaLive.children.length > 0 && ariaLive.textContent.length > 10000))
      ariaLive.children[0].remove();
    ariaLive.insertAdjacentText('beforeEnd', text);
  }
  CustomEvent.observe('global_aria_live_polite', ariaLivePolite);
  CustomEvent.observe('global_aria_live_assertive', ariaLiveAssertive);
  window.NOW.accessibility = window.NOW.accessibility || {};
  window.NOW.accessibility['ariaLivePolite'] = ariaLivePolite;
  window.NOW.accessibility['ariaLiveAssertive'] = ariaLiveAssertive;
})(window, document);;