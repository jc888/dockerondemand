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

/* GET home page. */
router.get('/', function(req, res) {
	var output = hl();
	var run = new Promise((resolve, reject) => {
			docker.run("helloworld", [], output, (err, data, container) => {
				if (err) {
					reject(err);
				}
				resolve([data, container]);
			})
		})
		.spread((data, container) => {
			output
				.collect()
				.apply((data) => {
					res.send(data);
				})
			var ref = docker.getContainer(container.id);
			return Promise.promisify(ref.remove, {
				context: ref
			})();
		})
});

module.exports = router;