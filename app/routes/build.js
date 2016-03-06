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

var dockerS = hl.streamifyAll(docker);
var JoiS = hl.streamifyAll(Joi);

function pull(name) {
	return dockerS.pullStream(name)
		.flatMap((stream) => hl(stream))
		.collect();
}

var prepImages = new Promise((resolve, reject) => {

	return hl.merge([pull("ubuntu:latest"), pull("docker:latest"), pull("axeclbr/git")])
		.collect()
		.apply((data) => resolve(data));
})

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

router.get('/:containername', function(req, res) {

	var downloadStream = hl();
	var buildStream = hl();

	hl.merge([downloadStream, buildStream])
		.pipe(res);

	JoiS.validateStream(req.query, {
			url: Joi.string().required()
		}, {
			presence: "required"
		})
		.flatMap(() => JoiS.validateStream(req.params, {
			containername: Joi.string().required()
		}))
		.flatMap(() => hl(prepImages))
		.flatMap(() => dockerS.createContainerStream({
			Image: "ubuntu",
			Cmd: ["/bin/bash"],
			"Volumes": {
				"/src": {}
			}
		}))
		.flatMap((holder) => {

			return hl([null])
				.flatMap(() => runAndRemove("axeclbr/git", ["clone", req.query.url, "/src"], downloadStream, {
					"VolumesFrom": [holder.id]
				}))
				.flatMap(() => runAndRemove("docker", ["build", "--rm", "-t", req.params.containername, "/src"], buildStream, {
					"HostConfig": {
						"Binds": [
							"/var/run/docker.sock:/var/run/docker.sock"
						],
						"VolumesFrom": [holder.id]
					}
				}))
				.map(() => holder)
		})
		.apply(() => {})
});

module.exports = router;