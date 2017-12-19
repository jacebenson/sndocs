        addLoadEvent(loadStars);

        function loadStars() {
          var vote = document.getElementById('vote');
          if (vote) {
             star1 = new Image();
             star1.src = "images/icons/kb_star_off.gifx";
             star2 = new Image();
             star2.src = "images/icons/kb_star_on.gifx";
             starFull = new Image();
             starFull.src = "images/icons/kb_star_full.gifx";
             starHalf = new Image();
             starHalf.src = "images/icons/kb_star_half.gifx";
          }
        }

        function postUsed(id,used){         
          var view = document.getElementById("view_id");
          var query = document.getElementById("sysparm_search");
          openFeedback();
          if (id) {
            var ajax = new GlideAjax("KnowledgeAjax");
            ajax.addParam("sysparm_type","kbGetText");
            ajax.addParam("sysparm_search",escape(query.value));
            ajax.addParam("article_id",id);
            ajax.addParam("used",used);
            if (view)
               ajax.addParam("view_id",view.value);
            ajax.getXML(doNothing);
          }
          if(isNaN(used)){
            if (used == 'yes') {
              hideObject(gel('noarticlerating'));
              var e = document.getElementById('yesarticlerating');
              if (e) {
                 e.setAttribute("onclick","");
                 e.setAttribute("class","kb_link_disable");
                 e.setAttribute("className","kb_link_disable");
              }
            } else if (used == 'no') {
              hideObject(gel('yesarticlerating'));
              show("kb_create_incident_link");
              var e = document.getElementById('noarticlerating');
              if (e) {
                 e.setAttribute("onclick","");
                 e.setAttribute("class","kb_link_disable");
                 e.setAttribute("className","kb_link_disable");
              }
            } else hideObject(gel('articlerating'));

            showObject(gel('articleratingsubmitted'));
          }
        }


var answer = new GwtMessage().getMessages(["Not rated", "Rated", "Rating", "by you", "average", "user rating", "user ratings"]);

function setStar(x) {
    a = x + "";
    set=true;
    gel('vote').innerHTML = answer["Rated"] + " " + x + "/5 " + answer["by you"];
    gel('rated_value').value = x;
    var id = gel('sys_id').value; 
    postUsed(id, x);
}

function toggleArticleFlag(e) {
   var msg = document.getElementById("commentsdiv_flagmsg");
   var inputdiv = document.getElementById("commentsdiv");
   var donemsg = document.getElementById("commentsdiv_done");
   var input = document.getElementById("article_comments");
   if (e.checked) {
      showObject(msg);
      hideObject(donemsg);
      openFeedback();
   } else
      hideObject(msg);
}

function openFeedback() { 
   var cmtdivdone = document.getElementById('commentsdiv_done');
   var cmtdiv = document.getElementById('commentsdiv');	
   if (cmtdivdone.style.display != "block") {
      var commentsdiv = document.getElementById('commentsdiv');
      showObject(commentsdiv);
      document.getElementById('commentsimg').src="images/filter_reveal.gifx";
      document.getElementById('commentsimg').alt="Collapse";
      window.scrollBy(0,9999999);
      var e = document.getElementById('article_comments');
      if (e)
         e.focus();
      window.scrollBy(0,-20);
   } else {
	   cmtdivdone.style.display = "none";
	   var feedBackText = document.getElementById('article_comments');
	   feedBackText.value = "";
	   cmtdiv.style.display = "block";
   }
}

var set=false;
var v=0;
var a;

function highlight(x) {
      for (i=1;i<6;i++) {
          if (i < x * 1 + 1)
             document.getElementById(i).src = star2.src;
          else
             document.getElementById(i).src = star1.src;
      }
      document.getElementById('vote').innerHTML = answer["Rating"] + ": " + x + "/5";
}

