/*! RESOURCE: /scripts/jquery-ui-1.9.2.custom.js */
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
                        suppressKeyPress =