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

/* GET home page. */
router.get('/:name', function(req, res) {
	var output = hl();

	output.pipe(res);
	hl([null])
		.flatMap(() => {
			return hl.wrapCallback(Joi.validate)(req.params, {
				name: Joi.string().required()
			})
		})
		.flatMap(() => {
			var run = new Promise((resolve, reject) => {
					docker.run(req.params.name, [], output, (err, data, container) => {
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