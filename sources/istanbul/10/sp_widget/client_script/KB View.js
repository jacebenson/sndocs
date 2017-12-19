function ($scope) {
	var c = $scope.data.categories;
	var d = $scope.data.documents;
	c.forEach(function(cat) {
		cat.documents = [];
		d.forEach(function(doc) {
			if (doc.kb_category == cat.sys_id) 
				cat.documents.push(doc);
		})
	})
}