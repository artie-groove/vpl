$(document).ready( () => {
	let carousel = $('.carousel');
	let callbackForm = $('#callbackForm');
	$('.link-callback').on('click', () => {
		carousel.hide();
		callbackForm.show();
	});
	$('.link-close').on('click', () => {
		callbackForm.hide();
		carousel.show();
	});

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

	$('.link-galerie').on('click', function() {
		$(this).closest('.row').hide();
		$('#carouselGalerie').toggleClass('d-none');
	});

});