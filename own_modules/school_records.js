var sqlite3 = require("sqlite3").verbose();

var _getGrades = function(db,onComplete){
	var q = 'select * from grades';
	db.all(q,onComplete);
};

var _getStudentsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){		
		db.all('select * from students', function(err1,students){
			grades.forEach(function(g){
				g.students = students.filter(function(s){return s.grade_id==g.id});
			})			
			onComplete(null,grades);
		})
	});	
};

var _addSubject = function(subjectDetails,db,onComplete){
	var query = "insert into subjects('name','maxScore',grade_id)values('"+
		subjectDetails.subjectName+"',"+subjectDetails.maxScore+","+subjectDetails.gradeId+");";
	var stu_sub_ids_query = "select st.id as stu_id, su.id as sub_id from students st,subjects su where  su.name='"+
		subjectDetails.subjectName+"' and st.grade_id ="+subjectDetails.gradeId;
	 db.run(query,function(err){
		 db.all(stu_sub_ids_query,function(st_err,st_id_And_sb_id){
	 		st_id_And_sb_id.forEach(function(stu_sub_ids){
				var update_score_query = "insert into scores('student_id','subject_id')values("+stu_sub_ids.stu_id+","+stu_sub_ids.sub_id+")";
				db.run(update_score_query,function(err){console.log(err)});
			})
	 	})
	 	onComplete(null);
	 });
};

var _addStudent = function(studentDetails,db,onComplete){
	var add_student_query = "insert into students('name','grade_id')values('"+studentDetails.studentName+"',"+studentDetails.gradeId+")";
	var student_id_query = "select id from students where name = '"+studentDetails.studentName+"' and grade_id="+studentDetails.gradeId+";";
	var student_subjects_query = "select id from subjects where grade_id="+studentDetails.gradeId;
		db.get(add_student_query,function(err){
			db.all(student_id_query,function(er,st_id){
				db.all(student_subjects_query,function(e,su_id){
					var subjectIds = su_id.map(function(element){
						return element.id;
					})
				subjectIds.forEach(function(sub_id){
					var update_score_query = "insert into scores('student_id','subject_id')values("+st_id[0].id+","+sub_id+")";
					db.run(update_score_query,function(error){console.log(error)});
				})
			})
		})
		onComplete(null);
	})
};

var _getSubjectsByGrade = function(db,onComplete){
	_getGrades(db,function(err,grades){	
		db.all('select * from subjects', function(err1,subjects){
			grades.forEach(function(g){
				g.subjects = subjects.filter(function(s){return s.grade_id==g.id});
			})	
			onComplete(null,grades);
		})
	});	
};

var _getStudentSummary = function(id, db,onComplete){
	var student_grade_query = 'select s.name as name, s.id as id, g.name as grade_name, g.id as grade_id '+
		'from students s, grades g where s.grade_id = g.id and s.id='+id;
	db.get(student_grade_query,function(est,student){
		if(!student){
			onComplete(null,null);
			return;
		}
		var subject_score_query = 'select su.name, su.id, su.maxScore, sc.score '+
			'from subjects su, scores sc '+
			'where sc.subject_id = su.id and sc.student_id = '+student.id;
		db.all(subject_score_query,function(esc,subjects){			
			student.subjects = subjects;			
			onComplete(null,student);
		})
	});
};

var _getGradeSummary = function(id,db,onComplete){
	var student_query = "select id,name from students where grade_id="+id;
	var subject_query = "select id,name from subjects where grade_id="+id;
	var grade_query = "select id,name from grades where id="+id;
	db.get(grade_query,function(err,grade){
		db.all(student_query,function(est,students){
			grade.students = students;
			db.all(subject_query,function(esu,subjects){
				grade.subjects = subjects;
				onComplete(null,grade);		
			});
		});
	});
};


var _getSubjectSummary = function(id,db,onComplete){
	var query  = ['select sb.id as subject_id, sb.name as subject_name,',
	' sb.maxScore, g.id as  grade_id, g.name as grade_name,',
	' st.name as',
	'  student_name, st.id as student_id, sc.score',
	' as score from students st, grades g,',
	' subjects sb, scores sc where sb.id =',id,
	' and sc.subject_id = ',id,
	' and sc.student_id = st.id ',
	'and st.grade_id = g.id'].join('');
	db.all(query , function(err, subjectSummary){
		onComplete(null , subjectSummary);
	})
};

var _updateGrade = function(updateDb,db,onComplete){
	var query = "update grades set name= '"+updateDb[1]+"' where name='"+updateDb[0]+"';";
	db.run(query,onComplete)
};

var _updateName = function(updateDb,db,onComplete){
	var query = "update students set name ='"+updateDb[1]+"' where name='"+updateDb[0]+"';";
	db.run(query,onComplete);
};

var _updateStudentGrade = function(ids,db,onComplete){
	var query = "update students set grade_id='" + ids[1] + "' where id='" + ids[0] + "';";
	db.run(query,onComplete);
};


var _updateStudentScore = function(ids,db,onComplete){
	var query="update scores set score ="+ids[2]+" where student_id='"+ids[0]+"' and subject_id='"+ids[1]+"';";
	db.run(query,onComplete);

};

var _updateSubjectName = function(subjects,db,onComplete){
	var query1="update subjects set name ='"+subjects.subjectToChange+"' where id='"+subjects.id+"';";
	var query2="update subjects set maxScore ='"+subjects.subjectToChange+"' where name='"+subjects.nameForChange+"';";
	(subjects.nameForChange==undefined)?db.run(query1,onComplete):db.run(query2,onComplete);
};



var init = function(location){	
	var operate = function(operation){
		return function(){
			var onComplete = (arguments.length == 2)?arguments[1]:arguments[0];
			var arg = (arguments.length == 2) && arguments[0];

			var onDBOpen = function(err){
				if(err){onComplete(err);return;}
				db.run("PRAGMA foreign_keys = 'ON';");
				arg && operation(arg,db,onComplete);
				arg || operation(db,onComplete);
				db.close();
			};
			var db = new sqlite3.Database(location,onDBOpen);
		};	
	};

	var records = {		
		getGrades: operate(_getGrades),
		getStudentsByGrade: operate(_getStudentsByGrade),
		getSubjectsByGrade: operate(_getSubjectsByGrade),
		getStudentSummary: operate(_getStudentSummary),
		getGradeSummary: operate(_getGradeSummary),
		getSubjectSummary: operate(_getSubjectSummary),
		updateGrade: operate(_updateGrade),
		updateStudentName:operate(_updateName),
		updateStudentGrade:operate(_updateStudentGrade),
		updateStudentScore:operate(_updateStudentScore),
		updateSubjectName:operate(_updateSubjectName),
		addStudent:operate(_addStudent),
		addSubject:operate(_addSubject)
	};

	return records;
};

exports.init = init;






















// $ sqlite3 tests/data/school.db --header "select st.id, su.id from students st,
// subjects su where su.name = 'TT' and su.grade_id = st.grade_id";