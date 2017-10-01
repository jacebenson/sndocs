/*! RESOURCE: /scripts/classes/UserRolesElement.js */
var UserRolesElement = Class.create({
    initialize: function(name) {
        this.name = name;
        this._initializeEvents();
    },
    setReadOnly: function(disabled) {
        var lockElement = gel(this.name + "_lock");
        if (disabled) {
            if (lockElement)
                hideObject(lockElement);
            var unlockElement = gel(this.name + "_unlock");
            lock(unlockElement, this.name, this.name + '_edit', this.name + '_nonedit', this.name + 'select_1', this.name + '_nonedit');
            hideObject(unlockElement);
        } else {
            if (lockElement && lockElement.style.display != "none")
                return true;
            var unlockElement = gel(this.name + "_unlock");
            if (isDoctype())
                showObjectInlineBlock(unlockElement);
            else
                showObjectInline(unlockElement);
        }
        gel(this.name).disabled = disabled;
        return true;
    },
    isDisabled: function() {
        var lockElement = $(this.name + "_lock");
        if (lockElement && lockElement.visible())
            return false;
        var unlockElement = $(this.name + "_unlock");
        if (unlockElement && unlockElement.visible())
            return false;
        return true;
    },
    setValue: function(newValue) {
        var hiddenElement = $(this.name);
        var visibleElement = $(this.name + "select_1");
        this.visibleElementId = visibleElement.id;
        var leftSideSelect = $(this.name + "select_0");
        hiddenElement.value = "";
        visibleElement.options.length = 0;
        if (typeof newValue == "string" && newValue != "")
            newValue = newValue.split(",");
        for (var i = 0; i < newValue.length; i++) {
            var value = newValue[i];
            for (var d = leftSideSelect.length - 1; d >= 0; d--) {
                if (leftSideSelect.options[d].value == value) {
                    leftSideSelect.remove(d);
                }
            }
            this._setValue(value);
        }
        this._updateNonEditValue(newValue);
        UserRolesElement.buildSelectList(this.name, true);
        onChange(this.name);
    },
    keyDownLeft: function(evt) {
        var key = evt.keyCode;
        if (this._isSpaceOrEnterKey(key))
            this.selectRole();
    },
    keyDownRight: function(evt) {
        var key = evt.keyCode;
        if (this._isSpaceOrEnterKey(key))
            this.deselectRole();
    },
    _isSpaceOrEnterKey: function(keycode) {
        return keycode == 32 || keycode == 13;
    },
    selectRole: function() {
        moveOption($(this.name + 'select_0'), $(this.name + 'select_1'), '--None--', [], '--None--');
        UserRolesElement.buildSelectList(this.name, true);
    },
    deselectRole: function() {
        moveOption($(this.name + 'select_1'), $(this.name + 'select_0'), '--None--', [], '--None--');
        UserRolesElement.buildSelectList(this.name, true);
    },
    _setValue: function(value) {
        if (!value)
            return;
        var select = new Select(this.visibleElementId);
        if (select.contains(value))
            return;
        select.addOption(value, value);
        select = null;
    },
    _updateNonEditValue: function(newValue) {
        var elem = $(this.name + '_nonedit');
        if (newValue.length < 2) {
            elem
                .setStyle('display', 'inline-block')
                .update(newValue);
        } else {
            elem
                .setStyle('display', 'inline-block')
                .update(newValue.join(', '));
        }
    },
    _initializeEvents: function() {
        $(this.name + 'select_0').on('keydown', this.keyDownLeft.bind(this));
        $(this.name + 'select_0').on('dblclick', this.selectRole.bind(this));
        $(this.name + 'select_1').on('keydown', this.keyDownRight.bind(this));
        $(this.name + 'select_1').on('dblclick', this.deselectRole.bind(this));
        $(this.name + '_edit').on('click', '[data-action="add"]', this.selectRole.bind(this));
        $(this.name + '_edit').on('click', '[data-action="remove"]', this.deselectRole.bind(this));
    }
});
UserRolesElement.buildSelectList = function(ref, performOnChange) {
    var sel0 = $(ref + 'select_0');
    var sel1 = $(ref + 'select_1');
    var available = $(ref + 'available');
    var selected = $(ref);
    saveAllSelected([sel0, sel1], [available, selected], ',', '\\', '--None--');
    if (performOnChange == false)
        return;
    onChange(ref);
}
UserRolesElement.userRolesMaxWidth = function(ref) {
    var minWidth = 120;
    var scrollPad = 12;
    if (isMSIE)
        scrollPad = 0;
    var prefix = ref + "select_";
    var select0 = gel(prefix + "0");
    minWidth = Math.max(select0.clientWidth + scrollPad, minWidth);
    var select1 = gel(prefix + "1");
    minWidth = Math.max(select1.clientWidth + scrollPad, minWidth);
    select0.style.width = minWidth + "px";
    select1.style.width = minWidth + "px";
};