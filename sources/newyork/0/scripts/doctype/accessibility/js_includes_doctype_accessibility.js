/*! RESOURCE: /scripts/doctype/accessibility/js_includes_doctype_accessibility.js */
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
/*! RESOURCE: /scripts/doctype/accessibility/forms/cleanLabels.js */
(function(document) {
  jQuery(function($j) {
    var doc = $j(document);
    doc.find('label[for]').each(function() {
      var label = $j(this);
      var forId = label.attr('for') || '';
      if (forId === '')
        return;
      var inputElement = document.getElementById(forId);
      if (
        !inputElement ||
        inputElement.hasAttribute('aria-label') ||
        inputElement.hasAttribute('aria-labelledby') ||
        ((inputElement.type || '').toLowerCase() === 'hidden')
      )
        return;
      var textElement = label.find('.label-text');
      var text = textElement.length > 0 ? textElement.text() : '';
      if (text !== '')
        inputElement.setAttribute('aria-label', text);
    })
  });
})(document);;;