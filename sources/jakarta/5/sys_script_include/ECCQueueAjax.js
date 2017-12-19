var ECCQueueAjax = Class.create();

ECCQueueAjax.prototype = Object.extendsObject(AbstractAjaxProcessor, {  
  ajaxFunction_ajaxProgress: function() { 
    var s = this.getValue() + "";
    s = s.split(" ");
    var id = this.getParameter('sysparm_id')+"";
    var answer = false;
    switch(s[0]){
      case "Running":  
        var gr = new GlideRecord('ecc_queue');
               gr.addQuery('response_to', id);
               gr.query();
               if (gr.next())
                   answer = 'true';
        return answer;
        break;
      case "Processing": 
          var gr = new GlideRecord('ecc_queue');
          gr.addQuery('response_to', id);
          gr.query();
          if (gr.next())
            if (gr.state != 'ready')
              answer = 'true';
          return answer;
          break;
      case "Sending": 
          var gr = new GlideRecord('ecc_queue');
          if (gr.get(id)) {
            if (gr.state != 'ready')
              answer = 'true';
          }
          return answer;
          break;
    }
  }

});