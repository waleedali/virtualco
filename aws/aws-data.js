var fs = require("fs");
var path = require("path");

var _awsDataFilePath = "aws-data.json";

var getData = function() {
  if (fs.existsSync(_awsDataFilePath)) {
    var data = require(".." + path.sep + _awsDataFilePath);
    return data;
  } else {
    return {};
  }
};

var saveData = function(data) {
  fs.writeFileSync(_awsDataFilePath, JSON.stringify(data, null, 2));
};

module.exports = {
  getData: getData,
  saveData: saveData
};
