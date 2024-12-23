from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from config import Config
from flask_cors import CORS
from models import db, User, Project, Department,Technologies,themes,Faculty,Student,StudentTechnology,FacultyTechnology
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

@app.route('/faculty/<int:user_id>', methods=['GET'])
def get_faculty_by_id(user_id):
    try:
        # Query the faculty member by user_id
        faculty = Faculty.query.filter_by(user_id=user_id).first()

        # If the faculty member is not found, return a 404 error
        if not faculty:
            return jsonify({"error": "Faculty member not found"}), 404

        # Prepare the faculty data for response
        faculty_data = {
            'faculty_id': faculty.faculty_id,
            'name': faculty.name,
            'department_id': faculty.department_id,
            'designation': faculty.designation,
            'role': faculty.role,
            'personal_email': faculty.personal_email,
            'phone_no': faculty.phone_no,
            'linkedin_profile': faculty.linkedin_profile,
            'github_profile': faculty.github_profile
        }

        return jsonify(faculty_data), 200

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": "An error occurred while fetching the faculty member", "details": str(e)}), 500
@app.route('/faculty/<int:user_id>', methods=['PUT'])
def update_faculty_by_id(user_id):
    try:
        # Query the faculty member by user_id
        faculty = Faculty.query.filter_by(user_id=user_id).first()

        # If the faculty member is not found, return a 404 error
        if not faculty:
            return jsonify({"error": "Faculty member not found"}), 404

        # Get the updated data from the request body
        data = request.get_json()

        # Update faculty member fields, ensure they are provided in the request
        if 'name' in data:
            faculty.name = data['name']
        if 'department_id' in data:
            faculty.department_id = data['department_id']
        if 'designation' in data:
            faculty.designation = data['designation']
        if 'role' in data:
            faculty.role = data['role']
        if 'personal_email' in data:
            faculty.personal_email = data['personal_email']
        if 'phone_no' in data:
            faculty.phone_no = data['phone_no']
        if 'linkedin_profile' in data:
            faculty.linkedin_profile = data['linkedin_profile']
        if 'github_profile' in data:
            faculty.github_profile = data['github_profile']

        # Commit the changes to the database
        db.session.commit()

        # Prepare the updated faculty data for response
        updated_faculty_data = {
            'faculty_id': faculty.faculty_id,
            'name': faculty.name,
            'department_id': faculty.department_id,
            'designation': faculty.designation,
            'role': faculty.role,
            'personal_email': faculty.personal_email,
            'phone_no': faculty.phone_no,
            'linkedin_profile': faculty.linkedin_profile,
            'github_profile': faculty.github_profile
        }

        return jsonify(updated_faculty_data), 200

    except Exception as e:
        # Handle unexpected errors
        return jsonify({"error": "An error occurred while updating the faculty member", "details": str(e)}), 500

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

@app.route('/students/<int:user_id>', methods=['PUT'])
def update_student(user_id):
    # Find the student by user_id
    student = Student.query.filter_by(user_id=user_id).first()
    
    # Check if student exists
    if not student:
        return jsonify({'error': 'Student not found'}), 404
    
    # Get the data from the request
    data = request.json
    
    # Update allowed fields
    try:
        # List of fields that can be updated
        updatable_fields = [
            'name', 
            'personal_email', 
            'phone_no', 
            'linkedin_profile', 
            'github_profile',
            'cgpa'
        ]
        
        # Validate CGPA if present
        if 'cgpa' in data:
            try:
                cgpa = float(data['cgpa'])
                if cgpa < 0 or cgpa > 10:
                    return jsonify({'error': 'CGPA must be between 0 and 10'}), 400
            except (TypeError, ValueError):
                return jsonify({'error': 'CGPA must be a valid number'}), 400
        
        # Update only the allowed fields
        for field in updatable_fields:
            if field in data:
                setattr(student, field, data[field])
        
        # Commit changes to the database
        db.session.commit()
        
        return jsonify({
            'message': 'Student profile updated successfully',
            'student': {
                'name': student.name,
                'personal_email': student.personal_email,
                'phone_no': student.phone_no,
                'linkedin_profile': student.linkedin_profile,
                'github_profile': student.github_profile,
                'cgpa': student.cgpa
            }
        }), 200
    
    except Exception as e:
        # Rollback in case of any error
        db.session.rollback()
        return jsonify({'error': str(e)}), 400

