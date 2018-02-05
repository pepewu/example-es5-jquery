window.NazwaProjektu = window.NazwaProjektu || {};

NazwaProjektu.kategoria = (function ($) {
	'use strict';

	var allowedPages = ['kategoria', 'strefa'];

	if ($.inArray(window._nazwaProjektu.pageType, allowedPages) < 0) {
		return null;
	}

	// Elementy DOM z filtrami
	var itemsCategory = $('.filtersBar li'),
		itemsTag = $('.tagsNav__items li'),
		itemsSort = $('.sortNav__items li').add('.sortingNav__items li');

	// globalny obiekt z zawartością wybranych filtrów i offsetem
	var query = {
		mainCategory: window._nazwaProjektu.mainCategory,
		filterCategories: [],
		filterTags: [],
		orderBy: undefined,
		offset: 0,
		layoutMode: 1
	};

	var currentOffset = 0;
	var loadLimit = window._nazwaProjektu.loadCountLimit || 9;

	// kontenery DOM
	var ajaxContainer = $('.categoryFiltersContent'),
		filtersContainer = $('.categoryFilters'),
		loadMoreButton = $('.js-loadCategory'),
		countContainer = $('.postCounter__number'),
		requestUrl = window._nazwaProjektu.categoryFiltersUrl,
		currentSortContainer = $('.sortingNav__sortname');

	// main
	var kategoria = {
		/*
		 * init
		 */
		init: function () {
			this.events();
			this.sortNav();
			this.handleHash();
		},


		/*
		 * Kontener na obiekt xhr
		 */
		xhrRequest: null,


		/*
		 * Zwija/rozija sortowanie
		 */
		sortNav: function () {
			$('.sortNav__header').add('.sortingNav__header').on('click', function (e) {
				e.preventDefault();
				$(this).parent().toggleClass('is-expanded');
			});
		},

		/*
		 * Przypięcie zdarzeń na klik filtrów i load more
		 */
		events: function () {
			var self = this;

			var itemsCategoryHandler = function (item) {
				if (item.hasClass('reseter')) {
					itemsCategory.removeClass('is-active');
					item.addClass('is-active');
				} else {
					itemsCategory.filter('.reseter').removeClass('is-active');
					item.toggleClass('is-active');
				}

				if (itemsCategory.filter('.is-active').length == 0) {
					itemsCategory.eq(0).addClass('is-active');
				}
			};

			var itemsSortHandler = function (item) {
				itemsSort.removeClass('is-active');
				item.addClass('is-active').parents('.sortNav').removeClass('is-expanded');
				item.parents('.sortingNav').removeClass('is-expanded');
				if (currentSortContainer.length) {
					currentSortContainer.html(item.text());
				}
			};

			itemsCategory.on('click', function (e) {
				var me = $(this);
				e.preventDefault();

				itemsCategoryHandler(me);
				self._buildQuery('new');
			});

			itemsTag.on('click', function (e) {
				var me = $(this);
				e.preventDefault();

				me.toggleClass('is-active');
				self._buildQuery('new');
			});

			itemsSort.on('click', function (e) {
				var me = $(this);
				e.preventDefault();

				itemsSortHandler(me);
				self._buildQuery('new');
			});

			loadMoreButton.on('click', function (e) {
				e.preventDefault();
				self._buildQuery('append');
			});
		},


		/*
		 * Obsługa hash w url strony
		 */
		handleHash: function () {
			var hsh = window.location.hash;

			function switchToHash(hsh) {
				var hsh = hsh.substr(1);
				var item = itemsCategory.filter('[data-id="' + hsh + '"]');

				if (item.length) {
					setTimeout(function () {
						item.trigger('click');
					}, 500);

					$('body, html').animate({
						scrollTop: item.parent().offset().top - 100
					}, 500);
				}
			}

			if (hsh) {
				switchToHash(hsh);
			}

			$(window).on('hashchange', function () {
				switchToHash(window.location.hash);
			});
		},


		/*
		 * Zeruje zmienną query i anuluje trwające zapytanie
		 */
		_resetQuery: function () {
			var self = this;
			query.filterCategories = [];
			query.filterTags = [];
			query.orderBy = undefined;
			query.mainCategory = window._nazwaProjektu.mainCategory;

			if (self.xhrRequest) {
				self.xhrRequest.abort();
				self.xhrRequest = null;
			}
			loadMoreButton.removeClass('is-disabled');
		},


		/*
		 * Buduje zawartość zmiennej query na podstawie aktualnie zaznaczonych filtrów
		 * @param mode: (string) 'new' - jeżeli zawartość kontenera będzie zastąpiona, 'append' - jeżeli nowa zawartość zostanie dodana na końcu kontenera (przypadek load more)
		 */
		_buildQuery: function (mode) {
			var self = this;

			self._resetQuery();

			$.each(itemsCategory, function (index, el) {
				var el = $(el);
				if (el.hasClass('is-active')) {
					query.filterCategories.push(el.data('id'));
				}
			});

			$.each(itemsTag, function (index, el) {
				var el = $(el);
				if (el.hasClass('is-active')) {
					query.filterTags.push(el.data('id'));
				}
			});

			$.each(itemsSort, function (index, el) {
				var el = $(el);
				if (el.hasClass('is-active')) {
					query.orderBy = el.data('id');
				}
			});

			if (mode == 'new') {
				query.offset = 0;
				currentOffset = 0;
				query.layoutMode = 1;
			} else if (mode == 'append') {
				query.offset += loadLimit;
				currentOffset += loadLimit;

				if (query.layoutMode == 1) {
					query.layoutMode = 2;
				} else {
					query.layoutMode = 1;
				}
			}

			self._setLoadingState();
			self._getResults(mode);
		},


		/*
		 * Włącza graficzne loadery, ustawia buttony na disabled - stan oczekiwania na nowe dane
		 */
		_setLoadingState: function () {
			filtersContainer.addClass('loading');
			ajaxContainer.addClass('loading');
			loadMoreButton.prop('disabled', true);
		},


		/*
		 * Wyłącza graficzne loadery, ustawia buttony na enabled - stan wyjściowy
		 */
		_unsetLoadingState: function () {
			filtersContainer.removeClass('loading');
			ajaxContainer.removeClass('loading');
			loadMoreButton.prop('disabled', false);
		},


		/*
		 * Wysyła zapytanie ajaxowe po nowe posty, przekazuje na serwer zawartość zmiennej query
		 */
		_getResults: function (mode) {
			var self = this;

			self.xhrRequest = $.ajax({
				type: 'GET',
				url: requestUrl,
				data: query,
				dataType: 'json',
				success: function (data) {
					setTimeout(function () {
						self._renderResults(data, mode);
					}, 1000);
				},
				error: function (data) {
					setTimeout(function () {
						self._renderResults(data, mode);
					}, 1000);
				}
			});
		},


		/*
		 * Renderuje nowe dane pobrane z serwera
		 */
		_renderResults: function (data, mode) {
			var self = this;
			if (mode === 'new') {
				ajaxContainer.html(data.data);
				countContainer.html(data.postscount);
			} else if (mode === 'append') {
				ajaxContainer.append(data.data);
			}
			ajaxContainer.find('.lazyshow').addClass('lazyshowed');
			self._unsetLoadingState();

			if (data.loadMoreEnabled == 0) {
				loadMoreButton.attr('disabled', true).addClass('is-disabled');
			}
			NazwaProjektu.video.init();
		}
	}

	return kategoria;

})(jQuery);