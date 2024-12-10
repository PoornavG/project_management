from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
from flask_cors import CORS
from models import db, User, Project, Department,Technologies,themes,Faculty,Student
import pymysql
from flask_bcrypt import Bcrypt


pymysql.install_as_MySQLdb()

app = Flask(__name__)
bcrypt = Bcrypt(app)
cors=CORS(app,origins='*')
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql+mysqlconnector://{Config.MYSQL_USER}:{Config.MYSQL_PASSWORD}@{Config.MYSQL_HOST}/{Config.MYSQL_DB}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db.init_app(app)

@app.route('/signup', methods=['POST'])
def signup():
    data = request.json
    # Check if email is already registered
    if User.query.filter_by(college_email=data['college_email']).first():
        return jsonify({'message': 'Email already registered!'}), 400
    
    # Hash the password
    hashed_password = bcrypt.generate_password_hash(data['password']).decode('utf-8')
    
    # Create a new user
    new_user = User(
        college_email=data['college_email'],
        hashed_password=hashed_password,
        role=data.get('role', 'Student'),  # Default to 'Student'
        is_profile_complete=False  # Default to False
    )
    
    # Add the new user to the database
    db.session.add(new_user)
    db.session.commit()

    # Return user ID and success message
    return jsonify({
        'message': 'Sign-Up successful!',
        'user_id': new_user.user_id  # Ensure the user_id is returned here
    })


@app.route('/login', methods=['POST'])
def login():
    data = request.json
    user = User.query.filter_by(college_email=data['college_email']).first()

    if user and bcrypt.check_password_hash(user.hashed_password, data['password']):
        return jsonify({'message': 'Login successful!', 'user_id': user.user_id})
    else:
        return jsonify({'message': 'Invalid credentials!'}), 401

@app.route('/users', methods=['GET'])
def get_users():
    users = User.query.all()
    return jsonify([{
        'user_id': user.user_id,
        'role': user.role,
        'college_email': user.college_email,
        'created_at': user.created_at
    } for user in users])


@app.route('/users', methods=['POST'])
def add_user():
    data = request.json
    new_user = User(
        role=data['role'],
        college_email=data['college_email'],
        hashed_password=data['hashed_password']
    )
    db.session.add(new_user)
    db.session.commit()
    return jsonify({'message': 'User added successfully!'})


@app.route('/technologies', methods=['GET'])
def get_technologies():
    technologies = Technologies.query.all()
    return jsonify([{
        'Technology_id': technology.technology_id,
        'Technology_Name':technology.name,
    } for technology in technologies])

@app.route('/technologies', methods=['POST'])
def add_technology():
    data = request.json
    new_technology = Technologies(
        name=data['technology_name']
    )
    db.session.add(new_technology)
    db.session.commit()
    return jsonify({'message': 'Technology added successfully!'})

@app.route('/themes', methods=['GET'])
def get_themes():
    themese = themes.query.all()
    return jsonify([{
        'Theme_id': theme.theme_id,
        'Theme_Name':theme.name,
    } for theme in themese])

@app.route('/themes', methods=['POST'])
def add_theme():
    data = request.json
    new_theme = themes(
        name=data['theme_name']
    )
    db.session.add(new_theme)
    db.session.commit()
    return jsonify({'message': 'Theme added successfully!'})

@app.route('/projects', methods=['GET'])
def get_projects():
    projects = Project.query.all()
    return jsonify([{
        'project_id': project.project_id,
        'name': project.name,
        'description': project.description,
        'budget': str(project.budget),
        'status': project.status,
        'students_involved_count': project.students_involved_count,
        'start_date': project.start_date,
        'end_date': project.end_date,
        'github_link': project.github_link
    } for project in projects])

@app.route('/projects', methods=['POST'])
def add_project():
    data = request.json
    new_project = Project(
        name=data['name'],
        description=data['description'],
        budget=data['budget'],
        status=data['status'],
        students_involved_count=data['students_involved_count'],
        start_date=data['start_date'],
        end_date=data['end_date'],
        github_link=data['github_link']
    )
    db.session.add(new_project)
    db.session.commit()
    return jsonify({'message': 'Project added successfully!'})

@app.route('/departments', methods=['GET'])
def get_departments():
    departments = Department.query.all()
    return jsonify([{
        'department_id': department.department_id,
        'name': department.name
    } for department in departments])

@app.route('/departments', methods=['POST'])
def add_department():
    data = request.json
    new_department = Department(name=data['name'])
    db.session.add(new_department)
    db.session.commit()
    return jsonify({'message': 'Department added successfully!'})

@app.route('/faculty', methods=['GET'])
def get_faculty():
    faculty_members = Faculty.query.all()
    return jsonify([{
        'faculty_id': faculty.faculty_id,
        'name': faculty.name,
        'department_id': faculty.department_id,
        'designation': faculty.designation,
        'role': faculty.role,
        'personal_email': faculty.personal_email,
        'phone_no': faculty.phone_no,
        'linkedin_profile': faculty.linkedin_profile,
        'github_profile': faculty.github_profile
    } for faculty in faculty_members])

@app.route('/faculty', methods=['POST'])
def add_faculty():
    data = request.json
    new_faculty = Faculty(
        user_id=data['user_id'],
        name=data['name'],
        department_id=data['department_id'],
        designation=data['designation'],
        role=data['role'],
        personal_email=data['personal_email'],
        phone_no=data['phone_no'],
        linkedin_profile=data['linkedin_profile'],
        github_profile=data['github_profile']
    )
    db.session.add(new_faculty)
    db.session.commit()
    return jsonify({'message': 'Faculty added successfully!'})

@app.route('/students', methods=['GET'])
def get_students():
    students = Student.query.all()
    return jsonify([{
        'student_id': student.student_id,
        'name': student.name,
        'usn': student.usn,
        'department_id': student.department_id,
        'cgpa': str(student.cgpa),
        'personal_email': student.personal_email,
        'phone_no': student.phone_no,
        'linkedin_profile': student.linkedin_profile,
        'github_profile': student.github_profile
    } for student in students])

@app.route('/students', methods=['POST'])
def add_student():
    data = request.json
    new_student = Student(
        user_id=data['user_id'],
        name=data['name'],
        usn=data['usn'],
        department_id=data['department_id'],
        cgpa=data['cgpa'],
        personal_email=data['personal_email'],
        phone_no=data['phone_no'],
        linkedin_profile=data['linkedin_profile'],
        github_profile=data['github_profile']
    )
    db.session.add(new_student)
    db.session.commit()
    return jsonify({'message': 'Student added successfully!'})




if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(debug=True,port=8080)
