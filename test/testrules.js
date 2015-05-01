'use strict';
var expect = require('chai').expect;
var robot = require('weixin-robot');
var ruler = require('../lib/rules.js');
var debug = require('debug')('weibus');

describe('rules', function() {

  before(function() {
    ruler(robot);
  });

  after(function() {
    robot.reset();
  });

  it('should setup rules', function() {
    expect(robot.routes.length).above(2);
  });

  it('answer to request', function(done) {

    expect(robot.reply).to.be.ok;

    robot.reply({}, function(err, info) {
      if (err) {
        done(err);
      }
      expect(info.reply).to.contain('如:5');
      done();
    });
  });

  it('query route by nick name directly ', function(done) {
    robot.reply({
      text: '5号'
    }, function(err, info) {
      try {
        expect(info.reply).to.have.length(2);
        debug('replies', info.reply);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

  it('answer to subscribe', function(done) {
    var info = new robot.Info({
      type: 'event',
      param: {
        event: 'subscribe'
      }

    });

    robot.reply(info, function(err, info) {
      if (err) {
        return done(err);
      }
      expect(info.reply).to.contain('欢迎');
      done();
    });
  });


  it.skip('answer to phone numbers', function(done) {
    var info = new robot.Info();

    info.text = '13524677703';
    info.session = {};
    robot.reply(info, function(err, _info) {
      if (err) {
        return done(err);
      }
      try {
        expect(_info.reply).to.match(/\d+:/);
      } catch (err) {
        done(err);
      }
      info.text = '2';
      robot.reply(info, function(err, _info) {
        try {
          expect(_info.reply).to.have.length(2);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

  });

});