/*! RESOURCE: /scripts/doctype/GwtCursor.js */
var GwtCursor = Class.create({
    initialize: function() {
        this.class = 'list_edit_cursor_cell';
        this.hidden = true;
    },
    isHidden: function() {
        return this.hidden;
    },
    hideCursor: function() {
        var self = this,
            tableCell = $j(document).find('.' + this.class);
        tableCell.each(function() {
            $j(this).removeClass(self.class).addClass('vt');
        });
        this.hidden = true;
    },
    createCursor: function(cell) {
        this.hideCursor();
        $j(cell).addClass(this.class);
        this.hidden = false;
    },
    toString: function() {
        return 'GwtCursor';
    }
});;