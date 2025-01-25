#user_routes
from flask import Blueprint, request, jsonify, render_template, current_app
from user_manager import UserManager
from models import db  # Ensure `db` is imported from `models`

user_routes = Blueprint('user_routes', __name__)

# Initialize the UserManager
user_manager = UserManager(db)

@user_routes.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'GET':
        return render_template('form.html')
    elif request.method == 'POST':
        data = request.form
        return user_manager.register_user(
            username=data.get('username'),
            email=data.get('email'),
            password=data.get('password'),
            phone=data.get('phone'),
            notes=data.get('notes')
        )

@user_routes.route('/users', methods=['GET'])
def get_users():
    sort_by = request.args.get('sort', 'id')
    all_users = user_manager.get_users(sort_by)
    return render_template('users.html', users=all_users)
    response.headers['Cache-Control'] = 'no-store'

@user_routes.route('/delete', methods=['POST'])
def delete_user():
    user_id = request.form.get('id')
    return user_manager.delete_user(user_id)

@user_routes.route('/delete_all', methods=['POST'])
def delete_all_users():
    return user_manager.delete_all_users()

@user_routes.route('/backup', methods=['POST'])
def backup_users():
    return user_manager.backup_users()

@user_routes.route('/restore', methods=['POST'])
def restore_users():
    return user_manager.restore_users()

@user_routes.route('/update_user/<int:user_id>', methods=['POST'])
def update_user(user_id):
    data = request.get_json()
    return user_manager.update_user(user_id, data)

@user_routes.route('/reorder', methods=['POST'])
def reorder_users():
    return user_manager.reorder_users()

@user_routes.route('/save_bucket_name', methods=['POST'])
def save_bucket_name():
    data = request.get_json()
    bucket_name = data.get('bucket_name')
    if not bucket_name:
        return jsonify({"message": "Bucket name is required."}), 400
    return user_manager.save_bucket_name(bucket_name)


@user_routes.route('/get_saved_bucket_name', methods=['GET'])
def get_saved_bucket_name():
    bucket_name = user_manager.get_bucket_name()
    return jsonify({"bucket_name": bucket_name or "None"}), 200
