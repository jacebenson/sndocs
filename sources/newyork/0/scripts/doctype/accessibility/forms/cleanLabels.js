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
})(document);;