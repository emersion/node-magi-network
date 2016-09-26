'use strict'

const EventEmitter = require('events')
const gossip = require('secure-gossip')

class Node extends EventEmitter {
	constructor(sw) {
		super()

		this.swarm = sw
		this.gossip = gossip()
		this.id = this.gossip.keys.public

		let connected = false
		sw.on('connection', conn => {
			conn.pipe(this.gossip.createPeerStream()).pipe(conn)

			if (!connected) {
				connected = true
				this.emit('connected')
			}
		})

		this.gossip.on('message', (msg, info) => {
			this.process(msg.type, msg.data, {id: info.public})
		})
	}

	process(type, data, info) {
		throw new Error('No process() function defined for this Node')
	}

	publish(type, data) {
		this.gossip.publish({type, data})
	}
}

module.exports = Node
