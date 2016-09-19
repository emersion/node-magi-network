'use strict'

const Unit = require('./unit')

class BrainUnit extends Unit {
	constructor(mesh, net, key) {
		super(mesh)

		this.net = net
		this.key = key
	}

	decide(question) {
		const output = this.net.run(question.data)
		return (output[this.key] > 0.5)
	}
}

module.exports = BrainUnit
