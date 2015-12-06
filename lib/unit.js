'use strict';

var Node = require('./node');

class Unit extends Node {
	constructor(mesh) {
		super(mesh);

		this.polls = {};

		var that = this;
		mesh.accept = function (other) {
			console.log('Accepting:', other.hashname);
			that.link(other);
		};
	}

	process(msg, link) {
		switch (msg.type) {
			case 'question':
				this.ask(msg.data);
				break;
			case 'vote':
				var question = msg.data.question,
					answer = msg.data.answer;
				if (!this.polls[question.id]) {
					this.polls[question.id] = {};
				}
				this.polls[question.id][link.hashname] = answer;

				if (Object.keys(this.polls[question.id]).length == 3) {
					console.log('Poll result:', this.polls[question.id]);
				}
				break;
		}
	}

	ask(question) {
		var answer = false;

		this.polls[question.id] = {};
		this.polls[question.id][this.mesh.hashname] = answer;

		this.broadcast({
			type: 'vote',
			data: {
				question: question,
				answer: answer
			}
		});
	}
}

module.exports = Unit;
