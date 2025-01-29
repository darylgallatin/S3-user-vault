#!/usr/bin/env python3
from flask_sqlalchemy import SQLAlchemy
from flask import request, jsonify, current_app
from models import User  # Import the User model
from transformers import BertTokenizer, BertForSequenceClassification
import torch
import json
import boto3
import os
from botocore.exceptions import NoCredentialsError, PartialCredentialsError, EndpointConnectionError, ClientError
import logging
"""This program provides a UserManager class to manage user records in a Flask application.
   It uses SQLAlchemy for database interaction and offers features for registering users,
   updating their information, deleting records, and managing backups to/from AWS S3. 
   It includes utilities for reordering user IDs and restoring backups. 
   The UserManager encapsulates all user-related operations, improving maintainability and 
   modularity.

Program/File structure 
├── app.py             # Main Flask app
├── models.py          # Database models
├── user_manager.py    # UserManager logic
├── routes/            # Directory for blueprints
│   ├── __init__.py    # Makes `routes` a package
│   ├── user_routes.py # Blueprint for user routes
└── templates/         # HTML template

This software is available under GPL license.
Author: Daryl Gallatin
Year: 2025
License: GNU GENERAL PUBLIC LICENSE (GPL)
 """



class UserManager:
    def __init__(self, db):
        """
        Initialize the UserManager class with a SQLAlchemy database session.
        :param db: SQLAlchemy database session
        """
        self.bucket_name = None  # Initialize bucket name
        self.db = db
        self.tokenizer = BertTokenizer.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
        self.model = BertForSequenceClassification.from_pretrained("nlptown/bert-base-multilingual-uncased-sentiment")
      

    def register_user(self, username, email, password, phone=None, notes=None):
        """
        Register a new user in the database.
        :param username: Username of the new user
        :param email: Email address of the new user
        :param password: Password of the new user
        :param phone: (Optional) Phone number of the new user
        :param notes: (Optional) Notes for the new user
        :return: Success or error message with HTTP status code
        """
        try:
            new_user = User(
                username=username,
                email=email,
                password=password,
                phone=phone,
                notes=notes
            )
            self.db.session.add(new_user)
            self.db.session.commit()
            return "User Registered Successfully.", 201
        except Exception as e:
            self.db.session.rollback()
            return f"User Already Exists. Error: {e}", 400

    def get_users(self, sort_by="id"):
        """
        Retrieve all users from the database, sorted by a specified column.
        :param sort_by: Column name to sort by (default is 'id')
        :return: List of User objects
        """
        valid_columns = ['id', 'username', 'email', 'phone', 'notes']
        if sort_by not in valid_columns:
            sort_by = 'id'
        return User.query.order_by(sort_by).all()

    def delete_user(self, user_id):
        """
        Delete a user by their ID.
        :param user_id: ID of the user to delete
        :return: Success or error message with HTTP status code
        """
        try:
            user = self.db.session.get(User, user_id)
            if not user:
                return jsonify({"message": f"No user found with ID {user_id}."}), 404

            self.db.session.delete(user)
            self.db.session.commit()
            return jsonify({"message": f"User with ID {user_id} deleted successfully."}), 200
        except Exception as e:
            self.db.session.rollback()
            return jsonify({"message": f"An error occurred: {str(e)}"}), 500


    def delete_all_users(self):
        """
        Delete all user records from the database.
        :return: Success or error message with HTTP status code
        """
        try:
            User.query.delete()
            self.db.session.commit()
            return "All users deleted successfully", 200
        except Exception as e:
            self.db.session.rollback()
            return {f"Error: {str(e)}"}, 500

    def backup_users(self):
        """
        Backup user records to an S3 bucket or a local file if S3 upload fails.
        :return: Success or error message with HTTP status code
        """
        users = User.query.all()
        user_data = [
            {
                "id": user.id,
                "username": user.username,
                "email": user.email,
                "password": user.password,
                "phone": user.phone,
                "notes": user.notes
            }
            for user in users
        ]
        backup_file = "backup_users.json"

        try:
            # Serialize and upload to S3
            json_data = json.dumps(user_data)
            s3 = boto3.client('s3')
            #bucket_name = "s3-vault-bucket"
            s3.put_object(Bucket=self.bucket_name, Key="backup_users.json", Body=json_data)
            return {"message": "Backup successfully uploaded to S3."}, 200
        except Exception:
            # Save locally on failure
            with open(backup_file, "w") as file:
                json.dump(user_data, file)
            return {"message": f"No S3 detected or acccess not allowed. Backup saved locally as {backup_file}."}, 500

    def restore_users(self):
        """
        Restore user records from an S3 backup file.
        :return: Success or error message with HTTP status code
        """
       # bucket_name = "s3-vault-bucket"
        object_key = "backup_users.json"

        try:
            # Fetch backup from S3
            s3 = boto3.client('s3')
            response = s3.get_object(Bucket=self.bucket_name, Key=object_key)
            user_data = json.loads(response['Body'].read().decode('utf-8'))

            # Clear existing data
            User.query.delete()
            self.db.session.commit()

            # Insert restored data
            for user in user_data:
                new_user = User(
                    id=user.get('id'),
                    username=user.get('username'),
                    email=user.get('email'),
                    password=user.get('password', "defaultpassword"),
                    phone=user.get('phone'),
                    notes=user.get('notes')
                )
                self.db.session.add(new_user)
            self.db.session.commit()
            return {"message": "User list successfully restored from S3."}, 200
        except Exception as e:
            return {"message": f"An error occurred: {str(e)}"}, 500

    def update_user(self, user_id, data):
        """
        Update user information for a given user ID.
        :param user_id: ID of the user to update
        :param data: Dictionary containing fields to update
        :return: Success or error message with HTTP status code
        """
        try:
            user = self.db.session.get(User, user_id)
            if not user:
                return {"message": f"User with ID {user_id} not found."}, 404

            user.username = data.get('username', user.username)
            user.email = data.get('email', user.email)
            user.phone = data.get('phone', user.phone)
            user.notes = data.get('notes', user.notes)
        # Commit the changes to the database
            self.db.session.commit()
            return ({"message": f"User {user_id} updated successfully."}), 200
        except Exception as e:
            self.db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500

    def reorder_users(self):
        """
        Reorder user IDs sequentially in the database.
        :return: Success or error message with HTTP status code
        """
        try:
            users = User.query.order_by(User.id).all()
            for index, user in enumerate(users, start=1):
                user.id = index
            self.db.session.commit()
            return {"message": "User IDs reordered successfully."}, 200
        except Exception as e:
            self.db.session.rollback()
            return {"message": f"An error occurred: {str(e)}"}, 500
        


    def save_bucket_name(self, bucket_name):
        """
        Save the bucket name to the backend.
        """
        try:
            if not bucket_name:
                return {"message": "Bucket name is required."}, 400

            # Save the bucket name in memory (or persistent storage if necessary)
            self.bucket_name = bucket_name
            current_app.logger.info(f"Bucket name saved: {bucket_name}")
            return {"message": f"S3 Bucket Name '{bucket_name}' saved successfully."}, 200
        except Exception as e:
            current_app.logger.error(f"Error saving bucket name: {e}")
            return {"message": "An error occurred while saving the bucket name."}, 500


    def get_bucket_name(self):
        """
        Retrieve the saved bucket name from the class variable.
        :return: The saved bucket name or None
        """
        return self.bucket_name



    def list_buckets(self):
        """
        Fetches and returns a list of all available S3 buckets in the AWS account.

        :return: A list of S3 bucket names if successful, otherwise an empty list.
        :rtype: list
        :raises Exception: If an error occurs while retrieving the bucket list.

        **Example Usage:**
        ```python
        user_manager = UserManager()
        buckets = user_manager.list_buckets()
        print(buckets)  # Output: ['my-bucket-1', 'my-bucket-2']
        ```
        """
        try:
            s3 = boto3.client('s3')
            buckets = s3.list_buckets()
            bucket_names = [bucket['Name'] for bucket in buckets['Buckets']]
            logging.info(f"Available Buckets: {bucket_names}")
            return bucket_names
        except Exception as e:
            logging.error(f"Error listing buckets: {e}")
            return []

    def create_bucket(self, bucket_name, region='us-east-1'):
        """
        Create a new S3 bucket in a specified region.
        :param bucket_name: Name of the S3 bucket
        :param region: AWS region to create the bucket in (default: us-east-1)
        :return: Success message or raises an exception
        """
        try:
            s3 = boto3.client('s3', region_name=region)
            
            if region == 'us-east-1':
                # Special case for us-east-1, no CreateBucketConfiguration required
                s3.create_bucket(Bucket=bucket_name)
            else:
                # Specify the region for all other regions
                s3.create_bucket(
                    Bucket=bucket_name,
                    CreateBucketConfiguration={'LocationConstraint': region}
                )
            return f"Bucket '{bucket_name}' created successfully in region '{region}'."
        except Exception as e:
            raise Exception(f"Failed to create bucket '{bucket_name}' in region '{region}': {str(e)}")


    def analyze_sentiment(self, notes):
        """
        Analyzes the sentiment of a given text (notes) using a pre-trained BERT model.

        :param notes: The input text for sentiment analysis.
        :type notes: str
        :return: A dictionary containing the sentiment result and HTTP status code.
        :rtype: tuple(dict, int)
        :raises Exception: If an error occurs during sentiment analysis.

        **Sentiment Labels:**
        - **Very Negative**
        - **Negative**
        - **Neutral**
        - **Positive**
        - **Very Positive**

        **Example Usage:**
        ```python
        user_manager = UserManager()
        result, status_code = user_manager.analyze_sentiment("I love this product!")
        print(result)  # Output: {"sentiment": "Very Positive"}
        ```
        """
        try:
            # Tokenize the input notes
            inputs = self.tokenizer(notes, return_tensors="pt", truncation=True, padding=True, max_length=512)
            outputs = self.model(**inputs)
            scores = torch.softmax(outputs.logits, dim=1).detach().numpy()

            # Determine the sentiment
            sentiment_labels = ['Very Negative', 'Negative', 'Neutral', 'Positive', 'Very Positive']
            sentiment = sentiment_labels[scores.argmax()]
            
            return {"sentiment": sentiment}, 200
        except Exception as e:
            return {"message": f"Error analyzing sentiment: {str(e)}"}, 500