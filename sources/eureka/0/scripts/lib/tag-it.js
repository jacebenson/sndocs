(function($) {
  $.widget('ui.tagit', {
    options: {
      allowDuplicates: false,
      caseSensitive: true,
      fieldName: 'tags',
      placeholderText: null,
      readOnly: false,
      removeConfirmation: false,
      tagLimit: null,
      availableTags: [],
      autocomplete: {},
      showAutocompleteOnFocus: false,
      allowSpaces: false,
      singleField: false,
      singleFieldDelimiter: ',',
      singleFieldNode: null,
      animate: true,
      tabIndex: null,
      beforeTagAdded: null,
      afterTagAdded: null,
      beforeTagRemoved: null,
      afterTagRemoved: null,
      onTagClicked: null,
      onTagLimitExceeded: null,
      onTagAdded: null,
      onTagRemoved: null,
      tagSource: null
    },
    _create: function() {
      var that = this;
      if (this.element.is('input')) {
        this.tagList = $('<ul></ul>').insertAfter(this.element);
        this.options.singleField = true;
        this.options.singleFieldNode = this.element;
        this.element.css('display', 'none');
      } else {
        this.tagList = this.element.find('ul, ol').andSelf().last();
      }
      this.tagInput = $('<input type="text" autocorrect="off" autocomplete="off"/>').addClass('ui-widget-content');
      if (this.options.readOnly) this.tagInput.attr('disabled', 'disabled');
      if (this.options.tabIndex) {
        this.tagInput.attr('tabindex', this.options.tabIndex);
      }
      if (this.options.placeholderText) {
        this.tagInput.attr('placeholder', this.options.placeholderText);
      }
      if (!this.options.autocomplete.source) {
        this.options.autocomplete.source = function(search, showChoices) {
          var filter = search.term.toLowerCase();
          var choices = $.grep(this.options.availableTags, function(element) {
            return (element.toLowerCase().indexOf(filter) === 0);
          });
          showChoices(this._subtractArray(choices, this.assignedTags()));
        };
      }
      if (this.options.showAutocompleteOnFocus) {
        this.tagInput.focus(function(event, ui) {
          that._showAutocomplete();
        });
        if (typeof this.options.autocomplete.minLength === 'undefined') {
          this.options.autocomplete.minLength = 0;
        }
      }
      if ($.isFunction(this.options.autocomplete.source)) {
        this.options.autocomplete.source = $.proxy(this.options.autocomplete.source, this);
      }
      if ($.isFunction(this.options.tagSource)) {
        this.options.tagSource = $.proxy(this.options.tagSource, this);
      }
      this.tagList
        .addClass('tagit')
        .addClass('ui-widget ui-widget-content ui-corner-all')
        .append($('<li class="tagit-new"></li>').append(this.tagInput))
        .click(function(e) {
          var target = $(e.target);
          if (target.hasClass('tagit-label')) {
            var tag = target.closest('.tagit-choice');
            if (!tag.hasClass('removed')) {
              that._trigger('onTagClicked', e, {
                tag: tag,
                tagLabel: that.tagLabel(tag)
              });
            }
          } else {}
        });
      var addedExistingFromSingleFieldNode = false;
      if (this.options.singleField) {
        if (this.options.singleFieldNode) {
          var node = $(this.options.singleFieldNode);
          var tags = node.val().split(this.options.singleFieldDelimiter);
          node.val('');
          $.each(tags, function(index, tag) {
            that.createTag(tag, null, true);
            addedExistingFromSingleFieldNode = true;
          });
        } else {
          this.options.singleFieldNode = $('<input type="hidden" style="display:none;" value="" name="' + this.options.fieldName + '" />');
          this.tagList.after(this.options.singleFieldNode);
        }
      }
      if (!addedExistingFromSingleFieldNode) {
        this.tagList.children('li').each(function() {
          if (!$(this).hasClass('tagit-new')) {
            that.createTag($(this).text(), $(this).attr('class'), true);
            $(this).remove();
          }
        });
      }
      this.tagInput
        .keydown(function(event) {
          if (event.which == $.ui.keyCode.BACKSPACE && that.tagInput.val() === '') {
            var tag = that._lastTag();
            if (!that.options.removeConfirmation || tag.hasClass('remove')) {
              that.removeTag(tag);
              if (that.options.showAutocompleteOnFocus) {
                setTimeout(function() {
                  that._showAutocomplete();
                }, 0);
              }
            } else if (that.options.removeConfirmation) {
              tag.addClass('remove ui-state-highlight');
            }
          } else if (that.options.removeConfirmation) {
            that._lastTag().removeClass('remove ui-state-highlight');
          }
          if (
            event.which === $.ui.keyCode.COMMA ||
            event.which === $.ui.keyCode.ENTER ||
            (
              event.which == $.ui.keyCode.TAB &&
              that.tagInput.val() !== ''
            ) ||
            (
              event.which == $.ui.keyCode.SPACE &&
              that.options.allowSpaces !== true &&
              (
                $.trim(that.tagInput.val()).replace(/^s*/, '').charAt(0) != '"' ||
                (
                  $.trim(that.tagInput.val()).charAt(0) == '"' &&
                  $.trim(that.tagInput.val()).charAt($.trim(that.tagInput.val()).length - 1) == '"' &&
                  $.trim(that.tagInput.val()).length - 1 !== 0
                )
              )
            )
          ) {
            if (!(event.which === $.ui.keyCode.ENTER && that.tagInput.val() === '')) {
              event.preventDefault();
            }
            that.createTag(that._cleanedInput());
            that.tagInput.autocomplete('close');
          }
        }).blur(function(e) {
          if (!that.tagInput.data('autocomplete-open')) {
            that.createTag(that._cleanedInput());
          }
        });
      if (this.options.availableTags || this.options.tagSource || this.options.autocomplete.source) {
        var autocompleteOptions = {
          select: function(event, ui) {
            that.createTag(ui.item.value);
            return false;
          }
        };
        $.extend(autocompleteOptions, this.options.autocomplete);
        autocompleteOptions.source = this.options.tagSource || autocompleteOptions.source;
        this.tagInput.autocomplete(autocompleteOptions).bind('autocompleteopen', function(event, ui) {
          that.tagInput.data('autocomplete-open', true);
        }).bind('autocompleteclose', function(event, ui) {
          that.tagInput.data('autocomplete-open', false)
        });
      }
    },
    _cleanedInput: function() {
      return $.trim(this.tagInput.val().replace(/^"(.*)"$/, '$1'));
    },
    _lastTag: function() {
      return this.tagList.find('.tagit-choice:last:not(.removed)');
    },
    _tags: function() {
      return this.tagList.find('.tagit-choice:not(.removed)');
    },
    assignedTags: function() {
      var that = this;
      var tags = [];
      if (this.options.singleField) {
        tags = $(this.options.singleFieldNode).val().split(this.options.singleFieldDelimiter);
        if (tags[0] === '') {
          tags = [];
        }
      } else {
        this._tags().each(function() {
          tags.push(that.tagLabel(this));
        });
      }
      return tags;
    },
    _updateSingleTagsField: function(tags) {
      $(this.options.singleFieldNode).val(tags.join(this.options.singleFieldDelimiter)).trigger('change');
    },
    _subtractArray: function(a1, a2) {
      var result = [];
      for (var i = 0; i < a1.length; i++) {
        if ($.inArray(a1[i], a2) == -1) {
          result.push(a1[i]);
        }
      }
      return result;
    },
    tagLabel: function(tag) {
      if (this.options.singleField) {
        return $(tag).find('.tagit-label:first').text();
      } else {
        return $(tag).find('input:first').val();
      }
    },
    _showAutocomplete: function() {
      this.tagInput.autocomplete('search', '');
    },
    _findTagByLabel: function(name) {
      var that = this;
      var tag = null;
      this._tags().each(function(i) {
        if (that._formatStr(name) == that._formatStr(that.tagLabel(this))) {
          tag = $(this);
          return false;
        }
      });
      return tag;
    },
    _isNew: function(name) {
      return !this._findTagByLabel(name);
    },
    _formatStr: function(str) {
      if (this.options.caseSensitive) {
        return str;
      }
      return $.trim(str.toLowerCase());
    },
    _effectExists: function(name) {
      return Boolean($.effects && ($.effects[name] || ($.effects.effect && $.effects.effect[name])));
    },
    createTag: function(value, additionalClass, duringInitialization) {
      var that = this;
      value = $.trim(value);
      if (value === '') {
        return false;
      }
      if (!this.options.allowDuplicates && !this._isNew(value)) {
        var existingTag = this._findTagByLabel(value);
        if (this._trigger('onTagExists', null, {
            existingTag: existingTag,
            duringInitialization: duringInitialization
          }) !== false) {
          if (this._effectExists('highlight')) {
            existingTag.effect('highlight');
          }
        }
        return false;
      }
      if (this.options.tagLimit && this._tags().length >= this.options.tagLimit) {
        this._trigger('onTagLimitExceeded', null, {
          duringInitialization: duringInitialization
        });
        return false;
      }
      var label = $(this.options.onTagClicked ? '<a class="tagit-label"></a>' : '<span class="tagit-label"></span>').text(value);
      var tag = $('<li></li>')
        .addClass('tagit-choice ui-widget-content ui-state-default ui-corner-all')
        .addClass(additionalClass)
        .append(label);
      if (this.options.readOnly) {
        tag.addClass('tagit-choice-read-only');
      } else {
        tag.addClass('tagit-choice-editable');
        var removeTagIcon = $('<span></span>')
          .addClass('ui-icon ui-icon-close');
        var removeTag = $('<a><span class="text-icon">\xd7</span></a>')
          .addClass('tagit-close')
          .append(removeTagIcon)
          .click(function(e) {
            that.removeTag(tag);
          });
        tag.append(removeTag);
      }
      if (!this.options.singleField) {
        var escapedValue = label.html();
        tag.append('<input type="hidden" style="display:none;" value="' + escapedValue + '" name="' + this.options.fieldName + '" />');
      }
      if (this._trigger('beforeTagAdded', null, {
          tag: tag,
          tagLabel: this.tagLabel(tag),
          duringInitialization: duringInitialization
        }) === false) {
        return;
      }
      if (this.options.singleField) {
        var tags = this.assignedTags();
        tags.push(value);
        this._updateSingleTagsField(tags);
      }
      this._trigger('onTagAdded', null, tag);
      this.tagInput.val('');
      this.tagInput.parent().before(tag);
      this._trigger('afterTagAdded', null, {
        tag: tag,
        tagLabel: this.tagLabel(tag),
        duringInitialization: duringInitialization
      });
      if (this.options.showAutocompleteOnFocus && !duringInitialization) {
        var currentActiveElement = document.activeElement;
        setTimeout(function() {
          if (document.activeElement !== currentActiveElement)
            return;
          that.preserveCursor(document.activeElement);
          that._showAutocomplete();
        }, 0);
      }
    },
    removeTag: function(tag, animate) {
      animate = typeof animate === 'undefined' ? this.options.animate : animate;
      tag = $(tag);
      this._trigger('onTagRemoved', null, tag);
      if (this._trigger('beforeTagRemoved', null, {
          tag: tag,
          tagLabel: this.tagLabel(tag)
        }) === false) {
        return;
      }
      if (this.options.singleField) {
        var tags = this.assignedTags();
        var removedTagLabel = this.tagLabel(tag);
        tags = $.grep(tags, function(el) {
          return el != removedTagLabel;
        });
        this._updateSingleTagsField(tags);
      }
      if (animate) {
        tag.addClass('removed');
        var hide_args = this._effectExists('blind') ? ['blind', {
          direction: 'horizontal'
        }, 'fast'] : ['fast'];
        hide_args.push(function() {
          tag.remove();
        });
        tag.fadeOut('fast').hide.apply(tag, hide_args).dequeue();
      } else {
        tag.remove();
      }
      this._trigger('afterTagRemoved', null, {
        tag: tag,
        tagLabel: this.tagLabel(tag)
      });
    },
    removeTagByLabel: function(tagLabel, animate) {
      var toRemove = this._findTagByLabel(tagLabel);
      if (!toRemove) {
        throw "No such tag exists with the name '" + tagLabel + "'";
      }
      this.removeTag(toRemove, animate);
    },
    removeAll: function() {
      var that = this;
      this._tags().each(function(index, tag) {
        that.removeTag(tag, false);
      });
    },
    preserveCursor: function(el) {
      if (!el)
        return;
      var initialValue = el.value;
      el.value = initialValue + 1;
      el.value = initialValue;
    }
  });
})(jQuery);