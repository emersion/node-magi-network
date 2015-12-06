'use strict';

class Node {
	constructor(mesh) {
		this.mesh = mesh;
		this.streams = {};

		var that = this;
		mesh.stream(function (link, args, accept) {
			var stream = accept();
			stream.on('data', function (data) {
				that.process(data, link);
			});
		});
	}

	link(other) {
		if (this.streams[other.hashname]) return;

		var link = this.mesh.link(other);
		var stream = link.stream(undefined, 'json');
		this.streams[link.hashname] = stream;
	}

	broadcast(data) {
		var that = this;
		Object.keys(this.streams).forEach(function (hashname) {
			var stream = that.streams[hashname];
			stream.write(data);
		});
	}
}

module.exports = Node;
