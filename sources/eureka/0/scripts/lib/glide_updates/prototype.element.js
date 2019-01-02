var elementPrototype = window.HTMLElement ? HTMLElement.prototype : Element.prototype;
elementPrototype.hide = function(elem) {
  return !elem ? Element.Methods.hide.call(null, this) : window.hide(elem);
}
elementPrototype.show = function(elem) {
  return !elem ? Element.Methods.show.call(null, this) : window.show(elem);
}
Element.addMethods({
  getInnerText: function(element) {
    element = $(element);
    return element.innerText && !window.opera ? element.innerText : element.innerHTML.stripScripts().unescapeHTML().replace(/[\n\r\s]+/g, ' ');
  },
  writeTitle: function(element, title) {
    element.title = title;
    if (element.alt)
      element.alt = title;
  },
  visible: function(element) {
    if (element.getStyle('display') == 'none' || element.getStyle('visibility') == 'hidden')
      return false;
    return true;
  },
  visibleInViewport: function(element) {
    if (!element.visible())
      return false;
    var offset = element.viewportOffset();
    if (offset.left < 0 || offset.top < 0)
      return false;
    var vp = document.viewport.getDimensions();
    if ((offset.left + element.getWidth()) > vp.width || (offset.top + element.getHeight()) > vp.height)
      return false;
    return true;
  },
  getDimensions: function(element) {
    element = $(element);
    var dimensions = {};
    var display = Element.getStyle(element, 'display');
    if (display && display !== 'none') {
      dimensions = {
        width: element.offsetWidth,
        height: element.offsetHeight
      };
    }
    if (dimensions.width > 0)
      return dimensions;
    var style = element.style;
    var originalStyles = {
      visibility: style.visibility,
      position: style.position,
      display: style.display
    };
    var newStyles = {
      visibility: 'hidden',
      display: 'block'
    };
    if (originalStyles.position !== 'fixed')
      newStyles.position = 'absolute';
    Element.setStyle(element, newStyles);
    var dimensions = {
      width: element.offsetWidth,
      height: element.offsetHeight
    };
    if (dimensions.width <= 0 && dimensions.height <= 0) {
      dimensions.width = parseInt(element.getStyle('width') || 0, 10);
      dimensions.height = parseInt(element.getStyle('height') || 0, 10);
    }
    Element.setStyle(element, originalStyles);
    return dimensions;
  }
});