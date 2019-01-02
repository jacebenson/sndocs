/*
 * Called from Parent Breadcrumbs formatter via the parent_crumbs ui macro. 
 * Used to show the hierarchy of parent records.
 */
var ParentCrumbs = Class.create();
ParentCrumbs.prototype = {

    initialize: function(/*GlideRecord*/gr) {
        this.crumbs = "";
        this.titleField = "";
        this.labelField = "";
        this.child = gr;
        this.limit = 6; //limit to 6 parents
        this.limitCounter = 1;
        this.recordsSeen = new Object();
    },

    /**
     * get the breadcrumb string with html formatting
     */
    getCrumbs: function() {
        if (!this.child || !this.child.isValidRecord() || this.child.parent.nil())
            return;

        this._addCrumb(this.child, false);
        this._buildParentCrumb(this.child);

        return this.crumbs;
    },

    /**
     * set optional label field, used to get the label value to show in the
     * breadcrumbs defaults to getDisplayValue() if not specified or an invalid
     * field is specified
     * 
     * @param String field - field name
     */
    setLabelField: function(field) {
        this.labelField = field;
    },

    /**
     * set optional title field, used to get the html title (hover) value
     * defaults to getDisplayValue() if not specified or an invalid field is
     * specified
     * 
     * @param String field - field name
     */
    setTitleField: function(field) {
        this.titleField = field;
    },

    _getLabelField: function(gr) {
        if (this.labelField != "" && this._isValidField(gr, this.labelField))
            return this.labelField;
        else
            return null;
    },

    _getTitleField: function(gr) {
        if (this.titleField != "" && this._isValidField(gr, this.titleField))
            return this.titleField;
        else if (this._isValidField(gr, "short_description"))
            return "short_description";
    },

    _buildParentCrumb: function(gr) {
        var parent = gr.parent.getRefRecord();
        this._addCrumb(parent, true);

        if (!parent.parent.nil()) {
            //check for parent limit
            if (this.limitCounter >= this.limit) {
                gs.log("ParentCrumbs - parent count limit (" + this.limit + " reached while processing: " + this.child.getDisplayValue());
                this._addTooManyParentsInfo();
                return;
            }

            //check for recursion
            if (this.recordsSeen[parent.getUniqueValue()]) {
                gs.log("ParentCrumbs parent recursion found while processing: " + this.child.getDisplayValue());
                return;
            }

            //track parents processed
            this.recordsSeen[parent.getUniqueValue()] = true;

            //increment counter
            this.limitCounter++;

            //process the parent
            this._buildParentCrumb(parent);
        }
    },

    _isValidField: function(gr, field) {
        if (gr.isValidField(field))
            return true;
    },

    _addTooManyParentsInfo: function() {
        var tooManyParents = gs.getMessage("too many parents");
        this.crumbs = "<a title='" + tooManyParents + "'> ... > " + this.crumbs;
    },

    _addCrumb: function(gr, addLink) {
        var labelField = this._getLabelField(gr);
        var titleField = this._getTitleField(gr);

        var link = gr.getLink(false);

        var label;
        if (labelField)
            label = gr.getValue(labelField);
        else
            label = gr.getDisplayValue();
        label = GlideStringUtil.escapeHTML(label);
        
        var title;
        if (titleField)
            title = gr.getValue(titleField);
        else
            title = "";
        title = GlideStringUtil.escapeHTML(title);

        if (addLink)
            var html = '<a class="breadcrumb" dir="' + GlideI18NStyle.getDirection() + '" href="' + link + '" title="' + title + '">' + label + '</a>';
        else
            var html = label;

        if (this.crumbs == "")
            this.crumbs = html;
        else if (this.crumbs.indexOf('<a class="breadcrumb"') > -1)
            this.crumbs = html + " > " + this.crumbs;
		else
			this.crumbs = html + ' > <span class="breadcrumb" dir="' + GlideI18NStyle.getDirection() + '">' + this.crumbs + '</span>';
    }

}