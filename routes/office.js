var express = require('express');
var router = express.Router();
//var AWS = require("aws-sdk");

router.post('/', function(req, res) {

  console.log("Hello2");

  // get the request body
  var numberOfEmployees = 0;
  var startOfWorkday = "";
  var endOfWorkday = "";
  var bucketName = "";
  var secretText = "";

  if (req.body) {
    console.log(req.body.numberOfEmployees);
    //console.log(req.body.startOfWorkday);
    res.sendStatus(200);
  } else {
    console.log("No payload was probided to the /initoffice API");
    res.sendStatus(400);
  }

  // get the list of file on the passed bucket
  //var s3 = new AWS.S3();
  //
  //var params = {
  //  Bucket: 'STRING_VALUE', /* required */
  //  ACL: 'private | public-read | public-read-write | authenticated-read',
  //  CreateBucketConfiguration: {
  //    LocationConstraint: 'EU | eu-west-1 | us-west-1 | us-west-2 | ap-southeast-1 | ap-southeast-2 | ap-northeast-1 | sa-east-1 | cn-north-1 | eu-central-1'
  //  },
  //  GrantFullControl: 'STRING_VALUE',
  //  GrantRead: 'STRING_VALUE',
  //  GrantReadACP: 'STRING_VALUE',
  //  GrantWrite: 'STRING_VALUE',
  //  GrantWriteACP: 'STRING_VALUE'
  //};
  //
  //s3.createBucket(params, function(err, data) {
  //  if (err) console.log(err, err.stack); // an error occurred
  //  else     console.log(data);           // successful response
  //});

});

module.exports = router;
