'use strict'

const gossip = require('secure-gossip')

class Node {
	constructor(sw) {
		this.swarm = sw
		this.gossip = gossip()

		sw.on('connection', (conn, info) => {
			conn.pipe(this.gossip.createPeerStream()).pipe(conn)

			this.gossip.on('message', msg => {
				this.process(msg.type, msg.data, info)
			})
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
