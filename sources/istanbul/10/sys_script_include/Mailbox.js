gs.include("PrototypeServer");

var Mailbox = Class.create();

Mailbox.prototype = {

    initialize : function() {
    },

    set : function(/* GlideRecord */ gr) {
        var type = gr.type;
        if (type == 'received') {
            // the email client creates outbound emails with a type of 'received'
            // even though they are, in fact, going out. Don't put them in the inbox
            if (gr.uid.nil())
                return;
            if (gr.state == 'ready')
               gr.mailbox = 'inbox'
            else
               gr.mailbox = 'received';
        } else if (type == 'sent')
            gr.mailbox = 'sent'
        else if (type == 'send-ready')
            gr.mailbox = 'outbox'
        else if (type == 'send-ignored') {
            gr.mailbox = 'skipped';
            gr.state = 'ignored';
        } else if (type == 'send-failed') {
            gr.mailbox = 'failed';
            gr.state = 'ignored';
        } else if (type == 'received-ignored') {
            gr.mailbox = 'junk';
            gr.state = 'ignored';
        }
    }

}