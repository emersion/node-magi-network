'use strict'

const Node = require('./node')

class Executor extends Node {
	constructor(sw, name, units) {
		super(sw)

		this.name = name
		this.units = units
		this.polls = {}
	}

	process(type, data, info) {
		switch (type) {
			case 'vote':
				return this.processVote(data.question, data.answer, info)
		}
	}

	processVote(question, answer, info) {
		if (question.module != this.name) {
			return // Not interested
		}

		let poll = this.polls[question.id]
		if (!poll) {
			poll = {}
			this.polls[question.id] = poll
		}
		poll[info.id] = answer

		if (Object.keys(poll).length == this.units) {
			this.polls[question.id] = null

			console.log('Poll result:', question, poll)
			process.exit()
		}
	}
}

module.exports = Executor
