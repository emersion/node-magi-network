'use strict';

var Node = require('./node');

class Module extends Node {
	constructor(mesh, name) {
		super(mesh);

		this.name = name;
		this.polls = {};

		var that = this;
		mesh.accept = function (other) {
			console.log('Accepting from module:', other.hashname);
			that.link(other);
		};
	}

	process(msg, link) {
		switch (msg.type) {
			case 'vote':
				var question = msg.data.question,
					answer = msg.data.answer;

				if (question.module != this.name) {
					return; // Not interested
				}
				if (!this.polls[question.id]) {
					this.polls[question.id] = {};
				}
				this.polls[question.id][link.hashname] = answer;

				if (Object.keys(this.polls[question.id]).length == 3) {
					console.log('Poll result:', question, this.polls[question.id]);
				}
				break;
		}
	}
}

module.exports = Module;
