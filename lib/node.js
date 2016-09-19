'use strict'

const gossip = require('secure-gossip')

class Node {
	constructor(sw) {
		this.swarm = sw
		this.gossip = gossip()

		sw.on('connection', (conn, info) => {
			conn.pipe(this.gossip.createPeerStream()).pipe(conn)

			this.gossip.on('message', msg => {
				this.process(msg, info)
			})
		})
	}

	process() {
		throw new Error('No process() function defined for this Node')
	}

	publish(msg) {
		this.gossip.publish(msg)
	}
}

module.exports = Node
