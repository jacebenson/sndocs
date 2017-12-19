var ChannelAjax = Class.create();

ChannelAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {

  process: function() {
      this.cm = GlideChannelManager.get();
      this.channel = null;
      this.channelName = this.getName();

      if (!this.getChannel(this.channelName)) {
          root.setAttribute("error", this.channelName + ": invalid channel");
          return;
      }
      
      if (this.getType() == "read") {
          var clientLastSeq = this.getValue();
          if (!clientLastSeq)
              clientLastSeq = 0;

          this._setThreadAttribute();
          this.grabChannelMessages(clientLastSeq);
      } else if (this.getType() == "write") {
          this.channel.msg(session.getUserName() + ": " + this.getChars());
      }
  },

  grabChannelMessages: function(clientLastSeq) {
      var messages;

      try {
          messages = this.getWaitForNewMessages(clientLastSeq);
      } catch(e) {
          root.setAttribute("interrupted", "true");
          return;
      }

      if (!messages || messages.length < 1) {
          root.setAttribute("error", this.channelName + ": no messages in channel");
          return;
      }

      var channelLastSeq = messages[messages.length - 1].seq;
      root.setAttribute("client_last_sequence", clientLastSeq);
      root.setAttribute("channel_last_sequence", channelLastSeq);

      for(var i = 0; i < messages.length; i++) {
           var message = messages[i];

           var item = this.newItem();
           item.setAttribute("sequence", message.seq);
           item.setAttribute("date", message.date);
           item.setAttribute("message", message.msg);
      }
  },

  getWaitForNewMessages: function(clientLastSeq) {
      var messages = [];

      var channelLastSeq = this.channel.getLastSequence();
      if (!channelLastSeq)
          return messages;

      // lets wait until we have a message
      while (clientLastSeq == channelLastSeq) {
          Packages.java.lang.Thread.sleep(250);
          channelLastSeq = this.channel.getLastSequence();
      }

      var channelMessages = this.channel.getMessages();
      var mListIterator = channelMessages.listIterator(channelMessages.size());
      while (mListIterator.hasPrevious()) {
          var cmsg = mListIterator.previous();
          if (cmsg.getSequence() > clientLastSeq)
              messages.push({ seq: cmsg.getSequence(), msg: cmsg.getMessage(), date: cmsg.getDate() });
      }

      messages.sort(this._sortMessageArray);
      return messages;
  },

  getChannel: function(name) {
      if (this.getParameter("sysparm_auto_create") == "true")
          this.channel = this.cm.createChannel(name);

      if (!this.cm.exists(name))
          return false;

      this.channel = this.cm.getChannel(name);
      return true;
  },

  _sortMessageArray: function(a, b) {
      return a.seq - b.seq;
  },

  _setThreadAttribute: function() {
      GlideThreadAttributes.createThreadAttribute("streaming_channel", this.channelName);
  },

  type: "ChannelAjax"
});