'use strict'

const window = require('global/window')
const document = require('global/document')
const path = require('path')
const signalhub = require('signalhub')
const swarm = require('hybrid-swarm')
const {fetch} = require('fetch-ponyfill')()
const Executor = require('../../lib/executor')

const topic = 'magi'

function setStatus(status) {
	const el = document.getElementById('status')
	if (status) {
		el.style.display = 'block'
		el.innerText = status
	} else {
		el.style.display = 'none'
	}
}

function connected() {
	return new Promise((resolve, reject) => {
		node.on('connected', () => resolve())
	})
}

function fetchUnits() {
	return fetch('api/units').then(res => res.json())
}

let seq = 0
function ask(exec, data) {
	const question = {
		module: exec.name,
		id: String(seq),
		data: data
	}

	seq++

	exec.publish('question', question)
	console.log('Started poll:', question)

	return new Promise((resolve, reject) => {
		const unitsEls = document.querySelectorAll('#magi > .unit')

		exec.on('vote', (question, poll) => {
			console.log('Got vote:', question, poll)

			exec.units.forEach((id, i) => {
				const classes = unitsEls[i].classList
				classes.remove('voted-yes')
				classes.remove('voted-no')
				classes.add(poll[id] ? 'voted-yes' : 'voted-no')
			})
		})

		exec.on('result', (question, ok) => {
			console.log('Poll result:', question, ok)
			resolve({question, ok})
		})
	})
}

setStatus('Fetching units...')
fetchUnits().then(units => {
	console.log('Got a list of %d units', units.length)

	const hub = signalhub(topic, [
		window.location.origin + path.join(window.location.pathname, '/signalhub')
	])

	const sw = swarm({
		signalhub: hub
	})

	const name = sw.browser.me
	const exec = new Executor(sw, name, units)

	setStatus('Connecting node to mesh network...')
	return new Promise((resolve, reject) => {
		exec.on('connected', () => resolve(exec))
	})
}).then(exec => {
	console.log('Node connected to network')
	setStatus(null)

	const question = { r: 0.95, g: 0.02, b: 0.43 }

	setStatus('Propagating question...')
	return ask(exec, question)
}).then(() => {
	setStatus(null)
}).catch(err => {
	console.error(err)
})
