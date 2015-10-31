var AWS = require("aws-sdk");
var uuid = require("node-uuid");
var fs = require("fs");

var _serviceRoleArn;
var _instanceProfileArn;
var _roleArnFilePath = "role-arn.json";

// load the role arn if they were already created before
if (fs.existsSync(_roleArnFilePath)) {
  var roleArn = require("../" + _roleArnFilePath);
  _serviceRoleArn = roleArn.serviceRoleArn;
  _instanceProfileArn = roleArn.instanceProfileArn;
}

// generate a random uuid to be used in the aws name to make them unique
var objectNameSuffix = uuid.v4();

var init = function() {

  // skip creating the role if they already exist
  if (!_serviceRoleArn) {

    console.log("create role and instance profile");
    AWS.config.update({region: 'us-east-1'});

    // create iam role and instance profile
    var iam = new AWS.IAM();

    var policyDoc = {
      "Version": "2008-10-17",
      "Statement": [
        {
          "Sid": "",
          "Effect": "Allow",
          "Principal": {
            "Service": "opsworks.amazonaws.com"
          },
          "Action": "sts:AssumeRole"
        }
      ]
    };

    var params = {
      AssumeRolePolicyDocument: JSON.stringify(policyDoc), /* required */
      RoleName: 'waleedali-role-' + objectNameSuffix /* required */
    };
    iam.createRole(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else {
        console.log(data);           // successful response
        _serviceRoleArn = data.Role.Arn;
        var serviceRoleName = data.Role.RoleName;

        // create the instance profile that will be used by the ec2 instances
        var params = {
          InstanceProfileName: 'waleedali-instanceprofile-' + objectNameSuffix /* required */
        };
        iam.createInstanceProfile(params, function(err, data) {
          if (err) console.log(err, err.stack); // an error occurred
          else {
            console.log(data);           // successful response
            _instanceProfileArn = data.InstanceProfile.Arn;
            var instanceProfileName = data.InstanceProfile.InstanceProfileName;

            var params = {
              InstanceProfileName: instanceProfileName, /* required */
              RoleName: serviceRoleName /* required */
            };
            iam.addRoleToInstanceProfile(params, function(err, data) {
              if (err) console.log(err, err.stack); // an error occurred
              else {
                console.log(data);           // successful response

                // write the role arn file
                var roleArn = {
                  serviceRoleArn: _serviceRoleArn,
                  instanceProfileArn: _instanceProfileArn
                };
                fs.writeFileSync(_roleArnFilePath, JSON.stringify(roleArn));

              }
            });
          }
        });
      }
    });
  }
};

var _getServiceRoleArn = function () {
  return _serviceRoleArn;
};

var _getInstanceProfileArn = function () {
  return _instanceProfileArn;
};

module.exports = {
  init: init,
  getServiceRoleArn: _getServiceRoleArn,
  getInstanceProfileArn: _getInstanceProfileArn,
  objectNameSuffix: objectNameSuffix
};