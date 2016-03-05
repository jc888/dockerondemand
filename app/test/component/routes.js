var expect = require('chai').expect;
var R = require('ramda');
var hl = require('highland');
var Promise = require('bluebird');
var rewire = require('rewire');
var sinon = require('sinon');
var request = require('supertest');

describe('Component tests docker on demand', function() {
	this.timeout(3000);

	before((done)=>{
		Promise.delay(500)
			.then(done);
	})
	describe('run an image', function() {

		it('should run image', (done) => {
			request('http://127.0.0.1:3000')
				.get('/invoke')
				.expect(200)
				.end((err, res) => {
					expect(res.text).to.be.equal('moo\n');
					(!!err) ? done(err): done();
				});
		});

	});

	describe('download an image', function() {

		it('should download an image from a place', (done) => {
			request('http://127.0.0.1:3000')
				.get('/download')
				.expect(200)
				.end((err, res) => {
					console.log(res.body);
					(!!err) ? done(err): done();
				});
		});

	});
});