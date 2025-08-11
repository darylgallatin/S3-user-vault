# 📦 S3-User-Vault

A lightweight, cloud-ready web application for storing and managing user information, with optional machine learning features. Designed for **AWS S3 integration** but can run locally with limited functionality.

---

## ✨ Features

- **User Registration**: Add details such as username, email, phone number, and notes.  
  *(Password field exists but is currently unused and may be removed)*  
- **User Management**: View, update, delete, reorder users, and add notes.
- **AWS S3 Integration**: Automatically saves and loads the user list to and from an S3 bucket.
- **Web Interface**: Responsive CSS/Bootstrap-based UI.
- **Sentiment Analysis**: Uses PyTorch with a pre-trained BERT model to determine the tone of user notes *(Positive, Neutral, Negative)*.

---

## 📸 Screenshot

<img width="1625" height="912" alt="S3_user_vault_screenshot" src="https://github.com/user-attachments/assets/410a41ac-81cb-4d63-8f7a-a64d29cfb930" />

---

## 📋 Prerequisites

- **Python 3.9** or later
- **Docker** *(optional, for containerization)*  
  Repo: [Docker Hub - gman9500/s3-user-vault](https://hub.docker.com/r/gman9500/s3-user-vault)
- AWS credentials with permissions to access S3 *(for bucket operations)*

---

## 📦 Required Python Libraries

Flask==3.1.0

boto3==1.36.1

Flask-SQLAlchemy==3.1.1

torch

transformers



> ⚠️ **Note:** Running locally is not recommended — installing `torch` and `transformers` can take a while.  

---

## 🛠 AWS Setup Instructions

### 1️⃣ Configure EC2 Security Group

When creating the EC2 instance or afterward:

- **Allow HTTP Access (Port 80)**  
  For running a web server like Nginx alongside Flask:
  - Type: HTTP  
  - Protocol: TCP  
  - Port Range: 80  
  - Source: `0.0.0.0/0` *(or restrict to specific IPs for security)*

- **Allow Flask (Port 5000)**  
  For direct Flask access:
  - Type: Custom TCP Rule  
  - Protocol: TCP  
  - Port Range: 5000  
  - Source: `0.0.0.0/0` *(or restrict to specific IPs)*

**To add these rules:**
1. Go to the AWS Management Console.
2. Navigate to **EC2 → Instances → Security Groups**.
3. Select the security group attached to your EC2 instance.
4. Under **Inbound Rules**, click **Edit** and add the necessary rules.

---

### 2️⃣ Create IAM Role with S3 Access

To allow your Flask application to interact with S3:

1. Go to the **AWS Management Console**.
2. Navigate to **IAM → Roles**.
3. Click **Create Role** and follow these steps:
   - **Trusted Entity Type:** AWS service
   - **Use Case:** EC2
4. Click **Next** to attach a policy:
   - Search for **AmazonS3FullAccess** *(or a custom policy with limited S3 permissions)*.
   - Attach the policy.
5. Complete the role creation process.

> **Note:** S3 creation in the web app is currently supported for **Region 1 only**.

---

### 3️⃣ Attach IAM Role to the EC2 Instance

1. Navigate to **EC2 → Instances** in the AWS Management Console.
2. Select your EC2 instance.
3. Click **Actions → Security → Modify IAM Role**.
4. Attach the IAM role you created.

---

## ⚠️ Performance Notes

t2.micro instance barely runs this program and often locks up within a few minutes.
Recommended: at least t2.medium (2 CPU, 4GB RAM) with a 20GB volume.
Use the Ubuntu AMI for your instance.


---

## 🚀 Running via Docker on EC2

1. **Connect to your EC2 instance**
   ```bash
   sudo apt-get update -y
   sudo apt-get install -y docker.io
   sudo systemctl enable --now docker

    Pull the Docker image (v3 is latest)

sudo docker pull gman9500/s3-user-vault:v3

Run the container (example)

sudo docker run -p 5000:5000 gman9500/s3-user-vault:v3

Access the app

    Get your EC2 Public IPv4 DNS from the AWS Console. Example:

ec2-xx-xx-xx-xx.compute-1.amazonaws.com

Add :5000/register to the end:

And then in your browser address field:  ec2-xx-xx-xx-xx.compute-1.amazonaws.com:5000/register
