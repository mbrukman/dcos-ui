let utils = require('../utils.js')
let Unit = require('./Unit.js')

let address = null

function populateUnits() {
  let units = []
  units.push(new Unit('dcos-cluster-id.service', 'Cluster ID', 0, 'Generates anonymous DCOS Cluster ID'))
  units.push(new Unit('dcos-adminrouter-reload.service', 'Admin Router Reloader', 0, 'Reload admin router to get new DNS'))

  return units
}

class Units {
  constructor(ip) {
    address = ip
    this.units = populateUnits()
  }

  write() {
    utils.write(`./logmaker/out/units-${address}.json`, this)
  }
}

module.exports = Units