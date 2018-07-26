/*! RESOURCE: /scripts/sn/common/util/service.priorityQueue.js */
angular.module('sn.common.util').factory('priorityQueue', function() {
  'use strict';
  return function(comparator) {
    var items = [];
    var compare = comparator || function(a, b) {
      return a - b;
    };
    var swap = function(a, b) {
      var temp = items[a];
      items[a] = items[b];
      items[b] = temp;
    };
    var bubbleUp = function(pos) {
      var parent;
      while (pos > 0) {
        parent = (pos - 1) >> 1;
        if (compare(items[pos], items[parent]) >= 0)
          break;
        swap(parent, pos);
        pos = parent;
      }
    };
    var bubbleDown = function(pos) {
      var left, right, min, last = items.length - 1;
      while (true) {
        left = (pos << 1) + 1;
        right = left + 1;
        min = pos;
        if (left <= last && compare(items[left], items[min]) < 0)
          min = left;
        if (right <= last && compare(items[right], items[min]) < 0)
          min = right;
        if (min === pos)
          break;
        swap(min, pos);
        pos = min;
      }
    };
    return {
      add: function(item) {
        items.push(item);
        bubbleUp(items.length - 1);
      },
      poll: function() {
        var first = items[0],
          last = items.pop();
        if (items.length > 0) {
          items[0] = last;
          bubbleDown(0);
        }
        return first;
      },
      peek: function() {
        return items[0];
      },
      clear: function() {
        items = [];
      },
      inspect: function() {
        return angular.toJson(items, true);
      },
      get size() {
        return items.length;
      },
      get all() {
        return items;
      },
      set comparator(fn) {
        compare = fn;
      }
    };
  };
});;