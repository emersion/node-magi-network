'use strict';

var Node = require('./node');

class Unit extends Node {
	constructor(mesh) {
		super(mesh);

		var that = this;
		mesh.accept = function (other) {
			console.log('Accepting:', other.hashname);
			that.link(other);
		};
	}

	process(data, link) {
		console.log('Received:', data, link.hashname);
	}

	ask(question) {
		this.broadcast({
			type: 'vote',
			data: {
				question: question,
				response: false
			}
		});
	}
}

module.exports = Unit;
