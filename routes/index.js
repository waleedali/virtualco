var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");
var awsConfig = require("../bootstrap/aws-bootstrap")

awsConfig.init();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log("create stack");

  // create the opsworks stack
  var opsworks = new AWS.OpsWorks({region: 'us-east-1'});

  var params = {
    DefaultInstanceProfileArn: awsConfig.getInstanceProfileArn(), /* required */
    Name: 'waleedali-stack-' + awsConfig.objectNameSuffix, /* required */
    Region: 'us-east-1', /* required */
    ServiceRoleArn: awsConfig.getServiceRoleArn() /* required */
  };
  console.log(params);
  opsworks.createStack(params, function(err, data) {
    if (err) console.log(err, err.stack); // an error occurred
    else     console.log(data);           // successful response
  });

  res.render('index', { title: 'Express' });

});

module.exports = router;
