## Virtual co

###Getting started:
1.	Install node if you don’t already have it installed - can be downloaded from https://nodejs.org
2.	git clone  https://github.com/waleedali/virtualco.git
3.	cd virtualco
4.	npm install
5.	set the AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY as environment variables, you can use the following command if running on mac or linux.
6.	AWS_ACCESS_KEY_ID=<access-key> AWS_SECRET_ACCESS_KEY=<secret-key> npm start
7.	Browse to http://localhost:3000/


###About the app:

The virtual co app uses the autoscaling feature in the EC2 offering to schedule the start and stop of the employee instances based on a daily schedule, it also uses the activates stream of to log the scheduled actions done by the service to an s3 bucket, e.g. starting an instance and terminating an instance.

The app provides a real-time monitoring for the instances on the home page with colored rows to indicating the startup, running and termination states.


