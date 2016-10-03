'use strict'

const http = require('http')
const url = require('url')
const express = require('express')
const serveStatic = require('serve-static')
const signalhub = require('signalhub')
const swarm = require('hybrid-swarm')
const brain = require('brain')
const Node = require('./lib/node')
const BrainUnit = require('./lib/brain-unit')
const trained = require('./trained')

const port = process.env.PORT || 5000
const topic = 'magi'

const names = ['melchior', 'balthasar', 'casper']

function allConnected(nodes) {
	return Promise.all(nodes.map(node => {
		return new Promise((resolve, reject) => {
			node.on('connected', () => resolve())
		})
	}))
}

function createHttpServer(listUnits) {
	const app = express()

	app.get('/api/units', (req, res) => {
		res.json(listUnits().map(unit => unit.id))
	})

	const signalhubServer = require('signalhub/server')()
	app.use('/signalhub', (req, res) => {
		signalhubServer.emit('request', req, res)
	})

	app.use(serveStatic('public'))

	return new Promise((resolve, reject) => {
		const server = app.listen(port, () => resolve(server))
	})
}

function createSwarm(opts) {
	opts = opts || {}
	opts.signalhub = signalhub(topic, ['http://127.0.0.1:'+port+'/signalhub'])

	const sw = swarm(opts)

	if (sw.node) {
		sw.node.join(topic)
	}

	return sw
}

function createBridge() {
	return new Node(createSwarm({
		//wrtc: require('wrtc')
		wrtc: require('electron-webrtc')()
	}))
}

function createUnits() {
	let i = 0
	return names.map(name => {
		const sw = createSwarm()

		const net = new brain.NeuralNetwork()
		net.fromJSON(trained[i])

		const unit = new BrainUnit(sw, net, 'black')

		i++
		console.log('Created unit', name + '-' + i, unit.id)

		return unit
	})
}

function createNodes() {
	const units = createUnits()

	const bridge = createBridge()
	console.log('Created bridge', bridge.id)

	return allConnected(units.concat(bridge)).then(() => units)
}

let listUnits = () => null
createHttpServer(() => listUnits()).then(server => {
	console.log('http server listening on port %d', server.address().port)
	return createNodes()
}).then(units => {
	console.log('Network is fully connected')
	listUnits = () => units
}).catch(err => {
	console.error(err)
	process.exit(1)
})
