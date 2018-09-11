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
    if (!/(38|40|27|32|9)/.test(e.keyCode) || /input|textarea/i.test(e.target.tagName)) return
    if (e.keyCode == 9) {
      clearMenus()
      return
    }
    var $this = $(this)
    e.preventDefault()
    e.stopPropagation()
    if ($this.is('.disabled, :disabled')) return
    var $parent = getParent($this)
    var isActive = $parent.hasClass('open')
    if ((!isActive && e.keyCode != 27) || (isActive && e.keyCode == 27)) {
      if (e.which == 27) $parent.find(toggle).trigger('focus')
      return $this.trigger('click')
    }
    var desc = ' li:not(.divider):visible a'
    var $items = $parent.find('[role="menu"]' + desc + ', [role="listbox"]' + desc)
    if (!$items.length) return
    var index = $items.index($items.filter(':focus'))
    if (e.keyCode == 38) {
      if (index > 0) index--
        else if (index == 0) index = $items.length - 1
    }
    if (e.keyCode == 40) {
      if (index < $items.length - 1) index++
        else if (index == $items.length - 1) index = 0
    }
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
    var title = ((this.options.title) ? this.options.title : this.getTitle());
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
    $('.dropdown-menu', evt.target).data('menu-trigger', evt.relatedTarget);
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
  var SN_TOOLTIP_SELECTOR = '.sn-tooltip-basic, *[title]:not(.accessibility_no_tooltip), *[data-dynamic-title]:not(.accessibility_no_tooltip)';
  $(function() {
    if ('ontouchstart' in document.documentElement)
      return;
    var $tooltips = $('.sn-tooltip-basic, *[title]:not(.accessibility_no_tooltip), *[data-dynamic-title]:not(.accessibility_no_tooltip)');
    (function setupTooltips() {
      $tooltips.each(function() {
        var $this = $(this);
        $this.hideFix();
        if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
          this.setAttribute('data-original-title', this.getAttribute('title'));
      })
    })();
    $(document.body).on('mouseenter focus', SN_TOOLTIP_SELECTOR, function(evt) {
      if (this.tagName == 'IFRAME' || this.tagName == 'OPTION')
        return;
      var $this = $(this);
      if ($this.data('bs.tooltip'))
        return;
      $this.hideFix();
      if (this.hasAttribute('title') && !this.hasAttribute('data-original-title'))
        this.setAttribute('data-original-title', this.getAttribute('title'));
      $this.tooltip({
        container: $this.attr('data-container') || 'body',
        title: function() {
          return $(this).attr('data-dynamic-title');
        }
      });
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
    $(document.body).on('mouseleave blur', SN_TOOLTIP_SELECTOR, function() {
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
  Popover.prototype.getTitle = function() {
    var $e = this.$element;
    var title = $e.data('popover-title');
    var expectingHtml = this.options && this.options.html;
    var isHtml = typeof $e.data('popover-title-is-html') !== 'undefined' ? $e.data('popover-title-is-html') : expectingHtml;
    if (expectingHtml && !isHtml) {
      title = $('<div />').text(title).html();
    }
    return title || $.fn.tooltip.Constructor.prototype.getTitle.call(this);
  }
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

    function debounce(fn, threshold, fireOnStart) {
      var timeout;
      return function() {
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
    }

    function closeOnBlur(e) {
      function eventTargetInElement(elem) {
        return elem.is(e.target) || elem.has(e.target).length !== 0
      }
      $('.sn-popover-basic').each(function() {
        var $popoverButton = $(this);
        var $popoverContent = $($popoverButton.data('target'));
        if (!$popoverButton.hasClass('active'))
          return;
        if (eventTargetInElement($popoverButton) || eventTargetInElement($popoverContent))
          return;
        if ($popoverButton.data('auto-close') === false && !$(e.target).is('.sn-popover-basic'))
          return;
        $popoverButton.popover('hide');
      });
    }
    var debouncedResetContainer = debounce(resetContainer);
    var debouncedHideOpenPopovers = debounce(hideOpenPopovers, 0, true);
    var debouncedCloseOnBlur = debounce(closeOnBlur, 10);
    $(window).on('resize', function() {
      if ('ontouchstart' in document.documentElement && document.activeElement.type === 'text')
        return;
      debouncedHideOpenPopovers();
      debouncedResetContainer();
    });
    $('html').on('click', function(e) {
      debouncedCloseOnBlur(e);
    });
    if (CustomEvent && CustomEvent.observe) {
      CustomEvent.observe('body_clicked', function(e) {
        debouncedCloseOnBlur(e);
      });
    }
  });
  $(document).on('show.bs.popover hide.bs.popover', function() {
    if (window._frameChanged)
      _frameChanged();
  })
})(jQuery);;
/*! RESOURCE: /scripts/select2_doctype/select2.min.js */
(function(n) {
  if (typeof n.fn.each2 == "undefined") {
    n.extend(n.fn, {
      each2: function(e) {
        var t = n([0]),
          s = -1,
          i = this.length;
        while (++s < i && (t.context = t[0] = this[s]) && e.call(t[0], s, t) !== false);
        return this
      }
    })
  }
})(jQuery);
(function(y, C) {
    "use strict";
    if (window.Select2 !== C) {
      return
    }
    var a, e, t, s, S, i, n = {
        x: 0,
        y: 0
      },
      o, E, a = {
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
        isArrow: function(e) {
          e = e.which ? e.which : e;
          switch (e) {
            case a.LEFT:
            case a.RIGHT:
            case a.UP:
            case a.DOWN:
              return true
          }
          return false
        },
        isControl: function(e) {
          var t = e.which;
          switch (t) {
            case a.SHIFT:
            case a.CTRL:
            case a.ALT:
              return true
          }
          if (e.metaKey) return true;
          return false
        },
        isFunctionKey: function(e) {
          e = e.which ? e.which : e;
          return e >= 112 && e <= 123
        }
      },
      r = "<div class='select2-measure-scrollbar'></div>",
      l = {
        "Ⓐ": "A",
        "Ａ": "A",
        "À": "A",
        "Á": "A",
        "Â": "A",
        "Ầ": "A",
        "Ấ": "A",
        "Ẫ": "A",
        "Ẩ": "A",
        "Ã": "A",
        "Ā": "A",
        "Ă": "A",
        "Ằ": "A",
        "Ắ": "A",
        "Ẵ": "A",
        "Ẳ": "A",
        "Ȧ": "A",
        "Ǡ": "A",
        "Ä": "A",
        "Ǟ": "A",
        "Ả": "A",
        "Å": "A",
        "Ǻ": "A",
        "Ǎ": "A",
        "Ȁ": "A",
        "Ȃ": "A",
        "Ạ": "A",
        "Ậ": "A",
        "Ặ": "A",
        "Ḁ": "A",
        "Ą": "A",
        "Ⱥ": "A",
        "Ɐ": "A",
        "Ꜳ": "AA",
        "Æ": "AE",
        "Ǽ": "AE",
        "Ǣ": "AE",
        "Ꜵ": "AO",
        "Ꜷ": "AU",
        "Ꜹ": "AV",
        "Ꜻ": "AV",
        "Ꜽ": "AY",
        "Ⓑ": "B",
        "Ｂ": "B",
        "Ḃ": "B",
        "Ḅ": "B",
        "Ḇ": "B",
        "Ƀ": "B",
        "Ƃ": "B",
        "Ɓ": "B",
        "Ⓒ": "C",
        "Ｃ": "C",
        "Ć": "C",
        "Ĉ": "C",
        "Ċ": "C",
        "Č": "C",
        "Ç": "C",
        "Ḉ": "C",
        "Ƈ": "C",
        "Ȼ": "C",
        "Ꜿ": "C",
        "Ⓓ": "D",
        "Ｄ": "D",
        "Ḋ": "D",
        "Ď": "D",
        "Ḍ": "D",
        "Ḑ": "D",
        "Ḓ": "D",
        "Ḏ": "D",
        "Đ": "D",
        "Ƌ": "D",
        "Ɗ": "D",
        "Ɖ": "D",
        "Ꝺ": "D",
        "Ǳ": "DZ",
        "Ǆ": "DZ",
        "ǲ": "Dz",
        "ǅ": "Dz",
        "Ⓔ": "E",
        "Ｅ": "E",
        "È": "E",
        "É": "E",
        "Ê": "E",
        "Ề": "E",
        "Ế": "E",
        "Ễ": "E",
        "Ể": "E",
        "Ẽ": "E",
        "Ē": "E",
        "���": "E",
        "Ḗ": "E",
        "Ĕ": "E",
        "Ė": "E",
        "Ë": "E",
        "Ẻ": "E",
        "Ě": "E",
        "Ȅ": "E",
        "Ȇ": "E",
        "Ẹ": "E",
        "Ệ": "E",
        "Ȩ": "E",
        "Ḝ": "E",
        "Ę": "E",
        "Ḙ": "E",
        "Ḛ": "E",
        "Ɛ": "E",
        "Ǝ": "E",
        "Ⓕ": "F",
        "Ｆ": "F",
        "Ḟ": "F",
        "Ƒ": "F",
        "Ꝼ": "F",
        "Ⓖ": "G",
        "Ｇ": "G",
        "Ǵ": "G",
        "Ĝ": "G",
        "Ḡ": "G",
        "Ğ": "G",
        "Ġ": "G",
        "Ǧ": "G",
        "Ģ": "G",
        "Ǥ": "G",
        "Ɠ": "G",
        "Ꞡ": "G",
        "Ᵹ": "G",
        "Ꝿ": "G",
        "Ⓗ": "H",
        "Ｈ": "H",
        "Ĥ": "H",
        "Ḣ": "H",
        "Ḧ": "H",
        "Ȟ": "H",
        "Ḥ": "H",
        "Ḩ": "H",
        "Ḫ": "H",
        "Ħ": "H",
        "Ⱨ": "H",
        "Ⱶ": "H",
        "Ɥ": "H",
        "Ⓘ": "I",
        "Ｉ": "I",
        "Ì": "I",
        "Í": "I",
        "Î": "I",
        "Ĩ": "I",
        "Ī": "I",
        "Ĭ": "I",
        "İ": "I",
        "Ï": "I",
        "Ḯ": "I",
        "Ỉ": "I",
        "Ǐ": "I",
        "Ȉ": "I",
        "Ȋ": "I",
        "Ị": "I",
        "Į": "I",
        "Ḭ": "I",
        "Ɨ": "I",
        "Ⓙ": "J",
        "Ｊ": "J",
        "Ĵ": "J",
        "Ɉ": "J",
        "Ⓚ": "K",
        "Ｋ": "K",
        "Ḱ": "K",
        "Ǩ": "K",
        "Ḳ": "K",
        "Ķ": "K",
        "Ḵ": "K",
        "Ƙ": "K",
        "Ⱪ": "K",
        "Ꝁ": "K",
        "Ꝃ": "K",
        "Ꝅ": "K",
        "Ꞣ": "K",
        "Ⓛ": "L",
        "Ｌ": "L",
        "Ŀ": "L",
        "Ĺ": "L",
        "Ľ": "L",
        "Ḷ": "L",
        "Ḹ": "L",
        "Ļ": "L",
        "Ḽ": "L",
        "Ḻ": "L",
        "Ł": "L",
        "Ƚ": "L",
        "Ɫ": "L",
        "Ⱡ": "L",
        "Ꝉ": "L",
        "Ꝇ": "L",
        "Ꞁ": "L",
        "Ǉ": "LJ",
        "ǈ": "Lj",
        "Ⓜ": "M",
        "Ｍ": "M",
        "Ḿ": "M",
        "Ṁ": "M",
        "Ṃ": "M",
        "Ɱ": "M",
        "Ɯ": "M",
        "Ⓝ": "N",
        "Ｎ": "N",
        "Ǹ": "N",
        "Ń": "N",
        "Ñ": "N",
        "Ṅ": "N",
        "Ň": "N",
        "Ṇ": "N",
        "Ņ": "N",
        "Ṋ": "N",
        "Ṉ": "N",
        "Ƞ": "N",
        "Ɲ": "N",
        "Ꞑ": "N",
        "Ꞥ": "N",
        "Ǌ": "NJ",
        "ǋ": "Nj",
        "Ⓞ": "O",
        "Ｏ": "O",
        "Ò": "O",
        "Ó": "O",
        "Ô": "O",
        "Ồ": "O",
        "Ố": "O",
        "Ỗ": "O",
        "Ổ": "O",
        "Õ": "O",
        "Ṍ": "O",
        "Ȭ": "O",
        "Ṏ": "O",
        "Ō": "O",
        "Ṑ": "O",
        "Ṓ": "O",
        "Ŏ": "O",
        "Ȯ": "O",
        "Ȱ": "O",
        "Ö": "O",
        "Ȫ": "O",
        "Ỏ": "O",
        "Ő": "O",
        "Ǒ": "O",
        "Ȍ": "O",
        "Ȏ": "O",
        "Ơ": "O",
        "Ờ": "O",
        "Ớ": "O",
        "Ỡ": "O",
        "Ở": "O",
        "Ợ": "O",
        "Ọ": "O",
        "Ộ": "O",
        "Ǫ": "O",
        "Ǭ": "O",
        "Ø": "O",
        "Ǿ": "O",
        "Ɔ": "O",
        "Ɵ": "O",
        "Ꝋ": "O",
        "Ꝍ": "O",
        "Ƣ": "OI",
        "Ꝏ": "OO",
        "Ȣ": "OU",
        "Ⓟ": "P",
        "Ｐ": "P",
        "Ṕ": "P",
        "Ṗ": "P",
        "Ƥ": "P",
        "Ᵽ": "P",
        "Ꝑ": "P",
        "Ꝓ": "P",
        "Ꝕ": "P",
        "Ⓠ": "Q",
        "Ｑ": "Q",
        "Ꝗ": "Q",
        "Ꝙ": "Q",
        "Ɋ": "Q",
        "Ⓡ": "R",
        "Ｒ": "R",
        "Ŕ": "R",
        "Ṙ": "R",
        "Ř": "R",
        "Ȑ": "R",
        "Ȓ": "R",
        "Ṛ": "R",
        "Ṝ": "R",
        "Ŗ": "R",
        "Ṟ": "R",
        "Ɍ": "R",
        "Ɽ": "R",
        "Ꝛ": "R",
        "Ꞧ": "R",
        "Ꞃ": "R",
        "Ⓢ": "S",
        "Ｓ": "S",
        "ẞ": "S",
        "Ś": "S",
        "Ṥ": "S",
        "Ŝ": "S",
        "Ṡ": "S",
        "Š": "S",
        "Ṧ": "S",
        "Ṣ": "S",
        "Ṩ": "S",
        "Ș": "S",
        "Ş": "S",
        "Ȿ": "S",
        "Ꞩ": "S",
        "Ꞅ": "S",
        "Ⓣ": "T",
        "Ｔ": "T",
        "Ṫ": "T",
        "Ť": "T",
        "Ṭ": "T",
        "Ț": "T",
        "Ţ": "T",
        "Ṱ": "T",
        "Ṯ": "T",
        "Ŧ": "T",
        "Ƭ": "T",
        "Ʈ": "T",
        "Ⱦ": "T",
        "Ꞇ": "T",
        "Ꜩ": "TZ",
        "Ⓤ": "U",
        "Ｕ": "U",
        "Ù": "U",
        "Ú": "U",
        "Û": "U",
        "Ũ": "U",
        "Ṹ": "U",
        "Ū": "U",
        "Ṻ": "U",
        "Ŭ": "U",
        "Ü": "U",
        "Ǜ": "U",
        "Ǘ": "U",
        "Ǖ": "U",
        "Ǚ": "U",
        "Ủ": "U",
        "Ů": "U",
        "Ű": "U",
        "Ǔ": "U",
        "Ȕ": "U",
        "Ȗ": "U",
        "Ư": "U",
        "Ừ": "U",
        "Ứ": "U",
        "Ữ": "U",
        "Ử": "U",
        "Ự": "U",
        "Ụ": "U",
        "Ṳ": "U",
        "Ų": "U",
        "Ṷ": "U",
        "Ṵ": "U",
        "Ʉ": "U",
        "Ⓥ": "V",
        "Ｖ": "V",
        "Ṽ": "V",
        "Ṿ": "V",
        "Ʋ": "V",
        "Ꝟ": "V",
        "Ʌ": "V",
        "Ꝡ": "VY",
        "Ⓦ": "W",
        "Ｗ": "W",
        "Ẁ": "W",
        "Ẃ": "W",
        "Ŵ": "W",
        "Ẇ": "W",
        "Ẅ": "W",
        "Ẉ": "W",
        "Ⱳ": "W",
        "Ⓧ": "X",
        "Ｘ": "X",
        "Ẋ": "X",
        "Ẍ": "X",
        "Ⓨ": "Y",
        "Ｙ": "Y",
        "Ỳ": "Y",
        "Ý": "Y",
        "Ŷ": "Y",
        "Ỹ": "Y",
        "Ȳ": "Y",
        "Ẏ": "Y",
        "Ÿ": "Y",
        "Ỷ": "Y",
        "Ỵ": "Y",
        "Ƴ": "Y",
        "Ɏ": "Y",
        "Ỿ": "Y",
        "Ⓩ": "Z",
        "Ｚ": "Z",
        "Ź": "Z",
        "Ẑ": "Z",
        "Ż": "Z",
        "Ž": "Z",
        "Ẓ": "Z",
        "Ẕ": "Z",
        "Ƶ": "Z",
        "Ȥ": "Z",
        "Ɀ": "Z",
        "Ⱬ": "Z",
        "Ꝣ": "Z",
        "ⓐ": "a",
        "ａ": "a",
        "ẚ": "a",
        "à": "a",
        "á": "a",
        "â": "a",
        "ầ": "a",
        "ấ": "a",
        "ẫ": "a",
        "ẩ": "a",
        "ã": "a",
        "ā": "a",
        "ă": "a",
        "ằ": "a",
        "ắ": "a",
        "ẵ": "a",
        "ẳ": "a",
        "ȧ": "a",
        "ǡ": "a",
        "ä": "a",
        "ǟ": "a",
        "ả": "a",
        "å": "a",
        "ǻ": "a",
        "ǎ": "a",
        "ȁ": "a",
        "ȃ": "a",
        "ạ": "a",
        "ậ": "a",
        "ặ": "a",
        "ḁ": "a",
        "ą": "a",
        "ⱥ": "a",
        "ɐ": "a",
        "ꜳ": "aa",
        "æ": "ae",
        "ǽ": "ae",
        "ǣ": "ae",
        "ꜵ": "ao",
        "ꜷ": "au",
        "ꜹ": "av",
        "ꜻ": "av",
        "ꜽ": "ay",
        "ⓑ": "b",
        "ｂ": "b",
        "ḃ": "b",
        "ḅ": "b",
        "ḇ": "b",
        "ƀ": "b",
        "ƃ": "b",
        "ɓ": "b",
        "ⓒ": "c",
        "ｃ": "c",
        "ć": "c",
        "ĉ": "c",
        "ċ": "c",
        "č": "c",
        "ç": "c",
        "ḉ": "c",
        "ƈ": "c",
        "ȼ": "c",
        "ꜿ": "c",
        "ↄ": "c",
        "ⓓ": "d",
        "ｄ": "d",
        "ḋ": "d",
        "ď": "d",
        "ḍ": "d",
        "ḑ": "d",
        "ḓ": "d",
        "ḏ": "d",
        "đ": "d",
        "ƌ": "d",
        "ɖ": "d",
        "ɗ": "d",
        "ꝺ": "d",
        "ǳ": "dz",
        "ǆ": "dz",
        "ⓔ": "e",
        "ｅ": "e",
        "è": "e",
        "é": "e",
        "ê": "e",
        "ề": "e",
        "ế": "e",
        "ễ": "e",
        "ể": "e",
        "ẽ": "e",
        "ē": "e",
        "ḕ": "e",
        "ḗ": "e",
        "ĕ": "e",
        "ė": "e",
        "ë": "e",
        "ẻ": "e",
        "ě": "e",
        "ȅ": "e",
        "ȇ": "e",
        "ẹ": "e",
        "ệ": "e",
        "ȩ": "e",
        "ḝ": "e",
        "ę": "e",
        "ḙ": "e",
        "ḛ": "e",
        "ɇ": "e",
        "ɛ": "e",
        "ǝ": "e",
        "ⓕ": "f",
        "ｆ": "f",
        "ḟ": "f",
        "ƒ": "f",
        "ꝼ": "f",
        "ⓖ": "g",
        "ｇ": "g",
        "ǵ": "g",
        "ĝ": "g",
        "ḡ": "g",
        "ğ": "g",
        "ġ": "g",
        "ǧ": "g",
        "ģ": "g",
        "ǥ": "g",
        "ɠ": "g",
        "ꞡ": "g",
        "ᵹ": "g",
        "ꝿ": "g",
        "ⓗ": "h",
        "ｈ": "h",
        "ĥ": "h",
        "ḣ": "h",
        "ḧ": "h",
        "ȟ": "h",
        "ḥ": "h",
        "ḩ": "h",
        "ḫ": "h",
        "ẖ": "h",
        "ħ": "h",
        "ⱨ": "h",
        "ⱶ": "h",
        "ɥ": "h",
        "ƕ": "hv",
        "ⓘ": "i",
        "ｉ": "i",
        "ì": "i",
        "í": "i",
        "î": "i",
        "ĩ": "i",
        "ī": "i",
        "ĭ": "i",
        "ï": "i",
        "ḯ": "i",
        "ỉ": "i",
        "ǐ": "i",
        "ȉ": "i",
        "ȋ": "i",
        "ị": "i",
        "į": "i",
        "ḭ": "i",
        "ɨ": "i",
        "ı": "i",
        "ⓙ": "j",
        "ｊ": "j",
        "ĵ": "j",
        "ǰ": "j",
        "ɉ": "j",
        "ⓚ": "k",
        "ｋ": "k",
        "ḱ": "k",
        "ǩ": "k",
        "ḳ": "k",
        "ķ": "k",
        "ḵ": "k",
        "ƙ": "k",
        "ⱪ": "k",
        "ꝁ": "k",
        "ꝃ": "k",
        "ꝅ": "k",
        "ꞣ": "k",
        "ⓛ": "l",
        "ｌ": "l",
        "ŀ": "l",
        "ĺ": "l",
        "ľ": "l",
        "ḷ": "l",
        "ḹ": "l",
        "ļ": "l",
        "ḽ": "l",
        "ḻ": "l",
        "ſ": "l",
        "ł": "l",
        "ƚ": "l",
        "ɫ": "l",
        "��": "l",
        "ꝉ": "l",
        "ꞁ": "l",
        "ꝇ": "l",
        "ǉ": "lj",
        "ⓜ": "m",
        "ｍ": "m",
        "ḿ": "m",
        "ṁ": "m",
        "ṃ": "m",
        "ɱ": "m",
        "ɯ": "m",
        "ⓝ": "n",
        "ｎ": "n",
        "ǹ": "n",
        "ń": "n",
        "ñ": "n",
        "ṅ": "n",
        "ň": "n",
        "ṇ": "n",
        "ņ": "n",
        "ṋ": "n",
        "ṉ": "n",
        "ƞ": "n",
        "ɲ": "n",
        "ŉ": "n",
        "ꞑ": "n",
        "ꞥ": "n",
        "ǌ": "nj",
        "ⓞ": "o",
        "ｏ": "o",
        "ò": "o",
        "ó": "o",
        "ô": "o",
        "ồ": "o",
        "ố": "o",
        "ỗ": "o",
        "ổ": "o",
        "õ": "o",
        "ṍ": "o",
        "ȭ": "o",
        "ṏ": "o",
        "ō": "o",
        "ṑ": "o",
        "ṓ": "o",
        "ŏ": "o",
        "ȯ": "o",
        "ȱ": "o",
        "ö": "o",
        "ȫ": "o",
        "ỏ": "o",
        "ő": "o",
        "ǒ": "o",
        "ȍ": "o",
        "ȏ": "o",
        "ơ": "o",
        "ờ": "o",
        "ớ": "o",
        "ỡ": "o",
        "ở": "o",
        "ợ": "o",
        "ọ": "o",
        "ộ": "o",
        "ǫ": "o",
        "ǭ": "o",
        "ø": "o",
        "ǿ": "o",
        "ɔ": "o",
        "ꝋ": "o",
        "ꝍ": "o",
        "ɵ": "o",
        "ƣ": "oi",
        "ȣ": "ou",
        "ꝏ": "oo",
        "ⓟ": "p",
        "ｐ": "p",
        "ṕ": "p",
        "ṗ": "p",
        "ƥ": "p",
        "ᵽ": "p",
        "ꝑ": "p",
        "ꝓ": "p",
        "ꝕ": "p",
        "ⓠ": "q",
        "ｑ": "q",
        "ɋ": "q",
        "ꝗ": "q",
        "ꝙ": "q",
        "ⓡ": "r",
        "ｒ": "r",
        "ŕ": "r",
        "ṙ": "r",
        "ř": "r",
        "ȑ": "r",
        "ȓ": "r",
        "ṛ": "r",
        "ṝ": "r",
        "ŗ": "r",
        "ṟ": "r",
        "ɍ": "r",
        "ɽ": "r",
        "ꝛ": "r",
        "ꞧ": "r",
        "ꞃ": "r",
        "ⓢ": "s",
        "ｓ": "s",
        "ß": "s",
        "ś": "s",
        "ṥ": "s",
        "ŝ": "s",
        "ṡ": "s",
        "š": "s",
        "ṧ": "s",
        "ṣ": "s",
        "ṩ": "s",
        "ș": "s",
        "ş": "s",
        "ȿ": "s",
        "ꞩ": "s",
        "ꞅ": "s",
        "ẛ": "s",
        "ⓣ": "t",
        "ｔ": "t",
        "ṫ": "t",
        "ẗ": "t",
        "ť": "t",
        "ṭ": "t",
        "ț": "t",
        "ţ": "t",
        "ṱ": "t",
        "ṯ": "t",
        "ŧ": "t",
        "ƭ": "t",
        "ʈ": "t",
        "ⱦ": "t",
        "ꞇ": "t",
        "ꜩ": "tz",
        "ⓤ": "u",
        "ｕ": "u",
        "ù": "u",
        "ú": "u",
        "û": "u",
        "ũ": "u",
        "ṹ": "u",
        "ū": "u",
        "ṻ": "u",
        "ŭ": "u",
        "ü": "u",
        "ǜ": "u",
        "ǘ": "u",
        "ǖ": "u",
        "ǚ": "u",
        "ủ": "u",
        "ů": "u",
        "ű": "u",
        "ǔ": "u",
        "ȕ": "u",
        "ȗ": "u",
        "ư": "u",
        "ừ": "u",
        "ứ": "u",
        "ữ": "u",
        "ử": "u",
        "ự": "u",
        "ụ": "u",
        "ṳ": "u",
        "ų": "u",
        "ṷ": "u",
        "ṵ": "u",
        "ʉ": "u",
        "ⓥ": "v",
        "ｖ": "v",
        "ṽ": "v",
        "ṿ": "v",
        "ʋ": "v",
        "ꝟ": "v",
        "ʌ": "v",
        "ꝡ": "vy",
        "ⓦ": "w",
        "ｗ": "w",
        "ẁ": "w",
        "ẃ": "w",
        "ŵ": "w",
        "ẇ": "w",
        "ẅ": "w",
        "ẘ": "w",
        "ẉ": "w",
        "ⱳ": "w",
        "ⓧ": "x",
        "ｘ": "x",
        "ẋ": "x",
        "ẍ": "x",
        "ⓨ": "y",
        "ｙ": "y",
        "ỳ": "y",
        "ý": "y",
        "ŷ": "y",
        "ỹ": "y",
        "ȳ": "y",
        "ẏ": "y",
        "ÿ": "y",
        "ỷ": "y",
        "ẙ": "y",
        "ỵ": "y",
        "ƴ": "y",
        "ɏ": "y",
        "ỿ": "y",
        "ⓩ": "z",
        "ｚ": "z",
        "ź": "z",
        "ẑ": "z",
        "ż": "z",
        "ž": "z",
        "ẓ": "z",
        "ẕ": "z",
        "ƶ": "z",
        "ȥ": "z",
        "ɀ": "z",
        "ⱬ": "z",
        "ꝣ": "z",
        "Ά": "Α",
        "Έ": "Ε",
        "Ή": "Η",
        "Ί": "Ι",
        "Ϊ": "Ι",
        "Ό": "Ο",
        "Ύ": "Υ",
        "Ϋ": "Υ",
        "Ώ": "Ω",
        "ά": "α",
        "έ": "ε",
        "ή": "η",
        "ί": "ι",
        "ϊ": "ι",
        "ΐ": "ι",
        "ό": "ο",
        "ύ": "υ",
        "ϋ": "υ",
        "ΰ": "υ",
        "ω": "ω",
        "ς": "σ"
      };
    o = y(document);
    S = function() {
      var e = 1;
      return function() {
        return e++
      }
    }();

    function c(e) {
      var t = y(document.createTextNode(""));
      e.before(t);
      t.before(e);
      t.remove()
    }

    function h(e) {
      function t(e) {
        return l[e] || e
      }
      return e.replace(/[^\u0000-\u007E]/g, t)
    }

    function u(e, t) {
      var s = 0,
        i = t.length;
      for (; s < i; s = s + 1) {
        if (d(e, t[s])) return s
      }
      return -1
    }

    function f() {
      var e = y(r);
      e.appendTo("body");
      var t = {
        width: e.width() - e[0].clientWidth,
        height: e.height() - e[0].clientHeight
      };
      e.remove();
      return t
    }

    function d(e, t) {
      if (e === t) return true;
      if (e === C || t === C) return false;
      if (e === null || t === null) return false;
      if (e.constructor === String) return e + "" === t + "";
      if (t.constructor === String) return t + "" === e + "";
      return false
    }

    function p(e, t) {
      var s, i, n;
      if (e === null || e.length < 1) return [];
      s = e.split(t);
      for (i = 0, n = s.length; i < n; i = i + 1) s[i] = y.trim(s[i]);
      return s
    }

    function g(e) {
      return e.outerWidth(false) - e.width()
    }

    function m(t) {
      var s = "keyup-change-value";
      t.on("keydown", function() {
        if (y.data(t, s) === C) {
          y.data(t, s, t.val())
        }
      });
      t.on("keyup", function() {
        var e = y.data(t, s);
        if (e !== C && t.val() !== e) {
          y.removeData(t, s);
          t.trigger("keyup-change")
        }
      })
    }

    function v(e) {
      e.on("mousemove", function(e) {
        var t = n;
        if (t === C || t.x !== e.pageX || t.y !== e.pageY) {
          y(e.target).trigger("mousemove-filtered", e)
        }
      })
    }

    function b(t, s, i) {
      i = i || C;
      var n;
      return function() {
        var e = arguments;
        window.clearTimeout(n);
        n = window.setTimeout(function() {
          s.apply(i, e)
        }, t)
      }
    }

    function w(e, t) {
      var s = b(e, function(e) {
        t.trigger("scroll-debounced", e)
      });
      t.on("scroll", function(e) {
        if (u(e.target, t.get()) >= 0) s(e)
      })
    }

    function x(n) {
      if (n[0] === document.activeElement) return;
      window.setTimeout(function() {
        var e = n[0],
          t = n.val().length,
          s;
        n.focus();
        var i = e.offsetWidth > 0 || e.offsetHeight > 0;
        if (i && e === document.activeElement) {
          if (e.setSelectionRange) {
            e.setSelectionRange(t, t)
          } else if (e.createTextRange) {
            s = e.createTextRange();
            s.collapse(false);
            s.select()
          }
        }
      }, 0)
    }

    function T(e) {
      e = y(e)[0];
      var t = 0;
      var s = 0;
      if ("selectionStart" in e) {
        t = e.selectionStart;
        s = e.selectionEnd - t
      } else if ("selection" in document) {
        e.focus();
        var i = document.selection.createRange();
        s = document.selection.createRange().text.length;
        i.moveStart("character", -e.value.length);
        t = i.text.length - s
      }
      return {
        offset: t,
        length: s
      }
    }

    function O(e) {
      e.preventDefault();
      e.stopPropagation()
    }

    function P(e) {
      e.preventDefault();
      e.stopImmediatePropagation()
    }

    function I(e) {
      if (!i) {
        var t = e[0].currentStyle || window.getComputedStyle(e[0], null);
        i = y(document.createElement("div")).css({
          position: "absolute",
          left: "-10000px",
          top: "-10000px",
          display: "none",
          fontSize: t.fontSize,
          fontFamily: t.fontFamily,
          fontStyle: t.fontStyle,
          fontWeight: t.fontWeight,
          letterSpacing: t.letterSpacing,
          textTransform: t.textTransform,
          whiteSpace: "nowrap"
        });
        i.attr("class", "select2-sizer");
        y("body").append(i)
      }
      i.text(e.val());
      return i.width()
    }

    function k(e, t, s) {
      var i, n = [],
        o;
      i = y.trim(e.attr("class"));
      if (i) {
        i = "" + i;
        y(i.split(/\s+/)).each2(function() {
          if (this.indexOf("select2-") === 0) {
            n.push(this)
          }
        })
      }
      i = y.trim(t.attr("class"));
      if (i) {
        i = "" + i;
        y(i.split(/\s+/)).each2(function() {
          if (this.indexOf("select2-") !== 0) {
            o = s(this);
            if (o) {
              n.push(o)
            }
          }
        })
      }
      e.attr("class", n.join(" "))
    }

    function A(e, t, s, i) {
      var n = h(e.toUpperCase()).indexOf(h(t.toUpperCase())),
        o = t.length;
      if (n < 0) {
        s.push(i(e));
        return
      }
      s.push(i(e.substring(0, n)));
      s.push("<span class='select2-match'>");
      s.push(i(e.substring(n, n + o)));
      s.push("</span>");
      s.push(i(e.substring(n + o, e.length)))
    }

    function R(e) {
      var t = {
        "\\": "&#92;",
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
        "/": "&#47;"
      };
      return String(e).replace(/[&<>"'\/\\]/g, function(e) {
        return t[e]
      })
    }

    function D(r) {
      var e, a = null,
        t = r.quietMillis || 100,
        l = r.url,
        c = this;
      return function(o) {
        window.clearTimeout(e);
        e = window.setTimeout(function() {
          var e = r.data,
            t = l,
            s = r.transport || y.fn.select2.ajaxDefaults.transport,
            i = {
              type: r.type || "GET",
              cache: r.cache || false,
              jsonpCallback: r.jsonpCallback || C,
              dataType: r.dataType || "json"
            },
            n = y.extend({}, y.fn.select2.ajaxDefaults.params, i);
          e = e ? e.call(c, o.term, o.page, o.context) : null;
          t = typeof t === "function" ? t.call(c, o.term, o.page, o.context) : t;
          if (a && typeof a.abort === "function") {
            a.abort()
          }
          if (r.params) {
            if (y.isFunction(r.params)) {
              y.extend(n, r.params.call(c))
            } else {
              y.extend(n, r.params)
            }
          }
          y.extend(n, {
            url: t,
            dataType: r.dataType,
            data: e,
            success: function(e) {
              var t = r.results(e, o.page, o);
              o.callback(t)
            },
            error: function(e, t, s) {
              var i = {
                hasError: true,
                jqXHR: e,
                textStatus: t,
                errorThrown: s
              };
              o.callback(i)
            }
          });
          a = s.call(c, n)
        }, t)
      }
    }

    function L(e) {
      var t = e,
        s, i, a = function(e) {
          return "" + e.text
        };
      if (y.isArray(t)) {
        i = t;
        t = {
          results: i
        }
      }
      if (y.isFunction(t) === false) {
        i = t;
        t = function() {
          return i
        }
      }
      var n = t();
      if (n.text) {
        a = n.text;
        if (!y.isFunction(a)) {
          s = n.text;
          a = function(e) {
            return e[s]
          }
        }
      }
      return function(n) {
        var o = n.term,
          s = {
            results: []
          },
          r;
        if (o === "") {
          n.callback(t());
          return
        }
        r = function(e, t) {
          var s, i;
          e = e[0];
          if (e.children) {
            s = {};
            for (i in e) {
              if (e.hasOwnProperty(i)) s[i] = e[i]
            }
            s.children = [];
            y(e.children).each2(function(e, t) {
              r(t, s.children)
            });
            if (s.children.length || n.matcher(o, a(s), e)) {
              t.push(s)
            }
          } else {
            if (n.matcher(o, a(e), e)) {
              t.push(e)
            }
          }
        };
        y(t().results).each2(function(e, t) {
          r(t, s.results)
        });
        n.callback(s)
      }
    }

    function H(t) {
      var o = y.isFunction(t);
      return function(s) {
        var i = s.term,
          n = {
            results: []
          };
        var e = o ? t(s) : t;
        if (y.isArray(e)) {
          y(e).each(function() {
            var e = this.text !== C,
              t = e ? this.text : this;
            if (i === "" || s.matcher(i, t)) {
              n.results.push(e ? this : {
                id: this,
                text: this
              })
            }
          });
          s.callback(n)
        }
      }
    }

    function M(e, t) {
      if (y.isFunction(e)) return true;
      if (!e) return false;
      if (typeof e === "string") return true;
      throw new Error(t + " must be a string, function, or falsy value")
    }

    function N(e, t) {
      if (y.isFunction(e)) {
        var s = Array.prototype.slice.call(arguments, 2);
        return e.apply(t, s)
      }
      return e
    }

    function F(e) {
      var s = 0;
      y.each(e, function(e, t) {
        if (t.children) {
          s += F(t.children)
        } else {
          s++
        }
      });
      return s
    }

    function U(e, t, s, i) {
      var n = e,
        o = false,
        r, a, l, c, h;
      if (!i.createSearchChoice || !i.tokenSeparators || i.tokenSeparators.length < 1) return C;
      while (true) {
        a = -1;
        for (l = 0, c = i.tokenSeparators.length; l < c; l++) {
          h = i.tokenSeparators[l];
          a = e.indexOf(h);
          if (a >= 0) break
        }
        if (a < 0) break;
        r = e.substring(0, a);
        e = e.substring(a + h.length);
        if (r.length > 0) {
          r = i.createSearchChoice.call(this, r, t);
          if (r !== C && r !== null && i.id(r) !== C && i.id(r) !== null) {
            o = false;
            for (l = 0, c = t.length; l < c; l++) {
              if (d(i.id(r), i.id(t[l]))) {
                o = true;
                break
              }
            }
            if (!o) s(r)
          }
        }
      }
      if (n !== e) return e
    }

    function j() {
      var s = this;
      y.each(arguments, function(e, t) {
        s[t].remove();
        s[t] = null
      })
    }

    function z(e, t) {
      var s = function() {};
      s.prototype = new e;
      s.prototype.constructor = s;
      s.prototype.parent = e.prototype;
      s.prototype = y.extend(s.prototype, t);
      return s
    }
    e = z(Object, {
          bind: function(e) {
            var t = this;
            return function() {
              e.apply(t, arguments)
            }
          },
          init: function(e) {
            var o, t, s = ".select2-results";
            this.opts = e = this.prepareOpts(e);
            this.id = e.id;
            if (e.element.data("select2") !== C && e.element.data("select2") !== null) {
              e.element.data("select2").destroy()
            }
            this.container = this.createContainer();
            this.liveRegion = y("<span>", {
              role: "status",
              "aria-live": "polite"
            }).addClass("select2-hidden-accessible").appendTo(document.body);
            this.containerId = "s2id_" + (e.element.attr("id") || "autogen" + S());
            this.containerEventName = this.containerId.replace(/([.])/g, "_").replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, "\\$1");
            this.container.attr("id", this.containerId);
            this.container.attr("title", e.element.attr("title"));
            this.body = y("body");
            k(this.container, this.opts.element, this.opts.adaptContainerCssClass);
            this.container.attr("style", e.element.attr("style"));
            this.container.css(N(e.containerCss, this.opts.element));
            this.container.addClass(N(e.containerCssClass, this.opts.element));
            this.elementTabIndex = this.opts.element.attr("tabindex");
            this.opts.element.data("select2", this).attr("tabindex", "-1").before(this.container).on("click.select2", O);
            this.container.data("select2", this);
            this.dropdown = this.container.find(".select2-drop");
            k(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
            this.dropdown.addClass(N(e.dropdownCssClass, this.opts.element));
            this.dropdown.data("select2", this);
            this.dropdown.on("click", O);
            this.results = o = this.container.find(s);
            this.search = t = this.container.find("input.select2-input");
            this.queryCount = 0;
            this.resultsPage = 0;
            this.context = null;
            this.initContainer();
            this.container.on("click", O);
            v(this.results);
            this.dropdown.on("mousemove-filtered", s, this.bind(this.highlightUnderEvent));
            this.dropdown.on("touchstart touchmove touchend", s, this.bind(function(e) {
              this._touchEvent = true;
              this.highlightUnderEvent(e)
            }));
            this.dropdown.on("touchmove", s, this.bind(this.touchMoved));
            this.dropdown.on("touchstart touchend", s, this.bind(this.clearTouchMoved));
            this.dropdown.on("click", this.bind(function(e) {
              if (this._touchEvent) {
                this._touchEvent = false;
                this.selectHighlighted()
              }
            }));
            w(80, this.results);
            this.dropdown.on("scroll-debounced", s, this.bind(this.loadMoreIfNeeded));
            y(this.container).on("change", ".select2-input", function(e) {
              e.stopPropagation()
            });
            y(this.dropdown).on("change", ".select2-input", function(e) {
              e.stopPropagation()
            });
            if (y.fn.mousewheel) {
              o.mousewheel(function(e, t, s, i) {
                var n = o.scrollTop();
                if (i > 0 && n - i <= 0) {
                  o.scrollTop(0);
                  O(e)
                } else if (i < 0 && o.get(0).scrollHeight - o.scrollTop() + i <= o.height()) {
                  o.scrollTop(o.get(0).scrollHeight - o.height());
                  O(e)
                }
              })
            }
            m(t);
            t.on("keyup-change input paste", this.bind(this.updateResults));
            t.on("focus", function() {
              t.addClass("select2-focused")
            });
            t.on("blur", function() {
              t.removeClass("select2-focused")
            });
            this.dropdown.on("mouseup", s, this.bind(function(e) {
              if (y(e.target).closest(".select2-result-selectable").length > 0) {
                this.highlightUnderEvent(e);
                this.selectHighlighted(e)
              }
            }));
            this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function(e) {
              e.stopPropagation()
            });
            this.nextSearchTerm = C;
            if (y.isFunction(this.opts.initSelection)) {
              this.initSelection();
              this.monitorSource()
            }
            if (e.maximumInputLength !== null) {
              this.search.attr("maxlength", e.maximumInputLength)
            }
            var i = e.element.prop("disabled");
            if (i === C) i = false;
            this.enable(!i);
            var n = e.element.prop("readonly");
            if (n === C) n = false;
            this.readonly(n);
            E = E || f();
            this.autofocus = e.element.prop("autofocus");
            e.element.prop("autofocus", false);
            if (this.autofocus) this.focus();
            this.search.attr("placeholder", e.searchInputPlaceholder)
          },
          destroy: function() {
            var e = this.opts.element,
              t = e.data("select2"),
              s = this;
            this.close();
            if (e.length && e[0].detachEvent) {
              e.each(function() {
                this.detachEvent("onpropertychange", s._sync)
              })
            }
            if (this.propertyObserver) {
              this.propertyObserver.disconnect();
              this.propertyObserver = null
            }
            this._sync = null;
            if (t !== C) {
              t.container.remove();
              t.liveRegion.remove();
              t.dropdown.remove();
              e.removeClass("select2-offscreen").removeData("select2").off(".select2").prop("autofocus", this.autofocus || false);
              if (this.elementTabIndex) {
                e.attr({
                  tabindex: this.elementTabIndex
                })
              } else {
                e.removeAttr("tabindex")
              }
              e.show()
            }
            j.call(this, "container", "liveRegion", "dropdown", "results", "search")
          },
          optionToData: function(e) {
            if (e.is("option")) {
              return {
                id: e.prop("value"),
                text: e.text(),
                element: e.get(),
                css: e.attr("class"),
                disabled: e.prop("disabled"),
                locked: d(e.attr("locked"), "locked") || d(e.data("locked"), true)
              }
            } else if (e.is("optgroup")) {
              return {
                text: e.attr("label"),
                children: [],
                element: e.get(),
                css: e.attr("class")
              }
            }
          },
          prepareOpts: function(b) {
            var r, e, t, s, w = this;
            r = b.element;
            if (r.get(0).tagName.toLowerCase() === "select") {
              this.select = e = b.element
            }
            if (e) {
              y.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function() {
                if (this in b) {
                  throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.")
                }
              })
            }
            b = y.extend({}, {
              populateResults: function(e, t, p) {
                var g, m = this.opts.id,
                  v = this.liveRegion;
                g = function(e, t, s) {
                  var i, n, o, r, a, l, c, h, u, f;
                  e = b.sortResults(e, t, p);
                  var d = [];
                  for (i = 0, n = e.length; i < n; i = i + 1) {
                    o = e[i];
                    a = o.disabled === true;
                    r = !a && m(o) !== C;
                    l = o.children && o.children.length > 0;
                    c = y("<li></li>");
                    c.addClass("select2-results-dept-" + s);
                    c.addClass("select2-result");
                    c.addClass(r ? "select2-result-selectable" : "select2-result-unselectable");
                    if (a) {
                      c.addClass("select2-disabled")
                    }
                    if (l) {
                      c.addClass("select2-result-with-children")
                    }
                    c.addClass(w.opts.formatResultCssClass(o));
                    c.attr("role", "presentation");
                    h = y(document.createElement("div"));
                    h.addClass("select2-result-label");
                    h.attr("id", "select2-result-label-" + S());
                    h.attr("role", "option");
                    f = b.formatResult(o, h, p, w.opts.escapeMarkup);
                    if (f !== C) {
                      h.html(f);
                      c.append(h)
                    }
                    if (l) {
                      u = y("<ul></ul>");
                      u.addClass("select2-result-sub");
                      g(o.children, u, s + 1);
                      c.append(u)
                    }
                    c.data("select2-data", o);
                    d.push(c[0])
                  }
                  t.append(d);
                  v.text(b.formatMatches(e.length))
                };
                g(t, e, 0)
              }
            }, y.fn.select2.defaults, b);
            if (typeof b.id !== "function") {
              t = b.id;
              b.id = function(e) {
                return e[t]
              }
            }
            if (y.isArray(b.element.data("select2Tags"))) {
              if ("tags" in b) {
                throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + b.element.attr("id")
              }
              b.tags = b.element.data("select2Tags")
            }
            if (e) {
              b.query = this.bind(function(i) {
                var s = {
                    results: [],
                    more: false
                  },
                  n = i.term,
                  e, t, o;
                o = function(e, t) {
                  var s;
                  if (e.is("option")) {
                    if (i.matcher(n, e.text(), e)) {
                      t.push(w.optionToData(e))
                    }
                  } else if (e.is("optgroup")) {
                    s = w.optionToData(e);
                    e.children().each2(function(e, t) {
                      o(t, s.children)
                    });
                    if (s.children.length > 0) {
                      t.push(s)
                    }
                  }
                };
                e = r.children();
                if (this.getPlaceholder() !== C && e.length > 0) {
                  t = this.getPlaceholderOption();
                  if (t) {
                    e = e.not(t)
                  }
                }
                e.each2(function(e, t) {
                  o(t, s.results)
                });
                i.callback(s)
              });
              b.id = function(e) {
                return e.id
              }
            } else {
              if (!("query" in b)) {
                if ("ajax" in b) {
                  s = b.element.data("ajax-url");
                  if (s && s.length > 0) {
                    b.ajax.url = s
                  }
                  b.query = D.call(b.element, b.ajax)
                } else if ("data" in b) {
                  b.query = L(b.data)
                } else if ("tags" in b) {
                  b.query = H(b.tags);
                  if (b.createSearchChoice === C) {
                    b.createSearchChoice = function(e) {
                      return {
                        id: y.trim(e),
                        text: y.trim(e)
                      }
                    }
                  }
                  if (b.initSelection === C) {
                    b.initSelection = function(e, t) {
                      var s = [];
                      y(p(e.val(), b.separator)).each(function() {
                        var e = {
                            id: this,
                            text: this
                          },
                          t = b.tags;
                        if (y.isFunction(t)) t = t();
                        y(t).each(function() {
                          if (d(this.id, e.id)) {
                            e = this;
                            return false
                          }
                        });
                        s.push(e)
                      });
                      t(s)
                    }
                  }
                }
              }
            }
            if (typeof b.query !== "function") {
              throw "query function not defined for Select2 " + b.element.attr("id")
            }
            if (b.createSearchChoicePosition === "top") {
              b.createSearchChoicePosition = function(e, t) {
                e.unshift(t)
              }
            } else if (b.createSearchChoicePosition === "bottom") {
              b.createSearchChoicePosition = function(e, t) {
                e.push(t)
              }
            } else if (typeof b.createSearchChoicePosition !== "function") {
              throw "invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function"
            }
            return b
          },
          monitorSource: function() {
            var s = this.opts.element,
              e, t = this;
            s.on("change.select2", this.bind(function(e) {
              if (this.opts.element.data("select2-change-triggered") !== true) {
                this.initSelection()
              }
            }));
            this._sync = this.bind(function() {
              var e = s.prop("disabled");
              if (e === C) e = false;
              this.enable(!e);
              var t = s.prop("readonly");
              if (t === C) t = false;
              this.readonly(t);
              k(this.container, this.opts.element, this.opts.adaptContainerCssClass);
              this.container.addClass(N(this.opts.containerCssClass, this.opts.element));
              k(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
              this.dropdown.addClass(N(this.opts.dropdownCssClass, this.opts.element))
            });
            if (s.length && s[0].attachEvent) {
              s.each(function() {
                this.attachEvent("onpropertychange", t._sync)
              })
            }
            e = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            if (e !== C) {
              if (this.propertyObserver) {
                delete this.propertyObserver;
                this.propertyObserver = null
              }
              this.propertyObserver = new e(function(e) {
                y.each(e, t._sync)
              });
              this.propertyObserver.observe(s.get(0), {
                attributes: true,
                subtree: false
              })
            }
          },
          triggerSelect: function(e) {
            var t = y.Event("select2-selecting", {
              val: this.id(e),
              object: e,
              choice: e
            });
            this.opts.element.trigger(t);
            return !t.isDefaultPrevented()
          },
          triggerChange: function(e) {
            e = e || {};
            e = y.extend({}, e, {
              type: "change",
              val: this.val()
            });
            this.opts.element.data("select2-change-triggered", true);
            this.opts.element.trigger(e);
            this.opts.element.data("select2-change-triggered", false);
            this.opts.element.click();
            if (this.opts.blurOnChange) this.opts.element.blur()
          },
          isInterfaceEnabled: function() {
            return this.enabledInterface === true
          },
          enableInterface: function() {
            var e = this._enabled && !this._readonly,
              t = !e;
            if (e === this.enabledInterface) return false;
            this.container.toggleClass("select2-container-disabled", t);
            this.close();
            this.enabledInterface = e;
            return true
          },
          enable: function(e) {
            if (e === C) e = true;
            if (this._enabled === e) return;
            this._enabled = e;
            this.opts.element.prop("disabled", !e);
            this.enableInterface()
          },
          disable: function() {
            this.enable(false)
          },
          readonly: function(e) {
            if (e === C) e = false;
            if (this._readonly === e) return;
            this._readonly = e;
            this.opts.element.prop("readonly", e);
            this.enableInterface()
          },
          opened: function() {
            return this.container ? this.container.hasClass("select2-dropdown-open") : false
          },
          positionDropdown: function() {
            var e = this.dropdown,
              t = this.container.offset(),
              s = this.container.outerHeight(false),
              i = this.container.outerWidth(false),
              n = e.outerHeight(false),
              o = y(window),
              r = o.width(),
              a = o.height(),
              l = o.scrollLeft() + r,
              c = o.scrollTop() + a,
              h = t.top + s,
              u = t.left,
              f = h + n <= c,
              d = t.top - n >= o.scrollTop(),
              p = e.outerWidth(false),
              g = u + p <= l,
              m = e.hasClass("select2-drop-above"),
              v, b, w, C, S;
            if (m) {
              b = true;
              if (!d && f) {
                w = true;
                b = false
              }
            } else {
              b = false;
              if (!f && d) {
                w = true;
                b = true
              }
            }
            if (w) {
              e.hide();
              t = this.container.offset();
              s = this.container.outerHeight(false);
              i = this.container.outerWidth(false);
              n = e.outerHeight(false);
              l = o.scrollLeft() + r;
              c = o.scrollTop() + a;
              h = t.top + s;
              u = t.left;
              p = e.outerWidth(false);
              g = u + p <= l;
              e.show();
              this.focusSearch()
            }
            if (this.opts.dropdownAutoWidth) {
              S = y(".select2-results", e)[0];
              e.addClass("select2-drop-auto-width");
              e.css("width", "");
              p = e.outerWidth(false) + (S.scrollHeight === S.clientHeight ? 0 : E.width);
              p > i ? i = p : p = i;
              n = e.outerHeight(false);
              g = u + p <= l
            } else {
              this.container.removeClass("select2-drop-auto-width")
            }
            if (this.body.css("position") !== "static") {
              v = this.body.offset();
              h -= v.top;
              u -= v.left
            }
            if (!g) {
              u = t.left + this.container.outerWidth(false) - p
            }
            C = {
              left: u,
              width: i
            };
            if (b) {
              C.top = t.top - n;
              C.bottom = "auto";
              this.container.addClass("select2-drop-above");
              e.addClass("select2-drop-above")
            } else {
              C.top = h;
              C.bottom = "auto";
              this.container.removeClass("select2-drop-above");
              e.removeClass("select2-drop-above")
            }
            C = y.extend(C, N(this.opts.dropdownCss, this.opts.element));
            e.css(C)
          },
          shouldOpen: function() {
            var e;
            if (this.opened()) return false;
            if (this._enabled === false || this._readonly === true) return false;
            e = y.Event("select2-opening");
            this.opts.element.trigger(e);
            return !e.isDefaultPrevented()
          },
          clearDropdownAlignmentPreference: function() {
            this.container.removeClass("select2-drop-above");
            this.dropdown.removeClass("select2-drop-above")
          },
          open: function() {
            if (!this.shouldOpen()) return false;
            this.opening();
            o.on("mousemove.select2Event", function(e) {
              n.x = e.pageX;
              n.y = e.pageY
            });
            return true
          },
          opening: function() {
            var e = this.containerEventName,
              t = "scroll." + e,
              s = "resize." + e,
              i = "orientationchange." + e,
              n;
            this.container.addClass("select2-dropdown-open").addClass("select2-container-active");
            this.clearDropdownAlignmentPreference();
            if (this.dropdown[0] !== this.body.children().last()[0]) {
              this.dropdown.detach().appendTo(this.body)
            }
            n = y("#select2-drop-mask");
            if (n.length == 0) {
              n = y(document.createElement("div"));
              n.attr("id", "select2-drop-mask").attr("class", "select2-drop-mask");
              n.hide();
              n.appendTo(this.body);
              n.on("mousedown touchstart click", function(e) {
                c(n);
                var t = y("#select2-drop"),
                  s;
                if (t.length > 0) {
                  s = t.data("select2");
                  if (s.opts.selectOnBlur) {
                    s.selectHighlighted({
                      noFocus: true
                    })
                  }
                  s.close();
                  e.preventDefault();
                  e.stopPropagation()
                }
              })
            }
            if (this.dropdown.prev()[0] !== n[0]) {
              this.dropdown.before(n)
            }
            y("#select2-drop").removeAttr("id");
            this.dropdown.attr("id", "select2-drop");
            n.show();
            this.positionDropdown();
            this.dropdown.show();
            this.positionDropdown();
            this.dropdown.addClass("select2-drop-active");
            var o = this;
            this.container.parents().add(window).each(function() {
              y(this).on(s + " " + t + " " + i, function(e) {
                if (o.opened()) o.positionDropdown()
              })
            })
          },
          close: function() {
            if (!this.opened()) return;
            var e = this.containerEventName,
              t = "scroll." + e,
              s = "resize." + e,
              i = "orientationchange." + e;
            this.container.parents().add(window).each(function() {
              y(this).off(t).off(s).off(i)
            });
            this.clearDropdownAlignmentPreference();
            y("#select2-drop-mask").hide();
            this.dropdown.removeAttr("id");
            this.dropdown.hide();
            this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active");
            this.results.empty();
            o.off("mousemove.select2Event");
            this.clearSearch();
            this.search.removeClass("select2-active");
            this.opts.element.trigger(y.Event("select2-close"))
          },
          externalSearch: function(e) {
            this.open();
            this.search.val(e);
            this.updateResults(false)
          },
          clearSearch: function() {},
          getMaximumSelectionSize: function() {
            return N(this.opts.maximumSelectionSize, this.opts.element)
          },
          ensureHighlightVisible: function() {
            var e = this.results,
              t, s, i, n, o, r, a, l;
            s = this.highlight();
            if (s < 0) return;
            if (s == 0) {
              e.scrollTop(0);
              return
            }
            t = this.findHighlightableChoices().find(".select2-result-label");
            i = y(t[s]);
            l = (i.offset() || {}).top || 0;
            n = l + i.outerHeight(true);
            if (s === t.length - 1) {
              a = e.find("li.select2-more-results");
              if (a.length > 0) {
                n = a.offset().top + a.outerHeight(true)
              }
            }
            o = e.offset().top + e.outerHeight(true);
            if (n > o) {
              e.scrollTop(e.scrollTop() + (n - o))
            }
            r = l - e.offset().top;
            if (r < 0 && i.css("display") != "none") {
              e.scrollTop(e.scrollTop() + r)
            }
          },
          findHighlightableChoices: function() {
            return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)")
          },
          moveHighlight: function(e) {
            var t = this.findHighlightableChoices(),
              s = this.highlight();
            while (s > -1 && s < t.length) {
              s += e;
              var i = y(t[s]);
              if (i.hasClass("select2-result-selectable") && !i.hasClass("select2-disabled") && !i.hasClass("select2-selected")) {
                this.highlight(s);
                break
              }
            }
          },
          highlight: function(e) {
            var t = this.findHighlightableChoices(),
              s, i;
            if (arguments.length === 0) {
              return u(t.filter(".select2-highlighted")[0], t.get())
            }
            if (e >= t.length) e = t.length - 1;
            if (e < 0) e = 0;
            this.removeHighlight();
            s = y(t[e]);
            s.addClass("select2-highlighted");
            this.search.attr("aria-activedescendant", s.find(".select2-result-label").attr("id"));
            this.ensureHighlightVisible();
            this.liveRegion.text(s.text());
            i = s.data("select2-data");
            if (i) {
              this.opts.element.trigger({
                type: "select2-highlight",
                val: this.id(i),
                choice: i
              })
            }
          },
          removeHighlight: function() {
            this.results.find(".select2-highlighted").removeClass("select2-highlighted")
          },
          touchMoved: function() {
            this._touchMoved = true
          },
          clearTouchMoved: function() {
            this._touchMoved = false
          },
          countSelectableResults: function() {
            return this.findHighlightableChoices().length
          },
          highlightUnderEvent: function(e) {
            var t = y(e.target).closest(".select2-result-selectable");
            if (t.length > 0 && !t.is(".select2-highlighted")) {
              var s = this.findHighlightableChoices();
              this.highlight(s.index(t))
            } else if (t.length == 0) {
              this.removeHighlight()
            }
          },
          loadMoreIfNeeded: function() {
            var t = this.results,
              s = t.find("li.select2-more-results"),
              e, i = this.resultsPage + 1,
              n = this,
              o = this.search.val(),
              r = this.context;
            if (s.length === 0) return;
            e = s.offset().top - t.offset().top - t.height();
            if (e <= this.opts.loadMorePadding) {
              s.addClass("select2-active");
              this.opts.query({
                element: this.opts.element,
                term: o,
                page: i,
                context: r,
                matcher: this.opts.matcher,
                callback: this.bind(function(e) {
                  if (!n.opened()) return;
                  n.opts.populateResults.call(this, t, e.results, {
                    term: o,
                    page: i,
                    context: r
                  });
                  n.postprocessResults(e, false, false);
                  if (e.more === true) {
                    s.detach().appendTo(t).text(N(n.opts.formatLoadMore, n.opts.element, i + 1));
                    window.setTimeout(function() {
                      n.loadMoreIfNeeded()
                    }, 10)
                  } else {
                    s.remove()
                  }
                  n.positionDropdown();
                  n.resultsPage = i;
                  n.context = e.context;
                  this.opts.element.trigger({
                    type: "select2-loaded",
                    items: e
                  })
                })
              })
            }
          },
          tokenize: function() {},
          updateResults: function(s) {
              var i = this.search,
                n = this.results,
                o = this.opts,
                e, r = this,
                t, a = i.val(),
                l = y.data(this.container, "select2-last-term"),
                c;
              if (s !== true && l && d(a, l)) return;
              y.data(this.container, "select2-last-term", a);
              if (s !== true && (this.showSearchInput === false || !this.opened())) {
                return
              }

              function h() {
                i.removeClass("select2-active");
                r.positionDropdown();
                if (n.find(".select2-no-results,.select2-selection-limit,.select2-searching").length) {
                  r.liveRegion.text(n.text())
                } else {
                  r.liveRegion.text(r.opts.formatMatches(n.find(".select2-result-selectable").length))
                }
              }

              function u(e) {
                n.html(e);
                h()
              }
              c = ++this.queryCount;
              var f = this.getMaximumSelectionSize();
              if (f >= 1) {
                e = this.data();
                if (y.isArray(e) && e.length >= f && M(o.formatSelectionTooBig, "formatSelectionTooBig")) {
                  u("<li class='select2-selection-limit'>" + N(o.formatSelectionTooBig, o.element, f) + "</li>");
                  return
                }
              }
              if (i.val().length < o.minimumInputLength) {
                if (M(o.formatInputTooShort, "formatInputTooShort")) {
                  u("<li class='select2-no-results'>" + N(o.formatInputTooShort, o.element, i.val(), o.minimumInputLength) + "</li>")
                } else {
                  u("")
                }
                if (s && this.showSearch) this.showSearch(true);
                return
              }
              if (o.maximumInputLength && i.val().length > o.maximumInputLength) {
                if (M(o.formatInputTooLong, "formatInputTooLong")) {
                  u("<li class='select2-no-results'>" + N(o.formatInputTooLong, o.element, i.val(), o.maximumInputLength) + "</li>")
                } else {
                  u("")
                }
                return
              }
              if (o.formatSearching && this.findHighlightableChoices().length === 0) {
                u("<li class='select2-searching'>" + N(o.formatSearching, o.element) + "</li>")
              }
              i.addClass("select2-active");
              this.removeHighlight();
              t = this.tokenize();
              if (t != C && t != null) {
                i.val(t)
              }
              this.resultsPage = 1;
              o.query({
                    element: o.element,
                    term: i.val(),
                    page: this.resultsPage,
                    context: null,
                    matcher: o.matcher,
                    callback: this.bind(function(e) {
                          var t;
                          if (c != this.queryCount) {
                            return
                          }
                          if (!this.opened()) {
                            this.search.removeClass("select2-active");
                            return
                          }
                          if (e.hasError !== C && M(o.formatAjaxError, "formatAjaxError")) {
                            u("<li class='select2-ajax-error'>" + N(o.formatAjaxError, o.element, e.jqXHR, e.textStatus, e.errorThrown) + "</li>");
                            return
                          }
                          this.context = e.context === C ? null : e.context;
                          if (this.opts.createSearchChoice && i.val() !== "") {
                            t = this.opts.createSearchChoice.call(r, i.val(), e.results);
                            if (t !== C && t !== null && r.id(t) !== C && r.id(t) !== null) {
                              if (y(e.results).filter(function() {
                                  return d(r.id(this), r.id(t))
                                }).length === 0) {
                                this.opts.createSearchChoicePosition(e.results, t)
                              }
                            }
                          }
                          if (e.results.length === 0 && M(o.formatNoMatches, "formatNoMatches"))