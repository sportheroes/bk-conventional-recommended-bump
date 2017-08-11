'use strict';

var execSync = require('child_process').execSync;
var conventionalRecommendedBump = require('../');
var equal = require('core-assert').deepStrictEqual;
var gitDummyCommit = require('git-dummy-commit');
var shell = require('shelljs');
var writeFileSync = require('fs').writeFileSync;
var betterThanBefore = require('better-than-before')();
var preparing = betterThanBefore.preparing;

betterThanBefore.setups([
  function() { // 1
    shell.mkdir('sportheroesgroup');
    shell.cd('sportheroesgroup');
    shell.exec('git init');

    gitDummyCommit('🔄 [MOD] first commit');
    gitDummyCommit('✅ [ADD] (compile) new feature');
    gitDummyCommit('🔄 [MOD] (perf) make it faster');
  },
  function() { // 2
    writeFileSync('test2', '');
    execSync('git add --all && git commit -m "✅ [ADD] (core) amazing new module" -m "BREAKING CHANGE: Not backward compatible."');
  },
  function() { // 3
    writeFileSync('test3', '');
    execSync('git add --all && git commit -m "✅ [ADD] another amazing new module" -m "Super backward compatible."');
  },
  function() { // 4
    writeFileSync('test4', '');
    var hash = execSync('git rev-parse HEAD~1').toString();
    execSync('git add --all && git commit -m "🔄 [MOD] revert: ✅ [ADD] (core) amazing new module" -m "This reverts commit ' + hash.trim() + '."');
  },
  function() { // 5
    writeFileSync('test5', '');
    execSync('git add --all && git commit -m "✅ [ADD] (scope) make BREAKING CHANGE more forgiving\n\nPeople might type BREAKING CHANGES unintentionally. EG: https://github.com/angular/angular/commit/098b461"');
  }
]);

betterThanBefore.tearsWithJoy(function() {
  shell.cd('../');
  shell.rm('-rf', 'sportheroesgroup');
});

describe('preset', function() {
  describe('sportheroesgroup', function() {
    var opts = {
      preset: 'sportheroesgroup'
    };

    it('should release as minor', function(done) {
      preparing(1);

      conventionalRecommendedBump(opts, function(err, releaseType) {
        equal(releaseType, {
          level: 1,
          reason: 'There are 0 BREAKING CHANGES and 1 features',
          releaseType: 'minor'
        });

        done();
      });
    });

    it('should merge parserOpts', function(done) {
      preparing(1);

      conventionalRecommendedBump(opts, {
        headerPattern: /^(\w*)\: (.*)$/,
      }, function(err, releaseType) {
        equal(releaseType, {
          level: 2,
          reason: 'There are 0 BREAKING CHANGES and 0 features',
          releaseType: 'patch'
        });

        done();
      });
    });

    it('should release as major', function(done) {
      preparing(2);

      conventionalRecommendedBump(opts, function(err, releaseType) {
        equal(releaseType, {
          level: 0,
          reason: 'There are 1 BREAKING CHANGES and 1 features',
          releaseType: 'major'
        });

        done();
      });
    });

    it('should release as major even after a feature', function(done) {
      preparing(3);

      conventionalRecommendedBump(opts, function(err, releaseType) {
        equal(releaseType, {
          level: 0,
          reason: 'There are 1 BREAKING CHANGES and 2 features',
          releaseType: 'major'
        });

        done();
      });
    });

    it('should ignore a reverted commit', function(done) {
      preparing(4);

      conventionalRecommendedBump(opts, function(err, releaseType) {
        equal(releaseType, {
          level: 1,
          reason: 'There are 0 BREAKING CHANGES and 2 features',
          releaseType: 'minor'
        });

        done();
      });
    });

    it('should not ignore a reverted commit', function(done) {
      preparing(4);

      conventionalRecommendedBump({
        preset: 'sportheroesgroup',
        ignoreReverted: false
      }, function(err, releaseType) {
        equal(releaseType, {
          level: 0,
          reason: 'There are 1 BREAKING CHANGES and 2 features',
          releaseType: 'major'
        });

        done();
      });
    });

    it('should not be major', function(done) {
      preparing(5);

      conventionalRecommendedBump(opts, function(err, releaseType) {
        equal(releaseType, {
          level: 1,
          reason: 'There are 0 BREAKING CHANGES and 3 features',
          releaseType: 'minor'
        });

        done();
      });
    });
  });
});
