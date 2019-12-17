/*! RESOURCE: /scripts/doctype/PersonalizeForm.js */
(function() {
  if (typeof g_form === "undefined")
    return;
  $j.extend(jQuery.expr[':'], {
    canBeSeen: function(el, index, selector) {
      return $j(el).css('visibility') != 'hidden';
    }
  });
  var PersonalizeForm = Class.create({
    initialize: function() {
      this.menuInputSelector = "input:enabled:canBeSeen, button:enabled:canBeSeen";
      this.tabOutsideMenuSelector = ":tabbable:enabled:canBeSeen";
      this.$toggleButton = $j("#togglePersonalizeForm");
      if (!this.$toggleButton.length)
        return;
      this.$toggleButton.hideFix();
      this.isInitialized = false;
      this.isOpen = false;
      this.popoverContentPadding = 0;
      this.ref = this.$toggleButton.data("ref");
      this.sectionZeroID = $j("span.tabs2_section0[data-header-only='false']").attr("id");
      this.$fieldLabelHideButtons = $j();
      this.$container = $j(this.$toggleButton.data("target"));
      this.$resetButton = $j("button.personalize_form_preference_reset");
      this.$templateBar = $j("#template-bar-aria-container");
      this.$list = this.$container.find(".personalize_form_fields");
      this.$containerParent = [];
      this.$extraTitle = [];
      this.elements = g_form.elements.reduce(function(newArray, element) {
        var tableName = element.tableName;
        if (tableName !== "variable") {
          var name = element.fieldName;
          newArray.push({
            tableName: tableName,
            name: name,
            mandatory: element.mandatory,
            label: g_form.getLabelOf(name),
            $control: $j(g_form.getControl(name))
          });
        }
        return newArray;
      }.bind(this), []);
      this.elements.sort(function(a, b) {
        return a.label <= b.label ? -1 : 1;
      });
      this.$toggleButton.click(function() {
        if (this.isOpen)
          this._hideSidebar();
        else if (!this.isInitialized)
          this._initializeSidebar();
        else
          this._showSidebar();
      }.bind(this));
      this._addOrRemoveMandatoryObserver();
      this._deepClone(g_form._getPersonalizeHiddenFields()).forEach(function(fieldName) {
        if (this._isMandatory(fieldName))
          g_form.setUserDisplay(fieldName, true);
        else
          g_form.setDisplay(fieldName, false);
      }, this);
    },
    toString: function() {
      return "PersonalizeForm"
    },
    _initializeSidebar: function() {
      $j("html").click(function(event) {
        if (this.isOpen && !this.$toggleButton.is(event.target) && this.$container.parents(".popover").has($j(event.target)).length === 0)
          this._hideSidebar();
      }.bind(this));
      $j(document).keyup(function(event) {
        if (event.keyCode === 27)
          if (this.isOpen && this.$container.parents(".popover").has($j(event.target)).length === 0)
            this._hideSidebar();
      }.bind(this));
      $j(window).resize(function() {
        if (this.isOpen)
          this._hideSidebar();
      }.bind(this));
      this.$toggleButton.popover({
        html: true,
        placement: "bottom",
        trigger: "manual",
        content: function() {
          this.$container.show();
          return this.$container;
        }.bind(this)
      });
      this.$container.css("overflow", "unset");
      this._render();
      this._showSidebar();
      this.isInitialized = true;
    },
    _hideSidebar: function() {
      this._removeHandlersAndClass();
      this.$toggleButton.removeClass("icon-cog-selected").addClass("icon-cog");
      this.$toggleButton.popover("hide");
      this.$fieldLabelHideButtons.hide();
      this.$toggleButton.attr("aria-expanded", "false");
      this.isOpen = false;
    },
    _showOrHideResetButton: function() {
      var personalizedFields = g_form._getPersonalizeHiddenFields();
      if (personalizedFields.length) {
        this._setResetButtonVisibility(true);
        this.$resetButton.click(function(event) {
          event.preventDefault();
          this._deepClone(personalizedFields).forEach(function(fieldName) {
            var field = document.getElementById(fieldName);
            field.checked = true;
            $j(field).attr("aria-selected", "true");
            g_form.setUserDisplay(fieldName, true);
          });
          this._setResetButtonVisibility(false);
          this._hideSidebar();
          this.$toggleButton.focus();
        }.bind(this));
      } else
        this._setResetButtonVisibility(false);
    },
    _showSidebar: function() {
      this.$toggleButton.removeClass("icon-cog").addClass("icon-cog-selected");
      this.$toggleButton.popover("show");
      this.$fieldLabelHideButtons.show();
      this.elements.forEach(function(element) {
        if (this._isFieldInHiddenSection(element.$control))
          element.$popoverListItem.css("display", "none");
      }, this);
      if (this.isInitialized)
        this.elements.forEach(function(element) {
          this._setIsCheckedIsDisabled(element);
        }, this);
      this._attachHandlers();
      if (!this.$extraTitle.length)
        this.$extraTitle = this.$container.parent().parent().find("h3.popover-title");
      this.$extraTitle.hide();
      this._setPopoverHeight();
      this._showOrHideResetButton();
      this.$toggleButton.attr("aria-expanded", "true");
      this.isOpen = true;
      if (!(this.lastFocusedElement && this.lastFocusedElement.is(":canBeSeen")))
        this.lastFocusedElement = this.getFirstTabbableInMenu();
      this.lastFocusedElement.focus()
    },
    _setPopoverHeight: function() {
      if (!this.$containerParent.length) {
        this.$containerParent = this.$container.parent(".popover-content");
        this.popoverContentPadding = this.$containerParent.innerHeight() - this.$containerParent.height();
        this.$container.height(this.$container.height() + this.popoverContentPadding);
      }
      var templateBarHeight = (this.$templateBar.css("opacity") === "1") ? this.$templateBar.outerHeight(true) : 0;
      var popoverMaxHeight = window.innerHeight - templateBarHeight - 120;
      var popoverContentHeight = this.$container.height();
      if (popoverContentHeight > popoverMaxHeight)
        this.$containerParent.height(popoverMaxHeight + 5);
      else
        this.$containerParent.height(popoverContentHeight - this.popoverContentPadding);
    },
    _addHoverClass: function(element) {
      element.$formElement.addClass("personalize_hover");
      element.$popoverElement.addClass("personalize_hover");
    },
    _removeHoverClass: function(element) {
      element.$formElement.removeClass("personalize_hover");
      element.$popoverElement.removeClass("personalize_hover");
    },
    _attachHandlers: function() {
      this._addOrRemoveMandatoryObserver();
      this.elements.forEach(function(element) {
        if (element.isDisabled)
          return;
        element.$formElement
          .on("mouseenter.personalizeForm", this._addHoverClass.bind(this, element))
          .on("mouseleave.personalizeForm", this._removeHoverClass.bind(this, element));
        element.$popoverElement
          .on("mouseenter.personalizeForm", this._addHoverClass.bind(this, element))
          .on("mouseleave.personalizeForm", this._removeHoverClass.bind(this, element));
        element.$popoverInput.on("change.personalizeForm", function(event) {
          element.$popoverInput.attr("aria-selected", element.$popoverInput.prop("checked") ? "true" : "false");
          g_form.setUserDisplay(
            element.$popoverInput.attr("name"),
            element.$popoverInput.prop("checked")
          );
          event.preventDefault();
          event.stopPropagation();
          this._showOrHideResetButton();
        }.bind(this));
      }, this);
      this.$container.keydown(function(e) {
        switch (e.keyCode) {
          case $j.ui.keyCode.DOWN:
            e.preventDefault();
            e.stopPropagation();
            this.tabNextInMenu();
            break;
          case $j.ui.keyCode.UP:
            e.preventDefault();
            e.stopPropagation();
            this.tabPreviousInMenu();
            break;
          case $j.ui.keyCode.TAB:
            e.preventDefault();
            e.stopPropagation();
            this.$toggleButton.click();
            this.$toggleButton.focus();
            if (e.shiftKey)
              this.tabOutPrevious();
            else
              this.tabOutNext();
            this._hideSidebar();
            break;
          case $j.ui.keyCode.ESCAPE:
            this._hideSidebar();
            this.$toggleButton.focus();
            break;
          default:
            break;
        }
      }.bind(this));
      this.$toggleButton.keydown(function(e) {
        if (e.keyCode === $j.ui.keyCode.TAB) {
          this._hideSidebar();
        }
      }.bind(this));
    },
    _removeHandlersAndClass: function() {
      this._addOrRemoveMandatoryObserver();
      this.elements.forEach(function(element) {
        this._removeHoverClass(element);
        element.$formElement.off(".personalizeForm");
        element.$popoverElement.off(".personalizeForm");
        element.$popoverInput.off(".personalizeForm");
      }, this);
      this.$container.unbind('keydown');
      this.$toggleButton.unbind('keydown');
    },
    _render: function() {
      var template = new XMLTemplate("personalize_item");
      this.elements.forEach(function(element) {
        var prefixedField = this.ref + "." + element.name;
        var $html = $j(template.evaluate(element));
        var $input = $html.find("input");
        var $fieldLabelTd = $j(gel("label." + prefixedField));
        element.$formElement = $fieldLabelTd.parent();
        element.$popoverElement = $input.next();
        element.$popoverInput = $input;
        element.$popoverListItem = $input.parents("li");
        this._setIsCheckedIsDisabled(element);
        if (!element.isDisabled) {
          $fieldLabelTd.css("position", "relative");
          var $hideButton = $j("<a class=\"icon icon-delete personalize_form_hide_field\" href=\"#\"></a>");
          if (!g_accessibility) {
            $hideButton.attr("title", "Hide " + element.label);
            $hideButton.data("input", $input);
            $fieldLabelTd.find("label").prepend($hideButton);
            this.$fieldLabelHideButtons = this.$fieldLabelHideButtons.add($hideButton);
            element.$hideButton = $hideButton;
          }
        }
        this.$container.find(".personalize_form_fields").append($html);
      }, this);
      this.$fieldLabelHideButtons.click(function(event) {
        $j(event.currentTarget).data("input").click();
        event.preventDefault();
        event.stopPropagation();
      });
      this.lastFocusedElement = this.getFirstTabbableInMenu();
      this.lastFocusedElement.focus();
    },
    getTargetToFocus: function(goPrevious, selectables) {
      var current = $j(':focus');
      var incrementor = goPrevious ? -1 : 1;
      var targetIndex = goPrevious ? selectables.length - 1 : 0;
      if (current.length === 1) {
        var currentIndex = selectables.index(current);
        var updateIndexCondition = goPrevious ? currentIndex > 0 : currentIndex + 1 < selectables.length;
        if (updateIndexCondition)
          targetIndex = currentIndex + incrementor;
      }
      return selectables.eq(targetIndex);
    },
    tabNextOrPrevOutOfMenu: function(goPrevious) {
      var selectables = $j(this.tabOutsideMenuSelector).not(this.$container.find(this.menuInputSelector));
      var target = this.getTargetToFocus(goPrevious, selectables);
      if (target)
        target.focus();
    },
    tabNextOrPrevInMenu: function(goPrevious) {
      var selectables = this.$container.find(this.menuInputSelector);
      var target = this.getTargetToFocus(goPrevious, selectables);
      this.lastFocusedElement = target;
      if (target)
        target.focus();
    },
    getFirstTabbableInMenu: function() {
      var selectables = $j(this.$container).find(this.menuInputSelector);
      return selectables.eq(0);
    },
    tabOutNext: function() {
      this.tabNextOrPrevOutOfMenu(false);
    },
    tabOutPrevious: function() {
      this.tabNextOrPrevOutOfMenu(true);
    },
    tabNextInMenu: function() {
      this.tabNextOrPrevInMenu(false);
    },
    tabPreviousInMenu: function() {
      this.tabNextOrPrevInMenu(true);
    },
    _deepClone: function(obj) {
      return JSON.parse(JSON.stringify(obj));
    },
    _isMandatory: function(fieldName) {
      var origMandatory = this.elements.some(function(element) {
        return element.name === fieldName && element.mandatory === true;
      });
      return g_form.isMandatory(fieldName) || origMandatory || false;
    },
    _isDisplayNone: function(fieldName) {
      var ed = g_form.getGlideUIElement(fieldName);
      var control = g_form.getControl(fieldName);
      return ed && control && g_form.isDisplayNone(ed, control);
    },
    _isFieldInHiddenSection: function($control) {
      if (typeof g_tabs2Sections === "undefined")
        return false;
      var sectionId = $control.closest("[data-section-id]").attr("id");
      if (sectionId === undefined || sectionId === this.sectionZeroID)
        return false;
      var tabIndex = g_tabs2Sections.findTabIndexByID(sectionId);
      if (tabIndex === -1)
        return false;
      return !g_tabs2Sections.isVisible(tabIndex);
    },
    _setIsCheckedIsDisabled: function(element) {
      var name = element.name;
      var isMandatory = this._isMandatory(name);
      var isPersonalized = g_form.isUserPersonalizedField(name);
      element.isChecked = isMandatory || !isPersonalized;
      element.$popoverInput.attr("aria-selected", element.isChecked ? "true" : "false");
      element.isDisabled = isMandatory || (this._isDisplayNone(name) && !isPersonalized);
      element.$popoverInput.attr("disabled", element.isDisabled).prop("checked", element.isChecked);
      if (element.isDisabled && element.$hideButton && element.$hideButton.is(":visible"))
        element.$hideButton.hide();
    },
    _mandatoryObserver: function(prefixedField) {
      var fieldName = g_form._removeTableName(prefixedField);
      var isMandatory = g_form.isMandatory(fieldName);
      var isPersonalized = g_form.isUserPersonalizedField(fieldName);
      if (isMandatory && isPersonalized)
        g_form.setDisplay(fieldName, true);
    },
    _addOrRemoveMandatoryObserver: function() {
      if (g_form._getPersonalizeHiddenFields().length)
        CustomEvent.observe("mandatory.changed", this._mandatoryObserver);
      else
        CustomEvent.un("mandatory.changed", this._mandatoryObserver);
    },
    _setResetButtonVisibility: function(b) {
      this.$resetButton.css("visibility", b ? "visible" : "hidden");
    }
  });
  addRenderEvent(function() {
    window.g_personalizeForm = new PersonalizeForm();
  });
}());;