'use strict'

const signalhub = require('signalhub')
const swarm = require('hybrid-swarm')
const Executor = require('../../lib/executor')

const topic = 'magi'

function connected() {
	return new Promise((resolve, reject) => {
		node.on('connected', () => resolve())
	})
}

function fetchUnits() {
	return fetch('/api/units').then(res => res.json())
}

fetchUnits().then(units => {
	console.log('Got a list of %d units', units.length)

	const sw = swarm({
		signalhub: signalhub(topic, ['http://127.0.0.1:8081'])
	})

	const name = sw.browser.me
	const exec = new Executor(sw, name, units)

	return new Promise((resolve, reject) => {
		exec.on('connected', () => resolve(exec))
	})
}).then(exec => {
	console.log('Node connected to network')

	const question = {
		id: '0',
		module: exec.name,
		data: { r: 0.95, g: 0.02, b: 0.43 }
	}

	exec.publish('question', question)
	console.log('Started poll:', question)

	return new Promise((resolve, reject) => {
		exec.on('vote', (question, poll) => {
			console.log('Got vote:', question, poll)
		})

		exec.on('result', (question, ok) => {
			console.log('Poll result:', question, ok)
			resolve({question, ok})
		})
	})
}).then(({question, ok}) => {
	console.log(question, ok)
}).catch(err => {
	console.error(err)
})
