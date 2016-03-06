var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var hl = require('highland');
var Docker = require('dockerode');
var fs = require('fs');
var R = require('ramda');
var Promise = require('bluebird');
var Joi = require('joi');

var docker = new Docker({
	socketPath: '/var/run/docker.sock'
});

var JoiS = hl.streamifyAll(Joi);

function runAndRemove() {
	var args = Array.prototype.slice.call(arguments);
	var run = new Promise((resolve, reject) => {

			args.push((err, data, container) => {
				if (err) {
					reject(err);
				}
				resolve([data, container]);
			});

			docker.run.apply(docker, args);

			return null;
		})
		.spread((data, container) => {
			var ref = docker.getContainer(container.id);
			return Promise.promisify(ref.remove, {
				context: ref
			})();
		})

	return hl(run);
}

router.get('/:name', function(req, res) {
	var output = hl();
	output.pipe(res);

	JoiS.validateStream(req.params, {
			name: Joi.string().required()
		})
		.flatMap(() => runAndRemove(req.params.name, [], output))
		.apply(() => {})

});

module.exports = router;