'use strict'

const swarm = require('discovery-swarm')
const Unit = require('./lib/unit')
const BrainUnit = require('./lib/brain-unit')
const Executor = require('./lib/executor')

const topic = 'magi'

const names = ['Melchior', 'Balthasar', 'Casper']
const units = []

function createSwarm() {
	const sw = swarm()
	sw.listen(0)
	sw.join(topic)
	return sw
}

names.forEach((name, i) => {
	const sw = createSwarm()

	const unit = new Unit(sw)
	units.push(unit)

	console.log('Created unit', i+1, name, sw.id)
})

const sw = createSwarm()
const exec = new Executor(sw, 'selfdestruct')
console.log('Created executor', sw.id)

setTimeout(() => {
	const question = {
		id: '0',
		module: 'selfdestruct'
	};

	units.forEach(unit => {
		unit.ask(question)
	})

	console.log('Started poll:', question)
}, 1000)
