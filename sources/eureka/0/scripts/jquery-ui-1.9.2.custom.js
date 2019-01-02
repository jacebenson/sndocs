(function($, undefined) {
  var uuid = 0,
    runiqueId = /^ui-id-\d+$/;
  $.ui = $.ui || {};
  if ($.ui.version) {
    return;
  }
  $.extend($.ui, {
    version: "1.9.2",
    keyCode: {
      BACKSPACE: 8,
      COMMA: 188,
      DELETE: 46,
      DOWN: 40,
      END: 35,
      ENTER: 13,
      ESCAPE: 27,
      HOME: 36,
      LEFT: 37,
      NUMPAD_ADD: 107,
      NUMPAD_DECIMAL: 110,
      NUMPAD_DIVIDE: 111,
      NUMPAD_ENTER: 108,
      NUMPAD_MULTIPLY: 106,
      NUMPAD_SUBTRACT: 109,
      PAGE_DOWN: 34,
      PAGE_UP: 33,
      PERIOD: 190,
      RIGHT: 39,
      SPACE: 32,
      TAB: 9,
      UP: 38
    }
  });
  $.fn.extend({
    _focus: $.fn.focus,
    focus: function(delay, fn) {
      return typeof delay === "number" ?
        this.each(function() {
          var elem = this;
          setTimeout(function() {
            $(elem).focus();
            if (fn) {
              fn.call(elem);
            }
          }, delay);
        }) :
        this._focus.apply(this, arguments);
    },
    scrollParent: function() {
      var scrollParent;
      if (($.ui.ie && (/(static|relative)/).test(this.css('position'))) || (/absolute/).test(this.css('position'))) {
        scrollParent = this.parents().filter(function() {
          return (/(relative|absolute|fixed)/).test($.css(this, 'position')) && (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
        }).eq(0);
      } else {
        scrollParent = this.parents().filter(function() {
          return (/(auto|scroll)/).test($.css(this, 'overflow') + $.css(this, 'overflow-y') + $.css(this, 'overflow-x'));
        }).eq(0);
      }
      return (/fixed/).test(this.css('position')) || !scrollParent.length ? $(document) : scrollParent;
    },
    zIndex: function(zIndex) {
      if (zIndex !== undefined) {
        return this.css("zIndex", zIndex);
      }
      if (this.length) {
        var elem = $(this[0]),
          position, value;
        while (elem.length && elem[0] !== document) {
          position = elem.css("position");
          if (position === "absolute" || position === "relative" || position === "fixed") {
            value = parseInt(elem.css("zIndex"), 10);
            if (!isNaN(value) && value !== 0) {
              return value;
            }
          }
          elem = elem.parent();
        }
      }
      return 0;
    },
    uniqueId: function() {
      return this.each(function() {
        if (!this.id) {
          this.id = "ui-id-" + (++uuid);
        }
      });
    },
    removeUniqueId: function() {
      return this.each(function() {
        if (runiqueId.test(this.id)) {
          $(this).removeAttr("id");
        }
      });
    }
  });

  function focusable(element, isTabIndexNotNaN) {
    var map, mapName, img,
      nodeName = element.nodeName.toLowerCase();
    if ("area" === nodeName) {
      map = element.parentNode;
      mapName = map.name;
      if (!element.href || !mapName || map.nodeName.toLowerCase() !== "map") {
        return false;
      }
      img = $("img[usemap=#" + mapName + "]")[0];
      return !!img && visible(img);
    }
    return (/input|select|textarea|button|object/.test(nodeName) ?
        !element.disabled :
        "a" === nodeName ?
        element.href || isTabIndexNotNaN :
        isTabIndexNotNaN) &&
      visible(element);
  }

  function visible(element) {
    return $.expr.filters.visible(element) &&
      !$(element).parents().andSelf().filter(function() {
        return $.css(this, "visibility") === "hidden";
      }).length;
  }
  $.extend($.expr[":"], {
    data: $.expr.createPseudo ?
      $.expr.createPseudo(function(dataName) {
        return function(elem) {
          return !!$.data(elem, dataName);
        };
      }) : function(elem, i, match) {
        return !!$.data(elem, match[3]);
      },
    focusable: function(element) {
      return focusable(element, !isNaN($.attr(element, "tabindex")));
    },
    tabbable: function(element) {
      var tabIndex = $.attr(element, "tabindex"),
        isTabIndexNaN = isNaN(tabIndex);
      return (isTabIndexNaN || tabIndex >= 0) && focusable(element, !isTabIndexNaN);
    }
  });
  $(function() {
    var body = document.body,
      div = body.appendChild(div = document.createElement("div"));
    div.offsetHeight;
    $.extend(div.style, {
      minHeight: "100px",
      height: "auto",
      padding: 0,
      borderWidth: 0
    });
    $.support.minHeight = div.offsetHeight === 100;
    $.support.selectstart = "onselectstart" in div;
    body.removeChild(div).style.display = "none";
  });
  if (!$("<a>").outerWidth(1).jquery) {
    $.each(["Width", "Height"], function(i, name) {
      var side = name === "Width" ? ["Left", "Right"] : ["Top", "Bottom"],
        type = name.toLowerCase(),
        orig = {
          innerWidth: $.fn.innerWidth,
          innerHeight: $.fn.innerHeight,
          outerWidth: $.fn.outerWidth,
          outerHeight: $.fn.outerHeight
        };

      function reduce(elem, size, border, margin) {
        $.each(side, function() {
          size -= parseFloat($.css(elem, "padding" + this)) || 0;
          if (border) {
            size -= parseFloat($.css(elem, "border" + this + "Width")) || 0;
          }
          if (margin) {
            size -= parseFloat($.css(elem, "margin" + this)) || 0;
          }
        });
        return size;
      }
      $.fn["inner" + name] = function(size) {
        if (size === undefined) {
          return orig["inner" + name].call(this);
        }
        return this.each(function() {
          $(this).css(type, reduce(this, size) + "px");
        });
      };
      $.fn["outer" + name] = function(size, margin) {
        if (typeof size !== "number") {
          return orig["outer" + name].call(this, size);
        }
        return this.each(function() {
          $(this).css(type, reduce(this, size, true, margin) + "px");
        });
      };
    });
  }
  if ($("<a>").data("a-b", "a").removeData("a-b").data("a-b")) {
    $.fn.removeData = (function(removeData) {
      return function(key) {
        if (arguments.length) {
          return removeData.call(this, $.camelCase(key));
        } else {
          return removeData.call(this);
        }
      };
    })($.fn.removeData);
  }
  (function() {
    var uaMatch = /msie ([\w.]+)/.exec(navigator.userAgent.toLowerCase()) || [];
    $.ui.ie = uaMatch.length ? true : false;
    $.ui.ie6 = parseFloat(uaMatch[1], 10) === 6;
  })();
  $.fn.extend({
    disableSelection: function() {
      return this.bind(($.support.selectstart ? "selectstart" : "mousedown") +
        ".ui-disableSelection",
        function(event) {
          event.preventDefault();
        });
    },
    enableSelection: function() {
      return this.unbind(".ui-disableSelection");
    }
  });
  $.extend($.ui, {
    plugin: {
      add: function(module, option, set) {
        var i,
          proto = $.ui[module].prototype;
        for (i in set) {
          proto.plugins[i] = proto.plugins[i] || [];
          proto.plugins[i].push([option, set[i]]);
        }
      },
      call: function(instance, name, args) {
        var i,
          set = instance.plugins[name];
        if (!set || !instance.element[0].parentNode || instance.element[0].parentNode.nodeType === 11) {
          return;
        }
        for (i = 0; i < set.length; i++) {
          if (instance.options[set[i][0]]) {
            set[i][1].apply(instance.element, args);
          }
        }
      }
    },
    contains: $.contains,
    hasScroll: function(el, a) {
      if ($(el).css("overflow") === "hidden") {
        return false;
      }
      var scroll = (a && a === "left") ? "scrollLeft" : "scrollTop",
        has = false;
      if (el[scroll] > 0) {
        return true;
      }
      el[scroll] = 1;
      has = (el[scroll] > 0);
      el[scroll] = 0;
      return has;
    },
    isOverAxis: function(x, reference, size) {
      return (x > reference) && (x < (reference + size));
    },
    isOver: function(y, x, top, left, height, width) {
      return $.ui.isOverAxis(y, top, height) && $.ui.isOverAxis(x, left, width);
    }
  });
})(jQuery);
(function($, undefined) {
  var uuid = 0,
    slice = Array.prototype.slice,
    _cleanData = $.cleanData;
  $.cleanData = function(elems) {
    for (var i = 0, elem;
      (elem = elems[i]) != null; i++) {
      try {
        $(elem).triggerHandler("remove");
      } catch (e) {}
    }
    _cleanData(elems);
  };
  $.widget = function(name, base, prototype) {
    var fullName, existingConstructor, constructor, basePrototype,
      namespace = name.split(".")[0];
    name = name.split(".")[1];
    fullName = namespace + "-" + name;
    if (!prototype) {
      prototype = base;
      base = $.Widget;
    }
    $.expr[":"][fullName.toLowerCase()] = function(elem) {
      return !!$.data(elem, fullName);
    };
    $[namespace] = $[namespace] || {};
    existingConstructor = $[namespace][name];
    constructor = $[namespace][name] = function(options, element) {
      if (!this._createWidget) {
        return new constructor(options, element);
      }
      if (arguments.length) {
        this._createWidget(options, element);
      }
    };
    $.extend(constructor, existingConstructor, {
      version: prototype.version,
      _proto: $.extend({}, prototype),
      _childConstructors: []
    });
    basePrototype = new base();
    basePrototype.options = $.widget.extend({}, basePrototype.options);
    $.each(prototype, function(prop, value) {
      if ($.isFunction(value)) {
        prototype[prop] = (function() {
          var _super = function() {
              return base.prototype[prop].apply(this, arguments);
            },
            _superApply = function(args) {
              return base.prototype[prop].apply(this, args);
            };
          return function() {
            var __super = this._super,
              __superApply = this._superApply,
              returnValue;
            this._super = _super;
            this._superApply = _superApply;
            returnValue = value.apply(this, arguments);
            this._super = __super;
            this._superApply = __superApply;
            return returnValue;
          };
        })();
      }
    });
    constructor.prototype = $.widget.extend(basePrototype, {
      widgetEventPrefix: existingConstructor ? basePrototype.widgetEventPrefix : name
    }, prototype, {
      constructor: constructor,
      namespace: namespace,
      widgetName: name,
      widgetBaseClass: fullName,
      widgetFullName: fullName
    });
    if (existingConstructor) {
      $.each(existingConstructor._childConstructors, function(i, child) {
        var childPrototype = child.prototype;
        $.widget(childPrototype.namespace + "." + childPrototype.widgetName, constructor, child._proto);
      });
      delete existingConstructor._childConstructors;
    } else {
      base._childConstructors.push(constructor);
    }
    $.widget.bridge(name, constructor);
  };
  $.widget.extend = function(target) {
    var input = slice.call(arguments, 1),
      inputIndex = 0,
      inputLength = input.length,
      key,
      value;
    for (; inputIndex < inputLength; inputIndex++) {
      for (key in input[inputIndex]) {
        value = input[inputIndex][key];
        if (input[inputIndex].hasOwnProperty(key) && value !== undefined) {
          if ($.isPlainObject(value)) {
            target[key] = $.isPlainObject(target[key]) ?
              $.widget.extend({}, target[key], value) :
              $.widget.extend({}, value);
          } else {
            target[key] = value;
          }
        }
      }
    }
    return target;
  };
  $.widget.bridge = function(name, object) {
    var fullName = object.prototype.widgetFullName || name;
    $.fn[name] = function(options) {
      var isMethodCall = typeof options === "string",
        args = slice.call(arguments, 1),
        returnValue = this;
      options = !isMethodCall && args.length ?
        $.widget.extend.apply(null, [options].concat(args)) :
        options;
      if (isMethodCall) {
        this.each(function() {
          var methodValue,
            instance = $.data(this, fullName);
          if (!instance) {
            return $.error("cannot call methods on " + name + " prior to initialization; " +
              "attempted to call method '" + options + "'");
          }
          if (!$.isFunction(instance[options]) || options.charAt(0) === "_") {
            return $.error("no such method '" + options + "' for " + name + " widget instance");
          }
          methodValue = instance[options].apply(instance, args);
          if (methodValue !== instance && methodValue !== undefined) {
            returnValue = methodValue && methodValue.jquery ?
              returnValue.pushStack(methodValue.get()) :
              methodValue;
            return false;
          }
        });
      } else {
        this.each(function() {
          var instance = $.data(this, fullName);
          if (instance) {
            instance.option(options || {})._init();
          } else {
            $.data(this, fullName, new object(options, this));
          }
        });
      }
      return returnValue;
    };
  };
  $.Widget = function() {};
  $.Widget._childConstructors = [];
  $.Widget.prototype = {
    widgetName: "widget",
    widgetEventPrefix: "",
    defaultElement: "<div>",
    options: {
      disabled: false,
      create: null
    },
    _createWidget: function(options, element) {
      element = $(element || this.defaultElement || this)[0];
      this.element = $(element);
      this.uuid = uuid++;
      this.eventNamespace = "." + this.widgetName + this.uuid;
      this.options = $.widget.extend({},
        this.options,
        this._getCreateOptions(),
        options);
      this.bindings = $();
      this.hoverable = $();
      this.focusable = $();
      if (element !== this) {
        $.data(element, this.widgetName, this);
        $.data(element, this.widgetFullName, this);
        this._on(true, this.element, {
          remove: function(event) {
            if (event.target === element) {
              this.destroy();
            }
          }
        });
        this.document = $(element.style ?
          element.ownerDocument :
          element.document || element);
        this.window = $(this.document[0].defaultView || this.document[0].parentWindow);
      }
      this._create();
      this._trigger("create", null, this._getCreateEventData());
      this._init();
    },
    _getCreateOptions: $.noop,
    _getCreateEventData: $.noop,
    _create: $.noop,
    _init: $.noop,
    destroy: function() {
      this._destroy();
      this.element
        .unbind(this.eventNamespace)
        .removeData(this.widgetName)
        .removeData(this.widgetFullName)
        .removeData($.camelCase(this.widgetFullName));
      this.widget()
        .unbind(this.eventNamespace)
        .removeAttr("aria-disabled")
        .removeClass(
          this.widgetFullName + "-disabled " +
          "ui-state-disabled");
      this.bindings.unbind(this.eventNamespace);
      this.hoverable.removeClass("ui-state-hover");
      this.focusable.removeClass("ui-state-focus");
    },
    _destroy: $.noop,
    widget: function() {
      return this.element;
    },
    option: function(key, value) {
      var options = key,
        parts,
        curOption,
        i;
      if (arguments.length === 0) {
        return $.widget.extend({}, this.options);
      }
      if (typeof key === "string") {
        options = {};
        parts = key.split(".");
        key = parts.shift();
        if (parts.length) {
          curOption = options[key] = $.widget.extend({}, this.options[key]);
          for (i = 0; i < parts.length - 1; i++) {
            curOption[parts[i]] = curOption[parts[i]] || {};
            curOption = curOption[parts[i]];
          }
          key = parts.pop();
          if (value === undefined) {
            return curOption[key] === undefined ? null : curOption[key];
          }
          curOption[key] = value;
        } else {
          if (value === undefined) {
            return this.options[key] === undefined ? null : this.options[key];
          }
          options[key] = value;
        }
      }
      this._setOptions(options);
      return this;
    },
    _setOptions: function(options) {
      var key;
      for (key in options) {
        this._setOption(key, options[key]);
      }
      return this;
    },
    _setOption: function(key, value) {
      this.options[key] = value;
      if (key === "disabled") {
        this.widget()
          .toggleClass(this.widgetFullName + "-disabled ui-state-disabled", !!value)
          .attr("aria-disabled", value);
        this.hoverable.removeClass("ui-state-hover");
        this.focusable.removeClass("ui-state-focus");
      }
      return this;
    },
    enable: function() {
      return this._setOption("disabled", false);
    },
    disable: function() {
      return this._setOption("disabled", true);
    },
    _on: function(suppressDisabledCheck, element, handlers) {
      var delegateElement,
        instance = this;
      if (typeof suppressDisabledCheck !== "boolean") {
        handlers = element;
        element = suppressDisabledCheck;
        suppressDisabledCheck = false;
      }
      if (!handlers) {
        handlers = element;
        element = this.element;
        delegateElement = this.widget();
      } else {
        element = delegateElement = $(element);
        this.bindings = this.bindings.add(element);
      }
      $.each(handlers, function(event, handler) {
        function handlerProxy() {
          if (!suppressDisabledCheck &&
            (instance.options.disabled === true ||
              $(this).hasClass("ui-state-disabled"))) {
            return;
          }
          return (typeof handler === "string" ? instance[handler] : handler)
            .apply(instance, arguments);
        }
        if (typeof handler !== "string") {
          handlerProxy.guid = handler.guid =
            handler.guid || handlerProxy.guid || $.guid++;
        }
        var match = event.match(/^(\w+)\s*(.*)$/),
          eventName = match[1] + instance.eventNamespace,
          selector = match[2];
        if (selector) {
          delegateElement.delegate(selector, eventName, handlerProxy);
        } else {
          element.bind(eventName, handlerProxy);
        }
      });
    },
    _off: function(element, eventName) {
      eventName = (eventName || "").split(" ").join(this.eventNamespace + " ") + this.eventNamespace;
      element.unbind(eventName).undelegate(eventName);
    },
    _delay: function(handler, delay) {
      function handlerProxy() {
        return (typeof handler === "string" ? instance[handler] : handler)
          .apply(instance, arguments);
      }
      var instance = this;
      return setTimeout(handlerProxy, delay || 0);
    },
    _hoverable: function(element) {
      this.hoverable = this.hoverable.add(element);
      this._on(element, {
        mouseenter: function(event) {
          $(event.currentTarget).addClass("ui-state-hover");
        },
        mouseleave: function(event) {
          $(event.currentTarget).removeClass("ui-state-hover");
        }
      });
    },
    _focusable: function(element) {
      this.focusable = this.focusable.add(element);
      this._on(element, {
        focusin: function(event) {
          $(event.currentTarget).addClass("ui-state-focus");
        },
        focusout: function(event) {
          $(event.currentTarget).removeClass("ui-state-focus");
        }
      });
    },
    _trigger: function(type, event, data) {
      var prop, orig,
        callback = this.options[type];
      data = data || {};
      event = $.Event(event);
      event.type = (type === this.widgetEventPrefix ?
        type :
        this.widgetEventPrefix + type).toLowerCase();
      event.target = this.element[0];
      orig = event.originalEvent;
      if (orig) {
        for (prop in orig) {
          if (!(prop in event)) {
            event[prop] = orig[prop];
          }
        }
      }
      this.element.trigger(event, data);
      return !($.isFunction(callback) &&
        callback.apply(this.element[0], [event].concat(data)) === false ||
        event.isDefaultPrevented());
    }
  };
  $.each({
    show: "fadeIn",
    hide: "fadeOut"
  }, function(method, defaultEffect) {
    $.Widget.prototype["_" + method] = function(element, options, callback) {
      if (typeof options === "string") {
        options = {
          effect: options
        };
      }
      var hasOptions,
        effectName = !options ?
        method :
        options === true || typeof options === "number" ?
        defaultEffect :
        options.effect || defaultEffect;
      options = options || {};
      if (typeof options === "number") {
        options = {
          duration: options
        };
      }
      hasOptions = !$.isEmptyObject(options);
      options.complete = callback;
      if (options.delay) {
        element.delay(options.delay);
      }
      if (hasOptions && $.effects && ($.effects.effect[effectName] || $.uiBackCompat !== false && $.effects[effectName])) {
        element[method](options);
      } else if (effectName !== method && element[effectName]) {
        element[effectName](options.duration, options.easing, callback);
      } else {
        element.queue(function(next) {
          $(this)[method]();
          if (callback) {
            callback.call(element[0]);
          }
          next();
        });
      }
    };
  });
  if ($.uiBackCompat !== false) {
    $.Widget.prototype._getCreateOptions = function() {
      return $.metadata && $.metadata.get(this.element[0])[this.widgetName];
    };
  }
})(jQuery);
(function($, undefined) {
  $.ui = $.ui || {};
  var cachedScrollbarWidth,
    max = Math.max,
    abs = Math.abs,
    round = Math.round,
    rhorizontal = /left|center|right/,
    rvertical = /top|center|bottom/,
    roffset = /[\+\-]\d+%?/,
    rposition = /^\w+/,
    rpercent = /%$/,
    _position = $.fn.position;

  function getOffsets(offsets, width, height) {
    return [
      parseInt(offsets[0], 10) * (rpercent.test(offsets[0]) ? width / 100 : 1),
      parseInt(offsets[1], 10) * (rpercent.test(offsets[1]) ? height / 100 : 1)
    ];
  }

  function parseCss(element, property) {
    return parseInt($.css(element, property), 10) || 0;
  }
  $.position = {
    scrollbarWidth: function() {
      if (cachedScrollbarWidth !== undefined) {
        return cachedScrollbarWidth;
      }
      var w1, w2,
        div = $("<div style='display:block;width:50px;height:50px;overflow:hidden;'><div style='height:100px;width:auto;'></div></div>"),
        innerDiv = div.children()[0];
      $("body").append(div);
      w1 = innerDiv.offsetWidth;
      div.css("overflow", "scroll");
      w2 = innerDiv.offsetWidth;
      if (w1 === w2) {
        w2 = div[0].clientWidth;
      }
      div.remove();
      return (cachedScrollbarWidth = w1 - w2);
    },
    getScrollInfo: function(within) {
      var overflowX = within.isWindow ? "" : within.element.css("overflow-x"),
        overflowY = within.isWindow ? "" : within.element.css("overflow-y"),
        hasOverflowX = overflowX === "scroll" ||
        (overflowX === "auto" && within.width < within.element[0].scrollWidth),
        hasOverflowY = overflowY === "scroll" ||
        (overflowY === "auto" && within.height < within.element[0].scrollHeight);
      return {
        width: hasOverflowX ? $.position.scrollbarWidth() : 0,
        height: hasOverflowY ? $.position.scrollbarWidth() : 0
      };
    },
    getWithinInfo: function(element) {
      var withinElement = $(element || window),
        isWindow = $.isWindow(withinElement[0]);
      return {
        element: withinElement,
        isWindow: isWindow,
        offset: withinElement.offset() || {
          left: 0,
          top: 0
        },
        scrollLeft: withinElement.scrollLeft(),
        scrollTop: withinElement.scrollTop(),
        width: isWindow ? withinElement.width() : withinElement.outerWidth(),
        height: isWindow ? withinElement.height() : withinElement.outerHeight()
      };
    }
  };
  $.fn.position = function(options) {
    if (!options || !options.of) {
      return _position.apply(this, arguments);
    }
    options = $.extend({}, options);
    var atOffset, targetWidth, targetHeight, targetOffset, basePosition,
      target = $(options.of),
      within = $.position.getWithinInfo(options.within),
      scrollInfo = $.position.getScrollInfo(within),
      targetElem = target[0],
      collision = (options.collision || "flip").split(" "),
      offsets = {};
    if (targetElem.nodeType === 9) {
      targetWidth = target.width();
      targetHeight = target.height();
      targetOffset = {
        top: 0,
        left: 0
      };
    } else if ($.isWindow(targetElem)) {
      targetWidth = target.width();
      targetHeight = target.height();
      targetOffset = {
        top: target.scrollTop(),
        left: target.scrollLeft()
      };
    } else if (targetElem.preventDefault) {
      options.at = "left top";
      targetWidth = targetHeight = 0;
      targetOffset = {
        top: targetElem.pageY,
        left: targetElem.pageX
      };
    } else {
      targetWidth = target.outerWidth();
      targetHeight = target.outerHeight();
      targetOffset = target.offset();
    }
    basePosition = $.extend({}, targetOffset);
    $.each(["my", "at"], function() {
      var pos = (options[this] || "").split(" "),
        horizontalOffset,
        verticalOffset;
      if (pos.length === 1) {
        pos = rhorizontal.test(pos[0]) ?
          pos.concat(["center"]) :
          rvertical.test(pos[0]) ? ["center"].concat(pos) : ["center", "center"];
      }
      pos[0] = rhorizontal.test(pos[0]) ? pos[0] : "center";
      pos[1] = rvertical.test(pos[1]) ? pos[1] : "center";
      horizontalOffset = roffset.exec(pos[0]);
      verticalOffset = roffset.exec(pos[1]);
      offsets[this] = [
        horizontalOffset ? horizontalOffset[0] : 0,
        verticalOffset ? verticalOffset[0] : 0
      ];
      options[this] = [
        rposition.exec(pos[0])[0],
        rposition.exec(pos[1])[0]
      ];
    });
    if (collision.length === 1) {
      collision[1] = collision[0];
    }
    if (options.at[0] === "right") {
      basePosition.left += targetWidth;
    } else if (options.at[0] === "center") {
      basePosition.left += targetWidth / 2;
    }
    if (options.at[1] === "bottom") {
      basePosition.top += targetHeight;
    } else if (options.at[1] === "center") {
      basePosition.top += targetHeight / 2;
    }
    atOffset = getOffsets(offsets.at, targetWidth, targetHeight);
    basePosition.left += atOffset[0];
    basePosition.top += atOffset[1];
    return this.each(function() {
      var collisionPosition, using,
        elem = $(this),
        elemWidth = elem.outerWidth(),
        elemHeight = elem.outerHeight(),
        marginLeft = parseCss(this, "marginLeft"),
        marginTop = parseCss(this, "marginTop"),
        collisionWidth = elemWidth + marginLeft + parseCss(this, "marginRight") + scrollInfo.width,
        collisionHeight = elemHeight + marginTop + parseCss(this, "marginBottom") + scrollInfo.height,
        position = $.extend({}, basePosition),
        myOffset = getOffsets(offsets.my, elem.outerWidth(), elem.outerHeight());
      if (options.my[0] === "right") {
        position.left -= elemWidth;
      } else if (options.my[0] === "center") {
        position.left -= elemWidth / 2;
      }
      if (options.my[1] === "bottom") {
        position.top -= elemHeight;
      } else if (options.my[1] === "center") {
        position.top -= elemHeight / 2;
      }
      position.left += myOffset[0];
      position.top += myOffset[1];
      if (!$.support.offsetFractions) {
        position.left = round(position.left);
        position.top = round(position.top);
      }
      collisionPosition = {
        marginLeft: marginLeft,
        marginTop: marginTop
      };
      $.each(["left", "top"], function(i, dir) {
        if ($.ui.position[collision[i]]) {
          $.ui.position[collision[i]][dir](position, {
            targetWidth: targetWidth,
            targetHeight: targetHeight,
            elemWidth: elemWidth,
            elemHeight: elemHeight,
            collisionPosition: collisionPosition,
            collisionWidth: collisionWidth,
            collisionHeight: collisionHeight,
            offset: [atOffset[0] + myOffset[0], atOffset[1] + myOffset[1]],
            my: options.my,
            at: options.at,
            within: within,
            elem: elem
          });
        }
      });
      if ($.fn.bgiframe) {
        elem.bgiframe();
      }
      if (options.using) {
        using = function(props) {
          var left = targetOffset.left - position.left,
            right = left + targetWidth - elemWidth,
            top = targetOffset.top - position.top,
            bottom = top + targetHeight - elemHeight,
            feedback = {
              target: {
                element: target,
                left: targetOffset.left,
                top: targetOffset.top,
                width: targetWidth,
                height: targetHeight
              },
              element: {
                element: elem,
                left: position.left,
                top: position.top,
                width: elemWidth,
                height: elemHeight
              },
              horizontal: right < 0 ? "left" : left > 0 ? "right" : "center",
              vertical: bottom < 0 ? "top" : top > 0 ? "bottom" : "middle"
            };
          if (targetWidth < elemWidth && abs(left + right) < targetWidth) {
            feedback.horizontal = "center";
          }
          if (targetHeight < elemHeight && abs(top + bottom) < targetHeight) {
            feedback.vertical = "middle";
          }
          if (max(abs(left), abs(right)) > max(abs(top), abs(bottom))) {
            feedback.important = "horizontal";
          } else {
            feedback.important = "vertical";
          }
          options.using.call(this, props, feedback);
        };
      }
      elem.offset($.extend(position, {
        using: using
      }));
    });
  };
  $.ui.position = {
    fit: {
      left: function(position, data) {
        var within = data.within,
          withinOffset = within.isWindow ? within.scrollLeft : within.offset.left,
          outerWidth = within.width,
          collisionPosLeft = position.left - data.collisionPosition.marginLeft,
          overLeft = withinOffset - collisionPosLeft,
          overRight = collisionPosLeft + data.collisionWidth - outerWidth - withinOffset,
          newOverRight;
        if (data.collisionWidth > outerWidth) {
          if (overLeft > 0 && overRight <= 0) {
            newOverRight = position.left + overLeft + data.collisionWidth - outerWidth - withinOffset;
            position.left += overLeft - newOverRight;
          } else if (overRight > 0 && overLeft <= 0) {
            position.left = withinOffset;
          } else {
            if (overLeft > overRight) {
              position.left = withinOffset + outerWidth - data.collisionWidth;
            } else {
              position.left = withinOffset;
            }
          }
        } else if (overLeft > 0) {
          position.left += overLeft;
        } else if (overRight > 0) {
          position.left -= overRight;
        } else {
          position.left = max(position.left - collisionPosLeft, position.left);
        }
      },
      top: function(position, data) {
        var within = data.within,
          withinOffset = within.isWindow ? within.scrollTop : within.offset.top,
          outerHeight = data.within.height,
          collisionPosTop = position.top - data.collisionPosition.marginTop,
          overTop = withinOffset - collisionPosTop,
          overBottom = collisionPosTop + data.collisionHeight - outerHeight - withinOffset,
          newOverBottom;
        if (data.collisionHeight > outerHeight) {
          if (overTop > 0 && overBottom <= 0) {
            newOverBottom = position.top + overTop + data.collisionHeight - outerHeight - withinOffset;
            position.top += overTop - newOverBottom;
          } else if (overBottom > 0 && overTop <= 0) {
            position.top = withinOffset;
          } else {
            if (overTop > overBottom) {
              position.top = withinOffset + outerHeight - data.collisionHeight;
            } else {
              position.top = withinOffset;
            }
          }
        } else if (overTop > 0) {
          position.top += overTop;
        } else if (overBottom > 0) {
          position.top -= overBottom;
        } else {
          position.top = max(position.top - collisionPosTop, position.top);
        }
      }
    },
    flip: {
      left: function(position, data) {
        var within = data.within,
          withinOffset = within.offset.left + within.scrollLeft,
          outerWidth = within.width,
          offsetLeft = within.isWindow ? within.scrollLeft : within.offset.left,
          collisionPosLeft = position.left - data.collisionPosition.marginLeft,
          overLeft = collisionPosLeft - offsetLeft,
          overRight = collisionPosLeft + data.collisionWidth - outerWidth - offsetLeft,
          myOffset = data.my[0] === "left" ?
          -data.elemWidth :
          data.my[0] === "right" ?
          data.elemWidth :
          0,
          atOffset = data.at[0] === "left" ?
          data.targetWidth :
          data.at[0] === "right" ?
          -data.targetWidth :
          0,
          offset = -2 * data.offset[0],
          newOverRight,
          newOverLeft;
        if (overLeft < 0) {
          newOverRight = position.left + myOffset + atOffset + offset + data.collisionWidth - outerWidth - withinOffset;
          if (newOverRight < 0 || newOverRight < abs(overLeft)) {
            position.left += myOffset + atOffset + offset;
          }
        } else if (overRight > 0) {
          newOverLeft = position.left - data.collisionPosition.marginLeft + myOffset + atOffset + offset - offsetLeft;
          if (newOverLeft > 0 || abs(newOverLeft) < overRight) {
            position.left += myOffset + atOffset + offset;
          }
        }
      },
      top: function(position, data) {
        var within = data.within,
          withinOffset = within.offset.top + within.scrollTop,
          outerHeight = within.height,
          offsetTop = within.isWindow ? within.scrollTop : within.offset.top,
          collisionPosTop = position.top - data.collisionPosition.marginTop,
          overTop = collisionPosTop - offsetTop,
          overBottom = collisionPosTop + data.collisionHeight - outerHeight - offsetTop,
          top = data.my[1] === "top",
          myOffset = top ?
          -data.elemHeight :
          data.my[1] === "bottom" ?
          data.elemHeight :
          0,
          atOffset = data.at[1] === "top" ?
          data.targetHeight :
          data.at[1] === "bottom" ?
          -data.targetHeight :
          0,
          offset = -2 * data.offset[1],
          newOverTop,
          newOverBottom;
        if (overTop < 0) {
          newOverBottom = position.top + myOffset + atOffset + offset + data.collisionHeight - outerHeight - withinOffset;
          if ((position.top + myOffset + atOffset + offset) > overTop && (newOverBottom < 0 || newOverBottom < abs(overTop))) {
            position.top += myOffset + atOffset + offset;
          }
        } else if (overBottom > 0) {
          newOverTop = position.top - data.collisionPosition.marginTop + myOffset + atOffset + offset - offsetTop;
          if ((position.top + myOffset + atOffset + offset) > overBottom && (newOverTop > 0 || abs(newOverTop) < overBottom)) {
            position.top += myOffset + atOffset + offset;
          }
        }
      }
    },
    flipfit: {
      left: function() {
        $.ui.position.flip.left.apply(this, arguments);
        $.ui.position.fit.left.apply(this, arguments);
      },
      top: function() {
        $.ui.position.flip.top.apply(this, arguments);
        $.ui.position.fit.top.apply(this, arguments);
      }
    }
  };
  (function() {
    var testElement, testElementParent, testElementStyle, offsetLeft, i,
      body = document.getElementsByTagName("body")[0],
      div = document.createElement("div");
    testElement = document.createElement(body ? "div" : "body");
    testElementStyle = {
      visibility: "hidden",
      width: 0,
      height: 0,
      border: 0,
      margin: 0,
      background: "none"
    };
    if (body) {
      $.extend(testElementStyle, {
        position: "absolute",
        left: "-1000px",
        top: "-1000px"
      });
    }
    for (i in testElementStyle) {
      testElement.style[i] = testElementStyle[i];
    }
    testElement.appendChild(div);
    testElementParent = body || document.documentElement;
    testElementParent.insertBefore(testElement, testElementParent.firstChild);
    div.style.cssText = "position: absolute; left: 10.7432222px;";
    offsetLeft = $(div).offset().left;
    $.support.offsetFractions = offsetLeft > 10 && offsetLeft < 11;
    testElement.innerHTML = "";
    testElementParent.removeChild(testElement);
  })();
  if ($.uiBackCompat !== false) {
    (function($) {
      var _position = $.fn.position;
      $.fn.position = function(options) {
        if (!options || !options.offset) {
          return _position.call(this, options);
        }
        var offset = options.offset.split(" "),
          at = options.at.split(" ");
        if (offset.length === 1) {
          offset[1] = offset[0];
        }
        if (/^\d/.test(offset[0])) {
          offset[0] = "+" + offset[0];
        }
        if (/^\d/.test(offset[1])) {
          offset[1] = "+" + offset[1];
        }
        if (at.length === 1) {
          if (/left|center|right/.test(at[0])) {
            at[1] = "center";
          } else {
            at[1] = at[0];
            at[0] = "center";
          }
        }
        return _position.call(this, $.extend(options, {
          at: at[0] + offset[0] + " " + at[1] + offset[1],
          offset: undefined
        }));
      };
    }(jQuery));
  }
}(jQuery));
(function($, undefined) {
  var requestIndex = 0;
  $.widget("ui.autocomplete", {
    version: "1.9.2",
    defaultElement: "<input>",
    options: {
      appendTo: "body",
      autoFocus: false,
      delay: 300,
      minLength: 1,
      position: {
        my: "left top",
        at: "left bottom",
        collision: "none"
      },
      source: null,
      change: null,
      close: null,
      focus: null,
      open: null,
      response: null,
      search: null,
      select: null
    },
    pending: 0,
    _create: function() {
      var suppressKeyPress, suppressKeyPressRepeat, suppressInput;
      this.isMultiLine = this._isMultiLine();
      this.valueMethod = this.element[this.element.is("input,textarea") ? "val" : "text"];
      this.isNewMenu = true;
      this.element
        .addClass("ui-autocomplete-input")
        .attr("autocomplete", "off");
      this._on(this.element, {
        keydown: function(event) {
          if (this.element.prop("readOnly")) {
            suppressKeyPress = true;
            suppressInput = true;
            suppressKeyPressRepeat = true;
            return;
          }
          suppressKeyPress = false;
          suppressInput = false;
          suppressKeyPressRepeat = false;
          var keyCode = $.ui.keyCode;
          switch (event.keyCode) {
            case keyCode.PAGE_UP:
              suppressKeyPress = true;
              this._move("previousPage", event);
              break;
            case keyCode.PAGE_DOWN:
              suppressKeyPress = true;
              this._move("nextPage", event);
              break;
            case keyCode.UP:
              suppressKeyPress = true;
              this._keyEvent("previous", event);
              break;
            case keyCode.DOWN:
              suppressKeyPress = true;
              this._keyEvent("next", event);
              break;
            case keyCode.ENTER:
            case keyCode.NUMPAD_ENTER:
              if (this.menu.active) {
                suppressKeyPress = true;
                event.preventDefault();
                this.menu.select(event);
              }
              break;
            case keyCode.TAB:
              if (this.menu.active) {
                this.menu.select(event);
              }
              break;
            case keyCode.ESCAPE:
              if (this.menu.element.is(":visible")) {
                this._value(this.term);
                this.close(event);
                event.preventDefault();
              }
              break;
            default:
              suppressKeyPressRepeat = true;
              this._searchTimeout(event);
              break;
          }
        },
        keypress: function(event) {
          if (suppressKeyPress) {
            suppressKeyPress = false;
            event.preventDefault();
            return;
          }
          if (suppressKeyPressRepeat) {
            return;
          }
          var keyCode = $.ui.keyCode;
          switch (event.keyCode) {
            case keyCode.PAGE_UP:
              this._move("previousPage", event);
              break;
            case keyCode.PAGE_DOWN:
              this._move("nextPage", event);
              break;
            case keyCode.UP:
              this._keyEvent("previous", event);
              break;
            case keyCode.DOWN:
              this._keyEvent("next", event);
              break;
          }
        },
        input: function(event) {
          if (suppressInput) {
            suppressInput = false;
            event.preventDefault();
            return;
          }
          this._searchTimeout(event);
        },
        focus: function() {
          this.selectedItem = null;
          this.previous = this._value();
        },
        blur: function(event) {
          if (this.cancelBlur) {
            delete this.cancelBlur;
            return;
          }
          clearTimeout(this.searching);
          this.close(event);
          this._change(event);
        }
      });
      this._initSource();
      this.menu = $("<ul>")
        .addClass("ui-autocomplete")
        .appendTo(this.document.find(this.options.appendTo || "body")[0])
        .menu({
          input: $(),
          role: null
        })
        .zIndex(this.element.zIndex() + 1)
        .hide()
        .data("menu");
      this._on(this.menu.element, {
        mousedown: function(event) {
          event.preventDefault();
          this.cancelBlur = true;
          this._delay(function() {
            delete this.cancelBlur;
          });
          var menuElement = this.menu.element[0];
          if (!$(event.target).closest(".ui-menu-item").length) {
            this._delay(function() {
              var that = this;
              this.document.one("mousedown", function(event) {
                if (event.target !== that.element[0] &&
                  event.target !== menuElement &&
                  !$.contains(menuElement, event.target)) {
                  that.close();
                }
              });
            });
          }
        },
        menufocus: function(event, ui) {
          if (this.isNewMenu) {
            this.isNewMenu = false;
            if (event.originalEvent && /^mouse/.test(event.originalEvent.type)) {
              this.menu.blur();
              this.document.one("mousemove", function() {
                $(event.target).trigger(event.originalEvent);
              });
              return;
            }
          }
          var item = ui.item.data("ui-autocomplete-item") || ui.item.data("item.autocomplete");
          if (false !== this._trigger("focus", event, {
              item: item
            })) {
            if (event.originalEvent && /^key/.test(event.originalEvent.type)) {
              this._value(item.value);
            }
          } else {
            this.liveRegion.text(item.value);
          }
        },
        menuselect: function(event, ui) {
          var item = ui.item.data("ui-autocomplete-item") || ui.item.data("item.autocomplete"),
            previous = this.previous;
          if (this.element[0] !== this.document[0].activeElement) {
            this.element.focus();
            this.previous = previous;
            this._delay(function() {
              this.previous = previous;
              this.selectedItem = item;
            });
          }
          if (false !== this._trigger("select", event, {
              item: item
            })) {
            this._value(item.value);
          }
          this.term = this._value();
          this.close(event);
          this.selectedItem = item;
        }
      });
      this.liveRegion = $("<span>", {
          role: "status",
          "aria-live": "polite"
        })
        .addClass("ui-helper-hidden-accessible")
        .insertAfter(this.element);
      if ($.fn.bgiframe) {
        this.menu.element.bgiframe();
      }
      this._on(this.window, {
        beforeunload: function() {
          this.element.removeAttr("autocomplete");
        }
      });
    },
    _destroy: function() {
      clearTimeout(this.searching);
      this.element
        .removeClass("ui-autocomplete-input")
        .removeAttr("autocomplete");
      this.menu.element.remove();
      this.liveRegion.remove();
    },
    _setOption: function(key, value) {
      this._super(key, value);
      if (key === "source") {
        this._initSource();
      }
      if (key === "appendTo") {
        this.menu.element.appendTo(this.document.find(value || "body")[0]);
      }
      if (key === "disabled" && value && this.xhr) {
        this.xhr.abort();
      }
    },
    _isMultiLine: function() {
      if (this.element.is("textarea")) {
        return true;
      }
      if (this.element.is("input")) {
        return false;
      }
      return this.element.prop("isContentEditable");
    },
    _initSource: function() {
      var array, url,
        that = this;
      if ($.isArray(this.options.source)) {
        array = this.options.source;
        this.source = function(request, response) {
          response($.ui.autocomplete.filter(array, request.term));
        };
      } else if (typeof this.options.source === "string") {
        url = this.options.source;
        this.source = function(request, response) {
          if (that.xhr) {
            that.xhr.abort();
          }
          that.xhr = $.ajax({
            url: url,
            data: request,
            dataType: "json",
            success: function(data) {
              response(data);
            },
            error: function() {
              response([]);
            }
          });
        };
      } else {
        this.source = this.options.source;
      }
    },
    _searchTimeout: function(event) {
      clearTimeout(this.searching);
      this.searching = this._delay(function() {
        if (this.term !== this._value()) {
          this.selectedItem = null;
          this.search(null, event);
        }
      }, this.options.delay);
    },
    search: function(value, event) {
      value = value != null ? value : this._value();
      this.term = this._value();
      if (value.length < this.options.minLength) {
        return this.close(event);
      }
      if (this._trigger("search", event) === false) {
        return;
      }
      return this._search(value);
    },
    _search: function(value) {
      this.pending++;
      this.element.addClass("ui-autocomplete-loading");
      this.cancelSearch = false;
      this.source({
        term: value
      }, this._response());
    },
    _response: function() {
      var that = this,
        index = ++requestIndex;
      return function(content) {
        if (index === requestIndex) {
          that.__response(content);
        }
        that.pending--;
        if (!that.pending) {
          that.element.removeClass("ui-autocomplete-loading");
        }
      };
    },
    __response: function(content) {
      if (content) {
        content = this._normalize(content);
      }
      this._trigger("response", null, {
        content: content
      });
      if (!this.options.disabled && content && content.length && !this.cancelSearch) {
        this._suggest(content);
        this._trigger("open");
      } else {
        this._close();
      }
    },
    close: function(event) {
      this.cancelSearch = true;
      this._close(event);
    },
    _close: function(event) {
      if (this.menu.element.is(":visible")) {
        this.menu.element.hide();
        this.menu.blur();
        this.isNewMenu = true;
        this._trigger("close", event);
      }
    },
    _change: function(event) {
      if (this.previous !== this._value()) {
        this._trigger("change", event, {
          item: this.selectedItem
        });
      }
    },
    _normalize: function(items) {
      if (items.length && items[0].label && items[0].value) {
        return items;
      }
      return $.map(items, function(item) {
        if (typeof item === "string") {
          return {
            label: item,
            value: item
          };
        }
        return $.extend({
          label: item.label || item.value,
          value: item.value || item.label
        }, item);
      });
    },
    _suggest: function(items) {
      var ul = this.menu.element
        .empty()
        .zIndex(this.element.zIndex() + 1);
      this._renderMenu(ul, items);
      this.menu.refresh();
      ul.show();
      this._resizeMenu();
      ul.position($.extend({ of: this.element
      }, this.options.position));
      if (this.options.autoFocus) {
        this.menu.next();
      }
    },
    _resizeMenu: function() {
      var ul = this.menu.element;
      ul.outerWidth(Math.max(
        ul.width("").outerWidth() + 1,
        this.element.outerWidth()
      ));
    },
    _renderMenu: function(ul, items) {
      var that = this;
      $.each(items, function(index, item) {
        that._renderItemData(ul, item);
      });
    },
    _renderItemData: function(ul, item) {
      return this._renderItem(ul, item).data("ui-autocomplete-item", item);
    },
    _renderItem: function(ul, item) {
      return $("<li>")
        .append($("<a>").text(item.label))
        .appendTo(ul);
    },
    _move: function(direction, event) {
      if (!this.menu.element.is(":visible")) {
        this.search(null, event);
        return;
      }
      if (this.menu.isFirstItem() && /^previous/.test(direction) ||
        this.menu.isLastItem() && /^next/.test(direction)) {
        this._value(this.term);
        this.menu.blur();
        return;
      }
      this.menu[direction](event);
    },
    widget: function() {
      return this.menu.element;
    },
    _value: function() {
      return this.valueMethod.apply(this.element, arguments);
    },
    _keyEvent: function(keyEvent, event) {
      if (!this.isMultiLine || this.menu.element.is(":visible")) {
        this._move(keyEvent, event);
        event.preventDefault();
      }
    }
  });
  $.extend($.ui.autocomplete, {
    escapeRegex: function(value) {
      return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
    },
    filter: function(array, term) {
      var matcher = new RegExp($.ui.autocomplete.escapeRegex(term), "i");
      return $.grep(array, function(value) {
        return matcher.test(value.label || value.value || value);
      });
    }
  });
  $.widget("ui.autocomplete", $.ui.autocomplete, {
    options: {
      messages: {
        noResults: "No search results.",
        results: function(amount) {
          return amount + (amount > 1 ? " results are" : " result is") +
            " available, use up and down arrow keys to navigate.";
        }
      }
    },
    __response: function(content) {
      var message;
      this._superApply(arguments);
      if (this.options.disabled || this.cancelSearch) {
        return;
      }
      if (content && content.length) {
        message = this.options.messages.results(content.length);
      } else {
        message = this.options.messages.noResults;
      }
      this.liveRegion.text(message);
    }
  });
}(jQuery));
(function($, undefined) {
  var mouseHandled = false;
  $.widget("ui.menu", {
    version: "1.9.2",
    defaultElement: "<ul>",
    delay: 300,
    options: {
      icons: {
        submenu: "ui-icon-carat-1-e"
      },
      menus: "ul",
      position: {
        my: "left top",
        at: "right top"
      },
      role: "menu",
      blur: null,
      focus: null,
      select: null
    },
    _create: function() {
      this.activeMenu = this.element;
      this.element
        .uniqueId()
        .addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
        .toggleClass("ui-menu-icons", !!this.element.find(".ui-icon").length)
        .attr({
          role: this.options.role,
          tabIndex: 0
        })
        .bind("click" + this.eventNamespace, $.proxy(function(event) {
          if (this.options.disabled) {
            event.preventDefault();
          }
        }, this));
      if (this.options.disabled) {
        this.element
          .addClass("ui-state-disabled")
          .attr("aria-disabled", "true");
      }
      this._on({
        "mousedown .ui-menu-item > a": function(event) {
          event.preventDefault();
        },
        "click .ui-state-disabled > a": function(event) {
          event.preventDefault();
        },
        "click .ui-menu-item:has(a)": function(event) {
          var target = $(event.target).closest(".ui-menu-item");
          if (!mouseHandled && target.not(".ui-state-disabled").length) {
            mouseHandled = true;
            this.select(event);
            if (target.has(".ui-menu").length) {
              this.expand(event);
            } else if (!this.element.is(":focus")) {
              this.element.trigger("focus", [true]);
              if (this.active && this.active.parents(".ui-menu").length === 1) {
                clearTimeout(this.timer);
              }
            }
          }
        },
        "mouseenter .ui-menu-item": function(event) {
          var target = $(event.currentTarget);
          target.siblings().children(".ui-state-active").removeClass("ui-state-active");
          this.focus(event, target);
        },
        mouseleave: "collapseAll",
        "mouseleave .ui-menu": "collapseAll",
        focus: function(event, keepActiveItem) {
          var item = this.active || this.element.children(".ui-menu-item").eq(0);
          if (!keepActiveItem) {
            this.focus(event, item);
          }
        },
        blur: function(event) {
          this._delay(function() {
            if (!$.contains(this.element[0], this.document[0].activeElement)) {
              this.collapseAll(event);
            }
          });
        },
        keydown: "_keydown"
      });
      this.refresh();
      this._on(this.document, {
        click: function(event) {
          if (!$(event.target).closest(".ui-menu").length) {
            this.collapseAll(event);
          }
          mouseHandled = false;
        }
      });
    },
    _destroy: function() {
      this.element
        .removeAttr("aria-activedescendant")
        .find(".ui-menu").andSelf()
        .removeClass("ui-menu ui-widget ui-widget-content ui-corner-all ui-menu-icons")
        .removeAttr("role")
        .removeAttr("tabIndex")
        .removeAttr("aria-labelledby")
        .removeAttr("aria-expanded")
        .removeAttr("aria-hidden")
        .removeAttr("aria-disabled")
        .removeUniqueId()
        .show();
      this.element.find(".ui-menu-item")
        .removeClass("ui-menu-item")
        .removeAttr("role")
        .removeAttr("aria-disabled")
        .children("a")
        .removeUniqueId()
        .removeClass("ui-corner-all ui-state-hover")
        .removeAttr("tabIndex")
        .removeAttr("role")
        .removeAttr("aria-haspopup")
        .children().each(function() {
          var elem = $(this);
          if (elem.data("ui-menu-submenu-carat")) {
            elem.remove();
          }
        });
      this.element.find(".ui-menu-divider").removeClass("ui-menu-divider ui-widget-content");
    },
    _keydown: function(event) {
      var match, prev, character, skip, regex,
        preventDefault = true;

      function escape(value) {
        return value.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
      }
      switch (event.keyCode) {
        case $.ui.keyCode.PAGE_UP:
          this.previousPage(event);
          break;
        case $.ui.keyCode.PAGE_DOWN:
          this.nextPage(event);
          break;
        case $.ui.keyCode.HOME:
          this._move("first", "first", event);
          break;
        case $.ui.keyCode.END:
          this._move("last", "last", event);
          break;
        case $.ui.keyCode.UP:
          this.previous(event);
          break;
        case $.ui.keyCode.DOWN:
          this.next(event);
          break;
        case $.ui.keyCode.LEFT:
          this.collapse(event);
          break;
        case $.ui.keyCode.RIGHT:
          if (this.active && !this.active.is(".ui-state-disabled")) {
            this.expand(event);
          }
          break;
        case $.ui.keyCode.ENTER:
        case $.ui.keyCode.SPACE:
          this._activate(event);
          break;
        case $.ui.keyCode.ESCAPE:
          this.collapse(event);
          break;
        default:
          preventDefault = false;
          prev = this.previousFilter || "";
          character = String.fromCharCode(event.keyCode);
          skip = false;
          clearTimeout(this.filterTimer);
          if (character === prev) {
            skip = true;
          } else {
            character = prev + character;
          }
          regex = new RegExp("^" + escape(character), "i");
          match = this.activeMenu.children(".ui-menu-item").filter(function() {
            return regex.test($(this).children("a").text());
          });
          match = skip && match.index(this.active.next()) !== -1 ?
            this.active.nextAll(".ui-menu-item") :
            match;
          if (!match.length) {
            character = String.fromCharCode(event.keyCode);
            regex = new RegExp("^" + escape(character), "i");
            match = this.activeMenu.children(".ui-menu-item").filter(function() {
              return regex.test($(this).children("a").text());
            });
          }
          if (match.length) {
            this.focus(event, match);
            if (match.length > 1) {
              this.previousFilter = character;
              this.filterTimer = this._delay(function() {
                delete this.previousFilter;
              }, 1000);
            } else {
              delete this.previousFilter;
            }
          } else {
            delete this.previousFilter;
          }
      }
      if (preventDefault) {
        event.preventDefault();
      }
    },
    _activate: function(event) {
      if (!this.active.is(".ui-state-disabled")) {
        if (this.active.children("a[aria-haspopup='true']").length) {
          this.expand(event);
        } else {
          this.select(event);
        }
      }
    },
    refresh: function() {
      var menus,
        icon = this.options.icons.submenu,
        submenus = this.element.find(this.options.menus);
      submenus.filter(":not(.ui-menu)")
        .addClass("ui-menu ui-widget ui-widget-content ui-corner-all")
        .hide()
        .attr({
          role: this.options.role,
          "aria-hidden": "true",
          "aria-expanded": "false"
        })
        .each(function() {
          var menu = $(this),
            item = menu.prev("a"),
            submenuCarat = $("<span>")
            .addClass("ui-menu-icon ui-icon " + icon)
            .data("ui-menu-submenu-carat", true);
          item
            .attr("aria-haspopup", "true")
            .prepend(submenuCarat);
          menu.attr("aria-labelledby", item.attr("id"));
        });
      menus = submenus.add(this.element);
      menus.children(":not(.ui-menu-item):has(a)")
        .addClass("ui-menu-item")
        .attr("role", "presentation")
        .children("a")
        .uniqueId()
        .addClass("ui-corner-all")
        .attr({
          tabIndex: -1,
          role: this._itemRole()
        });
      menus.children(":not(.ui-menu-item)").each(function() {
        var item = $(this);
        if (!/[^\-—–\s]/.test(item.text())) {
          item.addClass("ui-widget-content ui-menu-divider");
        }
      });
      menus.children(".ui-state-disabled").attr("aria-disabled", "true");
      if (this.active && !$.contains(this.element[0], this.active[0])) {
        this.blur();
      }
    },
    _itemRole: function() {
      return {
        menu: "menuitem",
        listbox: "option"
      }[this.options.role];
    },
    focus: function(event, item) {
      var nested, focused;
      this.blur(event, event && event.type === "focus");
      this._scrollIntoView(item);
      this.active = item.first();
      focused = this.active.children("a").addClass("ui-state-focus");
      if (this.options.role) {
        this.element.attr("aria-activedescendant", focused.attr("id"));
      }
      this.active
        .parent()
        .closest(".ui-menu-item")
        .children("a:first")
        .addClass("ui-state-active");
      if (event && event.type === "keydown") {
        this._close();
      } else {
        this.timer = this._delay(function() {
          this._close();
        }, this.delay);
      }
      nested = item.children(".ui-menu");
      if (nested.length && (/^mouse/.test(event.type))) {
        this._startOpening(nested);
      }
      this.activeMenu = item.parent();
      this._trigger("focus", event, {
        item: item
      });
    },
    _scrollIntoView: function(item) {
      var borderTop, paddingTop, offset, scroll, elementHeight, itemHeight;
      if (this._hasScroll()) {
        borderTop = parseFloat($.css(this.activeMenu[0], "borderTopWidth")) || 0;
        paddingTop = parseFloat($.css(this.activeMenu[0], "paddingTop")) || 0;
        offset = item.offset().top - this.activeMenu.offset().top - borderTop - paddingTop;
        scroll = this.activeMenu.scrollTop();
        elementHeight = this.activeMenu.height();
        itemHeight = item.height();
        if (offset < 0) {
          this.activeMenu.scrollTop(scroll + offset);
        } else if (offset + itemHeight > elementHeight) {
          this.activeMenu.scrollTop(scroll + offset - elementHeight + itemHeight);
        }
      }
    },
    blur: function(event, fromFocus) {
      if (!fromFocus) {
        clearTimeout(this.timer);
      }
      if (!this.active) {
        return;
      }
      this.active.children("a").removeClass("ui-state-focus");
      this.active = null;
      this._trigger("blur", event, {
        item: this.active
      });
    },
    _startOpening: function(submenu) {
      clearTimeout(this.timer);
      if (submenu.attr("aria-hidden") !== "true") {
        return;
      }
      this.timer = this._delay(function() {
        this._close();
        this._open(submenu);
      }, this.delay);
    },
    _open: function(submenu) {
      var position = $.extend({ of: this.active
      }, this.options.position);
      clearTimeout(this.timer);
      this.element.find(".ui-menu").not(submenu.parents(".ui-menu"))
        .hide()
        .attr("aria-hidden", "true");
      submenu
        .show()
        .removeAttr("aria-hidden")
        .attr("aria-expanded", "true")
        .position(position);
    },
    collapseAll: function(event, all) {
      clearTimeout(this.timer);
      this.timer = this._delay(function() {
        var currentMenu = all ? this.element :
          $(event && event.target).closest(this.element.find(".ui-menu"));
        if (!currentMenu.length) {
          currentMenu = this.element;
        }
        this._close(currentMenu);
        this.blur(event);
        this.activeMenu = currentMenu;
      }, this.delay);
    },
    _close: function(startMenu) {
      if (!startMenu) {
        startMenu = this.active ? this.active.parent() : this.element;
      }
      startMenu
        .find(".ui-menu")
        .hide()
        .attr("aria-hidden", "true")
        .attr("aria-expanded", "false")
        .end()
        .find("a.ui-state-active")
        .removeClass("ui-state-active");
    },
    collapse: function(event) {
      var newItem = this.active &&
        this.active.parent().closest(".ui-menu-item", this.element);
      if (newItem && newItem.length) {
        this._close();
        this.focus(event, newItem);
      }
    },
    expand: function(event) {
      var newItem = this.active &&
        this.active
        .children(".ui-menu ")
        .children(".ui-menu-item")
        .first();
      if (newItem && newItem.length) {
        this._open(newItem.parent());
        this._delay(function() {
          this.focus(event, newItem);
        });
      }
    },
    next: function(event) {
      this._move("next", "first", event);
    },
    previous: function(event) {
      this._move("prev", "last", event);
    },
    isFirstItem: function() {
      return this.active && !this.active.prevAll(".ui-menu-item").length;
    },
    isLastItem: function() {
      return this.active && !this.active.nextAll(".ui-menu-item").length;
    },
    _move: function(direction, filter, event) {
      var next;
      if (this.active) {
        if (direction === "first" || direction === "last") {
          next = this.active[direction === "first" ? "prevAll" : "nextAll"](".ui-menu-item")
            .eq(-1);
        } else {
          next = this.active[direction + "All"](".ui-menu-item")
            .eq(0);
        }
      }
      if (!next || !next.length || !this.active) {
        next = this.activeMenu.children(".ui-menu-item")[filter]();
      }
      this.focus(event, next);
    },
    nextPage: function(event) {
      var item, base, height;
      if (!this.active) {
        this.next(event);
        return;
      }
      if (this.isLastItem()) {
        return;
      }
      if (this._hasScroll()) {
        base = this.active.offset().top;
        height = this.element.height();
        this.active.nextAll(".ui-menu-item").each(function() {
          item = $(this);
          return item.offset().top - base - height < 0;
        });
        this.focus(event, item);
      } else {
        this.focus(event, this.activeMenu.children(".ui-menu-item")[!this.active ? "first" : "last"]());
      }
    },
    previousPage: function(event) {
      var item, base, height;
      if (!this.active) {
        this.next(event);
        return;
      }
      if (this.isFirstItem()) {
        return;
      }
      if (this._hasScroll()) {
        base = this.active.offset().top;
        height = this.element.height();
        this.active.prevAll(".ui-menu-item").each(function() {
          item = $(this);
          return item.offset().top - base + height > 0;
        });
        this.focus(event, item);
      } else {
        this.focus(event, this.activeMenu.children(".ui-menu-item").first());
      }
    },
    _hasScroll: function() {
      return this.element.outerHeight() < this.element.prop("scrollHeight");
    },
    select: function(event) {
      this.active = this.active || $(event.target).closest(".ui-menu-item");
      var ui = {
        item: this.active
      };
      if (!this.active.has(".ui-menu").length) {
        this.collapseAll(event, true);
      }
      this._trigger("select", event, ui);
    }
  });
}(jQuery));