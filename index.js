var th = require('telehash');
var Unit = require('./lib/unit');

function createMesh(done) {
	th.generate(function (err, endpoint) {
		if (err) return done('Cannot generate endpoint: '+err);

		th.mesh({ id: endpoint }, function (err, mesh) {
			if (err) return done('Could not initialize mesh: '+err);

			mesh.discover(true);
			done(null, mesh);
		});
	});
}

var units = [];

[0, 1, 2].forEach(function (i) {
	createMesh(function (err, mesh) {
		console.log('Created mesh', mesh.hashname);

		var unit = new Unit(mesh);
		units.push(unit);
	});
});

setTimeout(function () {
	var question = {
		id: '',
		module: 'autodestruct'
	};

	units.forEach(function (unit) {
		unit.ask(question);
	});
}, 1000);
