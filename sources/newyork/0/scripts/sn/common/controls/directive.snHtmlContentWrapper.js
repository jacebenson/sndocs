/*! RESOURCE: /scripts/sn/common/controls/directive.snHtmlContentWrapper.js */
angular.module('sn.common.controls').directive('snHtmlContentWrapper', function() {
  function link(scope, element, attrs) {
    encapsulate(element[0], attrs.content);
  }

  function encapsulate(root, content) {
    if (document.head.createShadowRoot ||
      document.head.attachShadow) {
      var shadow = document.head.attachShadow ?
        root.attachShadow({
          mode: 'open'
        }) :
        root.createShadowRoot();
      var contentDiv = document.createElement('div');
      shadow.appendChild(contentDiv);
      contentDiv.innerHTML = content;
    } else {
      var iframe = document.createElement("iframe");
      iframe.setAttribute("style", "border:none;display:block");
      iframe.setAttribute("class", "html-content");
      iframe.setAttribute("scrolling", "no");
      root.appendChild(iframe);
      var doc = iframe.contentWindow.document;
      doc.open();
      doc.write(content);
      doc.close();
      iframe.height = doc.body.scrollHeight + 'px';
    }
  }
  return {
    link: link,
    restrict: 'E',
    replace: true
  };
});;