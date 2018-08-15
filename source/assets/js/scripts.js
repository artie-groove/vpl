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
});