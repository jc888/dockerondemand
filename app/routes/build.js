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

function pull(name) {

	var w = hl.wrapCallback(docker.pull.bind(docker));
	return w(name)
		.flatMap((stream) => {
			return hl(stream);
		})
		.collect();
}

var prepImages = new Promise((resolve, reject) => {

	hl.merge([pull("ubuntu:latest"), pull("docker:latest"), pull("axeclbr/git")])
		.collect()
		.apply((data) => {
			resolve(data);
		})
})

router.get('/:containername', function(req, res) {

	var downloadStream = hl();
	var buildStream = hl();
	hl.merge([downloadStream, buildStream])
		.pipe(res);

	hl([null])
		.flatMap(() => {
			console.log(req.query)
			return hl.wrapCallback(Joi.validate)(req.query, {
				url: Joi.string().required()
			}, {
				presence: "required"
			})
		})
		.flatMap(() => {
			return hl.wrapCallback(Joi.validate)(req.params, {
				containername: Joi.string().required()
			})
		})
		.flatMap(() => {
			return hl(prepImages);
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

			var run = new Promise((resolve, reject) => {
					docker.run("axeclbr/git", ["clone", req.query.url, "/src"], downloadStream, {
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
				.map(() => holder)
		})
		.flatMap((holder) => {

			var run = new Promise((resolve, reject) => {
					docker.run("docker", ["build", "--rm", "-t", req.params.containername, "/src"], buildStream, {
						"HostConfig": {
							"Binds": [
								"/var/run/docker.sock:/var/run/docker.sock"
							],
							"VolumesFrom": [holder.id]
						}
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

			return hl(run);
		})
		.apply(() => {})
});

module.exports = router;