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

		this.publish('vote', {
			question: question,
			answer: answer
		})
	}

	decide(question) {
		throw new Error('No decide() function has been set for this Unit')
	}
}

module.exports = Unit
