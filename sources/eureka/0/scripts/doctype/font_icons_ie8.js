(function() {
  if (!isMSIE8)
    return;
  CustomEvent.observe('icons:reload', function(winName) {
    if (window.name == winName)
      return;
    var head = document.getElementsByTagName('head')[0],
      style = document.createElement('style');
    style.type = 'text/css';
    style.styleSheet.cssText = ':before,:after{content:none !important;}';
    head.appendChild(style);
    setTimeout(function() {
      head.removeChild(style);
    }, 0);
  })
  $j(window).bind('load', function() {
    CustomEvent.fireAll('icons:reload', window.name);
  })
})();