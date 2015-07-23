var Canvas = require('canvas');

exports.settings = {
	codeCharset: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz',
	imageWidth: 128,
	imageHeight: 64,
	codeLength: 4,
};

function genCode() {
	var code = [];
	for (var i = 0; i < exports.settings.codeLength; i++) {
		var n = Math.floor(Math.random() * 100);
		n = n % exports.settings.codeCharset.length;
		code.push(exports.settings.codeCharset[n]);
	}
	return code.join('');
}

exports.get = function () {
	var canvas = new Canvas(exports.settings.imageWidth, exports.settings.imageHeight);
	var dc = canvas.getContext('2d');

	var code = genCode();

	dc.font = '30px Impact';
	dc.fillStyle = 'black';
	dc.rotate(.1);
	dc.fillText(code, 30, (exports.settings.imageHeight + 30)/ 2);

	dc.strokeStyle = 'rgba(255, 0, 0, 0.5)'
	dc.beginPath();
	dc.lineTo(0, exports.settings.imageHeight / 2);
	dc.lineTo(exports.settings.imageWidth, exports.settings.imageHeight / 2);
	dc.stroke();

	code = code.toUpperCase();
	var image = canvas.toDataURL('image/png');
	return { code: code, image: image };
}