@app.route('/students/<int:user_id>', methods=['GET'])
def get_student_by_user_id(user_id):
    student = Student.query.filter_by(user_id=user_id).first()
    if student:
        return jsonify({
            'student_id': student.student_id,
            'name': student.name,
            'usn': student.usn,
            'department_id': student.department_id,
            'cgpa': str(student.cgpa),
            'personal_email': student.personal_email,
            'phone_no': student.phone_no,
            'linkedin_profile': student.linkedin_profile,
            'github_profile': student.github_profile,
            'image': student.image.decode('utf-8') if student.image else None  # Ensure binary data is encoded
        })
    else:
        return jsonify({'error': 'Student not found'}), 404

@app.route('/student_technologies', methods=['POST'])
def update_student_technologies():
    try:
        data = request.get_json()
        student_id = data.get('student_id')
        technology_ids = data.get('technology_ids')  # Accept an array of technology IDs

        if not student_id or not technology_ids:
            return jsonify({"error": "student_id and technology_ids are required"}), 400

        if not isinstance(technology_ids, list) or not all(isinstance(t_id, int) for t_id in technology_ids):
            return jsonify({"error": "technology_ids must be a list of integers"}), 400

        # Check if the student ID exists
        student = Student.query.get(student_id)
        if not student:
            return jsonify({"error": "Student not found"}), 404

        # Check if all technology IDs exist
        valid_technologies = Technologies.query.filter(Technologies.technology_id.in_(technology_ids)).all()
        if len(valid_technologies) != len(technology_ids):
            return jsonify({"error": "Some technology IDs are invalid"}), 400

        # Clear existing technologies for the student
        StudentTechnology.query.filter_by(student_id=student_id).delete()

        # Add new student-technology entries
        new_entries = [
            StudentTechnology(student_id=student_id, technology_id=technology_id)
            for technology_id in technology_ids
        ]
        db.session.add_all(new_entries)
        db.session.commit()

        # Return updated list of technologies
        updated_technologies = StudentTechnology.query.filter_by(student_id=student_id).all()
        return jsonify({
            "message": "Student technologies updated successfully",
            "technologies": [{"id": t.technology_id, "name": t.technology.name} for t in updated_technologies]
        }), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

# GET: Retrieve all technologies for a student


# PUT: Update a student's technology
@app.route('/student_technologies', methods=['PUT'])
def update_student_technology():
    data = request.get_json()
    student_id = data.get('student_id')
    old_technology_id = data.get('old_technology_id')
    new_technology_id = data.get('new_technology_id')

    if not student_id or not old_technology_id or not new_technology_id:
        return jsonify({"error": "student_id, old_technology_id, and new_technology_id are required"}), 400

    tech_entry = StudentTechnology.query.filter_by(student_id=student_id, technology_id=old_technology_id).first()

    if not tech_entry:
        return jsonify({"error": "Technology entry not found"}), 404

    tech_entry.technology_id = new_technology_id
    db.session.commit()
    return jsonify({"message": "Student technology updated successfully"}), 200

