'use strict'

const swarm = require('discovery-swarm')
const Unit = require('./lib/unit')
const BrainUnit = require('./lib/brain-unit')
const Executor = require('./lib/executor')

const names = ['Melchior', 'Balthasar', 'Casper']
const units = []

names.forEach((name, i) => {
	const sw = swarm()
	sw.listen(0)
	sw.join('magi')

	const unit = new Unit(sw)
	units.push(unit)

	console.log('Created unit', i+1, name, sw.id)
})

const sw = swarm()
sw.listen(0)
sw.join('magi')
const exec = new Executor(sw, 'selfdestruct')

setTimeout(() => {
	const question = {
		id: '0',
		module: 'selfdestruct'
	};

	units.forEach(function (unit) {
		unit.ask(question)
	})
}, 1000)
