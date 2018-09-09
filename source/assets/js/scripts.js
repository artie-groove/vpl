$(document).ready( () => {
	let carouselMain = $('#carouselMain');
	let callbackForm = $('#callbackForm');
	let callbackFormTriggerBtn = $('.link-callback');
	let carouselGalerie = $('#carouselGalerie');
	let galerieCarouselTriggerBtn = $('.link-galerie');
	let infoblockOverGalerie = galerieCarouselTriggerBtn.closest('.row');
	// $('.link-galerie').on('click', function() {
	// 	$(this).closest('.row').hide();
	// 	$('#carouselGalerie').toggleClass('d-none');
	// });


	function addBlockToggler(btnTrigger, objTop, objBottom) {
		btnTrigger.on('click', () => {
			objTop.hide();
			objBottom.show();
		});
		objBottom.find('.link-close').on('click', () => {
			objBottom.hide();
			objTop.show();
		});
	}

	
	addBlockToggler(callbackFormTriggerBtn, carouselMain, callbackForm);
	// addBlockToggler(galerieCarouselTriggerBtn, infoblockOverGalerie, carouselGalerie);



	let baseColor = $('.showcase').data('color');
	let items, n;

	// subcategory list colors
	items = $('.showcase-subcategories .showcase-item');
	n = items.length;
	items.each( (i, item) => {
		let itemColor = tinycolor(baseColor).spin(-10 * i);
		$(item).css('background-color', itemColor.toString());
	});

	// product list colors
	items = $('.showcase.showcase-products .showcase-item');
	n = items.length;
	items.each( (i, item) => {
		let level = Math.round(10 / n * i);
		let itemColor = tinycolor(baseColor).lighten(level);
		console.log(level, itemColor.toString());
		$(item).css('background-color', itemColor.toString());
	});

	$('.palette-buttons li img').on('click', function() {
		let item = $(this).parent();
		if ( item.hasClass('active') ) return false;
		item.siblings('.active').removeClass('active');
		item.addClass('active');
		item.parent().siblings('.d-block').removeClass('d-block').addClass('d-none');
		let idx = item.index();
		item.parent().siblings('img').eq(idx).removeClass('d-none').addClass('d-block');
	});

	$('.thumbs img').on('click', function() {
		let src = $(this).attr('src');
		$(this).closest('.thumbs').parent().siblings('.viewport').find('img').attr('src', src);
	});

	let vendorFilter = $('.vendor-filter');
	vendorFilter.find('a:not(:last-child)').on('click', function() {
		$(this).toggleClass('active');
	});
	vendorFilter.children().eq(-1).on('click', function() {
		$(this).siblings().removeClass('active');
	});

	let carouselDesign = $('#carouselDesign');
	carouselDesign.on('slide.bs.carousel', function(e) {
		btnNextOrPrevTriggered = carouselDesign.find('.carousel-control-prev:focus-within').length
			|| carouselDesign.find('.carousel-control-next:focus-within').length;
		if ( ! btnNextOrPrevTriggered ) return;
		let dir = e.direction === 'left' ? 1 : -1;
		let currentItem = carouselDesign.find('.carousel-inner .active');
		let buttonsPanel = currentItem.find('.palette-buttons');
		let idx = buttonsPanel.find('.active').index();
		if ( dir > 0 ) {
			if ( idx < buttonsPanel.children().length - 1) {
				buttonsPanel.children().eq(idx+dir).find('img').click();
				e.preventDefault();
			}
		}
		else {
			if ( idx > 0 ) {
				buttonsPanel.children().eq(idx+dir).find('img').click();
				e.preventDefault();
			}
		}
	});

	let carouselProduct = $('.carousel-product');
	carouselProduct.find('.product-tab-switcher li').on('click', function() {
		if ( $(this).is('.active') ) return;
		$(this).siblings().removeClass('active');
		$(this).addClass('active');
		let idx = $(this).index();
		let tabsContainer = carouselProduct.find('.carousel-item.active .product-tabs');
		tabsContainer.children('.active').fadeOut(100, () => {
			tabsContainer.children().eq(idx).fadeIn(100).addClass('active');
		}).removeClass('active');
	});

	function stripLeadingTabs(text) {
		let cleanText = text.replace(/^(?:\t| )+(?!\n)/gm, '');
		return cleanText;
	}

	carouselProduct.on('slide.bs.carousel', function(e) {
		let target = $(e.relatedTarget);
		let productName = target.find('.h1').text();
		$('.catalog-breadcrumbs li:last-of-type').text(productName);
		$('#productDetailsTabContent div').each( (idx, item) => {
			$(item).html( () => {
				let mdData = stripLeadingTabs(tabData[target.index()][idx]);
				return marked(mdData);
			});
		});
	});

});