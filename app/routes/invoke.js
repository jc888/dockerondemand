var express = require('express');
var router = express.Router();
var spawn = require('child_process').spawn;
var hl = require('highland');
/* GET home page. */
router.get('/', function(req, res) {
	var cmd = spawn('docker', ['run', '--rm', 'ubuntu', '/bin/bash', '-c', 'echo "moo"']);

	var outs = hl();

	cmd.stdout.on('data', (data) => {
		outs.write(data.toString());
	});

	cmd.stderr.on('data', (data) => {
		outs.write(data.toString());
	});

	cmd.on('close', (sig) => {
		outs.end();
	});

	outs.pipe(res);
});

module.exports = router;