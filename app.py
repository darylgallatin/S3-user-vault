#app.py
from flask import Flask
from models import db  # Import db from models
from routes.user_routes import user_routes
"""Main Entry Point for this Program   manage user records in a Flask application.
   It uses SQLAlchemy for database interaction and offers features for registering users,
   updating their information, deleting records, and managing backups to/from AWS S3. 
   It includes utilities for reordering user IDs and restoring backups. 
   The UserManager encapsulates all user-related operations, improving maintainability and 
   modularity.
   
   The User enteres in Information on the REgister page, then can click on the View Users button to list the users

   On the  View users form, the user can edit and update  fields, sort them  , delete, backup and restore the data


Program/File structure
Your Home Directory or wherever you install/
├── app.py             # Main Flask app
├── models.py          # Database models
├── user_manager.py    # UserManager logic
├── routes/            # Directory for blueprints
│   ├── __init__.py    # Makes `routes` a package
│   ├── user_routes.py # Blueprint for user routes
└── templates/         # HTML template
│   ├──form.html       #main form. enter in user info
│   ├──users.html      #display list of users. allosws editing info and , deleting , backing up and restore
├── static/
    ├──css       o
    |  ├──styles.css
    ├──js
       ├──form.js
       ├──users.js

This software is available under GPL license.
Author: Daryl Gallatin
Year: 2025
License: GNU GENERAL PUBLIC LICENSE (GPL)

to start type python app.py 

 """


app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Initialize the database
db.init_app(app)

# Register the Blueprint
app.register_blueprint(user_routes)

# Create database tables if they don't exist
with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)