# POST: Add a new technology for a faculty
@app.route('/faculty_technologies', methods=['POST'])
def update_faculty_technologies():
    try:
        data = request.get_json()
        faculty_id = data.get('faculty_id')
        technology_ids = data.get('technology_ids')  # Accept an array of technology IDs

        if not faculty_id or not technology_ids:
            return jsonify({"error": "faculty_id and technology_ids are required"}), 400

        if not isinstance(technology_ids, list) or not all(isinstance(t_id, int) for t_id in technology_ids):
            return jsonify({"error": "technology_ids must be a list of integers"}), 400

        # Check if the faculty ID exists
        faculty = Faculty.query.get(faculty_id)
        if not faculty:
            return jsonify({"error": "Faculty not found"}), 404

        # Check if all technology IDs exist
        valid_technologies = Technologies.query.filter(Technologies.technology_id.in_(technology_ids)).all()
        if len(valid_technologies) != len(technology_ids):
            return jsonify({"error": "Some technology IDs are invalid"}), 400

        # Clear existing technologies for the faculty
        FacultyTechnology.query.filter_by(faculty_id=faculty_id).delete()

        # Add new faculty-technology entries
        new_entries = [
            FacultyTechnology(faculty_id=faculty_id, technology_id=technology_id)
            for technology_id in technology_ids
        ]
        db.session.add_all(new_entries)
        db.session.commit()

        # Return updated list of technologies
        updated_technologies = FacultyTechnology.query.filter_by(faculty_id=faculty_id).all()
        return jsonify({
            "message": "Faculty technologies updated successfully",
            "technologies": [{"id": t.technology_id, "name": t.technology.name} for t in updated_technologies]
        }), 200 if request.method == 'PUT' else 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred", "details": str(e)}), 500

@app.route('/faculty_technologies/<int:faculty_id>', methods=['PUT'])
def update_faculty_technologies_put(faculty_id):
    try:
        data = request.get_json()
        technology_ids = data.get('technology_ids')  # Accept an array of technology IDs

        if not technology_ids:
            return jsonify({"error": "technology_ids are required"}), 400

        if not isinstance(technology_ids, list) or not all(isinstance(t_id, int) for t_id in technology_ids):
            return jsonify({"error": "technology_ids must be a list of integers"}), 400

        # Check if the faculty ID exists
        faculty = Faculty.query.get(faculty_id)
        if not faculty:
            return jsonify({"error": "Faculty not found"}), 404

        # Check if all technology IDs exist
        valid_technologies = Technologies.query.filter(Technologies.technology_id.in_(technology_ids)).all()
        if len(valid_technologies) != len(technology_ids):
            return jsonify({"error": "Some technology IDs are invalid"}), 400

        # Clear existing technologies for the faculty
        FacultyTechnology.query.filter_by(faculty_id=faculty_id).delete()

        # Add new faculty-technology entries
        new_entries = [
            FacultyTechnology(faculty_id=faculty_id, technology_id=technology_id)
            for technology_id in technology_ids
        ]
        db.session.add_all(new_entries)
        db.session.commit()

        # Return updated list of technologies
        updated_technologies = FacultyTechnology.query.filter_by(faculty_id=faculty_id).all()
        return jsonify({
            "message": "Faculty technologies updated successfully",
            "technologies": [{"id": t.technology_id, "name": t.technology.name} for t in updated_technologies]
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": "An error occurred", "details": str(e)}), 500


# GET: Retrieve all technologies for a faculty
@app.route('/faculty_technologies/<int:faculty_id>', methods=['GET'])
def get_faculty_technologies(faculty_id):
    technologies = FacultyTechnology.query.filter_by(faculty_id=faculty_id).all()
    return jsonify([{"faculty_id": tech.faculty_id, "technology_id": tech.technology_id} for tech in technologies]), 200

@app.route('/student_technologies/<int:student_id>', methods=['GET'])
def get_student_technologies(student_id):
    technologies = StudentTechnology.query.filter_by(student_id=student_id).all()
    return jsonify([{"student_id": tech.student_id, "technology_id": tech.technology_id} for tech in technologies]), 200
   

@app.cli.command('initdb')
def init_db():
    with app.app_context():
        db.create_all()
        print("Database initialized.")

if __name__ == '__main__':
    with app.app_context():
        db.create_all()  # Ensure tables are created
    app.run(debug=True,port=8080)
