'use strict'

const window = require('global/window')
const document = require('global/document')
const path = require('path')
const signalhub = require('signalhub')
const swarm = require('hybrid-swarm')
const {fetch} = require('fetch-ponyfill')()
const Executor = require('../../lib/executor')

const topic = 'magi'

const dom = {
	status: document.getElementById('status'),
	ask: document.getElementById('ask'),
	askInput: document.querySelector('#ask input[type="color"]'),
	units: document.querySelectorAll('#magi > .unit')
}

function setStatus(status) {
	if (status) {
		dom.status.style.display = 'block'
		dom.status.innerText = status
	} else {
		dom.status.style.display = 'none'
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
		exec.on('vote', (question, poll) => {
			console.log('Got vote:', question, poll)

			exec.units.forEach((id, i) => {
				const classes = dom.units[i].classList
				classes.remove('voted-yes')
				classes.remove('voted-no')

				switch (poll[id]) {
					case true:
						classes.add('voted-yes')
					case false:
						classes.add('voted-no')
				}
			})
		})

		exec.on('result', (question, ok) => {
			console.log('Poll result:', question, ok)
			resolve({question, ok})
		})
	})
}

function hexToRGB(hex) {
	hex = hex.replace('#', '')

	return {
		r: parseInt(hex.substr(0, 2), 16),
		g: parseInt(hex.substr(2, 2), 16),
		b: parseInt(hex.substr(4, 2), 16)
	}
}

setStatus('Fetching units...')
dom.ask.style.display = 'none'
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

	dom.ask.style.display = 'block'
	dom.askInput.disabled = false
	dom.askInput.addEventListener('change', event => {
		event.preventDefault()

		dom.askInput.disabled = true
		for (let el of dom.units) {
			const classes = el.classList
			classes.remove('voted-yes')
			classes.remove('voted-no')
		}

		const question = hexToRGB(dom.askInput.value)

		setStatus('Propagating question...')
		ask(exec, question).then(() => {
			dom.askInput.disabled = false
			setStatus(null)
		}).catch(err => {
			console.error('Cannot ask question:', err)
		})
	})
}).catch(err => {
	console.error(err)
})
