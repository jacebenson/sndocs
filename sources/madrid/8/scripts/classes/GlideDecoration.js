/*! RESOURCE: /scripts/classes/GlideDecoration.js */
var GlideDecoration = Class.create({
      EDIT_DECORATION: "images/editor_view_small.gifx",
      initialize: function(node) {
        this.type = node.getAttribute('type');
        this.iconSRC = node.getAttribute('iconSRC');
        var left = node.getAttribute('left');
        if (left == 'true')
          this.left = true;
        else
          this.left = false;
        if (this.type == 'popup') {
          this.onMouseMove = node.getAttribute('onMouseMove');
          this.onMouseExit = node.getAttribute('onMouseOut');
        } else if (this.type == 'expandCollapseDecoration') {
          this.expandedIcon = node.getAttribute('expandedIcon');
          this.collapsedIcon = node.getAttribute('collapsedIcon');
          this.expandedIconAlt = node.getAttribute('expandedIconAlt');
          this.collapsedIconAlt = node.getAttribute('collapsedIconAlt');
          this.memory = node.getAttribute('memory');
          this.expanded = node.getAttribute('expanded');
          this.altText = node.getAttribute("collapsedText");
        } else if (this.type == 'editDecoration') {
          this.editLink = node.getAttribute('editLink');
        }
      },
      attach: function(window) {
        if (this.type == 'image')
          this.attachImage(window);
        else if (this.type == 'popup')
          this.attachPopup(window);
        else if (this.type == 'expandCollapseDecoration')
          this.attachExpandCollapse(window);
        else if (this.type == 'editDecoration')
          this.attachEdit(window);
      },
      attachImage: function(window) {
        var decoration = cel('img');
        decoration.setAttribute('src', this.iconSRC);
        decoration.setAttribute('alt', '');
        window.addDecoration(decoration, this.left);
      },
      attachEdit: function(window) {
          var an = cel('a');
          var d = cel('img');
          d.src = this.EDIT_DECORATION;
          d.alt = getMessage('Edit');
          if (this.editLink.indexOf('javascript:') == 0) {
            var toEval = this.editLink.substring('javascript:'.length);
            toEval = "var f = function(e) { if (!e) { e = event;}; " + toEval + "}";
            eval(toEval);
            an.onclick = f;
          } else
            an.href = this.editLink;
          an.appendChild(d);
          win