function losehighlight() {
   var vote = gel('vote');
   var num = gel("num_ratings").value * 1;
   var rating = gel("rating_value").value * 1;
   if (set == false) {
      for (i=1;i<6;i++) {
         if (rating > i - 0.25)
             document.getElementById(i).src=starFull.src;
         else if (rating > i - 0.75)
             document.getElementById(i).src=starHalf.src;
         else
             document.getElementById(i).src=star1.src;
      }
      if (rating == 0)
         vote.innerHTML = answer["Not rated"];
      else
         vote.innerHTML = answer["Rated"] + " " + rating.toFixed(2);
      if (num == 1)
         vote.title = num + " " + answer["user rating"];
      else
         vote.title = num + " " + answer["user ratings"];
   } else {
      var rated = gel("rated_value").value * 1;
      for (i=1;i<6;i++) {
          if (i <= rated)
             document.getElementById(i).src = star2.src;
          else
             document.getElementById(i).src = star1.src;
      }
      vote.innerHTML = answer["Rated"] + " " + rated + "/5 " + answer["by you"];
      var totalScore = rating * num + rated;
      var totalRatings = num * 1 + 1;
      if (totalRatings == 1)
         vote.title = (totalScore/totalRatings).toFixed(2) + " " + answer["average"] + ", " + totalRatings + " " + answer["user rating"];
      else
         vote.title = (totalScore/totalRatings).toFixed(2) + " " + answer["average"] + ", " + totalRatings + " " + answer["user ratings"];
   }
}

// attachIncident2 uses a Script Include, attachIncident uses an AJAX Script
function attachIncident2(x, target) {
	if (self.opener) {
		var lastSaved = self.opener.document.getElementById("onLoad_sys_updated_on").value;
			if (!lastSaved){
				self.close();
				var err = (gel('error_msg')!=null)?gel('error_msg').value:"Invalid action: Record needs to be saved first";
				self.opener.g_form.addErrorMessage(err);
			    return false;
			}
		var e = self.opener.document.getElementById("sys_uniqueValue")
		var task = e.value;
	}
	var f = x.form;
	var sysID = f.sys_id.value;
   if (typeof sysID == "undefined") {
	  sysID = f.sys_id[0].value;
   }
    var args = new Array();
    args.push(sysID);
    args.push(target);
    
    var ajax = new GlideAjax("KnowledgeAjax");
    ajax.addParam("sysparm_type","kbAttachArticle");
    ajax.addParam("sysparm_value",sysID + "," + task);
    ajax.getXML(kbReturnAttach2, "", args);
    
	return false;
}

// kbReturnAttach2 uses a Script Include, kbReturnAttach uses an AJAX Script
function kbReturnAttach2(AJAXResponse, args) {
	var fieldName = self.opener.fillField;
	var tableName = fieldName.split('.')[0];
	var sourceID = args[0];
	var targetFields = args[1];

    var items = AJAXResponse.responseXML.getElementsByTagName("item");
    if (items.length > 0) {
        var item = items[0];
        var name = item.getAttribute("name");
        var value = item.getAttribute("value");
    }

	if (!(self.opener)) {
		self.close();
		return;
	}

	var names = new Array();
    if (targetFields) {
	    var parts = targetFields.split(",");
 	    for (var i = 0; i < parts.length; i++)
   	        names.push(parts[i]);
    }
	names.push('comments');
	names.push('description');
	var target = null;
	var targetName = null;
	for (var i =0; i<names.length; i++) {
		targetName = names[i];
		target = self.opener.document.getElementById(tableName + "." + targetName);
		if (target)
			break;
	}
	
	if (target) {
		var ed = self.opener.g_form.getGlideUIElement(targetName);
		if (ed && ed.type == 'reference') {
			self.opener.g_form.setValue(targetName, sourceID);
		} else {
			var newValue = "";
			if (target.value == "")
				newValue = value;
			else
		    	newValue = target.value + "\n" + value;
		    self.opener.g_form.setValue(targetName, newValue);
		}
	}

	self.close();
}

function kbFeedback2(name) {
	var comments = ($(name) ? $(name).value : "");
	if (comments == "") {
		showObject(gel('commentsdiv_empty'));
		return false;
	}

	var sys_id = ($('sys_id') ? $('sys_id').value : "");
	var flag = document.getElementById("article_flag");
	var view_id = document.getElementById("view_id");
	var query = document.getElementById("sysparm_search");
	
    var ajax = new GlideAjax("KnowledgeAjax");
    ajax.addParam("sysparm_type","kbWriteComment");
    ajax.addParam("sysparm_search",escape(query.value));
    ajax.addParam("sysparm_id",sys_id);
    if (flag)
        ajax.addParam("sysparm_flag",flag.checked);
    ajax.addParam("sysparm_feedback",escape(comments));
    ajax.addParam("view_id",view_id.value)
    ajax.getXML(kbFeedbackDone);
    var commentLinkDiv = $("comment_link_div");
    if (commentLinkDiv)
        commentLinkDiv.hide();

    return false;
}