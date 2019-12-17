/*! RESOURCE: /scripts/doctype/accessibility/focusOutlineUtility.js */
(function(window, document) {
  window.NOW = window.NOW || {};

  function addClassById(target, className) {
    modifyFocusOutline(target, className, true);
  }

  function removeClassById(target, className) {
    modifyFocusOutline(target, className, false);
  }

  function onFocusAddMSHCOutline(target) {
    addClassById(target, 'ms-high-contrast-outline');
  }

  function onBlurRemoveMSHCOutline(target) {
    removeClassById(target, 'ms-high-contrast-outline');
  }

  function modifyFocusOutline(el, className, add) {
    if (typeof el === "string") {
      el = document.getElementById(el);
    }
    if (el) {
      if (add) {
        el.classList.add(className);
      } else {
        el.classList.remove(className);
      }
    }
  }

  function luminance(r, g, b) {
    var a = [r, g, b].map(function(v) {
      v /= 255;
      return v <= 0.03928 ?
        v / 12.92 :
        Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  }

  function calculateContrastRatio(rgb1, rgb2) {
    var lum1 = luminance(rgb1[0], rgb1[1], rgb1[2]) + 0.05;
    var lum2 = luminance(rgb2[0], rgb2[1], rgb2[2]) + 0.05;
    return (lum1 > lum2) ?
      (lum1 / lum2) :
      (lum2 / lum1);
  }

  function extractRGB(rgb) {
    var re = RegExp(/\d{1,3}/, 'g');
    var match;
    var values = [];
    while ((match = re.exec(rgb)) !== null && values.length < 3) {
      values.push(match[0]);
    }
    return values;
  }

  function getContrastRatio(el) {
    var computedStyle = getComputedStyle(el);
    var color = computedStyle['color'];
    var backgroundColor = computedStyle['background-color'];
    var colorRGB = extractRGB(color);
    var backgroundColorRGB = extractRGB(backgroundColor);
    return calculateContrastRatio(backgroundColorRGB, colorRGB);
  }
  window.NOW.accessibility = window.NOW.accessibility || {};
  window.NOW.accessibility['onFocusAddMSHCOutline'] = onFocusAddMSHCOutline;
  window.NOW.accessibility['onBlurRemoveMSHCOutline'] = onBlurRemoveMSHCOutline;
})(window, document);;