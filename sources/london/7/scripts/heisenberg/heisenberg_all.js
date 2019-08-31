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
          this.$element.