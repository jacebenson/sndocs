/*! RESOURCE: /scripts/heisenberg/heisenberg_all.js */
/*! RESOURCE: /scripts/heisenberg/bootstrap/affix.js */
+ function($) {
  'use strict';
  var Affix = function(element, options) {
    this.options = $.extend({}, Affix.DEFAULTS, options)
    this.$target = $(this.options.target)
      .on('scroll.bs.affix.data-api', $.proxy(this.checkPosition, this))
      .on('click.bs.affix.data-api', $.proxy(this.checkPositionWithEventLoop, this))
    this.$element = $(element)
    this.affixed =
      this.unpin =
      this.pinnedOffset = null
    this.checkPosition()
  }
  Affix.VERSION = '3.2.0'
  Affix.RESET = 'affix affix-top affix-bottom'
  Affix.DEFAULTS = {
    offset: 0,
    target: window
  }
  Affix.prototype.getPinnedOffset = function() {
    if (this.pinnedOffset) return this.pinnedOffset
    this.$element.removeClass(Affix.RESET).addClass('affix')
    var scrollTop = this.$target.scrollTop()
    var position = this.$element.offset()
    return (this.pinnedOffset = position.top - scrollTop)
  }
  Affix.prototype.checkPositionWithEventLoop = function() {
    setTimeout($.proxy(this.checkPosition, this), 1)
  }
  Affix.prototype.checkPosition = function() {
    if (!this.$element.is(':visible')) return
    var scrollHeight = $(document).height()
    var scrollTop = this.$target.scrollTop()
    var position = this.$element.offset()
    var offset = this.options.offset
    var offsetTop = offset.top
    var offsetBottom = offset.bottom
    if (typeof offset != 'object') offsetBottom = offsetTop = offset
    if (typeof offsetTop == 'function') offsetTop = offset.top(this.$element)
    if (typeof offsetBottom == 'function') offsetBottom = offset.bottom(this.$element)
    var affix = this.unpin != null && (scrollTop + this.unpin <= position.top) ? false :
      offsetBottom != null && (position.top + this.$element.height() >= scrollHeight - offsetBottom) ? 'bottom' :
      offsetTop != null && (scrollTop <= offsetTop) ? 'top' : false
    if (this.affixed === affix) return
    if (this.unpin != null) this.$element.css('top', '')
    var affixType = 'affix' + (affix ? '-' + affix : '')
    var e = $.Event(affixType + '.bs.affix')
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
    this.affixed = affix
    this.unpin = affix == 'bottom' ? this.getPinnedOffset() : null
    this.$element
      .removeClass(Affix.RESET)
      .addClass(affixType)
      .trigger($.Event(affixType.replace('affix', 'affixed')))
    if (affix == 'bottom') {
      this.$element.offset({
        top: scrollHeight - this.$element.height() - offsetBottom
      })
    }
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.affix')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.affix', (data = new Affix(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.affix
  $.fn.affix = Plugin
  $.fn.affix.Constructor = Affix
  $.fn.affix.noConflict = function() {
    $.fn.affix = old
    return this
  }
  $(window).on('load', function() {
    $('[data-spy="affix"]').each(function() {
      var $spy = $(this)
      var data = $spy.data()
      data.offset = data.offset || {}
      if (data.offsetBottom) data.offset.bottom = data.offsetBottom
      if (data.offsetTop) data.offset.top = data.offsetTop
      Plugin.call($spy, data)
    })
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/alert.js */
+
function($) {
  'use strict';
  var dismiss = '[data-dismiss="alert"]'
  var Alert = function(el) {
    $(el).on('click', dismiss, this.close)
  }
  Alert.VERSION = '3.2.0'
  Alert.prototype.close = function(e) {
    var $this = $(this)
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
      selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '')
    }
    var $parent = $(selector)
    if (e) e.preventDefault()
    if (!$parent.length) {
      $parent = $this.hasClass('alert') ? $this : $this.parent()
    }
    $parent.trigger(e = $.Event('close.bs.alert'))
    if (e.isDefaultPrevented()) return
    $parent.removeClass('in')

    function removeElement() {
      $parent.detach().trigger('closed.bs.alert').remove()
    }
    $.support.transition && $parent.hasClass('fade') ?
      $parent
      .one('bsTransitionEnd', removeElement)
      .emulateTransitionEnd(150) :
      removeElement()
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.alert')
      if (!data) $this.data('bs.alert', (data = new Alert(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }
  var old = $.fn.alert
  $.fn.alert = Plugin
  $.fn.alert.Constructor = Alert
  $.fn.alert.noConflict = function() {
    $.fn.alert = old
    return this
  }
  $(document).on('click.bs.alert.data-api', dismiss, Alert.prototype.close)
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/button.js */
+
function($) {
  'use strict';
  var Button = function(element, options) {
    this.$element = $(element)
    this.options = $.extend({}, Button.DEFAULTS, options)
    this.isLoading = false
  }
  Button.VERSION = '3.2.0'
  Button.DEFAULTS = {
    loadingText: 'loading...'
  }
  Button.prototype.setState = function(state) {
    var d = 'disabled'
    var $el = this.$element
    var val = $el.is('input') ? 'val' : 'html'
    var data = $el.data()
    state = state + 'Text'
    if (data.resetText == null) $el.data('resetText', $el[val]())
    $el[val](data[state] == null ? this.options[state] : data[state])
    setTimeout($.proxy(function() {
      if (state == 'loadingText') {
        this.isLoading = true
        $el.addClass(d).attr(d, d)
      } else if (this.isLoading) {
        this.isLoading = false
        $el.removeClass(d).removeAttr(d)
      }
    }, this), 0)
  }
  Button.prototype.toggle = function() {
    var changed = true
    var $parent = this.$element.closest('[data-toggle="buttons"]')
    if ($parent.length) {
      var $input = this.$element.find('input')
      if ($input.prop('type') == 'radio') {
        if ($input.prop('checked') && this.$element.hasClass('active')) changed = false
        else $parent.find('.active').removeClass('active')
      }
      if (changed) $input.prop('checked', !this.$element.hasClass('active')).trigger('change')
    }
    if (changed) this.$element.toggleClass('active')
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.button')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.button', (data = new Button(this, options)))
      if (option == 'toggle') data.toggle()
      else if (option) data.setState(option)
    })
  }
  var old = $.fn.button
  $.fn.button = Plugin
  $.fn.button.Constructor = Button
  $.fn.button.noConflict = function() {
    $.fn.button = old
    return this
  }
  $(document).on('click.bs.button.data-api', '[data-toggle^="button"]', function(e) {
    var $btn = $(e.target)
    if (!$btn.hasClass('btn')) $btn = $btn.closest('.btn')
    Plugin.call($btn, 'toggle')
    e.preventDefault()
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/carousel.js */
+
function($) {
  'use strict';
  var Carousel = function(element, options) {
    this.$element = $(element).on('keydown.bs.carousel', $.proxy(this.keydown, this))
    this.$indicators = this.$element.find('.carousel-indicators')
    this.options = options
    this.paused =
      this.sliding =
      this.interval =
      this.$active =
      this.$items = null
    this.options.pause == 'hover' && this.$element
      .on('mouseenter.bs.carousel', $.proxy(this.pause, this))
      .on('mouseleave.bs.carousel', $.proxy(this.cycle, this))
  }
  Carousel.VERSION = '3.2.0'
  Carousel.DEFAULTS = {
    interval: 5000,
    pause: 'hover',
    wrap: true
  }
  Carousel.prototype.keydown = function(e) {
    switch (e.which) {
      case 37:
        this.prev();
        break
      case 39:
        this.next();
        break
      default:
        return
    }
    e.preventDefault()
  }
  Carousel.prototype.cycle = function(e) {
    e || (this.paused = false)
    this.interval && clearInterval(this.interval)
    this.options.interval &&
      !this.paused &&
      (this.interval = setInterval($.proxy(this.next, this), this.options.interval))
    return this
  }
  Carousel.prototype.getItemIndex = function(item) {
    this.$items = item.parent().children('.item')
    return this.$items.index(item || this.$active)
  }
  Carousel.prototype.to = function(pos) {
    var that = this
    var activeIndex = this.getItemIndex(this.$active = this.$element.find('.item.active'))
    if (pos > (this.$items.length - 1) || pos < 0) return
    if (this.sliding) return this.$element.one('slid.bs.carousel', function() {
      that.to(pos)
    })
    if (activeIndex == pos) return this.pause().cycle()
    return this.slide(pos > activeIndex ? 'next' : 'prev', $(this.$items[pos]))
  }
  Carousel.prototype.pause = function(e) {
    e || (this.paused = true)
    if (this.$element.find('.next, .prev').length && $.support.transition) {
      this.$element.trigger($.support.transition.end)
      this.cycle(true)
    }
    this.interval = clearInterval(this.interval)
    return this
  }
  Carousel.prototype.next = function() {
    if (this.sliding) return
    return this.slide('next')
  }
  Carousel.prototype.prev = function() {
    if (this.sliding) return
    return this.slide('prev')
  }
  Carousel.prototype.slide = function(type, next) {
    var $active = this.$element.find('.item.active')
    var $next = next || $active[type]()
    var isCycling = this.interval
    var direction = type == 'next' ? 'left' : 'right'
    var fallback = type == 'next' ? 'first' : 'last'
    var that = this
    if (!$next.length) {
      if (!this.options.wrap) return
      $next = this.$element.find('.item')[fallback]()
    }
    if ($next.hasClass('active')) return (this.sliding = false)
    var relatedTarget = $next[0]
    var slideEvent = $.Event('slide.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    this.$element.trigger(slideEvent)
    if (slideEvent.isDefaultPrevented()) return
    this.sliding = true
    isCycling && this.pause()
    if (this.$indicators.length) {
      this.$indicators.find('.active').removeClass('active')
      var $nextIndicator = $(this.$indicators.children()[this.getItemIndex($next)])
      $nextIndicator && $nextIndicator.addClass('active')
    }
    var slidEvent = $.Event('slid.bs.carousel', {
      relatedTarget: relatedTarget,
      direction: direction
    })
    if ($.support.transition && this.$element.hasClass('slide')) {
      $next.addClass(type)
      $next[0].offsetWidth
      $active.addClass(direction)
      $next.addClass(direction)
      $active
        .one('bsTransitionEnd', function() {
          $next.removeClass([type, direction].join(' ')).addClass('active')
          $active.removeClass(['active', direction].join(' '))
          that.sliding = false
          setTimeout(function() {
            that.$element.trigger(slidEvent)
          }, 0)
        })
        .emulateTransitionEnd($active.css('transition-duration').slice(0, -1) * 1000)
    } else {
      $active.removeClass('active')
      $next.addClass('active')
      this.sliding = false
      this.$element.trigger(slidEvent)
    }
    isCycling && this.cycle()
    return this
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.carousel')
      var options = $.extend({}, Carousel.DEFAULTS, $this.data(), typeof option == 'object' && option)
      var action = typeof option == 'string' ? option : options.slide
      if (!data) $this.data('bs.carousel', (data = new Carousel(this, options)))
      if (typeof option == 'number') data.to(option)
      else if (action) data[action]()
      else if (options.interval) data.pause().cycle()
    })
  }
  var old = $.fn.carousel
  $.fn.carousel = Plugin
  $.fn.carousel.Constructor = Carousel
  $.fn.carousel.noConflict = function() {
    $.fn.carousel = old
    return this
  }
  $(document).on('click.bs.carousel.data-api', '[data-slide], [data-slide-to]', function(e) {
    var href
    var $this = $(this)
    var $target = $($this.attr('data-target') || (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, ''))
    if (!$target.hasClass('carousel')) return
    var options = $.extend({}, $target.data(), $this.data())
    var slideIndex = $this.attr('data-slide-to')
    if (slideIndex) options.interval = false
    Plugin.call($target, options)
    if (slideIndex) {
      $target.data('bs.carousel').to(slideIndex)
    }
    e.preventDefault()
  })
  $(window).on('load', function() {
    $('[data-ride="carousel"]').each(function() {
      var $carousel = $(this)
      Plugin.call($carousel, $carousel.data())
    })
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/collapse.js */
+
function($) {
  'use strict';
  var Collapse = function(element, options) {
    this.$element = $(element)
    this.options = $.extend({}, Collapse.DEFAULTS, options)
    this.transitioning = null
    if (this.options.parent) this.$parent = $(this.options.parent)
    if (this.options.toggle) this.toggle()
  }
  Collapse.VERSION = '3.2.0'
  Collapse.DEFAULTS = {
    toggle: true
  }
  Collapse.prototype.dimension = function() {
    var hasWidth = this.$element.hasClass('width')
    return hasWidth ? 'width' : 'height'
  }
  Collapse.prototype.show = function() {
    if (this.transitioning || this.$element.hasClass('in')) return
    var startEvent = $.Event('show.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    var actives = this.$parent && this.$parent.find('> .panel > .in')
    if (actives && actives.length) {
      var hasData = actives.data('bs.collapse')
      if (hasData && hasData.transitioning) return
      Plugin.call(actives, 'hide')
      hasData || actives.data('bs.collapse', null)
    }
    var dimension = this.dimension()
    this.$element
      .removeClass('collapse')
      .addClass('collapsing')[dimension](0)
    this.transitioning = 1
    var complete = function() {
      this.$element
        .removeClass('collapsing')
        .addClass('collapse in')[dimension]('')
      this.transitioning = 0
      this.$element
        .trigger('shown.bs.collapse')
    }
    if (!$.support.transition) return complete.call(this)
    var scrollSize = $.camelCase(['scroll', dimension].join('-'))
    this.$element
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)[dimension](this.$element[0][scrollSize])
  }
  Collapse.prototype.hide = function() {
    if (this.transitioning || !this.$element.hasClass('in')) return
    var startEvent = $.Event('hide.bs.collapse')
    this.$element.trigger(startEvent)
    if (startEvent.isDefaultPrevented()) return
    var dimension = this.dimension()
    this.$element[dimension](this.$element[dimension]())[0].offsetHeight
    this.$element
      .addClass('collapsing')
      .removeClass('collapse')
      .removeClass('in')
    this.transitioning = 1
    var complete = function() {
      this.transitioning = 0
      this.$element
        .trigger('hidden.bs.collapse')
        .removeClass('collapsing')
        .addClass('collapse')
    }
    if (!$.support.transition) return complete.call(this)
    this.$element[dimension](0)
      .one('bsTransitionEnd', $.proxy(complete, this))
      .emulateTransitionEnd(350)
  }
  Collapse.prototype.toggle = function() {
    this[this.$element.hasClass('in') ? 'hide' : 'show']()
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.collapse')
      var options = $.extend({}, Collapse.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data && options.toggle && option == 'show') option = !option
      if (!data) $this.data('bs.collapse', (data = new Collapse(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.collapse
  $.fn.collapse = Plugin
  $.fn.collapse.Constructor = Collapse
  $.fn.collapse.noConflict = function() {
    $.fn.collapse = old
    return this
  }
  $(document).on('click.bs.collapse.data-api', '[data-toggle="collapse"]', function(e) {
    var href
    var $this = $(this)
    var target = $this.attr('data-target') ||
      e.preventDefault() ||
      (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
    var $target = $(target)
    var data = $target.data('bs.collapse')
    var option = data ? 'toggle' : $this.data()
    var parent = $this.attr('data-parent')
    var $parent = parent && $(parent)
    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }
    Plugin.call($target, option)
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/dropdown.js */
+
function($) {
  'use strict';
  var backdrop = '.dropdown-backdrop'
  var toggle = '[data-toggle="dropdown"]'
  var Dropdown = function(element) {
    $(element).on('click.bs.dropdown', this.toggle)
  }
  Dropdown.VERSION = '3.2.0'
  Dropdown.prototype.toggle = function(e) {
    var $this = $(this)
    if ($this.is('.disabled, :disabled')) return
    var $parent = getParent($this)
    var isActive = $parent.hasClass('open')
    clearMenus()
    if (!isActive) {
      if ('ontouchstart' in document.documentElement && !$parent.closest('.navbar-nav').length) {
        $('<div class="dropdown-backdrop"/>').insertAfter($(this)).on('click', clearMenus)
      }
      var relatedTarget = {
        relatedTarget: this
      }
      $parent.trigger(e = $.Event('show.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $this.trigger('focus')
      $parent
        .toggleClass('open')
        .trigger('shown.bs.dropdown', relatedTarget)
    }
    return false
  }
  Dropdown.prototype.keydown = function(e) {
    if (!/(38|40|27)/.test(e.keyCode)) return
    var $this = $(this)
    e.preventDefault()
    e.stopPropagation()
    if ($this.is('.disabled, :disabled')) return
    var $parent = getParent($this)
    var isActive = $parent.hasClass('open')
    if (!isActive || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }
    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)
    if (!$items.length) return
    var index = $items.index($items.filter(':focus'))
    if (e.keyCode == 38 && index > 0) index--
      if (e.keyCode == 40 && index < $items.length - 1) index++
        if (!~index) index = 0
    $items.eq(index).trigger('focus')
  }

  function clearMenus(e) {
    if (e && e.which === 3) return
    $(backdrop).remove()
    $(toggle).each(function() {
      var $parent = getParent($(this))
      var relatedTarget = {
        relatedTarget: this
      }
      if (!$parent.hasClass('open')) return
      $parent.trigger(e = $.Event('hide.bs.dropdown', relatedTarget))
      if (e.isDefaultPrevented()) return
      $parent.removeClass('open').trigger('hidden.bs.dropdown', relatedTarget)
    })
  }

  function getParent($this) {
    var selector = $this.attr('data-target')
    if (!selector) {
      selector = $this.attr('href')
      selector = selector && /#[A-Za-z]/.test(selector) && selector.replace(/.*(?=#[^\s]*$)/, '')
    }
    var $parent = selector && $(selector)
    return $parent && $parent.length ? $parent : $this.parent()
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.dropdown')
      if (!data) $this.data('bs.dropdown', (data = new Dropdown(this)))
      if (typeof option == 'string') data[option].call($this)
    })
  }
  var old = $.fn.dropdown
  $.fn.dropdown = Plugin
  $.fn.dropdown.Constructor = Dropdown
  $.fn.dropdown.noConflict = function() {
    $.fn.dropdown = old
    return this
  }
  $(document)
    .on('click.bs.dropdown.data-api', clearMenus)
    .on('click.bs.dropdown.data-api', '.dropdown form', function(e) {
      e.stopPropagation()
    })
    .on('click.bs.dropdown.data-api', toggle, Dropdown.prototype.toggle)
    .on('keydown.bs.dropdown.data-api', toggle + ', [role="menu"], [role="listbox"]', Dropdown.prototype.keydown)
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/tooltip.js */
+
function($) {
  'use strict';
  var Tooltip = function(element, options) {
    this.type =
      this.options =
      this.enabled =
      this.timeout =
      this.hoverState =
      this.orphanCheck =
      this.$element = null
    this.init('tooltip', element, options)
  }
  Tooltip.VERSION = '3.2.0'
  Tooltip.DEFAULTS = {
    animation: true,
    placement: 'top',
    selector: false,
    template: '<div class="tooltip" role="tooltip"><div class="tooltip-arrow"></div><div class="tooltip-inner"></div></div>',
    trigger: 'hover focus',
    title: '',
    delay: 0,
    html: false,
    container: false,
    viewport: {
      selector: 'body',
      padding: 0
    }
  }
  Tooltip.prototype.init = function(type, element, options) {
    this.enabled = true
    this.type = type
    this.$element = $(element)
    this.options = this.getOptions(options)
    this.$viewport = this.options.viewport && $(this.options.viewport.selector || this.options.viewport)
    var triggers = this.options.trigger.split(' ')
    for (var i = triggers.length; i--;) {
      var trigger = triggers[i]
      if (trigger == 'click') {
        this.$element.on('click.' + this.type, this.options.selector, $.proxy(this.toggle, this))
      } else if (trigger != 'manual') {
        var eventIn = trigger == 'hover' ? 'mouseenter' : 'focusin'
        var eventOut = trigger == 'hover' ? 'mouseleave' : 'focusout'
        this.$element.on(eventIn + '.' + this.type, this.options.selector, $.proxy(this.enter, this))
        this.$element.on(eventOut + '.' + this.type, this.options.selector, $.proxy(this.leave, this))
      }
    }
    this.options.selector ?
      (this._options = $.extend({}, this.options, {
        trigger: 'manual',
        selector: ''
      })) :
      this.fixTitle()
  }
  Tooltip.prototype.getDefaults = function() {
    return Tooltip.DEFAULTS
  }
  Tooltip.prototype.getOptions = function(options) {
    options = $.extend({}, this.getDefaults(), this.$element.data(), options)
    if (options.delay && typeof options.delay == 'number') {
      options.delay = {
        show: options.delay,
        hide: options.delay
      }
    }
    return options
  }
  Tooltip.prototype.getDelegateOptions = function() {
    var options = {}
    var defaults = this.getDefaults()
    this._options && $.each(this._options, function(key, value) {
      if (defaults[key] != value) options[key] = value
    })
    return options
  }
  Tooltip.prototype.enter = function(obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }
    clearTimeout(self.timeout)
    clearInterval(self.orphanCheck);
    self.hoverState = 'in'
    if (!self.options.delay || !self.options.delay.show) return self.show()
    self.timeout = setTimeout(function() {
      if (self.hoverState == 'in') self.show()
    }, self.options.delay.show)
    self.orphanCheck = setInterval(function() {
      if (self.$element && !self.$element.is(':visible')) {
        self.hide()
        clearInterval(self.orphanCheck)
      }
    }, 1000)
  }
  Tooltip.prototype.leave = function(obj) {
    var self = obj instanceof this.constructor ?
      obj : $(obj.currentTarget).data('bs.' + this.type)
    if (!self) {
      self = new this.constructor(obj.currentTarget, this.getDelegateOptions())
      $(obj.currentTarget).data('bs.' + this.type, self)
    }
    clearTimeout(self.timeout)
    clearInterval(self.orphanCheck);
    self.hoverState = 'out'
    if (!self.options.delay || !self.options.delay.hide) return self.hide()
    self.timeout = setTimeout(function() {
      if (self.hoverState == 'out') self.hide()
    }, self.options.delay.hide)
  }
  Tooltip.prototype.show = function() {
    var e = $.Event('show.bs.' + this.type)
    if (this.hasContent() && this.enabled) {
      this.$element.trigger(e)
      var inDom = $.contains(document.documentElement, this.$element[0])
      if (e.isDefaultPrevented() || !inDom) return
      var that = this
      var $tip = this.tip()
      var tipId = this.getUID(this.type)
      this.setContent()
      $tip.attr('id', tipId)
      this.$element.attr('aria-describedby', tipId)
      if (this.options.animation) $tip.addClass('fade')
      var placement = typeof this.options.placement == 'function' ?
        this.options.placement.call(this, $tip[0], this.$element[0]) :
        this.options.placement
      var autoToken = /\s?auto?\s?/i
      var autoPlace = autoToken.test(placement)
      if (autoPlace) placement = placement.replace(autoToken, '') || 'top'
      $tip
        .detach()
        .css({
          top: 0,
          left: 0,
          display: 'block'
        })
        .addClass(placement)
        .data('bs.' + this.type, this)
      this.options.container ? $tip.appendTo(this.options.container) : $tip.insertAfter(this.$element)
      var pos = this.getPosition()
      var actualWidth = $tip[0].offsetWidth
      var actualHeight = $tip[0].offsetHeight
      if (autoPlace) {
        var orgPlacement = placement
        var $container = this.options.container ? $(this.options.container) : this.$element.parent()
        var containerDim = this.getPosition($container)
        placement = placement == 'bottom' && pos.top + pos.height + actualHeight - containerDim.scroll > containerDim.height ? 'top' :
          placement == 'top' && pos.top - containerDim.scroll - actualHeight < containerDim.top ? 'bottom' :
          placement == 'right' && pos.right + actualWidth > containerDim.width ? 'left' :
          placement == 'left' && pos.left - actualWidth < containerDim.left ? 'right' :
          placement
        $tip
          .removeClass(orgPlacement)
          .addClass(placement)
      }
      var calculatedOffset = this.getCalculatedOffset(placement, pos, actualWidth, actualHeight)
      this.applyPlacement(calculatedOffset, placement)
      var complete = function() {
        var prevHoverState = that.hoverState
        that.$element.trigger('shown.bs.' + that.type)
        that.hoverState = null
        if (prevHoverState == 'out') that.leave(that)
      }
      $.support.transition && this.$tip.hasClass('fade') ?
        $tip
        .one('bsTransitionEnd', complete)
        .emulateTransitionEnd(150) :
        complete()
    }
  }
  Tooltip.prototype.applyPlacement = function(offset, placement) {
    var $tip = this.tip()
    var width = $tip[0].offsetWidth
    var height = $tip[0].offsetHeight
    var marginTop = parseInt($tip.css('margin-top'), 10)
    var marginLeft = parseInt($tip.css('margin-left'), 10)
    if (isNaN(marginTop)) marginTop = 0
    if (isNaN(marginLeft)) marginLeft = 0
    offset.top = offset.top + marginTop
    offset.left = offset.left + marginLeft
    $.offset.setOffset($tip[0], $.extend({
      using: function(props) {
        $tip.css({
          top: Math.round(props.top),
          left: Math.round(props.left)
        })
      }
    }, offset), 0)
    $tip.addClass('in')
    var actualWidth = $tip[0].offsetWidth
    var actualHeight = $tip[0].offsetHeight
    if (placement == 'top' && actualHeight != height) {
      offset.top = offset.top + height - actualHeight
    }
    var delta = this.getViewportAdjustedDelta(placement, offset, actualWidth, actualHeight)
    if (delta.left) offset.left += delta.left
    else offset.top += delta.top
    var isVertical = /top|bottom/.test(placement)
    var arrowDelta = isVertical ? delta.left * 2 - width + actualWidth : delta.top * 2 - height + actualHeight
    var arrowOffsetPosition = isVertical ? 'offsetWidth' : 'offsetHeight'
    $tip.offset(offset)
    this.replaceArrow(arrowDelta, $tip[0][arrowOffsetPosition], isVertical)
  }
  Tooltip.prototype.replaceArrow = function(delta, dimension, isHorizontal) {
    this.arrow()
      .css(isHorizontal ? 'left' : 'top', 50 * (1 - delta / dimension) + '%')
      .css(isHorizontal ? 'top' : 'left', '')
  }
  Tooltip.prototype.setContent = function() {
    var $tip = this.tip()
    var title = this.getTitle()
    $tip.find('.tooltip-inner')[this.options.html ? 'html' : 'text'](title)
    $tip.removeClass('fade in top bottom left right')
  }
  Tooltip.prototype.hide = function(callback) {
    var that = this
    var $tip = this.tip()
    var e = $.Event('hide.bs.' + this.type)

    function complete() {
      if (that.hoverState != 'in') $tip.detach()
      that.$element
        .removeAttr('aria-describedby')
        .trigger('hidden.bs.' + that.type)
      callback && callback()
    }
    this.$element.trigger(e)
    if (e.isDefaultPrevented()) return
    $tip.removeClass('in')
    $.support.transition && this.$tip.hasClass('fade') ?
      $tip
      .one('bsTransitionEnd', complete)
      .emulateTransitionEnd(150) :
      complete()
    this.hoverState = null
    return this
  }
  Tooltip.prototype.fixTitle = function() {
    var $e = this.$element
    if ($e.attr('title') || typeof($e.attr('data-original-title')) != 'string') {
      $e.attr('data-original-title', $e.attr('title') || '').attr('title', '')
    }
  }
  Tooltip.prototype.hasContent = function() {
    return this.getTitle()
  }
  Tooltip.prototype.getPosition = function($element) {
    $element = $element || this.$element
    var el = $element[0]
    var isBody = el.tagName == 'BODY'
    return $.extend({}, (typeof el.getBoundingClientRect == 'function') ? el.getBoundingClientRect() : null, {
      scroll: isBody ? document.documentElement.scrollTop || document.body.scrollTop : $element.scrollTop(),
      width: isBody ? document.documentElement.scrollWidth : $element.outerWidth(),
      height: isBody ? $(window).height() : $element.outerHeight()
    }, isBody ? {
      top: 0,
      left: 0
    } : $element.offset())
  }
  Tooltip.prototype.getCalculatedOffset = function(placement, pos, actualWidth, actualHeight) {
    return placement == 'bottom' ? {
        top: pos.top + pos.height,
        left: pos.left + pos.width / 2 - actualWidth / 2
      } :
      placement == 'top' ? {
        top: pos.top - actualHeight,
        left: pos.left + pos.width / 2 - actualWidth / 2
      } :
      placement == 'left' ? {
        top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left - actualWidth
      } : {
        top: pos.top + pos.height / 2 - actualHeight / 2,
        left: pos.left + pos.width
      }
  }
  Tooltip.prototype.getViewportAdjustedDelta = function(placement, pos, actualWidth, actualHeight) {
    var delta = {
      top: 0,
      left: 0
    }
    if (!this.$viewport) return delta
    var viewportPadding = this.options.viewport && this.options.viewport.padding || 0
    var viewportDimensions = this.getPosition(this.$viewport)
    if (/right|left/.test(placement)) {
      var topEdgeOffset = pos.top - viewportPadding - viewportDimensions.scroll
      var bottomEdgeOffset = pos.top + viewportPadding - viewportDimensions.scroll + actualHeight
      if (topEdgeOffset < viewportDimensions.top) {
        delta.top = viewportDimensions.top - topEdgeOffset
      } else if (bottomEdgeOffset > viewportDimensions.top + viewportDimensions.height) {
        delta.top = viewportDimensions.top + viewportDimensions.height - bottomEdgeOffset
      }
    } else {
      var leftEdgeOffset = pos.left - viewportPadding
      var rightEdgeOffset = pos.left + viewportPadding + actualWidth
      if (leftEdgeOffset < viewportDimensions.left) {
        delta.left = viewportDimensions.left - leftEdgeOffset
      } else if (rightEdgeOffset > viewportDimensions.width) {
        delta.left = viewportDimensions.left + viewportDimensions.width - rightEdgeOffset
      }
    }
    return delta
  }
  Tooltip.prototype.getTitle = function() {
    var title
    var $e = this.$element
    var o = this.options
    title = $e.attr('data-original-title') ||
      (typeof o.title == 'function' ? o.title.call($e[0]) : o.title)
    return title
  }
  Tooltip.prototype.getUID = function(prefix) {
    do prefix += ~~(Math.random() * 1000000)
    while (document.getElementById(prefix))
    return prefix
  }
  Tooltip.prototype.tip = function() {
    return (this.$tip = this.$tip || $(this.options.template))
  }
  Tooltip.prototype.arrow = function() {
    return (this.$arrow = this.$arrow || this.tip().find('.tooltip-arrow'))
  }
  Tooltip.prototype.validate = function() {
    if (!this.$element[0].parentNode) {
      this.hide()
      this.$element = null
      this.options = null
    }
  }
  Tooltip.prototype.enable = function() {
    this.enabled = true
  }
  Tooltip.prototype.disable = function() {
    this.enabled = false
  }
  Tooltip.prototype.toggleEnabled = function() {
    this.enabled = !this.enabled
  }
  Tooltip.prototype.toggle = function(e) {
    var self = this
    if (e) {
      self = $(e.currentTarget).data('bs.' + this.type)
      if (!self) {
        self = new this.constructor(e.currentTarget, this.getDelegateOptions())
        $(e.currentTarget).data('bs.' + this.type, self)
      }
    }
    self.tip().hasClass('in') ? self.leave(self) : self.enter(self)
  }
  Tooltip.prototype.destroy = function() {
    var that = this
    clearTimeout(this.timeout)
    this.hide(function() {
      that.$element.off('.' + that.type).removeData('bs.' + that.type)
    })
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.tooltip')
      var options = typeof option == 'object' && option
      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.tooltip', (data = new Tooltip(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.tooltip
  $.fn.tooltip = Plugin
  $.fn.tooltip.Constructor = Tooltip
  $.fn.tooltip.noConflict = function() {
    $.fn.tooltip = old
    return this
  }
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/modal.js */
+
function($) {
  'use strict';
  var Modal = function(element, options) {
    this.options = options
    this.$body = $(document.body)
    this.$element = $(element)
    this.$backdrop =
      this.isShown = null
    this.scrollbarWidth = 0
    if (this.options.remote) {
      this.$element
        .find('.modal-content')
        .load(this.options.remote, $.proxy(function() {
          this.$element.trigger('loaded.bs.modal')
        }, this))
    }
  }
  Modal.VERSION = '3.2.0'
  Modal.DEFAULTS = {
    backdrop: true,
    keyboard: true,
    show: true
  }
  Modal.prototype.toggle = function(_relatedTarget) {
    return this.isShown ? this.hide() : this.show(_relatedTarget)
  }
  Modal.prototype.show = function(_relatedTarget) {
    var that = this
    var e = $.Event('show.bs.modal', {
      relatedTarget: _relatedTarget
    })
    this.$element.trigger(e)
    if (this.isShown || e.isDefaultPrevented()) return
    this.isShown = true
    this.checkScrollbar()
    this.$body.addClass('modal-open')
    this.setScrollbar()
    this.escape()
    this.$element.on('click.dismiss.bs.modal', '[data-dismiss="modal"]', $.proxy(this.hide, this))
    this.backdrop(function() {
      var transition = $.support.transition && that.$element.hasClass('fade')
      if (!that.$element.parent().length) {
        that.$element.appendTo(that.$body)
      }
      that.$element
        .show()
        .scrollTop(0)
      if (transition) {
        that.$element[0].offsetWidth
      }
      that.$element
        .addClass('in')
        .attr('aria-hidden', false)
      that.enforceFocus()
      var e = $.Event('shown.bs.modal', {
        relatedTarget: _relatedTarget
      })
      transition ?
        that.$element.find('.modal-dialog')
        .one('bsTransitionEnd', function() {
          that.$element.trigger('focus').trigger(e)
        })
        .emulateTransitionEnd(300) :
        that.$element.trigger('focus').trigger(e)
    })
  }
  Modal.prototype.hide = function(e) {
    if (e) e.preventDefault()
    e = $.Event('hide.bs.modal')
    this.$element.trigger(e)
    if (!this.isShown || e.isDefaultPrevented()) return
    this.isShown = false
    this.$body.removeClass('modal-open')
    this.resetScrollbar()
    this.escape()
    $(document).off('focusin.bs.modal')
    this.$element
      .removeClass('in')
      .attr('aria-hidden', true)
      .off('click.dismiss.bs.modal')
    $.support.transition && this.$element.hasClass('fade') ?
      this.$element
      .one('bsTransitionEnd', $.proxy(this.hideModal, this))
      .emulateTransitionEnd(300) :
      this.hideModal()
  }
  Modal.prototype.enforceFocus = function() {
    $(document)
      .off('focusin.bs.modal')
      .on('focusin.bs.modal', $.proxy(function(e) {
        if (this.$element[0] !== e.target && !this.$element.has(e.target).length) {
          this.$element.trigger('focus')
        }
      }, this))
  }
  Modal.prototype.escape = function() {
    if (this.isShown && this.options.keyboard) {
      this.$element.on('keyup.dismiss.bs.modal', $.proxy(function(e) {
        e.which == 27 && this.hide()
      }, this))
    } else if (!this.isShown) {
      this.$element.off('keyup.dismiss.bs.modal')
    }
  }
  Modal.prototype.hideModal = function() {
    var that = this
    this.$element.hide()
    this.backdrop(function() {
      that.$element.trigger('hidden.bs.modal')
    })
  }
  Modal.prototype.removeBackdrop = function() {
    this.$backdrop && this.$backdrop.remove()
    this.$backdrop = null
  }
  Modal.prototype.backdrop = function(callback) {
    var that = this
    var animate = this.$element.hasClass('fade') ? 'fade' : ''
    if (this.isShown && this.options.backdrop) {
      var doAnimate = $.support.transition && animate
      this.$backdrop = $('<div class="modal-backdrop ' + animate + '" />')
        .appendTo(this.$body)
      this.$element.on('click.dismiss.bs.modal', $.proxy(function(e) {
        if (e.target !== e.currentTarget) return
        this.options.backdrop == 'static' ?
          this.$element[0].focus.call(this.$element[0]) :
          this.hide.call(this)
      }, this))
      if (doAnimate) this.$backdrop[0].offsetWidth
      this.$backdrop.addClass('in')
      if (!callback) return
      doAnimate ?
        this.$backdrop
        .one('bsTransitionEnd', callback)
        .emulateTransitionEnd(150) :
        callback()
    } else if (!this.isShown && this.$backdrop) {
      this.$backdrop.removeClass('in')
      var callbackRemove = function() {
        that.removeBackdrop()
        callback && callback()
      }
      $.support.transition && this.$element.hasClass('fade') ?
        this.$backdrop
        .one('bsTransitionEnd', callbackRemove)
        .emulateTransitionEnd(150) :
        callbackRemove()
    } else if (callback) {
      callback()
    }
  }
  Modal.prototype.checkScrollbar = function() {
    if (document.body.clientWidth >= window.innerWidth) return
    this.scrollbarWidth = this.scrollbarWidth || this.measureScrollbar()
  }
  Modal.prototype.setScrollbar = function() {
    var bodyPad = parseInt((this.$body.css('padding-right') || 0), 10)
    if (this.scrollbarWidth) this.$body.css('padding-right', bodyPad + this.scrollbarWidth)
  }
  Modal.prototype.resetScrollbar = function() {
    this.$body.css('padding-right', '')
  }
  Modal.prototype.measureScrollbar = function() {
    var scrollDiv = document.createElement('div')
    scrollDiv.className = 'modal-scrollbar-measure'
    this.$body.append(scrollDiv)
    var scrollbarWidth = scrollDiv.offsetWidth - scrollDiv.clientWidth
    this.$body[0].removeChild(scrollDiv)
    return scrollbarWidth
  }

  function Plugin(option, _relatedTarget) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.modal')
      var options = $.extend({}, Modal.DEFAULTS, $this.data(), typeof option == 'object' && option)
      if (!data) $this.data('bs.modal', (data = new Modal(this, options)))
      if (typeof option == 'string') data[option](_relatedTarget)
      else if (options.show) data.show(_relatedTarget)
    })
  }
  var old = $.fn.modal
  $.fn.modal = Plugin
  $.fn.modal.Constructor = Modal
  $.fn.modal.noConflict = function() {
    $.fn.modal = old
    return this
  }
  $(document).on('click.bs.modal.data-api', '[data-toggle="modal"]', function(e) {
    var $this = $(this)
    var href = $this.attr('href')
    var $target = $($this.attr('data-target') || (href && href.replace(/.*(?=#[^\s]+$)/, '')))
    var option = $target.data('bs.modal') ? 'toggle' : $.extend({
      remote: !/#/.test(href) && href
    }, $target.data(), $this.data())
    if ($this.is('a')) e.preventDefault()
    $target.one('show.bs.modal', function(showEvent) {
      if (showEvent.isDefaultPrevented()) return
      $target.one('hidden.bs.modal', function() {
        $this.is(':visible') && $this.trigger('focus')
      })
    })
    Plugin.call($target, option, this)
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/popover.js */
+
function($) {
  'use strict';
  var Popover = function(element, options) {
    this.init('popover', element, options)
  }
  if (!$.fn.tooltip) throw new Error('Popover requires tooltip.js')
  Popover.VERSION = '3.2.0'
  Popover.DEFAULTS = $.extend({}, $.fn.tooltip.Constructor.DEFAULTS, {
    placement: 'right',
    trigger: 'click',
    content: '',
    template: '<div class="popover" role="tooltip"><div class="arrow"></div><h3 class="popover-title"></h3><div class="popover-content"></div></div>'
  })
  Popover.prototype = $.extend({}, $.fn.tooltip.Constructor.prototype)
  Popover.prototype.constructor = Popover
  Popover.prototype.getDefaults = function() {
    return Popover.DEFAULTS
  }
  Popover.prototype.setContent = function() {
    var $tip = this.tip()
    var title = this.getTitle()
    var content = this.getContent()
    $tip.find('.popover-title')[this.options.html ? 'html' : 'text'](title)
    $tip.find('.popover-content').empty()[
      this.options.html ? (typeof content == 'string' ? 'html' : 'append') : 'text'
    ](content)
    $tip.removeClass('fade top bottom left right in')
    if (!$tip.find('.popover-title').html()) $tip.find('.popover-title').hide()
  }
  Popover.prototype.hasContent = function() {
    return this.getTitle() || this.getContent()
  }
  Popover.prototype.getContent = function() {
    var $e = this.$element
    var o = this.options
    return $e.attr('data-content') ||
      (typeof o.content == 'function' ?
        o.content.call($e[0]) :
        o.content)
  }
  Popover.prototype.arrow = function() {
    return (this.$arrow = this.$arrow || this.tip().find('.arrow'))
  }
  Popover.prototype.tip = function() {
    if (!this.$tip) this.$tip = $(this.options.template)
    return this.$tip
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.popover')
      var options = typeof option == 'object' && option
      if (!data && option == 'destroy') return
      if (!data) $this.data('bs.popover', (data = new Popover(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.popover
  $.fn.popover = Plugin
  $.fn.popover.Constructor = Popover
  $.fn.popover.noConflict = function() {
    $.fn.popover = old
    return this
  }
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/scrollspy.js */
+
function($) {
  'use strict';

  function ScrollSpy(element, options) {
    var process = $.proxy(this.process, this)
    this.$body = $('body')
    this.$scrollElement = $(element).is('body') ? $(window) : $(element)
    this.options = $.extend({}, ScrollSpy.DEFAULTS, options)
    this.selector = (this.options.target || '') + ' .nav li > a'
    this.offsets = []
    this.targets = []
    this.activeTarget = null
    this.scrollHeight = 0
    this.$scrollElement.on('scroll.bs.scrollspy', process)
    this.refresh()
    this.process()
  }
  ScrollSpy.VERSION = '3.2.0'
  ScrollSpy.DEFAULTS = {
    offset: 10
  }
  ScrollSpy.prototype.getScrollHeight = function() {
    return this.$scrollElement[0].scrollHeight || Math.max(this.$body[0].scrollHeight, document.documentElement.scrollHeight)
  }
  ScrollSpy.prototype.refresh = function() {
    var offsetMethod = 'offset'
    var offsetBase = 0
    if (!$.isWindow(this.$scrollElement[0])) {
      offsetMethod = 'position'
      offsetBase = this.$scrollElement.scrollTop()
    }
    this.offsets = []
    this.targets = []
    this.scrollHeight = this.getScrollHeight()
    var self = this
    this.$body
      .find(this.selector)
      .map(function() {
        var $el = $(this)
        var href = $el.data('target') || $el.attr('href')
        var $href = /^#./.test(href) && $(href)
        return ($href &&
          $href.length &&
          $href.is(':visible') &&
          [
            [$href[offsetMethod]().top + offsetBase, href]
          ]) || null
      })
      .sort(function(a, b) {
        return a[0] - b[0]
      })
      .each(function() {
        self.offsets.push(this[0])
        self.targets.push(this[1])
      })
  }
  ScrollSpy.prototype.process = function() {
    var scrollTop = this.$scrollElement.scrollTop() + this.options.offset
    var scrollHeight = this.getScrollHeight()
    var maxScroll = this.options.offset + scrollHeight - this.$scrollElement.height()
    var offsets = this.offsets
    var targets = this.targets
    var activeTarget = this.activeTarget
    var i
    if (this.scrollHeight != scrollHeight) {
      this.refresh()
    }
    if (scrollTop >= maxScroll) {
      return activeTarget != (i = targets[targets.length - 1]) && this.activate(i)
    }
    if (activeTarget && scrollTop <= offsets[0]) {
      return activeTarget != (i = targets[0]) && this.activate(i)
    }
    for (i = offsets.length; i--;) {
      activeTarget != targets[i] &&
        scrollTop >= offsets[i] &&
        (!offsets[i + 1] || scrollTop <= offsets[i + 1]) &&
        this.activate(targets[i])
    }
  }
  ScrollSpy.prototype.activate = function(target) {
    this.activeTarget = target
    $(this.selector)
      .parentsUntil(this.options.target, '.active')
      .removeClass('active')
    var selector = this.selector +
      '[data-target="' + target + '"],' +
      this.selector + '[href="' + target + '"]'
    var active = $(selector)
      .parents('li')
      .addClass('active')
    if (active.parent('.dropdown-menu').length) {
      active = active
        .closest('li.dropdown')
        .addClass('active')
    }
    active.trigger('activate.bs.scrollspy')
  }

  function Plugin(option) {
    return this.each(function() {
      var $this = $(this)
      var data = $this.data('bs.scrollspy')
      var options = typeof option == 'object' && option
      if (!data) $this.data('bs.scrollspy', (data = new ScrollSpy(this, options)))
      if (typeof option == 'string') data[option]()
    })
  }
  var old = $.fn.scrollspy
  $.fn.scrollspy = Plugin
  $.fn.scrollspy.Constructor = ScrollSpy
  $.fn.scrollspy.noConflict = function() {
    $.fn.scrollspy = old
    return this
  }
  $(window).on('load.bs.scrollspy.data-api', function() {
    $('[data-spy="scroll"]').each(function() {
      var $spy = $(this)
      Plugin.call($spy, $spy.data())
    })
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/bootstrap/transition.js */
+
function($) {
  'use strict';

  function transitionEnd() {
    var el = document.createElement('bootstrap')
    var transEndEventNames = {
      WebkitTransition: 'webkitTransitionEnd',
      MozTransition: 'transitionend',
      OTransition: 'oTransitionEnd otransitionend',
      transition: 'transitionend'
    }
    for (var name in transEndEventNames) {
      if (el.style[name] !== undefined) {
        return {
          end: transEndEventNames[name]
        }
      }
    }
    return false
  }
  $.fn.emulateTransitionEnd = function(duration) {
    var called = false
    var $el = this
    $(this).one('bsTransitionEnd', function() {
      called = true
    })
    var callback = function() {
      if (!called) $($el).trigger($.support.transition.end)
    }
    setTimeout(callback, duration)
    return this
  }
  $(function() {
    $.support.transition = transitionEnd()
    if (!$.support.transition) return
    $.event.special.bsTransitionEnd = {
      bindType: $.support.transition.end,
      delegateType: $.support.transition.end,
      handle: function(e) {
        if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
      }
    }
  })
}(jQuery);;
/*! RESOURCE: /scripts/heisenberg/custom/prototype.hidefix.js */
(function($) {
  "use strict";
  $.fn.hideFix = function() {
    return this.each(function() {
      if (!window.Prototype)
        return this;
      this.hide = function() {
        if (!jQuery.event.triggered)
          Element.hide(this);
      }
      this.show = function() {
        if (!jQuery.event.triggered)
          Element.show(this);
      }
      return this;
    })
  }
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/custom/collapse.js */
(function($) {
  "use strict";
  var bsCollapse = $.fn.collapse;
  $.fn.collapse = function(options) {
    var $this = this;
    $this.hideFix();
    return bsCollapse.call($this, options);
  };
  $(document).on('click.bs.collapse.data-api', '[data-sn-toggle="collapse"]', function(e) {
    var href
    var $this = $(this)
    var target = $this.attr('data-target') ||
      e.preventDefault() ||
      (href = $this.attr('href')) && href.replace(/.*(?=#[^\s]+$)/, '')
    var $target = $(target)
    var data = $target.data('bs.collapse')
    var option = data ? 'toggle' : $this.data()
    var parent = $this.attr('data-parent')
    var $parent = parent && $(parent)
    if (!data || !data.transitioning) {
      if ($parent) $parent.find('[data-toggle="collapse"][data-parent="' + parent + '"]').not($this).addClass('collapsed')
      $this[$target.hasClass('in') ? 'addClass' : 'removeClass']('collapsed')
    }
    $.fn.collapse.call($target, option)
  });
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/custom/dropdowns.js */
(function($) {
  "use strict";
  $(document).on('show.bs.dropdown', function(evt) {
    $(evt.relatedTarget).hideFix()
      .parent().hideFix()
      .closest('.dropup, .dropdown').hideFix();
  });
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/custom/modals.js */
jQuery(function($) {
  "use strict";
  var bsModal = $.fn.modal.Constructor;
  var bsModalShow = bsModal.prototype.show;
  var bsModalHide = bsModal.prototype.hide;
  var modalCount = 0;

  function isMobileSafari() {
    return navigator.userAgent.match(/iPad/i) || navigator.userAgent.match(/iPod/i);
  }

  function forceRedraw(element) {
    return element.offsetLeft;
  }
  bsModal.prototype.show = function() {
    bsModalShow.apply(this, arguments);
    modalCount++;
    var $backdrop = $('body').find('.modal-backdrop').not('.stacked');
    var zmodal = this.$element.css('z-index');
    var zbackdrop = $backdrop.css('z-index');
    this.$element.css('z-index', (~~zmodal) + (10 * modalCount));
    $backdrop.css('z-index', (~~zbackdrop) + (10 * modalCount));
    $backdrop.addClass('stacked');
    forceRedraw(this.$element[0]);
  };
  bsModal.prototype.hide = function(e) {
    bsModalHide.apply(this, arguments);
    if (this.isShown) return;
    modalCount--;
    this.$element.css('z-index', '');
    forceRedraw(this.$element[0]);
  };
  $(document).on('shown.bs.modal hidden.bs.modal', function() {
    if (window._frameChanged)
      _frameChanged();
  })
});;
/*! RESOURCE: /scripts/heisenberg/custom/tooltips.js */
(function($) {
  "use strict";
  var bsTooltip = $.fn.tooltip.Constructor;
  bsTooltip.DEFAULTS.placement = 'auto';
  bsTooltip.DEFAULTS.delay = {
    'show': 500,
    'hide': 100
  };
  bsTooltip.DEFAULTS.trigger = 'hover';
  $(function() {
    if ('ontouchstart' in document.documentElement)
      return;
    var $tooltips = $('.sn-tooltip-basic, *[title]');
    (function copyTitleAttr() {
      $tooltips.each(function() {
        if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
          this.setAttribute('data-original-title', this.getAttribute('title'));
      })
    })();
    $tooltips.one('mouseenter', function() {
      if (this.tagName == 'IFRAME' || this.tagName == 'OPTION')
        return;
      var $this = $(this);
      if ($this.data('bs.tooltip'))
        return;
      $this.tooltip({
        container: $this.attr('data-container') || 'body'
      });
      $this.hideFix();
      $this.on('click', function() {
        $this.tooltip('hide');
      });
      $this.on('shown.bs.tooltip', function() {
        setTimeout(function() {
          $this.tooltip('hide');
        }, 10000);
      });
      $this.data('hover', setTimeout(function() {
        $this.tooltip('show');
      }, bsTooltip.DEFAULTS.delay.show));
    });
    $tooltips.one('mouseleave', function() {
      var $this = $(this);
      var hover = $this.data('hover');
      if (hover) {
        clearTimeout($this.data('hover'));
        $this.removeData('hover')
      }
    });
    $(document).bind('mouseleave', function(evt) {
      if ($('.tooltip').length === 0)
        return;
      $('.sn-tooltip-basic, *[title]').each(function() {
        if (this.tagName == 'IFRAME')
          return;
        var $this = $(this);
        if ($this.data('bs.tooltip'))
          $this.tooltip('hide');
      })
    })
  });
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/custom/snPopover.js */
(function($) {
  "use strict";
  var Popover = $.fn.popover.Constructor;
  var popoverCount = 0;
  var bsPopoverInit = Popover.prototype.init;
  var bsPopoverShow = Popover.prototype.show;
  var bsPopoverHide = Popover.prototype.hide;
  var bsPopoverFixTitle = Popover.prototype.fixTitle;
  Popover.prototype.init = function(type, element, options) {
    var $e = $(element);
    var $target = $($e.data('target'));
    var popoverId = popoverCount++;
    var wide = !!$e.data('wide');
    $e.hideFix();
    this.$target = $target;
    this.$target.hide();
    this.popoverId = popoverId;
    options = $.extend({}, {
      html: true,
      content: function() {
        if (wide)
          this.tip().addClass('wide');
        var placeholderId = 'popover-placeholder-' + popoverId;
        if (!document.getElementById(placeholderId))
          $target.before('<div id="' + placeholderId + '" class="popover-placeholder" />');
        $target.show();
        return $target;
      }.bind(this)
    }, options);
    bsPopoverInit.call(this, type, element, options);
  };
  Popover.prototype.fixTitle = function() {
    var trigger = this.options.trigger;
    if (typeof trigger === "undefined" || trigger === "" || /hover/.test(trigger))
      bsPopoverFixTitle.apply(this, arguments);
  };
  Popover.prototype.show = function() {
    var $e = this.$element;
    bsPopoverShow.apply(this, arguments);
    $e.addClass('active');
    this.tip().one('click', '[data-dismiss=popover]', function() {
      $e.popover('hide');
      $e[0].focus();
    });
  };
  Popover.prototype.hide = function() {
    var $e = this.$element;
    var $target = this.$target;
    var $popover = $target.closest('.popover');
    var popoverId = this.popoverId;

    function saveOffContent() {
      $e.removeClass('active');
      var $placeholder = $('#popover-placeholder-' + popoverId);
      if (!$placeholder.length || !$target.length)
        return;
      var $innerContent = $target.detach();
      if ($innerContent.length === 0)
        return;
      $innerContent.hide();
      $placeholder.replaceWith($innerContent);
    }
    if ($.support.transition && $popover.hasClass('fade'))
      $popover.one('bsTransitionEnd', saveOffContent);
    else
      saveOffContent();
    bsPopoverHide.apply(this, arguments);
  };
})(jQuery);;
/*! RESOURCE: /scripts/heisenberg/custom/popovers.js */
(function($) {
  "use strict";
  $(function() {
    $('.sn-popover-basic').each(function() {
      var $this = $(this);
      if (!$this.data('bs.popover'))
        $(this).popover();
    });

    function hideOpenPopovers() {
      $('.sn-popover-basic').each(function() {
        var $this = $(this);
        if ($this.attr('aria-describedby') !== undefined)
          $this.popover('hide');
      });
    }

    function resetContainer() {
      $('.sn-popover-basic').each(function() {
        var $this = $(this);
        $this.popover({
          container: $this.data('container')
        });
      });
    }
    var debounce = (function() {
      var timeout;
      return function(fn, threshold, fireOnStart) {
        var obj = this,
          args = arguments;
        threshold = (threshold !== undefined) ? threshold : 500;

        function delayed() {
          if (!fireOnStart)
            fn.apply(obj, args);
          timeout = null;
        }
        if (timeout)
          clearTimeout(timeout);
        else if (fireOnStart)
          fn.apply(obj, args);
        timeout = setTimeout(delayed, threshold);
      };
    })();
    $(window).on('resize', function() {
      if ('ontouchstart' in document.documentElement && document.activeElement.type === 'text')
        return;
      debounce(hideOpenPopovers, 0, true);
      debounce(resetContainer);
    });

    function closeOnBlur(e) {
      function eventTargetInElement(elem) {
        return elem.is(e.target) || elem.has(e.target).length !== 0
      }
      $('.sn-popover-basic').each(function() {
        var $popoverButton = $(this);
        var $popoverContent = $($popoverButton.data('target'));
        if (!$popoverContent.is(':visible'))
          return;
        if (eventTargetInElement($popoverButton) || eventTargetInElement($popoverContent))
          return;
        if ($popoverButton.data('auto-close') === false && !$(e.target).is('.sn-popover-basic'))
          return;
        $popoverButton.popover('hide');
      });
    };
    $('html').on('click', function(e) {
      closeOnBlur(e);
    });
    if (CustomEvent && CustomEvent.observe) {
      CustomEvent.observe('body_clicked', function(e) {
        closeOnBlur(e);
      });
    }
  });
  $(document).on('show.bs.popover hide.bs.popover', function() {
    if (window._frameChanged)
      _frameChanged();
  })
})(jQuery);;
/*! RESOURCE: /scripts/select2_doctype/select2.min.js */
/*
Copyright 2014 Igor Vaynberg

Version: 3.5.1 Timestamp: Tue Jul 22 18:58:56 EDT 2014

This software is licensed under the Apache License, Version 2.0 (the "Apache License") or the GNU
General Public License version 2 (the "GPL License"). You may choose either license to govern your
use of this software only upon the condition that you accept all of the terms of either the Apache
License or the GPL License.

You may obtain a copy of the Apache License and the GPL License at:

http://www.apache.org/licenses/LICENSE-2.0
http://www.gnu.org/licenses/gpl-2.0.html

Unless required by applicable law or agreed to in writing, software distributed under the Apache License
or the GPL Licesnse is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
either express or implied. See the Apache License and the GPL License for the specific language governing
permissions and limitations under the Apache License and the GPL License.
*/
! function(a) {
  "undefined" == typeof a.fn.each2 && a.extend(a.fn, {
    each2: function(b) {
      for (var c = a([0]), d = -1, e = this.length; ++d < e && (c.context = c[0] = this[d]) && b.call(c[0], d, c) !== !1;);
      return this
    }
  })
}(jQuery),
function(a, b) {
  "use strict";

  function n(b) {
    var c = a(document.createTextNode(""));
    b.before(c), c.before(b), c.remove()
  }

  function o(a) {
    function b(a) {
      return m[a] || a
    }
    return a.replace(/[^\u0000-\u007E]/g, b)
  }

  function p(a, b) {
    for (var c = 0, d = b.length; d > c; c += 1)
      if (r(a, b[c])) return c;
    return -1
  }

  function q() {
    var b = a(l);
    b.appendTo("body");
    var c = {
      width: b.width() - b[0].clientWidth,
      height: b.height() - b[0].clientHeight
    };
    return b.remove(), c
  }

  function r(a, c) {
    return a === c ? !0 : a === b || c === b ? !1 : null === a || null === c ? !1 : a.constructor === String ? a + "" == c + "" : c.constructor === String ? c + "" == a + "" : !1
  }

  function s(b, c) {
    var d, e, f;
    if (null === b || b.length < 1) return [];
    for (d = b.split(c), e = 0, f = d.length; f > e; e += 1) d[e] = a.trim(d[e]);
    return d
  }

  function t(a) {
    return a.outerWidth(!1) - a.width()
  }

  function u(c) {
    var d = "keyup-change-value";
    c.on("keydown", function() {
      a.data(c, d) === b && a.data(c, d, c.val())
    }), c.on("keyup", function() {
      var e = a.data(c, d);
      e !== b && c.val() !== e && (a.removeData(c, d), c.trigger("keyup-change"))
    })
  }

  function v(c) {
    c.on("mousemove", function(c) {
      var d = i;
      (d === b || d.x !== c.pageX || d.y !== c.pageY) && a(c.target).trigger("mousemove-filtered", c)
    })
  }

  function w(a, c, d) {
    d = d || b;
    var e;
    return function() {
      var b = arguments;
      window.clearTimeout(e), e = window.setTimeout(function() {
        c.apply(d, b)
      }, a)
    }
  }

  function x(a, b) {
    var c = w(a, function(a) {
      b.trigger("scroll-debounced", a)
    });
    b.on("scroll", function(a) {
      p(a.target, b.get()) >= 0 && c(a)
    })
  }

  function y(a) {
    a[0] !== document.activeElement && window.setTimeout(function() {
      var d, b = a[0],
        c = a.val().length;
      a.focus();
      var e = b.offsetWidth > 0 || b.offsetHeight > 0;
      e && b === document.activeElement && (b.setSelectionRange ? b.setSelectionRange(c, c) : b.createTextRange && (d = b.createTextRange(), d.collapse(!1), d.select()))
    }, 0)
  }

  function z(b) {
    b = a(b)[0];
    var c = 0,
      d = 0;
    if ("selectionStart" in b) c = b.selectionStart, d = b.selectionEnd - c;
    else if ("selection" in document) {
      b.focus();
      var e = document.selection.createRange();
      d = document.selection.createRange().text.length, e.moveStart("character", -b.value.length), c = e.text.length - d
    }
    return {
      offset: c,
      length: d
    }
  }

  function A(a) {
    a.preventDefault(), a.stopPropagation()
  }

  function B(a) {
    a.preventDefault(), a.stopImmediatePropagation()
  }

  function C(b) {
    if (!h) {
      var c = b[0].currentStyle || window.getComputedStyle(b[0], null);
      h = a(document.createElement("div")).css({
        position: "absolute",
        left: "-10000px",
        top: "-10000px",
        display: "none",
        fontSize: c.fontSize,
        fontFamily: c.fontFamily,
        fontStyle: c.fontStyle,
        fontWeight: c.fontWeight,
        letterSpacing: c.letterSpacing,
        textTransform: c.textTransform,
        whiteSpace: "nowrap"
      }), h.attr("class", "select2-sizer"), a("body").append(h)
    }
    return h.text(b.val()), h.width()
  }

  function D(b, c, d) {
    var e, g, f = [];
    e = a.trim(b.attr("class")), e && (e = "" + e, a(e.split(/\s+/)).each2(function() {
      0 === this.indexOf("select2-") && f.push(this)
    })), e = a.trim(c.attr("class")), e && (e = "" + e, a(e.split(/\s+/)).each2(function() {
      0 !== this.indexOf("select2-") && (g = d(this), g && f.push(g))
    })), b.attr("class", f.join(" "))
  }

  function E(a, b, c, d) {
    var e = o(a.toUpperCase()).indexOf(o(b.toUpperCase())),
      f = b.length;
    return 0 > e ? (c.push(d(a)), void 0) : (c.push(d(a.substring(0, e))), c.push("<span class='select2-match'>"), c.push(d(a.substring(e, e + f))), c.push("</span>"), c.push(d(a.substring(e + f, a.length))), void 0)
  }

  function F(a) {
    var b = {
      "\\": "&#92;",
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "/": "&#47;"
    };
    return String(a).replace(/[&<>"'\/\\]/g, function(a) {
      return b[a]
    })
  }

  function G(c) {
    var d, e = null,
      f = c.quietMillis || 100,
      g = c.url,
      h = this;
    return function(i) {
      window.clearTimeout(d), d = window.setTimeout(function() {
        var d = c.data,
          f = g,
          j = c.transport || a.fn.select2.ajaxDefaults.transport,
          k = {
            type: c.type || "GET",
            cache: c.cache || !1,
            jsonpCallback: c.jsonpCallback || b,
            dataType: c.dataType || "json"
          },
          l = a.extend({}, a.fn.select2.ajaxDefaults.params, k);
        d = d ? d.call(h, i.term, i.page, i.context) : null, f = "function" == typeof f ? f.call(h, i.term, i.page, i.context) : f, e && "function" == typeof e.abort && e.abort(), c.params && (a.isFunction(c.params) ? a.extend(l, c.params.call(h)) : a.extend(l, c.params)), a.extend(l, {
          url: f,
          dataType: c.dataType,
          data: d,
          success: function(a) {
            var b = c.results(a, i.page, i);
            i.callback(b)
          },
          error: function(a, b, c) {
            var d = {
              hasError: !0,
              jqXHR: a,
              textStatus: b,
              errorThrown: c
            };
            i.callback(d)
          }
        }), e = j.call(h, l)
      }, f)
    }
  }

  function H(b) {
    var d, e, c = b,
      f = function(a) {
        return "" + a.text
      };
    a.isArray(c) && (e = c, c = {
      results: e
    }), a.isFunction(c) === !1 && (e = c, c = function() {
      return e
    });
    var g = c();
    return g.text && (f = g.text, a.isFunction(f) || (d = g.text, f = function(a) {
        return a[d]
      })),
      function(b) {
        var g, d = b.term,
          e = {
            results: []
          };
        return "" === d ? (b.callback(c()), void 0) : (g = function(c, e) {
          var h, i;
          if (c = c[0], c.children) {
            h = {};
            for (i in c) c.hasOwnProperty(i) && (h[i] = c[i]);
            h.children = [], a(c.children).each2(function(a, b) {
              g(b, h.children)
            }), (h.children.length || b.matcher(d, f(h), c)) && e.push(h)
          } else b.matcher(d, f(c), c) && e.push(c)
        }, a(c().results).each2(function(a, b) {
          g(b, e.results)
        }), b.callback(e), void 0)
      }
  }

  function I(c) {
    var d = a.isFunction(c);
    return function(e) {
      var f = e.term,
        g = {
          results: []
        },
        h = d ? c(e) : c;
      a.isArray(h) && (a(h).each(function() {
        var a = this.text !== b,
          c = a ? this.text : this;
        ("" === f || e.matcher(f, c)) && g.results.push(a ? this : {
          id: this,
          text: this
        })
      }), e.callback(g))
    }
  }

  function J(b, c) {
    if (a.isFunction(b)) return !0;
    if (!b) return !1;
    if ("string" == typeof b) return !0;
    throw new Error(c + " must be a string, function, or falsy value")
  }

  function K(b, c) {
    if (a.isFunction(b)) {
      var d = Array.prototype.slice.call(arguments, 2);
      return b.apply(c, d)
    }
    return b
  }

  function L(b) {
    var c = 0;
    return a.each(b, function(a, b) {
      b.children ? c += L(b.children) : c++
    }), c
  }

  function M(a, c, d, e) {
    var h, i, j, k, l, f = a,
      g = !1;
    if (!e.createSearchChoice || !e.tokenSeparators || e.tokenSeparators.length < 1) return b;
    for (;;) {
      for (i = -1, j = 0, k = e.tokenSeparators.length; k > j && (l = e.tokenSeparators[j], i = a.indexOf(l), !(i >= 0)); j++);
      if (0 > i) break;
      if (h = a.substring(0, i), a = a.substring(i + l.length), h.length > 0 && (h = e.createSearchChoice.call(this, h, c), h !== b && null !== h && e.id(h) !== b && null !== e.id(h))) {
        for (g = !1, j = 0, k = c.length; k > j; j++)
          if (r(e.id(h), e.id(c[j]))) {
            g = !0;
            break
          }
        g || d(h)
      }
    }
    return f !== a ? a : void 0
  }

  function N() {
    var b = this;
    a.each(arguments, function(a, c) {
      b[c].remove(), b[c] = null
    })
  }

  function O(b, c) {
    var d = function() {};
    return d.prototype = new b, d.prototype.constructor = d, d.prototype.parent = b.prototype, d.prototype = a.extend(d.prototype, c), d
  }
  if (window.Select2 === b) {
    var c, d, e, f, g, h, j, k, i = {
        x: 0,
        y: 0
      },
      c = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        END: 35,
        BACKSPACE: 8,
        DELETE: 46,
        isArrow: function(a) {
          switch (a = a.which ? a.which : a) {
            case c.LEFT:
            case c.RIGHT:
            case c.UP:
            case c.DOWN:
              return !0
          }
          return !1
        },
        isControl: function(a) {
          var b = a.which;
          switch (b) {
            case c.SHIFT:
            case c.CTRL:
            case c.ALT:
              return !0
          }
          return a.metaKey ? !0 : !1
        },
        isFunctionKey: function(a) {
          return a = a.which ? a.which : a, a >= 112 && 123 >= a
        }
      },
      l = "<div class='select2-measure-scrollbar'></div>",
      m = {
        "\u24b6": "A",
        "\uff21": "A",
        "\xc0": "A",
        "\xc1": "A",
        "\xc2": "A",
        "\u1ea6": "A",
        "\u1ea4": "A",
        "\u1eaa": "A",
        "\u1ea8": "A",
        "\xc3": "A",
        "\u0100": "A",
        "\u0102": "A",
        "\u1eb0": "A",
        "\u1eae": "A",
        "\u1eb4": "A",
        "\u1eb2": "A",
        "\u0226": "A",
        "\u01e0": "A",
        "\xc4": "A",
        "\u01de": "A",
        "\u1ea2": "A",
        "\xc5": "A",
        "\u01fa": "A",
        "\u01cd": "A",
        "\u0200": "A",
        "\u0202": "A",
        "\u1ea0": "A",
        "\u1eac": "A",
        "\u1eb6": "A",
        "\u1e00": "A",
        "\u0104": "A",
        "\u023a": "A",
        "\u2c6f": "A",
        "\ua732": "AA",
        "\xc6": "AE",
        "\u01fc": "AE",
        "\u01e2": "AE",
        "\ua734": "AO",
        "\ua736": "AU",
        "\ua738": "AV",
        "\ua73a": "AV",
        "\ua73c": "AY",
        "\u24b7": "B",
        "\uff22": "B",
        "\u1e02": "B",
        "\u1e04": "B",
        "\u1e06": "B",
        "\u0243": "B",
        "\u0182": "B",
        "\u0181": "B",
        "\u24b8": "C",
        "\uff23": "C",
        "\u0106": "C",
        "\u0108": "C",
        "\u010a": "C",
        "\u010c": "C",
        "\xc7": "C",
        "\u1e08": "C",
        "\u0187": "C",
        "\u023b": "C",
        "\ua73e": "C",
        "\u24b9": "D",
        "\uff24": "D",
        "\u1e0a": "D",
        "\u010e": "D",
        "\u1e0c": "D",
        "\u1e10": "D",
        "\u1e12": "D",
        "\u1e0e": "D",
        "\u0110": "D",
        "\u018b": "D",
        "\u018a": "D",
        "\u0189": "D",
        "\ua779": "D",
        "\u01f1": "DZ",
        "\u01c4": "DZ",
        "\u01f2": "Dz",
        "\u01c5": "Dz",
        "\u24ba": "E",
        "\uff25": "E",
        "\xc8": "E",
        "\xc9": "E",
        "\xca": "E",
        "\u1ec0": "E",
        "\u1ebe": "E",
        "\u1ec4": "E",
        "\u1ec2": "E",
        "\u1ebc": "E",
        "\u0112": "E",
        "\u1e14": "E",
        "\u1e16": "E",
        "\u0114": "E",
        "\u0116": "E",
        "\xcb": "E",
        "\u1eba": "E",
        "\u011a": "E",
        "\u0204": "E",
        "\u0206": "E",
        "\u1eb8": "E",
        "\u1ec6": "E",
        "\u0228": "E",
        "\u1e1c": "E",
        "\u0118": "E",
        "\u1e18": "E",
        "\u1e1a": "E",
        "\u0190": "E",
        "\u018e": "E",
        "\u24bb": "F",
        "\uff26": "F",
        "\u1e1e": "F",
        "\u0191": "F",
        "\ua77b": "F",
        "\u24bc": "G",
        "\uff27": "G",
        "\u01f4": "G",
        "\u011c": "G",
        "\u1e20": "G",
        "\u011e": "G",
        "\u0120": "G",
        "\u01e6": "G",
        "\u0122": "G",
        "\u01e4": "G",
        "\u0193": "G",
        "\ua7a0": "G",
        "\ua77d": "G",
        "\ua77e": "G",
        "\u24bd": "H",
        "\uff28": "H",
        "\u0124": "H",
        "\u1e22": "H",
        "\u1e26": "H",
        "\u021e": "H",
        "\u1e24": "H",
        "\u1e28": "H",
        "\u1e2a": "H",
        "\u0126": "H",
        "\u2c67": "H",
        "\u2c75": "H",
        "\ua78d": "H",
        "\u24be": "I",
        "\uff29": "I",
        "\xcc": "I",
        "\xcd": "I",
        "\xce": "I",
        "\u0128": "I",
        "\u012a": "I",
        "\u012c": "I",
        "\u0130": "I",
        "\xcf": "I",
        "\u1e2e": "I",
        "\u1ec8": "I",
        "\u01cf": "I",
        "\u0208": "I",
        "\u020a": "I",
        "\u1eca": "I",
        "\u012e": "I",
        "\u1e2c": "I",
        "\u0197": "I",
        "\u24bf": "J",
        "\uff2a": "J",
        "\u0134": "J",
        "\u0248": "J",
        "\u24c0": "K",
        "\uff2b": "K",
        "\u1e30": "K",
        "\u01e8": "K",
        "\u1e32": "K",
        "\u0136": "K",
        "\u1e34": "K",
        "\u0198": "K",
        "\u2c69": "K",
        "\ua740": "K",
        "\ua742": "K",
        "\ua744": "K",
        "\ua7a2": "K",
        "\u24c1": "L",
        "\uff2c": "L",
        "\u013f": "L",
        "\u0139": "L",
        "\u013d": "L",
        "\u1e36": "L",
        "\u1e38": "L",
        "\u013b": "L",
        "\u1e3c": "L",
        "\u1e3a": "L",
        "\u0141": "L",
        "\u023d": "L",
        "\u2c62": "L",
        "\u2c60": "L",
        "\ua748": "L",
        "\ua746": "L",
        "\ua780": "L",
        "\u01c7": "LJ",
        "\u01c8": "Lj",
        "\u24c2": "M",
        "\uff2d": "M",
        "\u1e3e": "M",
        "\u1e40": "M",
        "\u1e42": "M",
        "\u2c6e": "M",
        "\u019c": "M",
        "\u24c3": "N",
        "\uff2e": "N",
        "\u01f8": "N",
        "\u0143": "N",
        "\xd1": "N",
        "\u1e44": "N",
        "\u0147": "N",
        "\u1e46": "N",
        "\u0145": "N",
        "\u1e4a": "N",
        "\u1e48": "N",
        "\u0220": "N",
        "\u019d": "N",
        "\ua790": "N",
        "\ua7a4": "N",
        "\u01ca": "NJ",
        "\u01cb": "Nj",
        "\u24c4": "O",
        "\uff2f": "O",
        "\xd2": "O",
        "\xd3": "O",
        "\xd4": "O",
        "\u1ed2": "O",
        "\u1ed0": "O",
        "\u1ed6": "O",
        "\u1ed4": "O",
        "\xd5": "O",
        "\u1e4c": "O",
        "\u022c": "O",
        "\u1e4e": "O",
        "\u014c": "O",
        "\u1e50": "O",
        "\u1e52": "O",
        "\u014e": "O",
        "\u022e": "O",
        "\u0230": "O",
        "\xd6": "O",
        "\u022a": "O",
        "\u1ece": "O",
        "\u0150": "O",
        "\u01d1": "O",
        "\u020c": "O",
        "\u020e": "O",
        "\u01a0": "O",
        "\u1edc": "O",
        "\u1eda": "O",
        "\u1ee0": "O",
        "\u1ede": "O",
        "\u1ee2": "O",
        "\u1ecc": "O",
        "\u1ed8": "O",
        "\u01ea": "O",
        "\u01ec": "O",
        "\xd8": "O",
        "\u01fe": "O",
        "\u0186": "O",
        "\u019f": "O",
        "\ua74a": "O",
        "\ua74c": "O",
        "\u01a2": "OI",
        "\ua74e": "OO",
        "\u0222": "OU",
        "\u24c5": "P",
        "\uff30": "P",
        "\u1e54": "P",
        "\u1e56": "P",
        "\u01a4": "P",
        "\u2c63": "P",
        "\ua750": "P",
        "\ua752": "P",
        "\ua754": "P",
        "\u24c6": "Q",
        "\uff31": "Q",
        "\ua756": "Q",
        "\ua758": "Q",
        "\u024a": "Q",
        "\u24c7": "R",
        "\uff32": "R",
        "\u0154": "R",
        "\u1e58": "R",
        "\u0158": "R",
        "\u0210": "R",
        "\u0212": "R",
        "\u1e5a": "R",
        "\u1e5c": "R",
        "\u0156": "R",
        "\u1e5e": "R",
        "\u024c": "R",
        "\u2c64": "R",
        "\ua75a": "R",
        "\ua7a6": "R",
        "\ua782": "R",
        "\u24c8": "S",
        "\uff33": "S",
        "\u1e9e": "S",
        "\u015a": "S",
        "\u1e64": "S",
        "\u015c": "S",
        "\u1e60": "S",
        "\u0160": "S",
        "\u1e66": "S",
        "\u1e62": "S",
        "\u1e68": "S",
        "\u0218": "S",
        "\u015e": "S",
        "\u2c7e": "S",
        "\ua7a8": "S",
        "\ua784": "S",
        "\u24c9": "T",
        "\uff34": "T",
        "\u1e6a": "T",
        "\u0164": "T",
        "\u1e6c": "T",
        "\u021a": "T",
        "\u0162": "T",
        "\u1e70": "T",
        "\u1e6e": "T",
        "\u0166": "T",
        "\u01ac": "T",
        "\u01ae": "T",
        "\u023e": "T",
        "\ua786": "T",
        "\ua728": "TZ",
        "\u24ca": "U",
        "\uff35": "U",
        "\xd9": "U",
        "\xda": "U",
        "\xdb": "U",
        "\u0168": "U",
        "\u1e78": "U",
        "\u016a": "U",
        "\u1e7a": "U",
        "\u016c": "U",
        "\xdc": "U",
        "\u01db": "U",
        "\u01d7": "U",
        "\u01d5": "U",
        "\u01d9": "U",
        "\u1ee6": "U",
        "\u016e": "U",
        "\u0170": "U",
        "\u01d3": "U",
        "\u0214": "U",
        "\u0216": "U",
        "\u01af": "U",
        "\u1eea": "U",
        "\u1ee8": "U",
        "\u1eee": "U",
        "\u1eec": "U",
        "\u1ef0": "U",
        "\u1ee4": "U",
        "\u1e72": "U",
        "\u0172": "U",
        "\u1e76": "U",
        "\u1e74": "U",
        "\u0244": "U",
        "\u24cb": "V",
        "\uff36": "V",
        "\u1e7c": "V",
        "\u1e7e": "V",
        "\u01b2": "V",
        "\ua75e": "V",
        "\u0245": "V",
        "\ua760": "VY",
        "\u24cc": "W",
        "\uff37": "W",
        "\u1e80": "W",
        "\u1e82": "W",
        "\u0174": "W",
        "\u1e86": "W",
        "\u1e84": "W",
        "\u1e88": "W",
        "\u2c72": "W",
        "\u24cd": "X",
        "\uff38": "X",
        "\u1e8a": "X",
        "\u1e8c": "X",
        "\u24ce": "Y",
        "\uff39": "Y",
        "\u1ef2": "Y",
        "\xdd": "Y",
        "\u0176": "Y",
        "\u1ef8": "Y",
        "\u0232": "Y",
        "\u1e8e": "Y",
        "\u0178": "Y",
        "\u1ef6": "Y",
        "\u1ef4": "Y",
        "\u01b3": "Y",
        "\u024e": "Y",
        "\u1efe": "Y",
        "\u24cf": "Z",
        "\uff3a": "Z",
        "\u0179": "Z",
        "\u1e90": "Z",
        "\u017b": "Z",
        "\u017d": "Z",
        "\u1e92": "Z",
        "\u1e94": "Z",
        "\u01b5": "Z",
        "\u0224": "Z",
        "\u2c7f": "Z",
        "\u2c6b": "Z",
        "\ua762": "Z",
        "\u24d0": "a",
        "\uff41": "a",
        "\u1e9a": "a",
        "\xe0": "a",
        "\xe1": "a",
        "\xe2": "a",
        "\u1ea7": "a",
        "\u1ea5": "a",
        "\u1eab": "a",
        "\u1ea9": "a",
        "\xe3": "a",
        "\u0101": "a",
        "\u0103": "a",
        "\u1eb1": "a",
        "\u1eaf": "a",
        "\u1eb5": "a",
        "\u1eb3": "a",
        "\u0227": "a",
        "\u01e1": "a",
        "\xe4": "a",
        "\u01df": "a",
        "\u1ea3": "a",
        "\xe5": "a",
        "\u01fb": "a",
        "\u01ce": "a",
        "\u0201": "a",
        "\u0203": "a",
        "\u1ea1": "a",
        "\u1ead": "a",
        "\u1eb7": "a",
        "\u1e01": "a",
        "\u0105": "a",
        "\u2c65": "a",
        "\u0250": "a",
        "\ua733": "aa",
        "\xe6": "ae",
        "\u01fd": "ae",
        "\u01e3": "ae",
        "\ua735": "ao",
        "\ua737": "au",
        "\ua739": "av",
        "\ua73b": "av",
        "\ua73d": "ay",
        "\u24d1": "b",
        "\uff42": "b",
        "\u1e03": "b",
        "\u1e05": "b",
        "\u1e07": "b",
        "\u0180": "b",
        "\u0183": "b",
        "\u0253": "b",
        "\u24d2": "c",
        "\uff43": "c",
        "\u0107": "c",
        "\u0109": "c",
        "\u010b": "c",
        "\u010d": "c",
        "\xe7": "c",
        "\u1e09": "c",
        "\u0188": "c",
        "\u023c": "c",
        "\ua73f": "c",
        "\u2184": "c",
        "\u24d3": "d",
        "\uff44": "d",
        "\u1e0b": "d",
        "\u010f": "d",
        "\u1e0d": "d",
        "\u1e11": "d",
        "\u1e13": "d",
        "\u1e0f": "d",
        "\u0111": "d",
        "\u018c": "d",
        "\u0256": "d",
        "\u0257": "d",
        "\ua77a": "d",
        "\u01f3": "dz",
        "\u01c6": "dz",
        "\u24d4": "e",
        "\uff45": "e",
        "\xe8": "e",
        "\xe9": "e",
        "\xea": "e",
        "\u1ec1": "e",
        "\u1ebf": "e",
        "\u1ec5": "e",
        "\u1ec3": "e",
        "\u1ebd": "e",
        "\u0113": "e",
        "\u1e15": "e",
        "\u1e17": "e",
        "\u0115": "e",
        "\u0117": "e",
        "\xeb": "e",
        "\u1ebb": "e",
        "\u011b": "e",
        "\u0205": "e",
        "\u0207": "e",
        "\u1eb9": "e",
        "\u1ec7": "e",
        "\u0229": "e",
        "\u1e1d": "e",
        "\u0119": "e",
        "\u1e19": "e",
        "\u1e1b": "e",
        "\u0247": "e",
        "\u025b": "e",
        "\u01dd": "e",
        "\u24d5": "f",
        "\uff46": "f",
        "\u1e1f": "f",
        "\u0192": "f",
        "\ua77c": "f",
        "\u24d6": "g",
        "\uff47": "g",
        "\u01f5": "g",
        "\u011d": "g",
        "\u1e21": "g",
        "\u011f": "g",
        "\u0121": "g",
        "\u01e7": "g",
        "\u0123": "g",
        "\u01e5": "g",
        "\u0260": "g",
        "\ua7a1": "g",
        "\u1d79": "g",
        "\ua77f": "g",
        "\u24d7": "h",
        "\uff48": "h",
        "\u0125": "h",
        "\u1e23": "h",
        "\u1e27": "h",
        "\u021f": "h",
        "\u1e25": "h",
        "\u1e29": "h",
        "\u1e2b": "h",
        "\u1e96": "h",
        "\u0127": "h",
        "\u2c68": "h",
        "\u2c76": "h",
        "\u0265": "h",
        "\u0195": "hv",
        "\u24d8": "i",
        "\uff49": "i",
        "\xec": "i",
        "\xed": "i",
        "\xee": "i",
        "\u0129": "i",
        "\u012b": "i",
        "\u012d": "i",
        "\xef": "i",
        "\u1e2f": "i",
        "\u1ec9": "i",
        "\u01d0": "i",
        "\u0209": "i",
        "\u020b": "i",
        "\u1ecb": "i",
        "\u012f": "i",
        "\u1e2d": "i",
        "\u0268": "i",
        "\u0131": "i",
        "\u24d9": "j",
        "\uff4a": "j",
        "\u0135": "j",
        "\u01f0": "j",
        "\u0249": "j",
        "\u24da": "k",
        "\uff4b": "k",
        "\u1e31": "k",
        "\u01e9": "k",
        "\u1e33": "k",
        "\u0137": "k",
        "\u1e35": "k",
        "\u0199": "k",
        "\u2c6a": "k",
        "\ua741": "k",
        "\ua743": "k",
        "\ua745": "k",
        "\ua7a3": "k",
        "\u24db": "l",
        "\uff4c": "l",
        "\u0140": "l",
        "\u013a": "l",
        "\u013e": "l",
        "\u1e37": "l",
        "\u1e39": "l",
        "\u013c": "l",
        "\u1e3d": "l",
        "\u1e3b": "l",
        "\u017f": "l",
        "\u0142": "l",
        "\u019a": "l",
        "\u026b": "l",
        "\u2c61": "l",
        "\ua749": "l",
        "\ua781": "l",
        "\ua747": "l",
        "\u01c9": "lj",
        "\u24dc": "m",
        "\uff4d": "m",
        "\u1e3f": "m",
        "\u1e41": "m",
        "\u1e43": "m",
        "\u0271": "m",
        "\u026f": "m",
        "\u24dd": "n",
        "\uff4e": "n",
        "\u01f9": "n",
        "\u0144": "n",
        "\xf1": "n",
        "\u1e45": "n",
        "\u0148": "n",
        "\u1e47": "n",
        "\u0146": "n",
        "\u1e4b": "n",
        "\u1e49": "n",
        "\u019e": "n",
        "\u0272": "n",
        "\u0149": "n",
        "\ua791": "n",
        "\ua7a5": "n",
        "\u01cc": "nj",
        "\u24de": "o",
        "\uff4f": "o",
        "\xf2": "o",
        "\xf3": "o",
        "\xf4": "o",
        "\u1ed3": "o",
        "\u1ed1": "o",
        "\u1ed7": "o",
        "\u1ed5": "o",
        "\xf5": "o",
        "\u1e4d": "o",
        "\u022d": "o",
        "\u1e4f": "o",
        "\u014d": "o",
        "\u1e51": "o",
        "\u1e53": "o",
        "\u014f": "o",
        "\u022f": "o",
        "\u0231": "o",
        "\xf6": "o",
        "\u022b": "o",
        "\u1ecf": "o",
        "\u0151": "o",
        "\u01d2": "o",
        "\u020d": "o",
        "\u020f": "o",
        "\u01a1": "o",
        "\u1edd": "o",
        "\u1edb": "o",
        "\u1ee1": "o",
        "\u1edf": "o",
        "\u1ee3": "o",
        "\u1ecd": "o",
        "\u1ed9": "o",
        "\u01eb": "o",
        "\u01ed": "o",
        "\xf8": "o",
        "\u01ff": "o",
        "\u0254": "o",
        "\ua74b": "o",
        "\ua74d": "o",
        "\u0275": "o",
        "\u01a3": "oi",
        "\u0223": "ou",
        "\ua74f": "oo",
        "\u24df": "p",
        "\uff50": "p",
        "\u1e55": "p",
        "\u1e57": "p",
        "\u01a5": "p",
        "\u1d7d": "p",
        "\ua751": "p",
        "\ua753": "p",
        "\ua755": "p",
        "\u24e0": "q",
        "\uff51": "q",
        "\u024b": "q",
        "\ua757": "q",
        "\ua759": "q",
        "\u24e1": "r",
        "\uff52": "r",
        "\u0155": "r",
        "\u1e59": "r",
        "\u0159": "r",
        "\u0211": "r",
        "\u0213": "r",
        "\u1e5b": "r",
        "\u1e5d": "r",
        "\u0157": "r",
        "\u1e5f": "r",
        "\u024d": "r",
        "\u027d": "r",
        "\ua75b": "r",
        "\ua7a7": "r",
        "\ua783": "r",
        "\u24e2": "s",
        "\uff53": "s",
        "\xdf": "s",
        "\u015b": "s",
        "\u1e65": "s",
        "\u015d": "s",
        "\u1e61": "s",
        "\u0161": "s",
        "\u1e67": "s",
        "\u1e63": "s",
        "\u1e69": "s",
        "\u0219": "s",
        "\u015f": "s",
        "\u023f": "s",
        "\ua7a9": "s",
        "\ua785": "s",
        "\u1e9b": "s",
        "\u24e3": "t",
        "\uff54": "t",
        "\u1e6b": "t",
        "\u1e97": "t",
        "\u0165": "t",
        "\u1e6d": "t",
        "\u021b": "t",
        "\u0163": "t",
        "\u1e71": "t",
        "\u1e6f": "t",
        "\u0167": "t",
        "\u01ad": "t",
        "\u0288": "t",
        "\u2c66": "t",
        "\ua787": "t",
        "\ua729": "tz",
        "\u24e4": "u",
        "\uff55": "u",
        "\xf9": "u",
        "\xfa": "u",
        "\xfb": "u",
        "\u0169": "u",
        "\u1e79": "u",
        "\u016b": "u",
        "\u1e7b": "u",
        "\u016d": "u",
        "\xfc": "u",
        "\u01dc": "u",
        "\u01d8": "u",
        "\u01d6": "u",
        "\u01da": "u",
        "\u1ee7": "u",
        "\u016f": "u",
        "\u0171": "u",
        "\u01d4": "u",
        "\u0215": "u",
        "\u0217": "u",
        "\u01b0": "u",
        "\u1eeb": "u",
        "\u1ee9": "u",
        "\u1eef": "u",
        "\u1eed": "u",
        "\u1ef1": "u",
        "\u1ee5": "u",
        "\u1e73": "u",
        "\u0173": "u",
        "\u1e77": "u",
        "\u1e75": "u",
        "\u0289": "u",
        "\u24e5": "v",
        "\uff56": "v",
        "\u1e7d": "v",
        "\u1e7f": "v",
        "\u028b": "v",
        "\ua75f": "v",
        "\u028c": "v",
        "\ua761": "vy",
        "\u24e6": "w",
        "\uff57": "w",
        "\u1e81": "w",
        "\u1e83": "w",
        "\u0175": "w",
        "\u1e87": "w",
        "\u1e85": "w",
        "\u1e98": "w",
        "\u1e89": "w",
        "\u2c73": "w",
        "\u24e7": "x",
        "\uff58": "x",
        "\u1e8b": "x",
        "\u1e8d": "x",
        "\u24e8": "y",
        "\uff59": "y",
        "\u1ef3": "y",
        "\xfd": "y",
        "\u0177": "y",
        "\u1ef9": "y",
        "\u0233": "y",
        "\u1e8f": "y",
        "\xff": "y",
        "\u1ef7": "y",
        "\u1e99": "y",
        "\u1ef5": "y",
        "\u01b4": "y",
        "\u024f": "y",
        "\u1eff": "y",
        "\u24e9": "z",
        "\uff5a": "z",
        "\u017a": "z",
        "\u1e91": "z",
        "\u017c": "z",
        "\u017e": "z",
        "\u1e93": "z",
        "\u1e95": "z",
        "\u01b6": "z",
        "\u0225": "z",
        "\u0240": "z",
        "\u2c6c": "z",
        "\ua763": "z",
        "\u0386": "\u0391",
        "\u0388": "\u0395",
        "\u0389": "\u0397",
        "\u038a": "\u0399",
        "\u03aa": "\u0399",
        "\u038c": "\u039f",
        "\u038e": "\u03a5",
        "\u03ab": "\u03a5",
        "\u038f": "\u03a9",
        "\u03ac": "\u03b1",
        "\u03ad": "\u03b5",
        "\u03ae": "\u03b7",
        "\u03af": "\u03b9",
        "\u03ca": "\u03b9",
        "\u0390": "\u03b9",
        "\u03cc": "\u03bf",
        "\u03cd": "\u03c5",
        "\u03cb": "\u03c5",
        "\u03b0": "\u03c5",
        "\u03c9": "\u03c9",
        "\u03c2": "\u03c3"
      };
    j = a(document), g = function() {
        var a = 1;
        return function() {
          return a++
        }
      }(), d = O(Object, {
          bind: function(a) {
            var b = this;
            return function() {
              a.apply(b, arguments)
            }
          },
          init: function(c) {
            var d, e, f = ".select2-results";
            this.opts = c = this.prepareOpts(c), this.id = c.id, c.element.data("select2") !== b && null !== c.element.data("select2") && c.element.data("select2").destroy(), this.container = this.createContainer(), this.liveRegion = a("<span>", {
              role: "status",
              "aria-live": "polite"
            }).addClass("select2-hidden-accessible").appendTo(document.body), this.containerId = "s2id_" + (c.element.attr("id") || "autogen" + g()), this.containerEventName = this.containerId.replace(/([.])/g, "_").replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, "\\$1"), this.container.attr("id", this.containerId), this.container.attr("title", c.element.attr("title")), this.body = a("body"), D(this.container, this.opts.element, this.opts.adaptContainerCssClass), this.container.attr("style", c.element.attr("style")), this.container.css(K(c.containerCss, this.opts.element)), this.container.addClass(K(c.containerCssClass, this.opts.element)), this.elementTabIndex = this.opts.element.attr("tabindex"), this.opts.element.data("select2", this).attr("tabindex", "-1").before(this.container).on("click.select2", A), this.container.data("select2", this), this.dropdown = this.container.find(".select2-drop"), D(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass), this.dropdown.addClass(K(c.dropdownCssClass, this.opts.element)), this.dropdown.data("select2", this), this.dropdown.on("click", A), this.results = d = this.container.find(f), this.search = e = this.container.find("input.select2-input"), this.queryCount = 0, this.resultsPage = 0, this.context = null, this.initContainer(), this.container.on("click", A), v(this.results), this.dropdown.on("mousemove-filtered", f, this.bind(this.highlightUnderEvent)), this.dropdown.on("touchstart touchmove touchend", f, this.bind(function(a) {
              this._touchEvent = !0, this.highlightUnderEvent(a)
            })), this.dropdown.on("touchmove", f, this.bind(this.touchMoved)), this.dropdown.on("touchstart touchend", f, this.bind(this.clearTouchMoved)), this.dropdown.on("click", this.bind(function() {
              this._touchEvent && (this._touchEvent = !1, this.selectHighlighted())
            })), x(80, this.results), this.dropdown.on("scroll-debounced", f, this.bind(this.loadMoreIfNeeded)), a(this.container).on("change", ".select2-input", function(a) {
              a.stopPropagation()
            }), a(this.dropdown).on("change", ".select2-input", function(a) {
              a.stopPropagation()
            }), a.fn.mousewheel && d.mousewheel(function(a, b, c, e) {
              var f = d.scrollTop();
              e > 0 && 0 >= f - e ? (d.scrollTop(0), A(a)) : 0 > e && d.get(0).scrollHeight - d.scrollTop() + e <= d.height() && (d.scrollTop(d.get(0).scrollHeight - d.height()), A(a))
            }), u(e), e.on("keyup-change input paste", this.bind(this.updateResults)), e.on("focus", function() {
              e.addClass("select2-focused")
            }), e.on("blur", function() {
              e.removeClass("select2-focused")
            }), this.dropdown.on("mouseup", f, this.bind(function(b) {
              a(b.target).closest(".select2-result-selectable").length > 0 && (this.highlightUnderEvent(b), this.selectHighlighted(b))
            })), this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function(a) {
              a.stopPropagation()
            }), this.nextSearchTerm = b, a.isFunction(this.opts.initSelection) && (this.initSelection(), this.monitorSource()), null !== c.maximumInputLength && this.search.attr("maxlength", c.maximumInputLength);
            var h = c.element.prop("disabled");
            h === b && (h = !1), this.enable(!h);
            var i = c.element.prop("readonly");
            i === b && (i = !1), this.readonly(i), k = k || q(), this.autofocus = c.element.prop("autofocus"), c.element.prop("autofocus", !1), this.autofocus && this.focus(), this.search.attr("placeholder", c.searchInputPlaceholder)
          },
          destroy: function() {
            var a = this.opts.element,
              c = a.data("select2"),
              d = this;
            this.close(), a.length && a[0].detachEvent && a.each(function() {
              this.detachEvent("onpropertychange", d._sync)
            }), this.propertyObserver && (this.propertyObserver.disconnect(), this.propertyObserver = null), this._sync = null, c !== b && (c.container.remove(), c.liveRegion.remove(), c.dropdown.remove(), a.removeClass("select2-offscreen").removeData("select2").off(".select2").prop("autofocus", this.autofocus || !1), this.elementTabIndex ? a.attr({
              tabindex: this.elementTabIndex
            }) : a.removeAttr("tabindex"), a.show()), N.call(this, "container", "liveRegion", "dropdown", "results", "search")
          },
          optionToData: function(a) {
            return a.is("option") ? {
              id: a.prop("value"),
              text: a.text(),
              element: a.get(),
              css: a.attr("class"),
              disabled: a.prop("disabled"),
              locked: r(a.attr("locked"), "locked") || r(a.data("locked"), !0)
            } : a.is("optgroup") ? {
              text: a.attr("label"),
              children: [],
              element: a.get(),
              css: a.attr("class")
            } : void 0
          },
          prepareOpts: fun