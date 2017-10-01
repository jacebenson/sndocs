/*! RESOURCE: /scripts/doctype/GwtListEditCalendar.js */
var GwtListEditCalendar = Class.create(GwtListEditWindow, {
    createEditControls: function() {
        ScriptLoader.getScripts('scripts/classes/GwtDateTimePicker.js', this._start.bind(this));
        return false;
    },
    _start: function() {
        var html = this._createCalendarHTML();
        this.setTitle(html);
        if (g_full_calendar_edit)
            $('cell_edit_window').addClassName('hide_input_edit');
        this.createEditControlsComplete();
    },
    save: function() {
        var input = GwtListEditWindow.getCellEditValue();
        if (input) {
            this.setValue(null, input.value);
            this.setRenderValue(input.value);
        }
        this.saveAndClose();
        this.gridEdit.refreshCursor();
    },
    dismiss: function($super) {
        this._dismissCalendar();
        if (GwtListEditWindow.inputID) {
            var input = GwtListEditWindow.getCellEditValue();
            if (input)
                input.onfocus = null;
        }
        $super();
        this.gridEdit.refreshCursor();
    },
    _dismissCalendar: function() {
        this.cal = null;
    },
    _createCalendarHTML: function() {
        var answer = cel('div');
        var input = this.createTextInput();
        input.value = this.editor.getDisplayValue();
        answer.style.borderSpacing = '0';
        answer.className = 'input-group';
        answer.appendChild(input);
        input.onfocus = this.onFocus.bind(this);
        var img = createIcon('icon-calendar', getMessage("Choose date..."), this, this._showCalendar.bind(this));
        img.id = this.type();
        img = img.wrap('span', {
            'class': 'input-group-addon'
        });
        answer.appendChild(img);
        return answer;
    },
    onFocus: function() {
        var input = GwtListEditWindow.getCellEditValue();
        if (input)
            input.onfocus = null;
        this._showCalendar();
        if (g_full_calendar_edit)
            this._hideInput();
    },
    _hideInput: function() {
        var cell = this.getAnchorCell();
        var leftPosition = this._getOffsetLeft(cell);
        $j('#cell_edit_window').css({
            'display': 'none'
        });
        var calHeight = $j('#GwtDateTimePicker').height();
        var top = this._getOffsetTop(cell);
        var bottomClearance = getBrowserWindowHeight() - $(cell).viewportOffset().top - $(cell).getHeight();
        if (bottomClearance < calHeight) {
            top = top - calHeight + bottomClearance;
        }
        $j('#GwtDateTimePicker').css({
            'top': top,
            'left': leftPosition,
            'z-index': 1
        });
    },
    _showCalendar: function() {
        if (gel("GwtDateTimePicker"))
            return;
        var format;
        var useTime;
        if (this.editor.tableElement.isDateTime()) {
            format = g_user_date_time_format;
            useTime = true;
        } else
            format = g_user_date_format;
        this.cal = new GwtDateTimePicker(GwtListEditWindow.inputID, format, useTime);
        this.cal.on('save', this.save.bind(this));
        this.cal.on('cancel', this.dismiss.bind(this));
        this.addMultipleEditMsg();
        return false;
    },
    addMultipleEditMsg: function() {
        if (!window.g_full_calendar_edit)
            return;
        var msgStr;
        if (this.numCanEdit == 1)
            return;
        else
            msgStr = this.numCanEdit + this.msgRowsUpdated;
        if (this.numCannotEdit > 0) {
            msgStr = msgStr + "<br/>";
            if (this.numCannotEdit == 1)
                msgStr += this.msgRowNotUpdated;
            else
                msgStr += this.numCannotEdit + this.msgRowsNotUpdated;
        }
        var div = new Element('div');
        div.style.marginTop = 2;
        div.style.fontWeight = "normal";
        div.update(msgStr);
        $('window.GwtDateTimePicker').appendChild(div);
    },
    toString: function() {
        return "GwtListEditCalendar";
    }
});;