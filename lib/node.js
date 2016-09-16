'use strict'

class Node {
	constructor(sw) {
		this.swarm = sw

		sw.on('connection', (conn, info) => {
			conn.on('data', (data) => {
				this.process(JSON.parse(data), info)
			})
		})
	}

	broadcast(data) {
		this.swarm.connections.forEach((conn) => {
			conn.write(JSON.stringify(data))
		})
	}
}

module.exports = Node
