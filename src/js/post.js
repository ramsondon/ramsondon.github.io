(function($) {
	"use strict"; // Start of use strict
	$.ajax({
		url: 'web/data/posts.json',
		method: 'get',
		dataType: 'json',
		complete: function(data) {
			var tpl_post= $('#post-template');
			var tpl_post_modal = $('#post-template-modal');

			var posts = JSON.parse(data.responseText).posts;
			var append_html = function (tpl, post) {
				r = _.template(tpl.html());
				html = r(model);
				tpl.after($(html));
			};

			var r, html, model;
			for (var i=0; i < posts.length; i++) {
				model = { model : posts[i] };
				model.model.id = 'post-' + i;
				append_html(tpl_post_modal, model);
				append_html(tpl_post, model);
			}
		}
	});
})(jQuery); // End of use strict
