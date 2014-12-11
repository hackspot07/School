var school_records = require('./school_records').init('./data/school.db');
exports.get_grades = function(req,res){
	school_records.getGrades(function(err,grades){
		res.render('grades',{grades:grades});
	});
};

exports.get_students = function(req,res){
	school_records.getStudentsByGrade(function(err,grades){
		res.render('students',{grades:grades});
	});
};

exports.get_subjects = function(req,res){
	school_records.getSubjectsByGrade(function(err,grades){
		res.render('subjects',{grades:grades});
	});
};

exports.get_student = function(req,res,next){
	school_records.getStudentSummary(req.params.id,
	function(err,student){
		if(!student) 
			next();
		else 
			res.render('student',student);
	});
};

exports.get_subject_summary = function(req,res,next){
	school_records.getSubjectSummary(req.params.id,
	function(err,subject){
		if(!subject) 
			next();
		else 
			res.render('subject',{'subject':subject});
	});
};

exports.get_grade_summary = function(req,res,next){
	school_records.getGradeSummary(req.params.id,
		function(err,grade){
			if(!grade)
				next();
			else
				res.render('grade',grade);
		});
};
exports.update_garde = function(req,res,next){
	var gradeToChange = req.query['grade'];
	var currentGrade = req.params.grade;
	var updateDb = [currentGrade,gradeToChange];
	if(gradeToChange.trim() !="")
		school_records.updateGrade(updateDb,function(err){
			
		});
	res.redirect("/grades");
};

exports.update_student_name = function(req,res){
	var preName = req.params.name;
	var changeBy = req.query['changeName'];
	var updateDb = [preName,changeBy];
	if(changeBy.trim() !="")
		school_records.updateStudentName(updateDb,function(err){
			if(err) res.end("Operation failed");
			else
				res.redirect("/students");
		});
	else res.end("Some fields are empty");
};

exports.update_student_grade = function(req,res){
	var studentId = req.params.id;
	var gradeId = req.query.changeName;
	if(gradeId.trim() != "")
		school_records.updateStudentGrade([studentId,gradeId],function(err){
			if(err) res.end("Operation failed");
			else
				res.redirect("/students");
		});
	else res.end("Some fields are empty");
};

exports.update_student_score = function(req,res) {
	var studentId = req.params.id;
	var score = req.query.changeName;
	var subjectId = req.query.subjects;
	if(score.trim() != "")
		school_records.updateStudentScore([studentId,subjectId,score],function(err){
			if(err) res.end("Operation failed");
			else
				res.redirect("/students/"+studentId);
		});
	else res.end("Some fields are empty");	
};

exports.update_subject_name = function(req,res){
	var subjectId = req.params.id;
	var nameForChange = req.params.name;
	var subjectName = req.query.changeName;
	var subjects = {"nameForChange":nameForChange,"id":subjectId,"subjectToChange":subjectName};
	if(subjectName.trim() != "")
		school_records.updateSubjectName(subjects,function(err){
			if(err) res.end("Operation failed");
			  else{ 
			  	(nameForChange==undefined)?
				res.redirect("/subject/"+subjectId):
				res.redirect("/subjects"); 
			}
		});
	else res.end("Some fields are empty");	
};

exports.add_new_student = function(req,res){
 	school_records.getGrades(function(err,grades){
 		res.render('addStudent',{grades:grades});
 	});	
};

exports.add_student = function(req,res){
 	var grade_id = req.query.grades;
 	var studentname = req.query.studentName;
 	var obj = {"studentName":studentname,"gradeId":grade_id};
 	school_records.addStudent(obj,function(err){
 		if(err) res.end("Opeertaion failed");
 		else
 		res.redirect("/grades/"+grade_id);	
 	})
 };

exports.add_new_subjects = function(req,res){
 	school_records.getGrades(function(err,grades){
 		res.render('addSubject',{grades:grades});
 	});	
};

exports.add_subject = function(req,res){
 	var grade_id = req.query.grades;
 	var subjectName = req.query.SubjectName;
 	var maxScore = req.query.maxScore;
 	var obj = {"subjectName":subjectName,"gradeId":grade_id,"maxScore":maxScore};
 	school_records.addSubject(obj,function(err){
 		if(err) res.end("Operation failed");
 		else
 		res.redirect("/grades/"+grade_id);	
 	})
 };