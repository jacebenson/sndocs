/*! RESOURCE: /scripts/classes/GlideTabs2Tab.js */
var GlideTabs2Tab = Class.create({
  initialize: function(parent, index, caption, classPrefix) {
    this.caption = caption.replace(/\s/g, "\u00a0");
    this.parent = parent;
    this.index = index;
    this.element = cel("span");
    var e = this.element;
    if (!classPrefix)
      this.classPrefix = "tabs2";
    else
      this.classPrefix = classPrefix;
    e.className = this.classPrefix + '_tab';
    e.tabIndex = "0";
    this.mandatorySpan = this._createMandatorySpan();
    e.appendChild(this.mandatorySpan);
    var c = cel("span");
    c.className = "tab_caption_text";
    c.innerHTML = this.caption;
    e.appendChild(c);
    if (isTextDirectionRTL() && (isMSIE6 || isMSIE7 || isMSIE8 || (isMSIE9 && !getTopWindow().document.getElementById('edge_west'))))
      e.className = e.className + ' tabs2_tab_ie';
    Event.observe(e, 'click', this.onClick.bind(this));
    Event.observe(e, 'mouseover', this.onMouseOver.bind(this));
    Event.observe(e, 'mouseout', this.onMouseOut.bind(this));
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
    this.mandatorySpan.style.display = yesNo ? 'none' : 'inline-block';
    if (!isDoctype())
      this.mandatorySpan.style.visibility = yesNo ? 'hidden' : '';
  },
  _createMandatorySpan: function() {
    var answer = cel("span");
    answer.style.marginRight = '2px';
    if (isDoctype()) {
      answer.setAttribute('mandatory', 'true');
      answer.className = 'label_description';
      answer.innerHTML = '*';
      answer.style.display = 'none';
    } else {
      answer.style.visibility = 'hidden';
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