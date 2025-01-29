from flask import Blueprint, request, jsonify, render_template, current_app
from user_manager import UserManager
from models import db  # Ensure `db` is imported from `models`

# Create a Blueprint for user-related routes
user_routes = Blueprint('user_routes', __name__)

# Initialize the UserManager with the database
user_manager = UserManager(db)


### --- User Management Routes --- ###

@user_routes.route('/register', methods=['GET', 'POST'])
def register():
    """
    Handles user registration.
    
    - **GET**: Returns the registration form.
    - **POST**: Registers a new user using form data.

    Returns:
        - HTML page (GET) or JSON response (POST).
    """
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
    """
    Retrieves a list of all registered users sorted by a given parameter.

    Query Parameters:
        - sort (str, optional): Field to sort users by. Default is "id".

    Returns:
        - HTML page with the user list.
    """
    sort_by = request.args.get('sort', 'id')
    all_users = user_manager.get_users(sort_by)
    
    response = render_template('users.html', users=all_users)
    response.headers['Cache-Control'] = 'no-store'  # Prevent caching
    return response


@user_routes.route('/delete', methods=['POST'])
def delete_user():
    """
    Deletes a specific user by ID.

    Form Parameters:
        - id (int): ID of the user to delete.

    Returns:
        - JSON response with success or error message.
    """
    user_id = request.form.get('id')
    if not user_id:
        return jsonify({"message": "User ID is required."}), 400
    return user_manager.delete_user(user_id)


@user_routes.route('/delete_all', methods=['POST'])
def delete_all_users():
    """
    Deletes all users from the database.

    Returns:
        - JSON response confirming deletion.
    """
    return user_manager.delete_all_users()


@user_routes.route('/backup', methods=['POST'])
def backup_users():
    """
    Creates a backup of all users, storing them in an S3 bucket or locally.

    Returns:
        - JSON response with backup status.
    """
    return user_manager.backup_users()


@user_routes.route('/restore', methods=['POST'])
def restore_users():
    """
    Restores users from the backup stored in the S3 bucket.

    Returns:
        - JSON response with restore status.
    """
    return user_manager.restore_users()


@user_routes.route('/update_user/<int:user_id>', methods=['POST'])
def update_user(user_id):
    """
    Updates a specific user's information.

    Path Parameters:
        - user_id (int): ID of the user to update.

    JSON Payload:
        - Updated user fields.

    Returns:
        - JSON response with success or error message.
    """
    data = request.get_json()
    return user_manager.update_user(user_id, data)


@user_routes.route('/reorder', methods=['POST'])
def reorder_users():
    """
    Reorders user IDs sequentially after a user is deleted.

    Returns:
        - JSON response confirming the reordering.
    """
    return user_manager.reorder_users()


### --- S3 Bucket Management Routes --- ###

@user_routes.route('/save_bucket_name', methods=['POST'])
def save_bucket_name():
    """
    Saves the selected S3 bucket name in memory or configuration.

    JSON Payload:
        - bucket_name (str): Name of the selected S3 bucket.

    Returns:
        - JSON response with success or error message.
    """
    data = request.get_json()
    bucket_name = data.get('bucket_name')
    if not bucket_name:
        return jsonify({"message": "Bucket name is required."}), 400
    return user_manager.save_bucket_name(bucket_name)


@user_routes.route('/get_saved_bucket_name', methods=['GET'])
def get_saved_bucket_name():
    """
    Retrieves the currently saved S3 bucket name.

    Returns:
        - JSON response containing the saved bucket name.
    """
    bucket_name = user_manager.get_bucket_name()
    return jsonify({"bucket_name": bucket_name or "None"}), 200


@user_routes.route('/list_buckets', methods=['GET'])
def list_buckets_route():
    """
    Lists all available S3 buckets in the AWS account.

    Returns:
        - JSON response containing a list of bucket names.
    """
    buckets = user_manager.list_buckets()
    return jsonify({"buckets": buckets}), 200


@user_routes.route('/create_bucket', methods=['POST'])
def create_bucket():
    """
    Creates a new S3 bucket in the specified AWS region.

    JSON Payload:
        - bucket_name (str): Name of the new bucket.
        - region (str, optional): AWS region (default is us-east-1).

    Returns:
        - JSON response confirming bucket creation or error message.
    """
    try:
        data = request.get_json()  # Retrieve JSON payload
        bucket_name = data.get('bucket_name')
        region = data.get('region', 'us-east-1')  # Default to 'us-east-1'

        if not bucket_name:
            return jsonify({"message": "Bucket name is required."}), 400

        response = user_manager.create_bucket(bucket_name, region)
        return jsonify({"message": response, "success": True}), 200
    except Exception as e:
        current_app.logger.error(f"Error creating bucket: {e}")
        return jsonify({"message": f"An error occurred while creating the bucket: {e}", "success": False}), 500


### --- Sentiment Analysis Route --- ###

@user_routes.route('/analyze_sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Performs sentiment analysis on user notes using a BERT model.

    JSON Payload:
        - notes (str): Text input for sentiment analysis.

    Returns:
        - JSON response with sentiment result.
    """
    data = request.get_json()
    notes = data.get('notes', '')

    if not notes:
        return jsonify({"message": "No notes provided for sentiment analysis."}), 400

    # Call the method from UserManager for sentiment analysis
    return user_manager.analyze_sentiment(notes)
