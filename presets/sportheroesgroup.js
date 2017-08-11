var presetOpts = {
  whatBump: function(commits) {
    var level = 2;
    var breakings = 0;
    var features = 0;

    commits.forEach(function(commit) {
      if (commit.notes.length > 0) {
        breakings += commit.notes.length;
        level = 0;
      } else if (commit.type === 'ADD') {
        features += 1;
        if (level === 2) {
          level = 1;
        }
      }
    });

    return {
      level: level,
      reason: 'There are ' + breakings + ' BREAKING CHANGES and ' + features + ' features'
    };
  },
  parserOpts: {
    headerPattern: /^([\uD800-\uDBFF]|[\u2702-\u27B0]|[\uF680-\uF6C0]|[\u24C2-\uF251])*\s\[([A-Z]{3})\]\s(?:\((.*)\))?\s?(.*)$/,
    headerCorrespondence: [
      'emoji',
      'type',
      'scope',
      'shortDesc'
    ],
    noteKeywords: 'BREAKING CHANGE',
    revertPattern: /^(?:[\uD800-\uDBFF]|[\u2702-\u27B0]|[\uF680-\uF6C0]|[\u24C2-\uF251])*\s\[[A-Z]{3}\]\srevert:\s([\s\S]*?)\s*This reverts commit\s(\w*)/,
    revertCorrespondence: [
      'header',
      'hash'
    ]
  }
};

module.exports = presetOpts;
