# S3-user-vault
A lightweight, cloud-ready web application for storing and managing user information, with optional machine learning features. Designed for AWS S3 integration but can run locally with limited functionality.

---

## Features
- **User Registration**: Add details such as username, email, phone number, and notes. A password field exists but is currently unused and may be removed.
- **User Management**: View, update, delete, reorder users, and add notes.
- **AWS S3 Integration**: Automatically saves and loads the user list to and from an S3 bucket.
- **Web Interface**: Responsive CSS/Bootstrap-based UI for easy interaction.
- **Sentiment Analysis**: Uses PyTorch with a pre-trained BERT model to determine the tone of user notes (Positive, Neutral, Negative).
<img width="1633" height="943" alt="S3_user_vault_screenshot" src="https://github.com/user-attachments/assets/b2245706-7823-4ca1-8625-82a8b8f24071" />

---

## Prerequisites
To run this program, you need:
- Python 3.9 or later
- Docker (optional, for containerization)
   repo located https://hub.docker.com/r/gman9500/s3-user-vault 
- AWS credentials with permissions to access S3 (for bucket operations)


libaries needed
Flask 3.1.0
boto3 1.36.1
Flask-SQLAlchemy 3.1.1
torch
transformers


AS of this version, application updated to include  allowing you to create an s3 bucket but only for the default region  for now
Make sure the EC2 has access to it by adding a policy to it. 
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


#################################################################################################
    NOTE!! t2.micro instance barely runs this program and often locks up within a few minutes. 
           I recommend using  at least a t2.medium   2 CPU 4G of RAM to run this
#################################################################################################

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
    
    S3 creation in the web app is done for Region 1 only. 

3. Attach IAM Role to the EC2 Instance

    Navigate to EC2 > Instances in the AWS Management Console.
    Select your EC2 instance.
    Click Actions > Security > Modify IAM Role.
    Attach the IAM role you created.
