'use strict'

const Node = require('./node')

class Executor extends Node {
	constructor(sw, name) {
		super(sw)

		this.name = name
		this.polls = {}
	}

	process(msg, info) {
		switch (msg.type) {
			case 'vote':
				const question = msg.data.question
				const answer = msg.data.answer

				if (question.module != this.name) {
					return // Not interested
				}

				let poll = this.polls[question.id]
				if (!poll) {
					poll = {}
					this.polls[question.id] = poll
				}
				poll[info.id] = answer

				if (Object.keys(poll).length == 3) {
					console.log('Poll result:', question, poll)
				}
				break
		}
	}
}

module.exports = Executor
