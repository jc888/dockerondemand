var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var hl = require('highland');
var Docker = require('dockerode');
var fs = require('fs');
var R = require('ramda');
var Promise = require('bluebird');

var docker = new Docker({
	socketPath: '/var/run/docker.sock'
});

var pull = hl.wrapCallback(docker.pull.bind(docker));
var pulled = null;

router.get('/', function(req, res) {
	hl([null])
		.flatMap(() => {
			if (!pulled) {
				pulled = [
					pull('axeclbr/git'),
					pull('docker')
				];
			}
			return hl.merge(pulled)
				.collect();
		})
		.flatMap(() => {
			return hl.wrapCallback(docker.createContainer.bind(docker))({
				Image: "ubuntu",
				Cmd: ["/bin/bash"],
				"Volumes": {
					"/src": {}
				}
			})
		})
		.flatMap((holder) => {
			var output = hl();
			var run = new Promise((resolve, reject) => {
					docker.run("axeclbr/git", ["clone", "https://github.com/docker-library/hello-world.git", "/src"], output, {
						"VolumesFrom": [holder.id]
					}, (err, data, container) => {
						if (err) {
							reject(err);
						}
						resolve([data, container]);
					})
				})
				.spread((data, container) => {
					var ref = docker.getContainer(container.id);
					return Promise.promisify(ref.remove, {
						context: ref
					})();
				})

			return hl(run)
				.flatMap(() => output)
				.collect()
				.tap(console.log)
				.map(() => holder)
		})
		.apply((data) => res.send(data))
});

module.exports = router;