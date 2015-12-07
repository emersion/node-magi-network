'use strict';

var Node = require('./node');

class Unit extends Node {
	constructor(mesh) {
		super(mesh);

		var that = this;
		mesh.accept = function (other) {
			console.log('Accepting from unit:', other.hashname);
			that.link(other);
		};
	}

	process(msg, link) {
		switch (msg.type) {
			case 'question':
				this.ask(msg.data);
				break;
		}
	}

	ask(question) {
		var answer = this.decide(question);

		this.broadcast({
			type: 'vote',
			data: {
				question: question,
				answer: answer
			}
		});
	}

	decide(question) {
		return false;
	}
}

module.exports = Unit;
