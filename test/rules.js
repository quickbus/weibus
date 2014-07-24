'use strict';
var expect = require('chai').expect;
var robot = require('weixin-robot');
var ruler = require('../lib/rules.js');


describe('rules', function() {

  before(function() {
    ruler(robot);
  });

  after(function() {
    robot.routes = [];
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

      expect(info.reply).to.equal('直接输入路线名称查询位置');
      done();
    });
  });


  it('can hi and hi back', function() {
    robot.reply({
      text: 'who r u'
    }, function(err, info) {
      expect(info.reply).to.equal('I\'m a robot.');
    });
  });

  it('can hi and word', function(done) {
    robot.reply({
      text: 'ASB'
    }, function(err, info) {
      try {
        expect(info.reply).to.have.keys(['title','picUrl','description']);
        done();
      } catch (e) {
        done(e);
      }
    });
  });

});
