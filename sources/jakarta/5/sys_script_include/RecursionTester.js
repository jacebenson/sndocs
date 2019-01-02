gs.include("PrototypeServer");

var RecursionTester = Class.create();

RecursionTester.prototype = {
  initialize : function(table, field, targetField) {
    this.table = table;
    this.field = field; 
    if (targetField)
        this.targetField = targetField;
    else
        this.targetField = "sys_id";
  },

  isRecursive : function(/* GlideRecord */ gr) {
    if (gr[this.field].nil())
      return false; // no parent/target no recursion

    if (gr[this.field] == gr[this.targetField])
      return true; // cannot be your own parent/target

    this.abv = new Object();
    this.abv[gr[this.targetField] + ''] = true;
    if (!this._walkTree(gr[this.targetField]))
      return true;

    if (this.abv[current[this.field] + ''])
      return true;

    return false;
  },

  _walkTree : function(/* GlideElement */ p) {
    var gr = new GlideRecord(this.table);
    gr.addQuery(this.field, p);
    gr.query();
    while (gr.next()) {
        var child_id = gr[this.targetField] + '';
        if (this.abv[child_id])
            return false;

        this.abv[gr[this.targetField] + ''] = true;
        if (!this._walkTree(gr[this.targetField]))
            return false;
    }
    return true;
  }
}