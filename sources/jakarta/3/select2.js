/*! RESOURCE: /scripts/thirdparty/select2/select2.js */
(function($) {
  if (typeof $.fn.each2 == "undefined") {
    $.extend($.fn, {
      each2: function(c) {
        var j = $([0]),
          i = -1,
          l = this.length;
        while (
          ++i < l &&
          (j.context = j[0] = this[i]) &&
          c.call(j[0], i, j) !== false
        );
        return this;
      }
    });
  }
})(jQuery);
(function($, undefined) {
    "use strict";
    if (window.Select2 !== undefined) {
      return;
    }
    var KEY, AbstractSelect2, SingleSelect2, MultiSelect2, nextUid, sizer,
      lastMousePosition = {
        x: 0,
        y: 0
      },
      $document, scrollBarDimensions,
      KEY = {
        TAB: 9,
        ENTER: 13,
        ESC: 27,
        SPACE: 32,
        LEFT: 37,
        UP: 38,
        RIGHT: 39,
        DOWN: 40,
        SHIFT: 16,
        CTRL: 17,
        ALT: 18,
        PAGE_UP: 33,
        PAGE_DOWN: 34,
        HOME: 36,
        END: 35,
        BACKSPACE: 8,
        DELETE: 46,
        isArrow: function(k) {
          k = k.which ? k.which : k;
          switch (k) {
            case KEY.LEFT:
            case KEY.RIGHT:
            case KEY.UP:
            case KEY.DOWN:
              return true;
          }
          return false;
        },
        isControl: function(e) {
          var k = e.which;
          switch (k) {
            case KEY.SHIFT:
            case KEY.CTRL:
            case KEY.ALT:
              return true;
          }
          if (e.metaKey) return true;
          return false;
        },
        isFunctionKey: function(k) {
          k = k.which ? k.which : k;
          return k >= 112 && k <= 123;
        }
      },
      MEASURE_SCROLLBAR_TEMPLATE = "<div class='select2-measure-scrollbar'></div>",
      DIACRITICS = {
        "\u24B6": "A",
        "\uFF21": "A",
        "\u00C0": "A",
        "\u00C1": "A",
        "\u00C2": "A",
        "\u1EA6": "A",
        "\u1EA4": "A",
        "\u1EAA": "A",
        "\u1EA8": "A",
        "\u00C3": "A",
        "\u0100": "A",
        "\u0102": "A",
        "\u1EB0": "A",
        "\u1EAE": "A",
        "\u1EB4": "A",
        "\u1EB2": "A",
        "\u0226": "A",
        "\u01E0": "A",
        "\u00C4": "A",
        "\u01DE": "A",
        "\u1EA2": "A",
        "\u00C5": "A",
        "\u01FA": "A",
        "\u01CD": "A",
        "\u0200": "A",
        "\u0202": "A",
        "\u1EA0": "A",
        "\u1EAC": "A",
        "\u1EB6": "A",
        "\u1E00": "A",
        "\u0104": "A",
        "\u023A": "A",
        "\u2C6F": "A",
        "\uA732": "AA",
        "\u00C6": "AE",
        "\u01FC": "AE",
        "\u01E2": "AE",
        "\uA734": "AO",
        "\uA736": "AU",
        "\uA738": "AV",
        "\uA73A": "AV",
        "\uA73C": "AY",
        "\u24B7": "B",
        "\uFF22": "B",
        "\u1E02": "B",
        "\u1E04": "B",
        "\u1E06": "B",
        "\u0243": "B",
        "\u0182": "B",
        "\u0181": "B",
        "\u24B8": "C",
        "\uFF23": "C",
        "\u0106": "C",
        "\u0108": "C",
        "\u010A": "C",
        "\u010C": "C",
        "\u00C7": "C",
        "\u1E08": "C",
        "\u0187": "C",
        "\u023B": "C",
        "\uA73E": "C",
        "\u24B9": "D",
        "\uFF24": "D",
        "\u1E0A": "D",
        "\u010E": "D",
        "\u1E0C": "D",
        "\u1E10": "D",
        "\u1E12": "D",
        "\u1E0E": "D",
        "\u0110": "D",
        "\u018B": "D",
        "\u018A": "D",
        "\u0189": "D",
        "\uA779": "D",
        "\u01F1": "DZ",
        "\u01C4": "DZ",
        "\u01F2": "Dz",
        "\u01C5": "Dz",
        "\u24BA": "E",
        "\uFF25": "E",
        "\u00C8": "E",
        "\u00C9": "E",
        "\u00CA": "E",
        "\u1EC0": "E",
        "\u1EBE": "E",
        "\u1EC4": "E",
        "\u1EC2": "E",
        "\u1EBC": "E",
        "\u0112": "E",
        "\u1E14": "E",
        "\u1E16": "E",
        "\u0114": "E",
        "\u0116": "E",
        "\u00CB": "E",
        "\u1EBA": "E",
        "\u011A": "E",
        "\u0204": "E",
        "\u0206": "E",
        "\u1EB8": "E",
        "\u1EC6": "E",
        "\u0228": "E",
        "\u1E1C": "E",
        "\u0118": "E",
        "\u1E18": "E",
        "\u1E1A": "E",
        "\u0190": "E",
        "\u018E": "E",
        "\u24BB": "F",
        "\uFF26": "F",
        "\u1E1E": "F",
        "\u0191": "F",
        "\uA77B": "F",
        "\u24BC": "G",
        "\uFF27": "G",
        "\u01F4": "G",
        "\u011C": "G",
        "\u1E20": "G",
        "\u011E": "G",
        "\u0120": "G",
        "\u01E6": "G",
        "\u0122": "G",
        "\u01E4": "G",
        "\u0193": "G",
        "\uA7A0": "G",
        "\uA77D": "G",
        "\uA77E": "G",
        "\u24BD": "H",
        "\uFF28": "H",
        "\u0124": "H",
        "\u1E22": "H",
        "\u1E26": "H",
        "\u021E": "H",
        "\u1E24": "H",
        "\u1E28": "H",
        "\u1E2A": "H",
        "\u0126": "H",
        "\u2C67": "H",
        "\u2C75": "H",
        "\uA78D": "H",
        "\u24BE": "I",
        "\uFF29": "I",
        "\u00CC": "I",
        "\u00CD": "I",
        "\u00CE": "I",
        "\u0128": "I",
        "\u012A": "I",
        "\u012C": "I",
        "\u0130": "I",
        "\u00CF": "I",
        "\u1E2E": "I",
        "\u1EC8": "I",
        "\u01CF": "I",
        "\u0208": "I",
        "\u020A": "I",
        "\u1ECA": "I",
        "\u012E": "I",
        "\u1E2C": "I",
        "\u0197": "I",
        "\u24BF": "J",
        "\uFF2A": "J",
        "\u0134": "J",
        "\u0248": "J",
        "\u24C0": "K",
        "\uFF2B": "K",
        "\u1E30": "K",
        "\u01E8": "K",
        "\u1E32": "K",
        "\u0136": "K",
        "\u1E34": "K",
        "\u0198": "K",
        "\u2C69": "K",
        "\uA740": "K",
        "\uA742": "K",
        "\uA744": "K",
        "\uA7A2": "K",
        "\u24C1": "L",
        "\uFF2C": "L",
        "\u013F": "L",
        "\u0139": "L",
        "\u013D": "L",
        "\u1E36": "L",
        "\u1E38": "L",
        "\u013B": "L",
        "\u1E3C": "L",
        "\u1E3A": "L",
        "\u0141": "L",
        "\u023D": "L",
        "\u2C62": "L",
        "\u2C60": "L",
        "\uA748": "L",
        "\uA746": "L",
        "\uA780": "L",
        "\u01C7": "LJ",
        "\u01C8": "Lj",
        "\u24C2": "M",
        "\uFF2D": "M",
        "\u1E3E": "M",
        "\u1E40": "M",
        "\u1E42": "M",
        "\u2C6E": "M",
        "\u019C": "M",
        "\u24C3": "N",
        "\uFF2E": "N",
        "\u01F8": "N",
        "\u0143": "N",
        "\u00D1": "N",
        "\u1E44": "N",
        "\u0147": "N",
        "\u1E46": "N",
        "\u0145": "N",
        "\u1E4A": "N",
        "\u1E48": "N",
        "\u0220": "N",
        "\u019D": "N",
        "\uA790": "N",
        "\uA7A4": "N",
        "\u01CA": "NJ",
        "\u01CB": "Nj",
        "\u24C4": "O",
        "\uFF2F": "O",
        "\u00D2": "O",
        "\u00D3": "O",
        "\u00D4": "O",
        "\u1ED2": "O",
        "\u1ED0": "O",
        "\u1ED6": "O",
        "\u1ED4": "O",
        "\u00D5": "O",
        "\u1E4C": "O",
        "\u022C": "O",
        "\u1E4E": "O",
        "\u014C": "O",
        "\u1E50": "O",
        "\u1E52": "O",
        "\u014E": "O",
        "\u022E": "O",
        "\u0230": "O",
        "\u00D6": "O",
        "\u022A": "O",
        "\u1ECE": "O",
        "\u0150": "O",
        "\u01D1": "O",
        "\u020C": "O",
        "\u020E": "O",
        "\u01A0": "O",
        "\u1EDC": "O",
        "\u1EDA": "O",
        "\u1EE0": "O",
        "\u1EDE": "O",
        "\u1EE2": "O",
        "\u1ECC": "O",
        "\u1ED8": "O",
        "\u01EA": "O",
        "\u01EC": "O",
        "\u00D8": "O",
        "\u01FE": "O",
        "\u0186": "O",
        "\u019F": "O",
        "\uA74A": "O",
        "\uA74C": "O",
        "\u01A2": "OI",
        "\uA74E": "OO",
        "\u0222": "OU",
        "\u24C5": "P",
        "\uFF30": "P",
        "\u1E54": "P",
        "\u1E56": "P",
        "\u01A4": "P",
        "\u2C63": "P",
        "\uA750": "P",
        "\uA752": "P",
        "\uA754": "P",
        "\u24C6": "Q",
        "\uFF31": "Q",
        "\uA756": "Q",
        "\uA758": "Q",
        "\u024A": "Q",
        "\u24C7": "R",
        "\uFF32": "R",
        "\u0154": "R",
        "\u1E58": "R",
        "\u0158": "R",
        "\u0210": "R",
        "\u0212": "R",
        "\u1E5A": "R",
        "\u1E5C": "R",
        "\u0156": "R",
        "\u1E5E": "R",
        "\u024C": "R",
        "\u2C64": "R",
        "\uA75A": "R",
        "\uA7A6": "R",
        "\uA782": "R",
        "\u24C8": "S",
        "\uFF33": "S",
        "\u1E9E": "S",
        "\u015A": "S",
        "\u1E64": "S",
        "\u015C": "S",
        "\u1E60": "S",
        "\u0160": "S",
        "\u1E66": "S",
        "\u1E62": "S",
        "\u1E68": "S",
        "\u0218": "S",
        "\u015E": "S",
        "\u2C7E": "S",
        "\uA7A8": "S",
        "\uA784": "S",
        "\u24C9": "T",
        "\uFF34": "T",
        "\u1E6A": "T",
        "\u0164": "T",
        "\u1E6C": "T",
        "\u021A": "T",
        "\u0162": "T",
        "\u1E70": "T",
        "\u1E6E": "T",
        "\u0166": "T",
        "\u01AC": "T",
        "\u01AE": "T",
        "\u023E": "T",
        "\uA786": "T",
        "\uA728": "TZ",
        "\u24CA": "U",
        "\uFF35": "U",
        "\u00D9": "U",
        "\u00DA": "U",
        "\u00DB": "U",
        "\u0168": "U",
        "\u1E78": "U",
        "\u016A": "U",
        "\u1E7A": "U",
        "\u016C": "U",
        "\u00DC": "U",
        "\u01DB": "U",
        "\u01D7": "U",
        "\u01D5": "U",
        "\u01D9": "U",
        "\u1EE6": "U",
        "\u016E": "U",
        "\u0170": "U",
        "\u01D3": "U",
        "\u0214": "U",
        "\u0216": "U",
        "\u01AF": "U",
        "\u1EEA": "U",
        "\u1EE8": "U",
        "\u1EEE": "U",
        "\u1EEC": "U",
        "\u1EF0": "U",
        "\u1EE4": "U",
        "\u1E72": "U",
        "\u0172": "U",
        "\u1E76": "U",
        "\u1E74": "U",
        "\u0244": "U",
        "\u24CB": "V",
        "\uFF36": "V",
        "\u1E7C": "V",
        "\u1E7E": "V",
        "\u01B2": "V",
        "\uA75E": "V",
        "\u0245": "V",
        "\uA760": "VY",
        "\u24CC": "W",
        "\uFF37": "W",
        "\u1E80": "W",
        "\u1E82": "W",
        "\u0174": "W",
        "\u1E86": "W",
        "\u1E84": "W",
        "\u1E88": "W",
        "\u2C72": "W",
        "\u24CD": "X",
        "\uFF38": "X",
        "\u1E8A": "X",
        "\u1E8C": "X",
        "\u24CE": "Y",
        "\uFF39": "Y",
        "\u1EF2": "Y",
        "\u00DD": "Y",
        "\u0176": "Y",
        "\u1EF8": "Y",
        "\u0232": "Y",
        "\u1E8E": "Y",
        "\u0178": "Y",
        "\u1EF6": "Y",
        "\u1EF4": "Y",
        "\u01B3": "Y",
        "\u024E": "Y",
        "\u1EFE": "Y",
        "\u24CF": "Z",
        "\uFF3A": "Z",
        "\u0179": "Z",
        "\u1E90": "Z",
        "\u017B": "Z",
        "\u017D": "Z",
        "\u1E92": "Z",
        "\u1E94": "Z",
        "\u01B5": "Z",
        "\u0224": "Z",
        "\u2C7F": "Z",
        "\u2C6B": "Z",
        "\uA762": "Z",
        "\u24D0": "a",
        "\uFF41": "a",
        "\u1E9A": "a",
        "\u00E0": "a",
        "\u00E1": "a",
        "\u00E2": "a",
        "\u1EA7": "a",
        "\u1EA5": "a",
        "\u1EAB": "a",
        "\u1EA9": "a",
        "\u00E3": "a",
        "\u0101": "a",
        "\u0103": "a",
        "\u1EB1": "a",
        "\u1EAF": "a",
        "\u1EB5": "a",
        "\u1EB3": "a",
        "\u0227": "a",
        "\u01E1": "a",
        "\u00E4": "a",
        "\u01DF": "a",
        "\u1EA3": "a",
        "\u00E5": "a",
        "\u01FB": "a",
        "\u01CE": "a",
        "\u0201": "a",
        "\u0203": "a",
        "\u1EA1": "a",
        "\u1EAD": "a",
        "\u1EB7": "a",
        "\u1E01": "a",
        "\u0105": "a",
        "\u2C65": "a",
        "\u0250": "a",
        "\uA733": "aa",
        "\u00E6": "ae",
        "\u01FD": "ae",
        "\u01E3": "ae",
        "\uA735": "ao",
        "\uA737": "au",
        "\uA739": "av",
        "\uA73B": "av",
        "\uA73D": "ay",
        "\u24D1": "b",
        "\uFF42": "b",
        "\u1E03": "b",
        "\u1E05": "b",
        "\u1E07": "b",
        "\u0180": "b",
        "\u0183": "b",
        "\u0253": "b",
        "\u24D2": "c",
        "\uFF43": "c",
        "\u0107": "c",
        "\u0109": "c",
        "\u010B": "c",
        "\u010D": "c",
        "\u00E7": "c",
        "\u1E09": "c",
        "\u0188": "c",
        "\u023C": "c",
        "\uA73F": "c",
        "\u2184": "c",
        "\u24D3": "d",
        "\uFF44": "d",
        "\u1E0B": "d",
        "\u010F": "d",
        "\u1E0D": "d",
        "\u1E11": "d",
        "\u1E13": "d",
        "\u1E0F": "d",
        "\u0111": "d",
        "\u018C": "d",
        "\u0256": "d",
        "\u0257": "d",
        "\uA77A": "d",
        "\u01F3": "dz",
        "\u01C6": "dz",
        "\u24D4": "e",
        "\uFF45": "e",
        "\u00E8": "e",
        "\u00E9": "e",
        "\u00EA": "e",
        "\u1EC1": "e",
        "\u1EBF": "e",
        "\u1EC5": "e",
        "\u1EC3": "e",
        "\u1EBD": "e",
        "\u0113": "e",
        "\u1E15": "e",
        "\u1E17": "e",
        "\u0115": "e",
        "\u0117": "e",
        "\u00EB": "e",
        "\u1EBB": "e",
        "\u011B": "e",
        "\u0205": "e",
        "\u0207": "e",
        "\u1EB9": "e",
        "\u1EC7": "e",
        "\u0229": "e",
        "\u1E1D": "e",
        "\u0119": "e",
        "\u1E19": "e",
        "\u1E1B": "e",
        "\u0247": "e",
        "\u025B": "e",
        "\u01DD": "e",
        "\u24D5": "f",
        "\uFF46": "f",
        "\u1E1F": "f",
        "\u0192": "f",
        "\uA77C": "f",
        "\u24D6": "g",
        "\uFF47": "g",
        "\u01F5": "g",
        "\u011D": "g",
        "\u1E21": "g",
        "\u011F": "g",
        "\u0121": "g",
        "\u01E7": "g",
        "\u0123": "g",
        "\u01E5": "g",
        "\u0260": "g",
        "\uA7A1": "g",
        "\u1D79": "g",
        "\uA77F": "g",
        "\u24D7": "h",
        "\uFF48": "h",
        "\u0125": "h",
        "\u1E23": "h",
        "\u1E27": "h",
        "\u021F": "h",
        "\u1E25": "h",
        "\u1E29": "h",
        "\u1E2B": "h",
        "\u1E96": "h",
        "\u0127": "h",
        "\u2C68": "h",
        "\u2C76": "h",
        "\u0265": "h",
        "\u0195": "hv",
        "\u24D8": "i",
        "\uFF49": "i",
        "\u00EC": "i",
        "\u00ED": "i",
        "\u00EE": "i",
        "\u0129": "i",
        "\u012B": "i",
        "\u012D": "i",
        "\u00EF": "i",
        "\u1E2F": "i",
        "\u1EC9": "i",
        "\u01D0": "i",
        "\u0209": "i",
        "\u020B": "i",
        "\u1ECB": "i",
        "\u012F": "i",
        "\u1E2D": "i",
        "\u0268": "i",
        "\u0131": "i",
        "\u24D9": "j",
        "\uFF4A": "j",
        "\u0135": "j",
        "\u01F0": "j",
        "\u0249": "j",
        "\u24DA": "k",
        "\uFF4B": "k",
        "\u1E31": "k",
        "\u01E9": "k",
        "\u1E33": "k",
        "\u0137": "k",
        "\u1E35": "k",
        "\u0199": "k",
        "\u2C6A": "k",
        "\uA741": "k",
        "\uA743": "k",
        "\uA745": "k",
        "\uA7A3": "k",
        "\u24DB": "l",
        "\uFF4C": "l",
        "\u0140": "l",
        "\u013A": "l",
        "\u013E": "l",
        "\u1E37": "l",
        "\u1E39": "l",
        "\u013C": "l",
        "\u1E3D": "l",
        "\u1E3B": "l",
        "\u017F": "l",
        "\u0142": "l",
        "\u019A": "l",
        "\u026B": "l",
        "\u2C61": "l",
        "\uA749": "l",
        "\uA781": "l",
        "\uA747": "l",
        "\u01C9": "lj",
        "\u24DC": "m",
        "\uFF4D": "m",
        "\u1E3F": "m",
        "\u1E41": "m",
        "\u1E43": "m",
        "\u0271": "m",
        "\u026F": "m",
        "\u24DD": "n",
        "\uFF4E": "n",
        "\u01F9": "n",
        "\u0144": "n",
        "\u00F1": "n",
        "\u1E45": "n",
        "\u0148": "n",
        "\u1E47": "n",
        "\u0146": "n",
        "\u1E4B": "n",
        "\u1E49": "n",
        "\u019E": "n",
        "\u0272": "n",
        "\u0149": "n",
        "\uA791": "n",
        "\uA7A5": "n",
        "\u01CC": "nj",
        "\u24DE": "o",
        "\uFF4F": "o",
        "\u00F2": "o",
        "\u00F3": "o",
        "\u00F4": "o",
        "\u1ED3": "o",
        "\u1ED1": "o",
        "\u1ED7": "o",
        "\u1ED5": "o",
        "\u00F5": "o",
        "\u1E4D": "o",
        "\u022D": "o",
        "\u1E4F": "o",
        "\u014D": "o",
        "\u1E51": "o",
        "\u1E53": "o",
        "\u014F": "o",
        "\u022F": "o",
        "\u0231": "o",
        "\u00F6": "o",
        "\u022B": "o",
        "\u1ECF": "o",
        "\u0151": "o",
        "\u01D2": "o",
        "\u020D": "o",
        "\u020F": "o",
        "\u01A1": "o",
        "\u1EDD": "o",
        "\u1EDB": "o",
        "\u1EE1": "o",
        "\u1EDF": "o",
        "\u1EE3": "o",
        "\u1ECD": "o",
        "\u1ED9": "o",
        "\u01EB": "o",
        "\u01ED": "o",
        "\u00F8": "o",
        "\u01FF": "o",
        "\u0254": "o",
        "\uA74B": "o",
        "\uA74D": "o",
        "\u0275": "o",
        "\u01A3": "oi",
        "\u0223": "ou",
        "\uA74F": "oo",
        "\u24DF": "p",
        "\uFF50": "p",
        "\u1E55": "p",
        "\u1E57": "p",
        "\u01A5": "p",
        "\u1D7D": "p",
        "\uA751": "p",
        "\uA753": "p",
        "\uA755": "p",
        "\u24E0": "q",
        "\uFF51": "q",
        "\u024B": "q",
        "\uA757": "q",
        "\uA759": "q",
        "\u24E1": "r",
        "\uFF52": "r",
        "\u0155": "r",
        "\u1E59": "r",
        "\u0159": "r",
        "\u0211": "r",
        "\u0213": "r",
        "\u1E5B": "r",
        "\u1E5D": "r",
        "\u0157": "r",
        "\u1E5F": "r",
        "\u024D": "r",
        "\u027D": "r",
        "\uA75B": "r",
        "\uA7A7": "r",
        "\uA783": "r",
        "\u24E2": "s",
        "\uFF53": "s",
        "\u00DF": "s",
        "\u015B": "s",
        "\u1E65": "s",
        "\u015D": "s",
        "\u1E61": "s",
        "\u0161": "s",
        "\u1E67": "s",
        "\u1E63": "s",
        "\u1E69": "s",
        "\u0219": "s",
        "\u015F": "s",
        "\u023F": "s",
        "\uA7A9": "s",
        "\uA785": "s",
        "\u1E9B": "s",
        "\u24E3": "t",
        "\uFF54": "t",
        "\u1E6B": "t",
        "\u1E97": "t",
        "\u0165": "t",
        "\u1E6D": "t",
        "\u021B": "t",
        "\u0163": "t",
        "\u1E71": "t",
        "\u1E6F": "t",
        "\u0167": "t",
        "\u01AD": "t",
        "\u0288": "t",
        "\u2C66": "t",
        "\uA787": "t",
        "\uA729": "tz",
        "\u24E4": "u",
        "\uFF55": "u",
        "\u00F9": "u",
        "\u00FA": "u",
        "\u00FB": "u",
        "\u0169": "u",
        "\u1E79": "u",
        "\u016B": "u",
        "\u1E7B": "u",
        "\u016D": "u",
        "\u00FC": "u",
        "\u01DC": "u",
        "\u01D8": "u",
        "\u01D6": "u",
        "\u01DA": "u",
        "\u1EE7": "u",
        "\u016F": "u",
        "\u0171": "u",
        "\u01D4": "u",
        "\u0215": "u",
        "\u0217": "u",
        "\u01B0": "u",
        "\u1EEB": "u",
        "\u1EE9": "u",
        "\u1EEF": "u",
        "\u1EED": "u",
        "\u1EF1": "u",
        "\u1EE5": "u",
        "\u1E73": "u",
        "\u0173": "u",
        "\u1E77": "u",
        "\u1E75": "u",
        "\u0289": "u",
        "\u24E5": "v",
        "\uFF56": "v",
        "\u1E7D": "v",
        "\u1E7F": "v",
        "\u028B": "v",
        "\uA75F": "v",
        "\u028C": "v",
        "\uA761": "vy",
        "\u24E6": "w",
        "\uFF57": "w",
        "\u1E81": "w",
        "\u1E83": "w",
        "\u0175": "w",
        "\u1E87": "w",
        "\u1E85": "w",
        "\u1E98": "w",
        "\u1E89": "w",
        "\u2C73": "w",
        "\u24E7": "x",
        "\uFF58": "x",
        "\u1E8B": "x",
        "\u1E8D": "x",
        "\u24E8": "y",
        "\uFF59": "y",
        "\u1EF3": "y",
        "\u00FD": "y",
        "\u0177": "y",
        "\u1EF9": "y",
        "\u0233": "y",
        "\u1E8F": "y",
        "\u00FF": "y",
        "\u1EF7": "y",
        "\u1E99": "y",
        "\u1EF5": "y",
        "\u01B4": "y",
        "\u024F": "y",
        "\u1EFF": "y",
        "\u24E9": "z",
        "\uFF5A": "z",
        "\u017A": "z",
        "\u1E91": "z",
        "\u017C": "z",
        "\u017E": "z",
        "\u1E93": "z",
        "\u1E95": "z",
        "\u01B6": "z",
        "\u0225": "z",
        "\u0240": "z",
        "\u2C6C": "z",
        "\uA763": "z",
        "\u0386": "\u0391",
        "\u0388": "\u0395",
        "\u0389": "\u0397",
        "\u038A": "\u0399",
        "\u03AA": "\u0399",
        "\u038C": "\u039F",
        "\u038E": "\u03A5",
        "\u03AB": "\u03A5",
        "\u038F": "\u03A9",
        "\u03AC": "\u03B1",
        "\u03AD": "\u03B5",
        "\u03AE": "\u03B7",
        "\u03AF": "\u03B9",
        "\u03CA": "\u03B9",
        "\u0390": "\u03B9",
        "\u03CC": "\u03BF",
        "\u03CD": "\u03C5",
        "\u03CB": "\u03C5",
        "\u03B0": "\u03C5",
        "\u03C9": "\u03C9",
        "\u03C2": "\u03C3"
      };
    $document = $(document);
    nextUid = (function() {
      var counter = 1;
      return function() {
        return counter++;
      };
    }());

    function reinsertElement(element) {
      var placeholder = $(document.createTextNode(''));
      element.before(placeholder);
      placeholder.before(element);
      placeholder.remove();
    }

    function stripDiacritics(str) {
      function match(a) {
        return DIACRITICS[a] || a;
      }
      return str.replace(/[^\u0000-\u007E]/g, match);
    }

    function indexOf(value, array) {
      var i = 0,
        l = array.length;
      for (; i < l; i = i + 1) {
        if (equal(value, array[i])) return i;
      }
      return -1;
    }

    function measureScrollbar() {
      var $template = $(MEASURE_SCROLLBAR_TEMPLATE);
      $template.appendTo('body');
      var dim = {
        width: $template.width() - $template[0].clientWidth,
        height: $template.height() - $template[0].clientHeight
      };
      $template.remove();
      return dim;
    }

    function equal(a, b) {
      if (a === b) return true;
      if (a === undefined || b === undefined) return false;
      if (a === null || b === null) return false;
      if (a.constructor === String) return a + '' === b + '';
      if (b.constructor === String) return b + '' === a + '';
      return false;
    }

    function splitVal(string, separator) {
      var val, i, l;
      if (string === null || string.length < 1) return [];
      val = string.split(separator);
      for (i = 0, l = val.length; i < l; i = i + 1) val[i] = $.trim(val[i]);
      return val;
    }

    function getSideBorderPadding(element) {
      return element.outerWidth(false) - element.width();
    }

    function installKeyUpChangeEvent(element) {
      var key = "keyup-change-value";
      element.on("keydown", function() {
        if ($.data(element, key) === undefined) {
          $.data(element, key, element.val());
        }
      });
      element.on("keyup", function() {
        var val = $.data(element, key);
        if (val !== undefined && element.val() !== val) {
          $.removeData(element, key);
          element.trigger("keyup-change");
        }
      });
    }

    function installFilteredMouseMove(element) {
      element.on("mousemove", function(e) {
        var lastpos = lastMousePosition;
        if (lastpos === undefined || lastpos.x !== e.pageX || lastpos.y !== e.pageY) {
          $(e.target).trigger("mousemove-filtered", e);
        }
      });
    }

    function debounce(quietMillis, fn, ctx) {
      ctx = ctx || undefined;
      var timeout;
      return function() {
        var args = arguments;
        window.clearTimeout(timeout);
        timeout = window.setTimeout(function() {
          fn.apply(ctx, args);
        }, quietMillis);
      };
    }

    function installDebouncedScroll(threshold, element) {
      var notify = debounce(threshold, function(e) {
        element.trigger("scroll-debounced", e);
      });
      element.on("scroll", function(e) {
        if (indexOf(e.target, element.get()) >= 0) notify(e);
      });
    }

    function focus($el) {
      if ($el[0] === document.activeElement) return;
      window.setTimeout(function() {
        var el = $el[0],
          pos = $el.val().length,
          range;
        $el.focus();
        var isVisible = (el.offsetWidth > 0 || el.offsetHeight > 0);
        if (isVisible && el === document.activeElement) {
          if (el.setSelectionRange) {
            el.setSelectionRange(pos, pos);
          } else if (el.createTextRange) {
            range = el.createTextRange();
            range.collapse(false);
            range.select();
          }
        }
      }, 0);
    }

    function getCursorInfo(el) {
      el = $(el)[0];
      var offset = 0;
      var length = 0;
      if ('selectionStart' in el) {
        offset = el.selectionStart;
        length = el.selectionEnd - offset;
      } else if ('selection' in document) {
        el.focus();
        var sel = document.selection.createRange();
        length = document.selection.createRange().text.length;
        sel.moveStart('character', -el.value.length);
        offset = sel.text.length - length;
      }
      return {
        offset: offset,
        length: length
      };
    }

    function killEvent(event) {
      event.preventDefault();
      event.stopPropagation();
    }

    function killEventImmediately(event) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }

    function measureTextWidth(e) {
      if (!sizer) {
        var style = e[0].currentStyle || window.getComputedStyle(e[0], null);
        sizer = $(document.createElement("div")).css({
          position: "absolute",
          left: "-10000px",
          top: "-10000px",
          display: "none",
          fontSize: style.fontSize,
          fontFamily: style.fontFamily,
          fontStyle: style.fontStyle,
          fontWeight: style.fontWeight,
          letterSpacing: style.letterSpacing,
          textTransform: style.textTransform,
          whiteSpace: "nowrap"
        });
        sizer.attr("class", "select2-sizer");
        $("body").append(sizer);
      }
      sizer.text(e.val());
      return sizer.width();
    }

    function syncCssClasses(dest, src, adapter) {
      var classes, replacements = [],
        adapted;
      classes = $.trim(dest.attr("class"));
      if (classes) {
        classes = '' + classes;
        $(classes.split(/\s+/)).each2(function() {
          if (this.indexOf("select2-") === 0) {
            replacements.push(this);
          }
        });
      }
      classes = $.trim(src.attr("class"));
      if (classes) {
        classes = '' + classes;
        $(classes.split(/\s+/)).each2(function() {
          if (this.indexOf("select2-") !== 0) {
            adapted = adapter(this);
            if (adapted) {
              replacements.push(adapted);
            }
          }
        });
      }
      dest.attr("class", replacements.join(" "));
    }

    function markMatch(text, term, markup, escapeMarkup) {
      var match = stripDiacritics(text.toUpperCase()).indexOf(stripDiacritics(term.toUpperCase())),
        tl = term.length;
      if (match < 0) {
        markup.push(escapeMarkup(text));
        return;
      }
      markup.push(escapeMarkup(text.substring(0, match)));
      markup.push("<span class='select2-match'>");
      markup.push(escapeMarkup(text.substring(match, match + tl)));
      markup.push("</span>");
      markup.push(escapeMarkup(text.substring(match + tl, text.length)));
    }

    function defaultEscapeMarkup(markup) {
      var replace_map = {
        '\\': '&#92;',
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#47;'
      };
      return String(markup).replace(/[&<>"'\/\\]/g, function(match) {
        return replace_map[match];
      });
    }

    function ajax(options) {
      var timeout,
        handler = null,
        quietMillis = options.quietMillis || 100,
        ajaxUrl = options.url,
        self = this;
      return function(query) {
        window.clearTimeout(timeout);
        timeout = window.setTimeout(function() {
          var data = options.data,
            url = ajaxUrl,
            transport = options.transport || $.fn.select2.ajaxDefaults.transport,
            deprecated = {
              type: options.type || 'GET',
              cache: options.cache || false,
              jsonpCallback: options.jsonpCallback || undefined,
              dataType: options.dataType || "json"
            },
            params = $.extend({}, $.fn.select2.ajaxDefaults.params, deprecated);
          data = data ? data.call(self, query.term, query.page, query.context) : null;
          url = (typeof url === 'function') ? url.call(self, query.term, query.page, query.context) : url;
          if (handler && typeof handler.abort === "function") {
            handler.abort();
          }
          if (options.params) {
            if ($.isFunction(options.params)) {
              $.extend(params, options.params.call(self));
            } else {
              $.extend(params, options.params);
            }
          }
          $.extend(params, {
            url: url,
            dataType: options.dataType,
            data: data,
            success: function(data) {
              var results = options.results(data, query.page, query);
              query.callback(results);
            },
            error: function(jqXHR, textStatus, errorThrown) {
              var results = {
                hasError: true,
                jqXHR: jqXHR,
                textStatus: textStatus,
                errorThrown: errorThrown,
              };
              query.callback(results);
            }
          });
          handler = transport.call(self, params);
        }, quietMillis);
      };
    }

    function local(options) {
      var data = options,
        dataText,
        tmp,
        text = function(item) {
          return "" + item.text;
        };
      if ($.isArray(data)) {
        tmp = data;
        data = {
          results: tmp
        };
      }
      if ($.isFunction(data) === false) {
        tmp = data;
        data = function() {
          return tmp;
        };
      }
      var dataItem = data();
      if (dataItem.text) {
        text = dataItem.text;
        if (!$.isFunction(text)) {
          dataText = dataItem.text;
          text = function(item) {
            return item[dataText];
          };
        }
      }
      return function(query) {
        var t = query.term,
          filtered = {
            results: []
          },
          process;
        if (t === "") {
          query.callback(data());
          return;
        }
        process = function(datum, collection) {
          var group, attr;
          datum = datum[0];
          if (datum.children) {
            group = {};
            for (attr in datum) {
              if (datum.hasOwnProperty(attr)) group[attr] = datum[attr];
            }
            group.children = [];
            $(datum.children).each2(function(i, childDatum) {
              process(childDatum, group.children);
            });
            if (group.children.length || query.matcher(t, text(group), datum)) {
              collection.push(group);
            }
          } else {
            if (query.matcher(t, text(datum), datum)) {
              collection.push(datum);
            }
          }
        };
        $(data().results).each2(function(i, datum) {
          process(datum, filtered.results);
        });
        query.callback(filtered);
      };
    }

    function tags(data) {
      var isFunc = $.isFunction(data);
      return function(query) {
        var t = query.term,
          filtered = {
            results: []
          };
        var result = isFunc ? data(query) : data;
        if ($.isArray(result)) {
          $(result).each(function() {
            var isObject = this.text !== undefined,
              text = isObject ? this.text : this;
            if (t === "" || query.matcher(t, text)) {
              filtered.results.push(isObject ? this : {
                id: this,
                text: this
              });
            }
          });
          query.callback(filtered);
        }
      };
    }

    function checkFormatter(formatter, formatterName) {
      if ($.isFunction(formatter)) return true;
      if (!formatter) return false;
      if (typeof(formatter) === 'string') return true;
      throw new Error(formatterName + " must be a string, function, or falsy value");
    }

    function evaluate(val, context) {
      if ($.isFunction(val)) {
        var args = Array.prototype.slice.call(arguments, 2);
        return val.apply(context, args);
      }
      return val;
    }

    function countResults(results) {
      var count = 0;
      $.each(results, function(i, item) {
        if (item.children) {
          count += countResults(item.children);
        } else {
          count++;
        }
      });
      return count;
    }

    function defaultTokenizer(input, selection, selectCallback, opts) {
      var original = input,
        dupe = false,
        token,
        index,
        i, l,
        separator;
      if (!opts.createSearchChoice || !opts.tokenSeparators || opts.tokenSeparators.length < 1) return undefined;
      while (true) {
        index = -1;
        for (i = 0, l = opts.tokenSeparators.length; i < l; i++) {
          separator = opts.tokenSeparators[i];
          index = input.indexOf(separator);
          if (index >= 0) break;
        }
        if (index < 0) break;
        token = input.substring(0, index);
        input = input.substring(index + separator.length);
        if (token.length > 0) {
          token = opts.createSearchChoice.call(this, token, selection);
          if (token !== undefined && token !== null && opts.id(token) !== undefined && opts.id(token) !== null) {
            dupe = false;
            for (i = 0, l = selection.length; i < l; i++) {
              if (equal(opts.id(token), opts.id(selection[i]))) {
                dupe = true;
                break;
              }
            }
            if (!dupe) selectCallback(token);
          }
        }
      }
      if (original !== input) return input;
    }

    function cleanupJQueryElements() {
      var self = this;
      $.each(arguments, function(i, element) {
        self[element].remove();
        self[element] = null;
      });
    }

    function clazz(SuperClass, methods) {
      var constructor = function() {};
      constructor.prototype = new SuperClass;
      constructor.prototype.constructor = constructor;
      constructor.prototype.parent = SuperClass.prototype;
      constructor.prototype = $.extend(constructor.prototype, methods);
      return constructor;
    }
    AbstractSelect2 = clazz(Object, {
          bind: function(func) {
            var self = this;
            return function() {
              func.apply(self, arguments);
            };
          },
          init: function(opts) {
            var results, search, resultsSelector = ".select2-results";
            this.opts = opts = this.prepareOpts(opts);
            this.id = opts.id;
            if (opts.element.data("select2") !== undefined &&
              opts.element.data("select2") !== null) {
              opts.element.data("select2").destroy();
            }
            this.container = this.createContainer();
            this.liveRegion = $("<span>", {
                role: "status",
                "aria-live": "polite"
              })
              .addClass("select2-hidden-accessible")
              .appendTo(document.body);
            this.containerId = "s2id_" + (opts.element.attr("id") || "autogen" + nextUid());
            this.containerEventName = this.containerId
              .replace(/([.])/g, '_')
              .replace(/([;&,\-\.\+\*\~':"\!\^#$%@\[\]\(\)=>\|])/g, '\\$1');
            this.container.attr("id", this.containerId);
            this.container.attr("title", opts.element.attr("title"));
            this.body = $("body");
            syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
            this.container.attr("style", opts.element.attr("style"));
            this.container.css(evaluate(opts.containerCss, this.opts.element));
            this.container.addClass(evaluate(opts.containerCssClass, this.opts.element));
            this.elementTabIndex = this.opts.element.attr("tabindex");
            this.opts.element
              .data("select2", this)
              .attr("tabindex", "-1")
              .before(this.container)
              .on("click.select2", killEvent);
            this.container.data("select2", this);
            this.dropdown = this.container.find(".select2-drop");
            syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
            this.dropdown.addClass(evaluate(opts.dropdownCssClass, this.opts.element));
            this.dropdown.data("select2", this);
            this.dropdown.on("click", killEvent);
            this.results = results = this.container.find(resultsSelector);
            this.search = search = this.container.find("input.select2-input");
            this.queryCount = 0;
            this.resultsPage = 0;
            this.context = null;
            this.initContainer();
            this.container.on("click", killEvent);
            installFilteredMouseMove(this.results);
            this.dropdown.on("mousemove-filtered", resultsSelector, this.bind(this.highlightUnderEvent));
            this.dropdown.on("touchstart touchmove touchend", resultsSelector, this.bind(function(event) {
              this._touchEvent = true;
              this.highlightUnderEvent(event);
            }));
            this.dropdown.on("touchmove", resultsSelector, this.bind(this.touchMoved));
            this.dropdown.on("touchstart touchend", resultsSelector, this.bind(this.clearTouchMoved));
            this.dropdown.on('click', this.bind(function(event) {
              if (this._touchEvent) {
                this._touchEvent = false;
                this.selectHighlighted();
              }
            }));
            installDebouncedScroll(80, this.results);
            this.dropdown.on("scroll-debounced", resultsSelector, this.bind(this.loadMoreIfNeeded));
            $(this.container).on("change", ".select2-input", function(e) {
              e.stopPropagation();
            });
            $(this.dropdown).on("change", ".select2-input", function(e) {
              e.stopPropagation();
            });
            if ($.fn.mousewheel) {
              results.mousewheel(function(e, delta, deltaX, deltaY) {
                var top = results.scrollTop();
                if (deltaY > 0 && top - deltaY <= 0) {
                  results.scrollTop(0);
                  killEvent(e);
                } else if (deltaY < 0 && results.get(0).scrollHeight - results.scrollTop() + deltaY <= results.height()) {
                  results.scrollTop(results.get(0).scrollHeight - results.height());
                  killEvent(e);
                }
              });
            }
            installKeyUpChangeEvent(search);
            search.on("keyup-change input paste", this.bind(this.updateResults));
            search.on("focus", function() {
              search.addClass("select2-focused");
            });
            search.on("blur", function() {
              search.removeClass("select2-focused");
            });
            this.dropdown.on("mouseup", resultsSelector, this.bind(function(e) {
              if ($(e.target).closest(".select2-result-selectable").length > 0) {
                this.highlightUnderEvent(e);
                this.selectHighlighted(e);
              }
            }));
            this.dropdown.on("click mouseup mousedown touchstart touchend focusin", function(e) {
              e.stopPropagation();
            });
            this.nextSearchTerm = undefined;
            if ($.isFunction(this.opts.initSelection)) {
              this.initSelection();
              this.monitorSource();
            }
            if (opts.maximumInputLength !== null) {
              this.search.attr("maxlength", opts.maximumInputLength);
            }
            var disabled = opts.element.prop("disabled");
            if (disabled === undefined) disabled = false;
            this.enable(!disabled);
            var readonly = opts.element.prop("readonly");
            if (readonly === undefined) readonly = false;
            this.readonly(readonly);
            scrollBarDimensions = scrollBarDimensions || measureScrollbar();
            this.autofocus = opts.element.prop("autofocus");
            opts.element.prop("autofocus", false);
            if (this.autofocus) this.focus();
            this.search.attr("placeholder", opts.searchInputPlaceholder);
          },
          destroy: function() {
            var element = this.opts.element,
              select2 = element.data("select2"),
              self = this;
            this.close();
            if (element.length && element[0].detachEvent) {
              element.each(function() {
                this.detachEvent("onpropertychange", self._sync);
              });
            }
            if (this.propertyObserver) {
              this.propertyObserver.disconnect();
              this.propertyObserver = null;
            }
            this._sync = null;
            if (select2 !== undefined) {
              select2.container.remove();
              select2.liveRegion.remove();
              select2.dropdown.remove();
              element
                .removeClass("select2-offscreen")
                .removeData("select2")
                .off(".select2")
                .prop("autofocus", this.autofocus || false);
              if (this.elementTabIndex) {
                element.attr({
                  tabindex: this.elementTabIndex
                });
              } else {
                element.removeAttr("tabindex");
              }
              element.show();
            }
            cleanupJQueryElements.call(this,
              "container",
              "liveRegion",
              "dropdown",
              "results",
              "search"
            );
          },
          optionToData: function(element) {
            if (element.is("option")) {
              return {
                id: element.prop("value"),
                text: element.text(),
                element: element.get(),
                css: element.attr("class"),
                disabled: element.prop("disabled"),
                locked: equal(element.attr("locked"), "locked") || equal(element.data("locked"), true)
              };
            } else if (element.is("optgroup")) {
              return {
                text: element.attr("label"),
                children: [],
                element: element.get(),
                css: element.attr("class")
              };
            }
          },
          prepareOpts: function(opts) {
            var element, select, idKey, ajaxUrl, self = this;
            element = opts.element;
            if (element.get(0).tagName.toLowerCase() === "select") {
              this.select = select = opts.element;
            }
            if (select) {
              $.each(["id", "multiple", "ajax", "query", "createSearchChoice", "initSelection", "data", "tags"], function() {
                if (this in opts) {
                  throw new Error("Option '" + this + "' is not allowed for Select2 when attached to a <select> element.");
                }
              });
            }
            opts = $.extend({}, {
              populateResults: function(container, results, query) {
                var populate, id = this.opts.id,
                  liveRegion = this.liveRegion;
                populate = function(results, container, depth) {
                  var i, l, result, selectable, disabled, compound, node, label, innerContainer, formatted;
                  results = opts.sortResults(results, container, query);
                  var nodes = [];
                  for (i = 0, l = results.length; i < l; i = i + 1) {
                    result = results[i];
                    disabled = (result.disabled === true);
                    selectable = (!disabled) && (id(result) !== undefined);
                    compound = result.children && result.children.length > 0;
                    node = $("<li></li>");
                    node.addClass("select2-results-dept-" + depth);
                    node.addClass("select2-result");
                    node.addClass(selectable ? "select2-result-selectable" : "select2-result-unselectable");
                    if (disabled) {
                      node.addClass("select2-disabled");
                    }
                    if (compound) {
                      node.addClass("select2-result-with-children");
                    }
                    node.addClass(self.opts.formatResultCssClass(result));
                    node.attr("role", "presentation");
                    label = $(document.createElement("div"));
                    label.addClass("select2-result-label");
                    label.attr("id", "select2-result-label-" + nextUid());
                    label.attr("role", "option");
                    formatted = opts.formatResult(result, label, query, self.opts.escapeMarkup);
                    if (formatted !== undefined) {
                      label.html(formatted);
                      node.append(label);
                    }
                    if (compound) {
                      innerContainer = $("<ul></ul>");
                      innerContainer.addClass("select2-result-sub");
                      populate(result.children, innerContainer, depth + 1);
                      node.append(innerContainer);
                    }
                    node.data("select2-data", result);
                    nodes.push(node[0]);
                  }
                  container.append(nodes);
                  liveRegion.text(opts.formatMatches(results.length));
                };
                populate(results, container, 0);
              }
            }, $.fn.select2.defaults, opts);
            if (typeof(opts.id) !== "function") {
              idKey = opts.id;
              opts.id = function(e) {
                return e[idKey];
              };
            }
            if ($.isArray(opts.element.data("select2Tags"))) {
              if ("tags" in opts) {
                throw "tags specified as both an attribute 'data-select2-tags' and in options of Select2 " + opts.element.attr("id");
              }
              opts.tags = opts.element.data("select2Tags");
            }
            if (select) {
              opts.query = this.bind(function(query) {
                var data = {
                    results: [],
                    more: false
                  },
                  term = query.term,
                  children, placeholderOption, process;
                process = function(element, collection) {
                  var group;
                  if (element.is("option")) {
                    if (query.matcher(term, element.text(), element)) {
                      collection.push(self.optionToData(element));
                    }
                  } else if (element.is("optgroup")) {
                    group = self.optionToData(element);
                    element.children().each2(function(i, elm) {
                      process(elm, group.children);
                    });
                    if (group.children.length > 0) {
                      collection.push(group);
                    }
                  }
                };
                children = element.children();
                if (this.getPlaceholder() !== undefined && children.length > 0) {
                  placeholderOption = this.getPlaceholderOption();
                  if (placeholderOption) {
                    children = children.not(placeholderOption);
                  }
                }
                children.each2(function(i, elm) {
                  process(elm, data.results);
                });
                query.callback(data);
              });
              opts.id = function(e) {
                return e.id;
              };
            } else {
              if (!("query" in opts)) {
                if ("ajax" in opts) {
                  ajaxUrl = opts.element.data("ajax-url");
                  if (ajaxUrl && ajaxUrl.length > 0) {
                    opts.ajax.url = ajaxUrl;
                  }
                  opts.query = ajax.call(opts.element, opts.ajax);
                } else if ("data" in opts) {
                  opts.query = local(opts.data);
                } else if ("tags" in opts) {
                  opts.query = tags(opts.tags);
                  if (opts.createSearchChoice === undefined) {
                    opts.createSearchChoice = function(term) {
                      return {
                        id: $.trim(term),
                        text: $.trim(term)
                      };
                    };
                  }
                  if (opts.initSelection === undefined) {
                    opts.initSelection = function(element, callback) {
                      var data = [];
                      $(splitVal(element.val(), opts.separator)).each(function() {
                        var obj = {
                            id: this,
                            text: this
                          },
                          tags = opts.tags;
                        if ($.isFunction(tags)) tags = tags();
                        $(tags).each(function() {
                          if (equal(this.id, obj.id)) {
                            obj = this;
                            return false;
                          }
                        });
                        data.push(obj);
                      });
                      callback(data);
                    };
                  }
                }
              }
            }
            if (typeof(opts.query) !== "function") {
              throw "query function not defined for Select2 " + opts.element.attr("id");
            }
            if (opts.createSearchChoicePosition === 'top') {
              opts.createSearchChoicePosition = function(list, item) {
                list.unshift(item);
              };
            } else if (opts.createSearchChoicePosition === 'bottom') {
              opts.createSearchChoicePosition = function(list, item) {
                list.push(item);
              };
            } else if (typeof(opts.createSearchChoicePosition) !== "function") {
              throw "invalid createSearchChoicePosition option must be 'top', 'bottom' or a custom function";
            }
            return opts;
          },
          monitorSource: function() {
            var el = this.opts.element,
              observer, self = this;
            el.on("change.select2", this.bind(function(e) {
              if (this.opts.element.data("select2-change-triggered") !== true) {
                this.initSelection();
              }
            }));
            this._sync = this.bind(function() {
              var disabled = el.prop("disabled");
              if (disabled === undefined) disabled = false;
              this.enable(!disabled);
              var readonly = el.prop("readonly");
              if (readonly === undefined) readonly = false;
              this.readonly(readonly);
              syncCssClasses(this.container, this.opts.element, this.opts.adaptContainerCssClass);
              this.container.addClass(evaluate(this.opts.containerCssClass, this.opts.element));
              syncCssClasses(this.dropdown, this.opts.element, this.opts.adaptDropdownCssClass);
              this.dropdown.addClass(evaluate(this.opts.dropdownCssClass, this.opts.element));
            });
            if (el.length && el[0].attachEvent) {
              el.each(function() {
                this.attachEvent("onpropertychange", self._sync);
              });
            }
            observer = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
            if (observer !== undefined) {
              if (this.propertyObserver) {
                delete this.propertyObserver;
                this.propertyObserver = null;
              }
              this.propertyObserver = new observer(function(mutations) {
                $.each(mutations, self._sync);
              });
              this.propertyObserver.observe(el.get(0), {
                attributes: true,
                subtree: false
              });
            }
          },
          triggerSelect: function(data) {
            var evt = $.Event("select2-selecting", {
              val: this.id(data),
              object: data,
              choice: data
            });
            this.opts.element.trigger(evt);
            return !evt.isDefaultPrevented();
          },
          triggerChange: function(details) {
            details = details || {};
            details = $.extend({}, details, {
              type: "change",
              val: this.val()
            });
            this.opts.element.data("select2-change-triggered", true);
            this.opts.element.trigger(details);
            this.opts.element.data("select2-change-triggered", false);
            this.opts.element.click();
            if (this.opts.blurOnChange)
              this.opts.element.blur();
          },
          isInterfaceEnabled: function() {
            return this.enabledInterface === true;
          },
          enableInterface: function() {
            var enabled = this._enabled && !this._readonly,
              disabled = !enabled;
            if (enabled === this.enabledInterface) return false;
            this.container.toggleClass("select2-container-disabled", disabled);
            this.close();
            this.enabledInterface = enabled;
            return true;
          },
          enable: function(enabled) {
            if (enabled === undefined) enabled = true;
            if (this._enabled === enabled) return;
            this._enabled = enabled;
            this.opts.element.prop("disabled", !enabled);
            this.enableInterface();
          },
          disable: function() {
            this.enable(false);
          },
          readonly: function(enabled) {
            if (enabled === undefined) enabled = false;
            if (this._readonly === enabled) return;
            this._readonly = enabled;
            this.opts.element.prop("readonly", enabled);
            this.enableInterface();
          },
          opened: function() {
            return (this.container) ? this.container.hasClass("select2-dropdown-open") : false;
          },
          positionDropdown: function() {
            var $dropdown = this.dropdown,
              offset = this.container.offset(),
              height = this.container.outerHeight(false),
              width = this.container.outerWidth(false),
              dropHeight = $dropdown.outerHeight(false),
              $window = $(window),
              windowWidth = $window.width(),
              windowHeight = $window.height(),
              viewPortRight = $window.scrollLeft() + windowWidth,
              viewportBottom = $window.scrollTop() + windowHeight,
              dropTop = offset.top + height,
              dropLeft = offset.left,
              enoughRoomBelow = dropTop + dropHeight <= viewportBottom,
              enoughRoomAbove = (offset.top - dropHeight) >= $window.scrollTop(),
              dropWidth = $dropdown.outerWidth(false),
              enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight,
              aboveNow = $dropdown.hasClass("select2-drop-above"),
              bodyOffset,
              above,
              changeDirection,
              css,
              resultsListNode;
            if (aboveNow) {
              above = true;
              if (!enoughRoomAbove && enoughRoomBelow) {
                changeDirection = true;
                above = false;
              }
            } else {
              above = false;
              if (!enoughRoomBelow && enoughRoomAbove) {
                changeDirection = true;
                above = true;
              }
            }
            if (changeDirection) {
              $dropdown.hide();
              offset = this.container.offset();
              height = this.container.outerHeight(false);
              width = this.container.outerWidth(false);
              dropHeight = $dropdown.outerHeight(false);
              viewPortRight = $window.scrollLeft() + windowWidth;
              viewportBottom = $window.scrollTop() + windowHeight;
              dropTop = offset.top + height;
              dropLeft = offset.left;
              dropWidth = $dropdown.outerWidth(false);
              enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;
              $dropdown.show();
              this.focusSearch();
            }
            if (this.opts.dropdownAutoWidth) {
              resultsListNode = $('.select2-results', $dropdown)[0];
              $dropdown.addClass('select2-drop-auto-width');
              $dropdown.css('width', '');
              dropWidth = $dropdown.outerWidth(false) + (resultsListNode.scrollHeight === resultsListNode.clientHeight ? 0 : scrollBarDimensions.width);
              dropWidth > width ? width = dropWidth : dropWidth = width;
              dropHeight = $dropdown.outerHeight(false);
              enoughRoomOnRight = dropLeft + dropWidth <= viewPortRight;
            } else {
              this.container.removeClass('select2-drop-auto-width');
            }
            if (this.body.css('position') !== 'static') {
              bodyOffset = this.body.offset();
              dropTop -= bodyOffset.top;
              dropLeft -= bodyOffset.left;
            }
            if (!enoughRoomOnRight) {
              dropLeft = offset.left + this.container.outerWidth(false) - dropWidth;
            }
            css = {
              left: dropLeft,
              width: width
            };
            if (above) {
              css.top = offset.top - dropHeight;
              css.bottom = 'auto';
              this.container.addClass("select2-drop-above");
              $dropdown.addClass("select2-drop-above");
            } else {
              css.top = dropTop;
              css.bottom = 'auto';
              this.container.removeClass("select2-drop-above");
              $dropdown.removeClass("select2-drop-above");
            }
            css = $.extend(css, evaluate(this.opts.dropdownCss, this.opts.element));
            $dropdown.css(css);
          },
          shouldOpen: function() {
            var event;
            if (this.opened()) return false;
            if (this._enabled === false || this._readonly === true) return false;
            event = $.Event("select2-opening");
            this.opts.element.trigger(event);
            return !event.isDefaultPrevented();
          },
          clearDropdownAlignmentPreference: function() {
            this.container.removeClass("select2-drop-above");
            this.dropdown.removeClass("select2-drop-above");
          },
          open: function() {
            if (!this.shouldOpen()) return false;
            this.opening();
            $document.on("mousemove.select2Event", function(e) {
              lastMousePosition.x = e.pageX;
              lastMousePosition.y = e.pageY;
            });
            return true;
          },
          opening: function() {
            var cid = this.containerEventName,
              scroll = "scroll." + cid,
              resize = "resize." + cid,
              orient = "orientationchange." + cid,
              mask;
            this.container.addClass("select2-dropdown-open").addClass("select2-container-active");
            this.clearDropdownAlignmentPreference();
            if (this.dropdown[0] !== this.body.children().last()[0]) {
              this.dropdown.detach().appendTo(this.body);
            }
            mask = $("#select2-drop-mask");
            if (mask.length == 0) {
              mask = $(document.createElement("div"));
              mask.attr("id", "select2-drop-mask").attr("class", "select2-drop-mask");
              mask.hide();
              mask.appendTo(this.body);
              mask.on("mousedown touchstart click", function(e) {
                reinsertElement(mask);
                var dropdown = $("#select2-drop"),
                  self;
                if (dropdown.length > 0) {
                  self = dropdown.data("select2");
                  if (self.opts.selectOnBlur) {
                    self.selectHighlighted({
                      noFocus: true
                    });
                  }
                  self.close();
                  e.preventDefault();
                  e.stopPropagation();
                }
              });
            }
            if (this.dropdown.prev()[0] !== mask[0]) {
              this.dropdown.before(mask);
            }
            $("#select2-drop").removeAttr("id");
            this.dropdown.attr("id", "select2-drop");
            mask.show();
            this.positionDropdown();
            this.dropdown.show();
            this.positionDropdown();
            this.dropdown.addClass("select2-drop-active");
            var that = this;
            this.container.parents().add(window).each(function() {
              $(this).on(resize + " " + scroll + " " + orient, function(e) {
                if (that.opened()) that.positionDropdown();
              });
            });
          },
          close: function() {
            if (!this.opened()) return;
            var cid = this.containerEventName,
              scroll = "scroll." + cid,
              resize = "resize." + cid,
              orient = "orientationchange." + cid;
            this.container.parents().add(window).each(function() {
              $(this).off(scroll).off(resize).off(orient);
            });
            this.clearDropdownAlignmentPreference();
            $("#select2-drop-mask").hide();
            this.dropdown.removeAttr("id");
            this.dropdown.hide();
            this.container.removeClass("select2-dropdown-open").removeClass("select2-container-active");
            this.results.empty();
            $document.off("mousemove.select2Event");
            this.clearSearch();
            this.search.removeClass("select2-active");
            this.opts.element.trigger($.Event("select2-close"));
          },
          externalSearch: function(term) {
            this.open();
            this.search.val(term);
            this.updateResults(false);
          },
          clearSearch: function() {},
          getMaximumSelectionSize: function() {
            return evaluate(this.opts.maximumSelectionSize, this.opts.element);
          },
          ensureHighlightVisible: function() {
            var results = this.results,
              children, index, child, hb, rb, y, more, topOffset;
            index = this.highlight();
            if (index < 0) return;
            if (index == 0) {
              results.scrollTop(0);
              return;
            }
            children = this.findHighlightableChoices().find('.select2-result-label');
            child = $(children[index]);
            topOffset = (child.offset() || {}).top || 0;
            hb = topOffset + child.outerHeight(true);
            if (index === children.length - 1) {
              more = results.find("li.select2-more-results");
              if (more.length > 0) {
                hb = more.offset().top + more.outerHeight(true);
              }
            }
            rb = results.offset().top + results.outerHeight(true);
            if (hb > rb) {
              results.scrollTop(results.scrollTop() + (hb - rb));
            }
            y = topOffset - results.offset().top;
            if (y < 0 && child.css('display') != 'none') {
              results.scrollTop(results.scrollTop() + y);
            }
          },
          findHighlightableChoices: function() {
            return this.results.find(".select2-result-selectable:not(.select2-disabled):not(.select2-selected)");
          },
          moveHighlight: function(delta) {
            var choices = this.findHighlightableChoices(),
              index = this.highlight();
            while (index > -1 && index < choices.length) {
              index += delta;
              var choice = $(choices[index]);
              if (choice.hasClass("select2-result-selectable") && !choice.hasClass("select2-disabled") && !choice.hasClass("select2-selected")) {
                this.highlight(index);
                break;
              }
            }
          },
          highlight: function(index) {
            var choices = this.findHighlightableChoices(),
              choice,
              data;
            if (arguments.length === 0) {
              return indexOf(choices.filter(".select2-highlighted")[0], choices.get());
            }
            if (index >= choices.length) index = choices.length - 1;
            if (index < 0) index = 0;
            this.removeHighlight();
            choice = $(choices[index]);
            choice.addClass("select2-highlighted");
            this.search.attr("aria-activedescendant", choice.find(".select2-result-label").attr("id"));
            this.ensureHighlightVisible();
            this.liveRegion.text(choice.text());
            data = choice.data("select2-data");
            if (data) {
              this.opts.element.trigger({
                type: "select2-highlight",
                val: this.id(data),
                choice: data
              });
            }
          },
          removeHighlight: function() {
            this.results.find(".select2-highlighted").removeClass("select2-highlighted");
          },
          touchMoved: function() {
            this._touchMoved = true;
          },
          clearTouchMoved: function() {
            this._touchMoved = false;
          },
          countSelectableResults: function() {
            return this.findHighlightableChoices().length;
          },
          highlightUnderEvent: function(event) {
            var el = $(event.target).closest(".select2-result-selectable");
            if (el.length > 0 && !el.is(".select2-highlighted")) {
              var choices = this.findHighlightableChoices();
              this.highlight(choices.index(el));
            } else if (el.length == 0) {
              this.removeHighlight();
            }
          },
          loadMoreIfNeeded: function() {
              var results = this.results,
                more = results.find("li.select2-more-results"),
                below,
                page = this.resultsPage + 1,
                self = this,
                term = this.search.val(),
                context = this.context;
              if (more.length === 0) return;
              below = more.offset().top - results.offset().top - results.height();
              if (below <= this.opts.loadMorePadding) {
                more.addClass("select2-active");
                this.opts.query({
                      element: this.opts.element,
                      term: term,
                      page: page,
                      context: context,
                      matcher: this.opts.matcher,
                      callback: this.bind(function(data) {
                            if (!self.opened()) return;
                            self.opts.populateResults.call(this, results, data.results, {
                              term: term,
                              page: page,
                              context: context
                            });
                            self.postprocessResults(data, false, false);
                            if (data.more === true) {
                              more.detach().appendTo(results).text(evaluate(self.opts.formatLoadMore, self.opts.element, page + 1));
                              window.setTim