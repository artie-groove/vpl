$(document).ready( () => {
	let carousel = $('#carouselMain');
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
		let itemColor = tinycolor(baseColor).lighten(i * 100 / n);
		$(item).css('background-color', itemColor.toString());
	});

});