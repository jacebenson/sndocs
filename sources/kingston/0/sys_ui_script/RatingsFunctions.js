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

function postUsed() {
	var ajax = new GlideAjax("RatingUtilsAJAX");
	ajax.addParam("sysparm_name","setRating");
	ajax.addParam("sysparm_table", document.getElementById("table").value);
	ajax.addParam("sysparm_recordId", document.getElementById("recordId").value);
	ajax.addParam("sysparm_userId", document.getElementById("userId").value);
	ajax.addParam("sysparm_rating", document.getElementById("rated_value").value);
	ajax.addParam("sysparm_comment", document.getElementById("rated_comment").value);
	ajax.addParam("sysparm_like", "false");
	ajax.getXML(function(serverResponse) {});
}

var answer = new GwtMessage().getMessages(["Not rated", "Rated", "Rating", "by you", "average", "user rating", "user ratings"]);

function setStar(x) {
	a = x + "";
	set=true;
	gel('vote').innerHTML = answer["Rated"] + " " + x + "/5 " + answer["by you"];
	gel('rated_value').value = x;
	postUsed();
}

function setComment() {
	set=true;
	gel('rated_value').value = document.getElementById("rating_value").value;
	postUsed();
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