/*! RESOURCE: /scripts/classes/GlideFilterDescription.js */
var GlideFilterDescription = Class.create({
  initialize: function() {},
  choices: null,
  setParsedQuery: function(strVal) {
    this.parsedQuery = strVal;
  },
  getParsedQuery: function() {
    return this.parsedQuery;
  },
  setBaseLine: function(value) {
    this.baseLine = value;
  },
  getBaseLine: function() {
    return this.baseLine;
  },
  setMetaData: function(value) {
    this.metaData = value;
  },
  getMetaData: function() {
    return this.metaData;
  },
  setPreferenceParam: function(value) {
    this.preference = value;
  },
  getPreferenceParam: function() {
    return this.preference;
  },
  setExpanded: function(value) {
    this.expanded = value;
  },
  getExpanded: function() {
    return this.expanded;
  },
  setName: function(value) {
    this.name = value;
  },
  getName: function() {
    return this.name;
  },
  setFilter: function(value) {
    this.filter = value;
  },
  getFilter: function() {
    return this.filter;
  },
  setTableName: function(value) {
    this.tableName = value;
  },
  getTableName: function() {
    return this.tableName;
  },
  setPinned: function(value) {
    this.pinned = value;
  },
  getPinned: function() {
    return this.pinned;
  },
  setMainFilterTable: function(filterTable) {
    this.mainFilterTable = filterTable;
  },
  getMainFilterTable: function() {
    return this.mainFilterTable;
  },
  setPinnable: function(value) {
    this.pinnable = value;
  },
  getPinnable: function() {
    return this.pinnable;
  },
  setShowRelated: function(value) {
    this.showRelated = value;
  },
  getShowRelated: function() {
    return this.showRelated;
  },
  setChoiceListMap: function(value) {
    this.choiceList = value;
  },
  getChoiceList: function(table) {
    if (typeof this.choiceList == 'undefined')
      return null;
    return this.choiceList[table];
  }
});;