/*! RESOURCE: /scripts/doctype/PersonalizeForm.js */
var PersonalizeForm = Class.create({
  initialize: function(toggleButtonSelector) {
    var self = this;
    this.$toggleButton = $j(toggleButtonSelector);
    this.$toggleButton.hideFix();
    if (this.$toggleButton.length < 1)
      return;
    this.isOpen = false;
    this.isInitialized = false;
    this.ref = this.$toggleButton.data("ref");
    this.$container = $j(this.$toggleButton.data('target'));
    this.$fieldLabelHideButtons = null;
    this.$fields = null;
    this.$toggleButton.click(function() {
      if (self.isOpen) {
        self.hideSidebar();
      } else {
        if (!self.isInitialized) {
          self.initializeSidebar();
        } else
          self.showSidebar();
      }
    });
    $j('html').on('click', function(e) {
      if (self.isOpen && !self.$toggleButton.is(e.target) && self.$container.parents('.popover').has($j(e.target)).length == 0) {
        self.hideSidebar();
      }
    });
    $j(document).keyup(function(e) {
      if (e.keyCode == 27) {
        if (self.isOpen && self.$container.parents('.popover').has($j(e.target)).length == 0) {
          self.hideSidebar();
        }
      }
    });
    $j(window).on('resize', function() {
      if (self.isOpen)
        self.hideSidebar();
    });
    this.initializeForm();
  },
  initializeForm: function() {
    var fields = g_form._getPersonalizeHiddenFields();
    fields.forEach(function(f) {
      g_form.setDisplay(f, false);
    })
  },
  initializeSidebar: function() {
    var self = this;
    this.$toggleButton.popover({
      html: true,
      placement: 'bottom',
      trigger: 'manual',
      content: function() {
        self.$container.show();
        return self.$container;
      }
    });
    this.render();
    this.isInitialized = true;
    this.showSidebar();
  },
  hideSidebar: function() {
    this.$toggleButton.removeClass("icon-cog-selected").addClass("icon-cog");
    this.$toggleButton.popover('hide');
    if (this.$fieldLabelHideButtons != null)
      this.$fieldLabelHideButtons.hide();
    this.isOpen = false;
    this.$toggleButton.attr('aria-expanded', 'false');
    if (window && window.accessibilityEnabled && this.focusTrap) {
      this.focusTrap.deactivate();
    }
  },
  showSidebar: function() {
    this.$toggleButton.removeClass("icon-cog").addClass("icon-cog-selected");
    this.$toggleButton.popover('show');
    this.$container.parent().parent().find('h3.popover-title').hide();
    this.setPopoverHeight();
    if (this.$fieldLabelHideButtons != null)
      this.$fieldLabelHideButtons.show();
    var self = this;
    if (g_form.personalizeHiddenFields.length) {
      $j(".personalize_form_preference_reset").show().click(function(e) {
        for (var i = g_form.personalizeHiddenFields.length; i >= 0; i--) {
          document.getElementById(g_form.personalizeHiddenFields[i]).checked = true;
          g_form.setUserDisplay(g_form.personalizeHiddenFields[i], true);
        }
        self.hideSidebar();
        $j(".personalize_form_preference_reset").hide();
        e.preventDefault();
      });
    }
    if (this.$fields != null)
      this.$fields.change(this, function(event) {
        var fieldName = $j(this).attr('name');
        var display = $j(this).prop('checked');
        g_form.setUserDisplay(fieldName, display);
        event.preventDefault();
        event.stopPropagation();
      });
    this.isOpen = true;
    this.$toggleButton.attr('aria-expanded', 'true');
    this.$container.on('click', '.dismiss', function(e) {
      self.hideSidebar();
    });
    if (window && window.accessibilityEnabled && window.focusTrap) {
      this.focusTrap = window.focusTrap(this.$container[0]);
      this.focusTrap.activate();
    }
  },
  setPopoverHeight: function() {
    var bootstrapPopoverContentPadding = 28;
    var popoverMaxHeight = window.innerHeight - 120;
    var popoverContentsHeight = this.$container.height();
    var topOffset = this.$container.position().top;
    var popoverOuterHeight = popoverMaxHeight;
    var popoverInnerHeight = (popoverMaxHeight - topOffset) + bootstrapPopoverContentPadding;
    if (popoverContentsHeight + bootstrapPopoverContentPadding <= popoverMaxHeight) {
      popoverOuterHeight = popoverContentsHeight;
      popoverInnerHeight = popoverContentsHeight;
    }
    this.$container.parent(".popover-content").height(popoverOuterHeight);
    this.$container.height(popoverInnerHeight);
  },
  render: function() {
    var formElements = this.getFormElements();
    var container = this.$container.find('.personalize_form_fields');
    var template = new XMLTemplate('personalize_item');
    var self = this;
    formElements.forEach(function(e) {
      var html = $j(template.evaluate(e));
      var input = html.find('input').prop('checked', e.display);
      if (e.isDisabled)
        input.attr("disabled", "disabled");
      else {
        var fieldLabelTd = $j(gel("label." + self.ref + "." + e.name));
        fieldLabelTd.css("position", "relative");
        if (window && !window.accessibilityEnabled) {
          var hideButton = $j("<a class='icon icon-delete personalize_form_hide_field' href='#'></a>");
          hideButton.attr("title", "Hide " + e.label);
          hideButton.data("input", input);
          fieldLabelTd.find('label').prepend(hideButton);
        }
        fieldLabelTd.parent().mouseenter(self, function(event) {
          if (event.data.isOpen)
            $j(self).addClass("personalize_hover");
        }).mouseleave(self, function(event) {
          if (event.data.isOpen)
            $j(self).removeClass("personalize_hover");
        });
        input.next().mouseenter(fieldLabelTd, function(event) {
          event.data.parent().addClass("personalize_hover");
        }).mouseleave(fieldLabelTd, function(event) {
          event.data.parent().removeClass("personalize_hover");
        });
        if (self.$fieldLabelHideButtons === null)
          self.$fieldLabelHideButtons = hideButton;
        else if (window && !window.accessibilityEnabled)
          self.$fieldLabelHideButtons = self.$fieldLabelHideButtons.add(hideButton);
        if (self.$fields === null)
          self.$fields = input;
        else
          self.$fields = self.$fields.add(input);
      }
      container.append(html);
    });
    if (this.$fieldLabelHideButtons != null)
      this.$fieldLabelHideButtons.click(function(event) {
        $j(this).data("input").click();
        event.preventDefault();
        event.stopPropagation();
      });
  },
  getFormElements: function() {
    var fieldNames = g_form.elements.sort(function(a, b) {
      return a.fieldName <= b.fieldName ? -1 : 1;
    });
    var answer = [];
    fieldNames.each(function(item) {
      if (item.tableName == "variable")
        return;
      answer.push({
        name: item.fieldName,
        label: g_form.getLabelOf(item.fieldName),
        display: !g_form.isUserPersonalizedField(item.fieldName),
        isDisabled: (g_form.isMandatory(item.fieldName) || g_form.isDisplayNone(item, g_form.getControl(item.fieldName))) && !g_form.isUserPersonalizedField(item.fieldName)
      })
    });
    return answer;
  },
  toString: function() {
    return 'PersonalizeForm';
  }
});
$j(function() {
  "use strict";
  if (typeof g_form !== "undefined")
    new PersonalizeForm("#togglePersonalizeForm");
});;