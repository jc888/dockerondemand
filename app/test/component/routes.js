var expect = require('chai').expect;
var R = require('ramda');
var hl = require('highland');
var Promise = require('bluebird');
var rewire = require('rewire');
var sinon = require('sinon');
var request = require('supertest');

describe('Component tests docker on demand', function() {
	this.timeout(6000);

	before((done) => {
		Promise.delay(500)
			.then(done);
	})

	describe('build an image', function() {

		it('should download an image from a place', (done) => {
			request('http://127.0.0.1:3000')
				.get('/build/helloworld')
				.query({
					url:"https://github.com/docker-library/hello-world.git"
				})
				.expect(200)
				.end((err, res) => {
					console.log(res.body);
					(!!err) ? done(err): done();
				});
		});

	});

	describe('run an image', function() {

		it('should run image', (done) => {
			request('http://127.0.0.1:3000')
				.get('/run/helloworld')
				.expect(200)
				.end((err, res) => {
					console.log(res.body);
					(!!err) ? done(err): done();
				});
		});

	});

	describe('run an image', function() {

		it('should run image', (done) => {
			request('http://127.0.0.1:3000')
				.get('/run/helloworld')
				.expect(200)
				.end((err, res) => {
					console.log(res.body);
					(!!err) ? done(err): done();
				});
		});

	});
});