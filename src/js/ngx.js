if (!_ || typeof(_) === 'undefined') {
	_ = {};
}

if ('registerElement' in document) {
	var ngxApp = document.registerElement('ngx-app');
	var ngxInclude = document.registerElement('ngx-include');
}

_.ngx = function () {

	var ngx = function () {
		this.base_route = "";
		this.wait_cache_freq = 0;
		this.model_cache = {
			mark: {},
			cache: {}
		};
		this.tpl_cache = {
			mark: {},
			cache: {}
		};
		this.ready_listeners = {};
	};

	ngx.prototype.get = function(resource, type) {
		return new Promise(function (resolve, reject) {
			var url = this.base_route + resource;
			fetch(url, {
				method: 'GET'
			}).then(function(response) {
				if (response.status !== 200) {
					console.error('Error Report', 'Status Code: ' + response.status, response.statusText);
					return;
				}
				response[type]().then(function(data) {
					resolve(data);
				}.bind(this));

			}.bind(this)).catch(function(err) {
				reject(err);
			}.bind(this));
		}.bind(this));
	};

	ngx.prototype.toKey = function(str) {
		return str.replace(new RegExp('[\/\.-]', 'g'), '_');
	};

	ngx.prototype.waitCache = function(cache, key) {
		return new Promise(function(resolve, reject) {
			var t=0;
			var poll = function() {
				if (t > 0 && key in cache) {
					clearTimeout(t);
					t = 0;
					resolve(key);
				} else {
					t = setTimeout(poll, this.wait_cache_freq);
				}
			}.bind(this);
			t = setTimeout(poll, this.wait_cache_freq);
		}.bind(this));
	};

	ngx.prototype.render = function (filepath, model, el, listener) {
		var render = function(html) {
			var s = document.createElement('script');
			s.type = 'text/x-ngx-tpl';
			s.innerHTML = html;
			el.appendChild(s);
			el.innerHTML = _.template(el.innerHTML)(model);
			el.innerHTML = el.querySelector('script').innerHTML;

			this.include(el.querySelectorAll('ngx-include'));
			// fix call when last child has been executed.. implement call render stack
			if (_.isString(listener) && listener in this.ready_listeners) {
				this.ready_listeners[listener]();
			}
		}.bind(this);

		this.cacheResource(filepath, this.tpl_cache, 'text')
			.then(function(key) {
				render(this.tpl_cache.cache[key]);
			}.bind(this)).catch(function(k) {
				console.warn(k);
			});
	};

	ngx.prototype.cacheResource = function (resource, cache, res_type) {
		return new Promise(function (resolve, reject) {
			var key = this.toKey(resource);
			if (key in cache.mark) {
				this.waitCache(cache.cache, key)
					.then(function (key) {
						resolve(key);
					}.bind(this));
			} else {
				cache.mark[key] = resource;
				this.get(resource, res_type)
					.then(function(response) {
						cache.cache[key] = response;
						resolve(key);
					});
			}
		}.bind(this));
	};
	
	ngx.prototype.parseInclude = function (el) {
		return {
			model: el.getAttribute('x-model'),
			template: el.getAttribute('x-template'),
			listener: el.getAttribute('x-listen')
		}
	};

	ngx.prototype.include = function(includes) {
		var _render = function (directive, model, $cur) {
			this.render(directive.template, {
				ngxModel: model
			}, $cur, directive.listener);
		}.bind(this);

		_.forEach(includes, function($cur, idx) {
			var directive = this.parseInclude($cur);
			if (directive.model) {

				try {
					// check if we assigned a json object
					_render(directive, this.readAssignment(directive.model), $cur);
				} catch (e) {
					this.cacheResource(directive.model, this.model_cache, 'json')
						.then(function(key) {
							_render(directive, this.model_cache.cache[key], $cur);
						}.bind(this))
						.catch(function(key) {
							console.warn(key);
						});
				}
			} else {
				_render(directive, null, $cur);
			}

		}.bind(this));
	};

	/**
	 * @link https://stackoverflow.com/questions/7467840/nl2br-equivalent-in-javascript
	 * @param str
	 * @param is_xhtml
	 * @returns {string}
	 */
	ngx.prototype.nl2br = function(str, is_xhtml) {
		if (_.isString(str)) {
			var breakTag = (is_xhtml || typeof is_xhtml === 'undefined') ? '<br />' : '<br>';
			return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + breakTag + '$2');
		}
		return str;
	};

	ngx.prototype.assign = function (obj) {
		return _.escape(JSON.stringify(obj));
	};

	ngx.prototype.readAssignment = function (obj) {
		return JSON.parse(_.unescape(obj));
	};

	ngx.prototype.ngx = function () {
		var apps = document.querySelectorAll('ngx-app');
		_.forEach(apps, function(app, idx) {
			this.include(app.querySelectorAll('ngx-include'));
		}.bind(this));
	};

	ngx.prototype.base = function(base_dir) {
		this.base_route = base_dir;
		return this;
	};

	ngx.prototype.listen = function(key, cb) {
		if (_.isObject(key) && _.isUndefined(cb)) {
			for (var k in key) {
				this.listen(k, key[k]);
			}
		} else if (_.isString(key) && _.isFunction(cb)) {
			this.ready_listeners [key] = cb;
		}
		return this;
	};

	ngx.prototype.require = function (src, callback) {
		return (function(d, s, src) {
			var id = src.replace(new RegExp('[\/\.:]', 'g'), '_');
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) return;
			js = d.createElement(s);
			js.id = id;
			js.src = src;
			fjs.parentNode.insertBefore(js, fjs);

			if (js.readyState) { //IE
				js.onreadystatechange = function () {
					if (js.readyState === "loaded" ||
						js.readyState === "complete") {
						js.onreadystatechange = null;
						callback();
					}
				};
			} else { // others than IE
				js.onload = callback;
			}
		}(document, "script", src));
	};

	ngx.prototype.start = function() {
		var startup = function() {
			this.ngx();
		}.bind(this);

		if ( ! ('fetch' in window) ) {
			this.require("https://cdnjs.cloudflare.com/ajax/libs/fetch/2.0.3/fetch.min.js", startup);
		} else {
			startup();
		}

		return this;
	};

	return new ngx;
}();






