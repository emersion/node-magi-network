'use strict'

const Unit = require('./unit')

class BrainUnit extends Unit {
	constructor(mesh, net) {
		super(mesh)

		this.net = net
	}

	decide(question) {
		const output = this.net.run(question)
		return (output[0] > 0.5)
	}
}

module.exports = BrainUnit
