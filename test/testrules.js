'use strict';
var expect = require('chai').expect;
var robot = require('weixin-robot');
var ruler = require('../lib/rules.js');

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
      expect(info.reply).to.contain('直接输入路线名称查询位置');
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

  it('answer to phone numbers', function(done){
    var info = new robot.Info();

    info.text = '13524677703';
    info.session ={};
    robot.reply(info, function(err, _info) {
      try{
        expect(_info.reply).to.match(/\d+:/);
      } catch (err){
        done(err);
      }
      info.text = '2';
      robot.reply(info,function(err, _info){
        expect(_info.reply).to.have.keys(['title','picUrl','description']);
        done();
      });
    });

  });



});
