'use strict'

const Node = require('./node')

class Unit extends Node {
	process(msg, link) {
		switch (msg.type) {
			case 'question':
				this.ask(msg.data)
				break
		}
	}

	ask(question) {
		const answer = this.decide(question)

		this.publish({
			type: 'vote',
			data: {
				question: question,
				answer: answer
			}
		})
	}

	decide(question) {
		return false
	}
}

module.exports = Unit
