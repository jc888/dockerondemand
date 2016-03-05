var express = require('express');
var router = express.Router();
var hl = require('highland');

const spawn = require('child_process').spawn;

router.get('/', function(req, res) {

	var cmd = spawn('docker', ['run', 'ubuntu', '-d']);
	var outs = hl();

	cmd.stdout.on('data', (data) => {
		console.log(data.toString());
		outs.write(data.toString());
	});

	cmd.on('close', (sig) => {
		outs.end();
	});

	outs.pipe(res);
});

module.exports = router;