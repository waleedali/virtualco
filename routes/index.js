var express = require('express');
var router = express.Router();
var AWS = require("aws-sdk");
var Promise = require("bluebird");
var aws = require("../aws/aws");
var uuid = require("node-uuid");
var moment = require("moment");
var awsData = require("../aws/aws-data");
var S3StreamLogger = require('s3-streamlogger').S3StreamLogger;

var _s3Stream;
var _s3BucketName;
var _secret;

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Virtual Company Builder', time: moment.utc().format("hh:mm A") });
});

router.get('/officestatus', function(req, res, next) {
  aws.autoscaling.describeAutoScalingInstancesAsync({})
    .then(function (data) {
      res.send(JSON.stringify(data));
    })
    .catch(function(err) {
      console.log(err, err.stack);
      res.sendStatus(400);
    });

  // Update the s3 logs
  aws.autoscaling.describeScalingActivitiesAsync({})
    .then(function(data) {
      var dataObject = awsData.getData();
      if (_s3BucketName) {
        // initialize the stream if needed
        if (!_s3Stream) {
          _s3Stream = new S3StreamLogger({
            bucket: _s3BucketName,
            access_key_id: process.env.AWS_ACCESS_KEY_ID,
            secret_access_key: process.env.AWS_SECRET_ACCESS_KEY,
            name_format: "virtual-company.log"
          });
        }

        // check if the activityId already exists
        for (var i=0; i < data.Activities.length;i++) {
          console.log(data.Activities[i].ActivityId);
          console.log(dataObject[data.Activities[i].ActivityId]);
          if (!dataObject[data.Activities[i].ActivityId]) {
            _s3Stream.write(data.Activities[i].StartTime + " " + data.Activities[i].Description + ", the secret is " + _secret + "\n");
            dataObject[data.Activities[i].ActivityId] = {};
          }
        }

        awsData.saveData(dataObject);
      }
    })
    .catch(function(err) {
      console.log(err, err.stack);
    });;

});

router.post('/officeinit', function(req, res, next) {

  if ( !req.body.numberOfEmp
    || !req.body.startTime
    || !req.body.endTime
    || !req.body.bucketName) {
    console.log ("Bad request, number of employees, start time, end time, and bucket name must be sent!");
    res.sendStatus(400);
  }

  var startTimeHour = req.body.startTime.split(":")[0];
  var starttimeMin = req.body.startTime.split(":")[1];
  var endTimeHour = req.body.endTime.split(":")[0];
  var endtimeMin = req.body.endTime.split(":")[1];
  var numberOfEmp = req.body.numberOfEmp;
  _secret = req.body.secretText;

  // generate a random uuid to be used in the aws name to make them unique
  var objectNameSuffix = uuid.v4().substring(0, 8);
  var launchConfigurationName = "waleed-lc-" + objectNameSuffix;
  var autoscalingGroupName = "waleed-asg-" + objectNameSuffix;
  var s3BucketName = req.body.bucketName.toLowerCase() + "-" + objectNameSuffix;

  // Create the Launch Configuration
  var params = {
    LaunchConfigurationName: launchConfigurationName, /* required */
    AssociatePublicIpAddress: true,
    ImageId: 'ami-f0091d91',
    InstanceMonitoring: {
      Enabled: true
    },
    InstanceType: 't2.micro'
  };
  aws.autoscaling.createLaunchConfigurationAsync(params)
    .then(function() {
      return aws.ec2.describeSubnetsAsync();
    })
    .then(function(data){
      // Get an existing subnet Id
      // check if there's a subnet
      if (data.Subnets.length > 0) {
        return Promise.resolve(data.Subnets[0].SubnetId);
      } else {
        return Promise.reject("No Subnets available, please create at least one VPC and subnet");
      }
    })
    .then(function(subnetId) {
      // Create an auto scaling group
      var params = {
        AutoScalingGroupName: autoscalingGroupName, /* required */
        MaxSize: 3, /* required */
        MinSize: 0, /* required */
        LaunchConfigurationName: launchConfigurationName,
        AvailabilityZones: [
          'us-west-2a'
        ],
        DesiredCapacity: 0,
        VPCZoneIdentifier: subnetId
      };
      return aws.autoscaling.createAutoScalingGroupAsync(params);
    })
    .then(function(data) {
      // Create the startup schedule
      var params = {
        AutoScalingGroupName: autoscalingGroupName, /* required */
        ScheduledActionName: 'Startup instances', /* required */
        DesiredCapacity: numberOfEmp, /* no. of new instances */
        Recurrence: starttimeMin + ' ' + startTimeHour + ' * * *'
      };
      return aws.autoscaling.putScheduledUpdateGroupActionAsync(params);
    })
    .then(function(data) {
      // Create the stop schedule
      var params = {
        AutoScalingGroupName: autoscalingGroupName, /* required */
        ScheduledActionName: 'Stop instances', /* required */
        DesiredCapacity: 0,
        Recurrence: endtimeMin + ' ' + endTimeHour + ' * * *'
      };
      return aws.autoscaling.putScheduledUpdateGroupActionAsync(params);
    })
    .then(function() {
      // Create the s3 logs bucket
      var params = {
        Bucket: s3BucketName, /* required */
        ACL: 'private',
        CreateBucketConfiguration: {
          LocationConstraint: 'us-west-2'
        }
      };
      return aws.s3.createBucketAsync(params);
    })
    .then(function() {
      // Save the bucket name
      _s3BucketName = s3BucketName;
      return Promise.resolve();
    })
    .then(function() {
      console.log("Launch Configuration Name:", launchConfigurationName);
      console.log("AutoScaling Group Name:", autoscalingGroupName);
      console.log("S3 logs bucket Name:", s3BucketName);
      console.log("Office initiated!");
      res.sendStatus(200);
    })
    .catch(function(err) {
      console.log(err, err.stack);
      res.sendStatus(400);
    });

});

router.post('/startinstance', function(req, res, next) {

  if (!req.body.instanceId) {
    console.log("Bad request, no instanceId was provided");
    res.sendStatus(400);
  }

  res.sendStatus(200);
});

router.post('/stopinstance', function(req, res, next) {

  if (!req.body.instanceId) {
    console.log("Bad request, no instanceId was provided");
    res.sendStatus(400);
  }

  res.sendStatus(200);
});

router.post('/startallinstances', function(req, res, next) {

  if (!req.body.instanceId) {
    console.log("Bad request, no instanceId was provided");
    res.sendStatus(400);
  }

  res.sendStatus(200);
});

router.post('/stopallinstances', function(req, res, next) {

  if (!req.body.instanceId) {
    console.log("Bad request, no instanceId was provided");
    res.sendStatus(400);
  }

  res.sendStatus(200);
});

router.get('/showsecret', function(req, res, next) {
  res.send(JSON.stringify(_secret));
});

module.exports = router;
