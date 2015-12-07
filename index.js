var th = require('telehash');
var brain = require('brain');
var Unit = require('./lib/unit');
var BrainUnit = require('./lib/brain-unit');
var Executor = require('./lib/executor');

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

var names = ['Melchior', 'Balthasar', 'Casper'];
var units = [];

[0, 1, 2].forEach(function (i) {
	createMesh(function (err, mesh) {
		console.log('Created unit', i+1, names[i], mesh.hashname);

		var unit = new Unit(mesh);
		units.push(unit);
	});
});

var execName = 'selfdestruct';
var exec;
createMesh(function (err, mesh) {
	console.log('Created executor', execName, mesh.hashname);

	exec = new Executor(mesh, execName);
});

setTimeout(function () {
	var question = {
		id: '0',
		module: 'selfdestruct'
	};

	units.forEach(function (unit) {
		unit.ask(question);
	});
}, 1000);
