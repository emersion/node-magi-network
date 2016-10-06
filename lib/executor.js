'use strict'

const Node = require('./node')

const processQuestion = Symbol()
const processVote = Symbol()

class Executor extends Node {
	constructor(sw, name, units) {
		super(sw)

		this.name = name
		this.units = units

		this.questions = {}
		this.polls = {}
	}

	process(type, data, info) {
		switch (type) {
			case 'question':
				return this[processQuestion](data.question, data.answer, info)
			case 'vote':
				return this[processVote](data.question, data.answer, info)
		}
	}

	acceptQuestion(question) {
		if (question.module !== this.name) {
			return false // Not interested
		}
		return true
	}

	[processQuestion](question, info) {
		if (!this.acceptQuestion(question)) return

		this.questions[question.id] = question
		this.emit('question', question)
	}

	[processVote](question, answer, info) {
		if (!this.acceptQuestion(question)) return
		if (this.units.indexOf(info.id) < 0) return

		let poll = this.polls[question.id]
		if (!poll) {
			poll = {}
			this.polls[question.id] = poll
		}
		poll[info.id] = answer

		this.emit('vote', question, poll)

		if (Object.keys(poll).length === this.units.length) {
			this.polls[question.id] = null
			this.questions[question.id] = null

			const sum = Object.keys(poll).reduce((acc, k) => {
				if (poll[k]) acc++
				return acc
			}, 0)
			const ok = sum > this.units.length/2

			this.emit('result', question, ok)
			if (ok) {
				this.emit('execute', question)
			}
		}
	}
}

module.exports = Executor
