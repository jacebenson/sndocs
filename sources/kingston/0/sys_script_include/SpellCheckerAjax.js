var SpellCheckerAjax = Class.create();

SpellCheckerAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {
  wrongs: new Array(),
  GLIDE_SPELL_DICT: "glide.spell.dictionary.",
  MAX_MATCHES: gs.getProperty("glide.spell.dictionary.max_matches", "10"),
  MAX_SUGGESTIONS: gs.getProperty("glide.spell.dictionary.max_suggestions", "10"),

  process: function() {
      var dictionary;

      try {
          var dictInfo = SNC.PluginResources.openReader("com.glide.spellcheck", "dict/" + this.getDictionary());
          dictionary = new Packages.com.swabunga.spell.engine.SpellDictionaryHashMap(dictInfo);
      } catch (e) {
          gs.log(this.type + " Exception: " + e.getMessage());
          return;
      }

      var spellChecker = new Packages.com.swabunga.spell.event.SpellChecker(dictionary);
      spellChecker.addSpellCheckListener(new Packages.com.swabunga.spell.event.SpellCheckListener(this));
      spellChecker.checkSpelling(new Packages.com.swabunga.spell.event.StringWordTokenizer(this.getChars()));

      this.populateResults();
  },

  populateResults: function() {
      for (var i = 0; i < this.wrongs.length && i < this.MAX_MATCHES; i++) {
          var wrong = this.wrongs[i];

          var item = this.newItem("match");
          item.setAttribute("word", wrong.word);
          item.setAttribute("position", wrong.position);

          var keys = wrong.suggestions.iterator();
          var found = 0;

          while (keys.hasNext()) {
              var wkey = keys.next();
              var suggest = document.createElement("suggest");
              suggest.setAttribute("word", wkey.getWord());
              item.appendChild(suggest);

              if (++found >= this.MAX_SUGGESTIONS)
                  break;
          }
      }
  },

  getDictionary: function() {
      var prop = this.GLIDE_SPELL_DICT + gs.getSession().getLanguage();
      return gs.getProperty(prop, "en.dic");
  },


  spellingError: function(evt) {
      this.wrongs.push({
          word: evt.getInvalidWord(),
          position: evt.getWordContextPosition(),
          suggestions: evt.getSuggestions()
      });
  },

  type: "SpellCheckerAJAX"
});