var mongoose = require('mongoose');
var fs = require('fs');

var jobSchema = new mongoose.Schema({
	id: String,
	title: String,
	fullDesc: String,
	reqSkills: String,
	locale: String,
	employer: String, //username foreign key
	tagList: Array,
	compensation: String,
	length: String,
	applicants: Array, //foreign keys for user:usernames
	isPositionFilled: Boolean,
	//the username of the user that has been hired - a foreign key for username
	userHired: String, //another username foreign key
	isCompleted: Boolean,
	tel: Number,
	//can we not use the email from the user schema??
	email: String
});

// on every save, add the date
jobSchema.pre('save', function(next) {
  // get the current date
  var currentDate = new Date();
  
  // change the updated_at field to current date
  this.updated_at = currentDate;

  // if created_at doesn't exist, add to that field
  if (!this.created_at)
    this.created_at = currentDate;

  next();
});	

	

// Gets all the job data and renders the ejs
var getJobData = function (res, req) {
	var Job;
	if (mongoose.models.jobs) {
		Job = mongoose.model('jobs');
	} else {
		Job = mongoose.model('jobs', jobSchema);
	}

	Job.find(function(err, jobs) {
		Job.find({'employer' : req.user.username}, function (err, postedJobs) {
			res.render('dashboard.ejs', {
	            "jobs" : jobs,
	            "user" : req.user,
	            "postedJobs" : postedJobs
	        });
		});
	})
};

// Gets the information about the request job and renders the ejs
var getJobInfo = function (res, req) {
	var files = [];
	var allFiles = [];
	try {
		files = fs.readdirSync('upload/' + req.params.id + '/' + req.user.username);
	} catch ( e ) {
		// It is okay if it errors here, since no folders exist
	}

	try {
		allFiles = fs.readdirSync('upload/' + req.params.id);
		for ( var i = 0; i < allFiles.length; i++ ) {
			var filesInside = fs.readdirSync('upload/' + req.params.id + '/' + allFiles[i]);
			allFiles[i] = [ allFiles[i], filesInside ];
		}
	} catch ( e ) {}

	var Job;
	if (mongoose.models.jobs) {
		Job = mongoose.model('jobs');
	} else {
		Job = mongoose.model('jobs', jobSchema);
	}

	

	Job.findOne({"_id":req.params.id},function(err, job) {
		res.render('jobInfo.ejs', {
			"jobInfo" : job,
			"uploadedResumes" : files,
			"allFiles" : allFiles,
			"user" : req.user
		});
	});
}


//Compiling Schema into a Model
var Job = mongoose.model('Job', jobSchema);

// make this available to our users in our Node applications
module.exports = Job;
module.exports.getJobData = getJobData;
module.exports.getJobInfo = getJobInfo;

