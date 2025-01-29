# S3-user-vault
A simple cloud-based web application for entering and managing user information. Though you can run it locally on your PC if you want(it will do so if a bucket isn't detected when you try to save, but  right now you won't be able to load it back up locally.  S3 bucket on AWS only.

---

## Features
- **User Registration**: Allows users to input their details, such as username, email, phone number, and notee. Also a  password even though thats not really used atm for anything. I may even remove it
- **User Management**: Displays a list of registered users that can be updated, deleted, reordered and notes added.
- **S3 Integration**: Saves the user list to an S3 bucket and restores it when needed.
- **Web UI**: Provides a CSS/Bootstrap-based frontend for interaction.
- **Analyze Notes**.  A litle Machine Learning added using  the torch library to anaylze the notes and display the tone(Positiive, Neutral, Negative)  of the notes about the user.
   

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
