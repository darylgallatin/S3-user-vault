# S3-user-vault
A simple cloud-based web application for entering and managing user information. Though you can run it locally on your PC if you want, but right now you won't be able to save the database to your PC.  S3 bucket on AWS only.

---

## Features
- **User Registration**: Allows users to input their details, such as username, email, phone number, and notes.
- **User Management**: Displays a list of registered users that can be updated, deleted, or reordered.
- **S3 Integration**: Saves the user list to an S3 bucket and restores it when needed.
- **Web UI**: Provides a CSS/Bootstrap-based frontend for interaction.

---


## Prerequisites
To run this program, you need:
- Python 3.9 or later
- Docker (optional, for containerization)
- AWS credentials with permissions to access S3 (for bucket operations)


libaries needed
Flask 3.1.0
boto3 1.36.1
Flask-SQLAlchemy 3.1.1


AS of this version, you'll need to create the S3 bucket ahead of time and make sure the EC2 has access to it by adding a pllicy to it. 
When creating the EC2 instance or afterward:

    Allow HTTP Access:
        Ensure the EC2 instance's security group allows HTTP (port 80) if you plan to run a web server (e.g., Nginx) alongside Flask.
        Add an inbound rule for HTTP:
            Type: HTTP
            Protocol: TCP
            Port Range: 80
            Source: Anywhere (0.0.0.0/0) or restrict to specific IPs for security.
    Allow Flask (Port 5000):
        Add another inbound rule for port 5000:
            Type: Custom TCP Rule
            Protocol: TCP
            Port Range: 5000
            Source: Anywhere (0.0.0.0/0) or restrict to specific IPs.

To add these rules:

    Go to the AWS Management Console.
    Navigate to EC2 > Instances > Security Groups.
    Select the security group attached to your EC2 instance.
    Under Inbound Rules, click Edit and add the necessary rules.



Instructions for Configuring the EC2 for Running the Flask Application
1. Allow HTTP Access and Port 5000 in Security Group

When creating the EC2 instance or afterward:

    Allow HTTP Access:
        Ensure the EC2 instance's security group allows HTTP (port 80) if you plan to run a web server (e.g., Nginx) alongside Flask.
        Add an inbound rule for HTTP:
            Type: HTTP
            Protocol: TCP
            Port Range: 80
            Source: Anywhere (0.0.0.0/0) or restrict to specific IPs for security.
    Allow Flask (Port 5000):
        Add another inbound rule for port 5000:
            Type: Custom TCP Rule
            Protocol: TCP
            Port Range: 5000
            Source: Anywhere (0.0.0.0/0) or restrict to specific IPs.

To add these rules:

    Go to the AWS Management Console.
    Navigate to EC2 > Instances > Security Groups.
    Select the security group attached to your EC2 instance.
    Under Inbound Rules, click Edit and add the necessary rules.

2. Create an IAM Role with S3 Access

To allow your Flask application to interact with S3:

    Go to the AWS Management Console.
    Navigate to IAM > Roles.
    Click Create Role and follow these steps:
        Trusted Entity Type: AWS service.
        Use Case: EC2.
    Click Next to attach a policy:
        Search for AmazonS3FullAccess (or a custom policy with limited S3 permissions).
        Attach the policy.
    Complete the role creation process.

3. Attach IAM Role to the EC2 Instance

    Navigate to EC2 > Instances in the AWS Management Console.
    Select your EC2 instance.
    Click Actions > Security > Modify IAM Role.
    Attach the IAM role you created.
