'use strict'

const Node = require('./node')

class Unit extends Node {
	process(type, data, link) {
		switch (type) {
			case 'question':
				this.ask(data)
				break
		}
	}

	ask(question) {
		const answer = this.decide(question)

		this.publish('vote', {
			question: {
				id: question.id,
				module: question.module
			},
			answer: answer
		})
	}

	decide(question) {
		throw new Error('No decide() function has been set for this Unit')
	}
}

module.exports = Unit
