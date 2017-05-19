(function($) {
	"use strict"; // Start of use strict

	var _get = function(url, complete) {
		$.ajax({
			url: url,
			method: 'get',
			dataType: 'json',
			complete: function(data) {
				complete(JSON.parse(data.responseText).items)
			}
		});
	};

	var render = function (tpl, model) {
		var r = _.template(tpl.html());
		var html = r(model);
		tpl.after($(html));
	};

	_get('web/data/posts.json', function(items) {
		var tpl_post= $('#post-template');
		var tpl_post_modal = $('#post-template-modal');

		var model;
		for (var i=0; i < items.length; i++) {
			model = { model : items[i] };
			model.model.id = 'post-' + i;
			render(tpl_post_modal, model);
			render(tpl_post, model);
		}
	});

	_get('web/data/tech.json', function(items) {
		var tpl_post= $('#skill-item-template');
		items = items.shuffle();
		for (var i=0; i < items.length; i++) {
			render(tpl_post, { model : items[i] });
			if ((i+1) % 3  === 0) {
				tpl_post.after('<div class="clearfix visible-xs '+ ((i+1) % 6 === 0 ? "visible-sm visible-md visible-lg" : "") +'"></div>');
			}
		}
	});

})(jQuery); // End of use strict
