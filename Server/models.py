from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'Users'
    user_id = db.Column(db.Integer, primary_key=True)
    role = db.Column(db.Enum('Faculty', 'Student'), nullable=False)
    college_email = db.Column(db.String(255), unique=True, nullable=False)
    hashed_password = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, server_default=db.func.now())
    is_profile_complete = db.Column(db.Boolean, default=False) 
    

class Department(db.Model):
    __tablename__ = 'Departments'
    department_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), unique=True, nullable=False)

class Technologies(db.Model):
    __tablename__ = 'technologies'

    technology_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), unique=True, nullable=False)

    # Relationships
    faculty_technologies = db.relationship('FacultyTechnology', back_populates='technology')
    student_technologies = db.relationship('StudentTechnology', back_populates='technology')
    project_technologies = db.relationship('ProjectTechnology', back_populates='technology')
     
class themes(db.Model):
    __tablename__='themes'
    theme_id=db.Column(db.Integer,primary_key=True)
    name=db.Column(db.String(255),unique=True,nullable=False)
    project_themes = db.relationship('ProjectTheme', back_populates='theme')

# Project-Departments Table (Many-to-Many Relationship)
class ProjectDepartment(db.Model):
    __tablename__ = 'Project_Departments'
    project_id = db.Column(db.Integer, db.ForeignKey('Projects.project_id'), primary_key=True)
    department_id = db.Column(db.Integer, db.ForeignKey('Departments.department_id'), primary_key=True)

# Faculty Table
class Faculty(db.Model):
    __tablename__ = 'faculty'
    faculty_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('Departments.department_id'), nullable=False)
    designation = db.Column(db.String(100))
    role = db.Column(db.String(100))
    personal_email = db.Column(db.String(255))
    phone_no = db.Column(db.String(15))
    linkedin_profile = db.Column(db.String(255))
    github_profile = db.Column(db.String(255))
    image = db.Column(db.LargeBinary)
    faculty_technologies = db.relationship('FacultyTechnology', back_populates='faculty')
    project_faculty = db.relationship('ProjectFaculty', back_populates='faculty')



# Students Table
class Student(db.Model):
    __tablename__ = 'Students'
    student_id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    name = db.Column(db.String(255), nullable=False)
    usn = db.Column(db.String(20), unique=True, nullable=False)
    department_id = db.Column(db.Integer, db.ForeignKey('Departments.department_id'), nullable=False)
    cgpa = db.Column(db.Numeric(3, 2))
    personal_email = db.Column(db.String(255))
    phone_no = db.Column(db.String(15))
    linkedin_profile = db.Column(db.String(255))
    github_profile = db.Column(db.String(255))
    image = db.Column(db.LargeBinary)
    student_technologies = db.relationship('StudentTechnology', back_populates='student')
    project_students = db.relationship('ProjectStudent', back_populates='student')

class Project(db.Model):
    __tablename__ = 'projects'

    project_id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    budget = db.Column(db.Numeric(10, 2))
    status = db.Column(db.Enum('Ongoing', 'Completed', 'Proposed'), default='Proposed')
    students_involved_count = db.Column(db.Integer)
    start_date = db.Column(db.Date)
    end_date = db.Column(db.Date)
    github_link = db.Column(db.String(255))
    image = db.Column(db.LargeBinary)
    owner_id = db.Column(db.Integer, db.ForeignKey('Users.user_id'), nullable=False)
    # Relationships
    owner = db.relationship('User', backref='projects')
    project_technologies = db.relationship('ProjectTechnology', back_populates='project')
    project_themes = db.relationship('ProjectTheme', back_populates='project')
    project_students = db.relationship('ProjectStudent', back_populates='project')
    project_faculty = db.relationship('ProjectFaculty', back_populates='project')
# Project-Students Table (Many-to-Many Relationship)

class ProjectStudent(db.Model):
    __tablename__ = 'project_students'
    project_id = db.Column(db.Integer, db.ForeignKey('projects.project_id'), primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('Students.student_id'), primary_key=True)
    project = db.relationship('Project', back_populates='project_students')
    student = db.relationship('Student', back_populates='project_students')

# Project-Faculty Table (Many-to-Many Relationship)
class ProjectFaculty(db.Model):
    __tablename__ = 'project_faculty'
    project_id = db.Column(db.Integer, db.ForeignKey('projects.project_id'), primary_key=True)
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.faculty_id'), primary_key=True)
    project = db.relationship('Project', back_populates='project_faculty')
    faculty = db.relationship('Faculty', back_populates='project_faculty')    

class StudentTechnology(db.Model):
    __tablename__ = 'student_technologies'
    student_id = db.Column(db.Integer, db.ForeignKey('Students.student_id'), primary_key=True)
    technology_id = db.Column(db.Integer, db.ForeignKey('technologies.technology_id'), primary_key=True)

    student = db.relationship('Student', back_populates='student_technologies')
    technology = db.relationship('Technologies', back_populates='student_technologies')


class FacultyTechnology(db.Model):
    __tablename__ = 'faculty_technologies'
    
    faculty_id = db.Column(db.Integer, db.ForeignKey('faculty.faculty_id'), primary_key=True, nullable=False)
    technology_id = db.Column(db.Integer, db.ForeignKey('technologies.technology_id'), primary_key=True, nullable=False)

    # Relationships
    faculty = db.relationship('Faculty', back_populates='faculty_technologies')
    technology = db.relationship('Technologies', back_populates='faculty_technologies')


class ProjectTheme(db.Model):
    __tablename__ = 'project_themes'
    project_id = db.Column(db.Integer, db.ForeignKey('projects.project_id'), primary_key=True)
    theme_id = db.Column(db.Integer, db.ForeignKey('themes.theme_id'), primary_key=True)
    project = db.relationship('Project', back_populates='project_themes')
    theme = db.relationship('themes', back_populates='project_themes')

class ProjectTechnology(db.Model):
    __tablename__ = 'project_technologies'
    project_id = db.Column(db.Integer, db.ForeignKey('projects.project_id'), primary_key=True, nullable=False)
    technology_id = db.Column(db.Integer, db.ForeignKey('technologies.technology_id'), primary_key=True, nullable=False)

    project = db.relationship('Project', back_populates='project_technologies')
    technology = db.relationship('Technologies', back_populates='project_technologies')
    


