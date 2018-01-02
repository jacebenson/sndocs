/*! RESOURCE: /scripts/annotations_toggle.js */
var SN = SN || {};
SN.formAnnotations = {
  preference: false,
  annotations: null,
  hide: function() {
    SN.formAnnotations.annotations.fadeOut();
    SN.formAnnotations.preference = false;
  },
  show: function() {
    SN.formAnnotations.annotations.fadeIn();
    SN.formAnnotations.preference = true;
  },
  toggle: function() {
    if (SN.formAnnotations.preference)
      SN.formAnnotations.hide();
    else
      SN.formAnnotations.show();
    setPreference('glide.ui.show_annotations', SN.formAnnotations.preference);
  },
  toggleFromInfoMsg: function() {
    SN.formAnnotations.toggle();
    GlideUI.get().clearOutputMessages();
  },
  init: function() {
    var selectors = ['.annotation-row[data-annotation-type="Info Box Blue"]',
      '.annotation-row[data-annotation-type="Info Box Red"]',
      '.annotation-row[data-annotation-type="Section Details"]',
      '.annotation-row[data-annotation-type="Text"]'
    ];
    SN.formAnnotations.annotations = $j(selectors.join(','));
    var $annotationButton = $j('#header_toggle_annotations');
    if (SN.formAnnotations.annotations.length) {
      $annotationButton.show().click(SN.formAnnotations.toggle);
      if (!SN.formAnnotations.preference && SN.formAnnotations.infoPreference) {
        SN.formAnnotations.addHiddenAnnotationMessage();
        $j("#info_toggle_annotations").show().click(SN.formAnnotations.toggleFromInfoMsg);
      }
    } else {
      $annotationButton.prop('disabled', true)
      var $annotationTooltip = $annotationButton.closest('.annotation-tooltip');
      $annotationTooltip.attr('title', $annotationTooltip.attr('data-title-disabled'));
    }
    if (SN.formAnnotations.preference)
      SN.formAnnotations.show();
  },
  setInfoPref: function() {
    setPreference("glide.ui.annotations.show_hidden_msg", "false");
    GlideUI.get().clearOutputMessages();
  },
  addHiddenAnnotationMessage: function() {
    var msg = getMessage('This form has annotations - click');
    msg += ' <span id="info_toggle_annotations" tabindex="0" class="icon-button icon-help sn-cloak" title="Toggle annotations on / off" style="display: inline-block;color:#678;cursor:pointer;font-size:1.4em"></span> ';
    msg += getMessage("to toggle them");
    msg += ' - (<span style="text-decoration:underline;cursor:pointer;" onclick="SN.formAnnotations.setInfoPref()">';
    msg += getMessage("click here");
    msg += '</span> ';
    msg += getMessage("to never show this again");
    msg += ')';
    g_form.addInfoMessage(msg);
  }
};