/*! RESOURCE: /scripts/classes/GlideTabs2Tab.js */
var GlideTabs2Tab = Class.create({
  initialize: function(parent, index, caption, classPrefix, isPreloaded) {
    var el;
    var tabs = isPreloaded ? $j('#tabs2_section').find('.tabs2_tab') : '';
    this.caption = caption.replace(/\s/g, "\u00a0");
    this.parent = parent;
    this.index = index;
    if (isPreloaded && tabs.length !== 0 && tabs[index]) {
      el = tabs[index];
      this.element = el;
      this.classPrefix = "tabs2";
      this.mandatorySpan = $j(el).find('[mandatory=true]')[0];
      this._createMandatorySpan(this.mandatorySpan);
    } else {
      this.element = cel("span");
      el = this.element;
      if (!classPrefix)
        this.classPrefix = "tabs2";
      else
        this.classPrefix = classPrefix;
      el.className = this.classPrefix + '_tab';
      el.tabIndex = "0";
      el.setAttribute('role', 'tab');
      this.mandatorySpan = this._createMandatorySpan();
      el.appendChild(this.mandatorySpan);
      var c = cel("span");
      c.className = "tab_caption_text";
      c.innerHTML = this.caption;
      el.appendChild(c);
    }
    if (isTextDirectionRTL() && (isMSIE6 || isMSIE7 || isMSIE8 || (isMSIE9 && !getTopWindow().document.getElementById('edge_west'))))
      $j(el).addClass('tabs2_tab_ie');
    Event.observe(el, 'click', this.onClick.bind(this));
    Event.observe(el, 'mouseover', this.onMouseOver.bind(this));
    Event.observe(el, 'mouseout', this.onMouseOut.bind(this));
  },
  setActive: function(yesNo) {
    if (yesNo) {
      addClassName(this.element, this.classPrefix + '_active');
      CustomEvent.fire("tab.activated", this.parent.className + (this.index + 1));
    } else
      removeClassName(this.element, this.classPrefix + '_active');
  },
  showTab: function(yesNo) {
    var display = 'none';
    if (yesNo)
      display = '';
    this.element.style.display = display;
    var elementParent = this.element.parentElement;
    if (!elementParent || elementParent.tagName != 'H3')
      return;
    var elementParentSibling = elementParent.nextSibling;
    if (elementParentSibling && elementParentSibling.tagName == 'IMG')
      elementParentSibling.style.display = display;
  },
  updateCaption: function(caption) {
    this.caption = caption;
    this.getElement().getElementsByClassName('tab_caption_text')[0].innerHTML = this.caption;
  },
  isVisible: function() {
    return this.element.style.display == '';
  },
  getElement: function() {
    return this.element;
  },
  onClick: function() {
    this.parent.setActive(this.index);
  },
  onMouseOver: function() {
    addClassName(this.element, this.classPrefix + '_hover');
  },
  onMouseOut: function() {
    removeClassName(this.element, this.classPrefix + '_hover');
  },
  markAsComplete: function(yesNo) {
    this.mandatorySpan.style.visibility = yesNo ? 'hidden' : '';
    if (isDoctype())
      this.mandatorySpan.style.display = yesNo ? 'none' : 'inline-block';
  },
  _createMandatorySpan: function(element) {
    var answer = element || cel("span");
    answer.style.marginRight = '2px';
    answer.style.visibility = 'hidden';
    if (isDoctype()) {
      answer.setAttribute('mandatory', 'true');
      answer.className = 'label_description';
      answer.innerHTML = '*';
      answer.style.display = 'none';
    } else {
      answer.className = 'mandatory';
      var img = cel("img", answer);
      img.src = 'images/s.gifx';
      img.alt = '';
      img.style.width = '4px';
      img.style.height = '12px';
      img.style.margin = '0px';
    }
    return answer;
  }
});;