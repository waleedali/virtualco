var AWS = require("aws-sdk");
var Promise = require("bluebird");

var config = {
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || "us-west-2"
};

var ec2 = new AWS.EC2(config);
Promise.promisifyAll(Object.getPrototypeOf(ec2));

var autoscaling = new AWS.AutoScaling(config);
Promise.promisifyAll(Object.getPrototypeOf(autoscaling));

module.exports = {
  autoscaling: autoscaling,
  ec2: ec2
};