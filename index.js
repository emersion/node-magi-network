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

function allConnected(nodes) {
	return Promise.all(nodes.map(node => {
		return new Promise((resolve, reject) => {
			node.on('connected', () => resolve())
		})
	}))
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

const exec = new Executor(createSwarm(), 'selfdestruct', units.length)
console.log('Created executor', exec.id)

const hud = new Node(createSwarm())
console.log('Created HUD', hud.id)

allConnected(units.concat(exec, hud)).then(() => {
	console.log('Network is fully connected')

	const question = {
		id: '0',
		module: 'selfdestruct',
		data: { r: 0.95, g: 0.02, b: 0.43 }
	}

	return new Promise((resolve, reject) => {
		exec.on('vote', (question, poll) => {
			console.log('Got vote:', question, poll)
		})

		exec.on('result', (question, ok) => {
			resolve({question, ok})
		})

		hud.publish('question', question)
		console.log('Started poll:', question)
	})
}).then(({question, ok}) => {
	console.log('Poll result:', question, ok)
	process.exit()
}).catch(err => {
	console.error(err)
	process.exit(1)
})
