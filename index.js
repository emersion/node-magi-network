'use strict'

const swarm = require('discovery-swarm')
const Node = require('./lib/node')
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

	unit.decide = question => false

	console.log('Created unit', i+1, name, sw.id)
})

const exec = new Executor(createSwarm(), 'selfdestruct')
console.log('Created executor', exec.swarm.id)

const hud = new Node(createSwarm())
console.log('Created HUD', hud.swarm.id)

setTimeout(() => {
	const question = {
		id: '0',
		module: 'selfdestruct'
	}

	hud.publish('question', question)

	console.log('Started poll:', question)
}, 1000)
