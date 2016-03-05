var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var hl = require('highland');
var Docker = require('dockerode');
var fs = require('fs');
var R = require('ramda');

var docker = new Docker({
	socketPath: '/var/run/docker.sock'
});

var output = hl();
var pull = hl.wrapCallback(docker.pull.bind(docker));
var pulled = null;

router.get('/', function(req, res) {
	hl([null])
		.flatMap(() => {
			if (!pulled) {
				pulled = [
					pull('axeclbr/git')
				];
			}
			return hl.merge(pulled)
				.collect();
		})
		.flatMap(() => {
			return hl((push, next) => {
				docker.run('axeclbr/git', ['clone', 'https://github.com/docker-library/hello-world.git'], output, function(err, data, container) {
					if (err) {
						push(err, null);
					} else {
						push(null, [data, container]);
					}
					push(null, hl.nil);
				});
			})
		})
		.map(R.last)
		.map(R.prop('id'))
		.tap(console.log)
		.flatMap((data) => output)
		.collect()
		.apply((data) => res.send(data))
});

module.exports = router;