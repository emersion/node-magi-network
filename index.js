'use strict'

const swarm = require('discovery-swarm')
const brain = require('brain')
const Node = require('./lib/node')
const Unit = require('./lib/unit')
const BrainUnit = require('./lib/brain-unit')
const Executor = require('./lib/executor')
const trained = require('./trained')

const topic = 'magi'
const names = ['melchior', 'balthasar', 'casper']

function createSwarm() {
	const sw = swarm()
	sw.listen(0)
	sw.join(topic)
	return sw
}

const units = []

names.forEach((name, i) => {
	const sw = createSwarm()

	const net = new brain.NeuralNetwork()
	net.fromJSON(trained[i])

	const unit = new BrainUnit(sw, net, 'black')
	units.push(unit)

	console.log('Created unit', i+1, name, unit.id)
})

const exec = new Executor(createSwarm(), 'selfdestruct')
console.log('Created executor', exec.id)

const hud = new Node(createSwarm())
console.log('Created HUD', hud.id)

Promise.all(units.concat(exec, hud).map(node => {
	return new Promise((resolve, reject) => {
		node.on('connected', () => {
			resolve()
		})
	})
})).then(() => {
	console.log('Network is fully connected')

	const question = {
		id: '0',
		module: 'selfdestruct',
		data: { r: 0.95, g: 0.02, b: 0.43 }
	}

	hud.publish('question', question)

	console.log('Started poll:', question)
})
