import os
import smtplib # Python's built-in library for sending emails
from email.mime.text import MIMEText # For structuring email content
from email.header import Header # For handling email headers (like subject)
from fastapi import FastAPI, HTTPException, Request, status # FastAPI library components
from pydantic import BaseModel, EmailStr # For data validation and structure
from dotenv import load_dotenv # To load environment variables from a .env file (for local development only)

# Load environment variables from the .env file.
# This only runs during local development. In deployed environments like Vercel,
# environment variables are usually provided directly by the platform.
load_dotenv()

# Initialize the FastAPI application
app = FastAPI()

# CORS (Cross-Origin Resource Sharing) Middleware:
# This is crucial for allowing your frontend (which will be at a different domain, e.g., your-app.vercel.app)
# to make requests to your backend API (which is also hosted by Vercel, but treated as a separate service).
@app.middleware("http")
async def add_cors_headers(request: Request, call_next):
    response = await call_next(request)
    # IMPORTANT: In a production environment, change '*' to your specific frontend domain for better security (e.g., "https://melih-portfolio.vercel.app")
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "POST, GET, OPTIONS" # Allow POST, GET, and OPTIONS methods
    response.headers["Access-Control-Allow-Headers"] = "Content-Type" # Allow Content-Type header
    return response

# Pydantic Model: Defines the expected structure and validation rules for the incoming contact form data.
# This ensures that data received from the frontend is correctly formatted before processing.
class ContactForm(BaseModel):
    name: str # 'name' must be a string
    email: EmailStr # 'email' must be a valid email format string
    message: str # 'message' must be a string

# API Endpoint: This function will handle HTTP POST requests sent to '/api/contact'.
@app.post("/api/contact")
async def send_contact_email(form_data: ContactForm): # FastAPI automatically validates form_data against ContactForm model
    try:
        # Retrieve email credentials from environment variables.
        # These are kept separate from the code for security.
        EMAIL_USER = os.getenv("EMAIL_USER")
        EMAIL_PASS = os.getenv("EMAIL_PASS")
        EMAIL_HOST = os.getenv("EMAIL_HOST")
        EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587)) # Convert port to integer; default to 587 if not set
        EMAIL_SECURE = os.getenv("EMAIL_SECURE", "false").lower() == "true" # Convert "true"/"false" string to boolean
        TARGET_EMAIL = os.getenv("TARGET_EMAIL") # The email address where contact form messages will be sent

        # Basic check to ensure all necessary email environment variables are set
        if not all([EMAIL_USER, EMAIL_PASS, EMAIL_HOST, TARGET_EMAIL]):
            raise ValueError("Email configuration is incomplete. Please check your environment variables.")

        # Create the email message using MIMEText for plain text content
        msg = MIMEText(f"Name: {form_data.name}\nEmail: {form_data.email}\nMessage:\n{form_data.message}", 'plain', 'utf-8')
        msg['Subject'] = Header(f"New Contact Form Message from: {form_data.name}", 'utf-8') # Set email subject
        msg['From'] = f"{form_data.name} <{form_data.email}>" # Set sender's name and email
        msg['To'] = TARGET_EMAIL # Set recipient email

        # Establish SMTP connection and send the email
        # Use SMTP_SSL for port 465 (secure), otherwise use SMTP with starttls for port 587
        if EMAIL_SECURE:
            server = smtplib.SMTP_SSL(EMAIL_HOST, EMAIL_PORT)
        else:
            server = smtplib.SMTP(EMAIL_HOST, EMAIL_PORT)
            server.starttls() # Start TLS encryption for secure communication

        server.login(EMAIL_USER, EMAIL_PASS) # Log in to the email account
        server.send_message(msg) # Send the created email message
        server.quit() # Close the connection to the SMTP server

        # If successful, return a success message to the frontend
        return {"message": "Message sent successfully!"}

    except Exception as e:
        # If any error occurs during the process, print it to the console for debugging
        print(f"Error sending email: {e}")
        # Return a 500 Internal Server Error status with a user-friendly message to the frontend
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while sending your message. Please try again."
        )

# The following lines are typically NOT required when deploying to Vercel,
# as Vercel automatically handles serving static files from 'public'
# and running FastAPI functions from 'backend/main.py' based on 'vercel.json'.
# They are primarily for local testing of the FastAPI part directly if you are not using 'vercel dev'.
# from fastapi.staticfiles import StaticFiles
# app.mount("/", StaticFiles(directory="public", html=True), name="static") # Mount static files from 'public' folder
# import uvicorn
# if __name__ == "__main__":
#     uvicorn.run(app, host="0.0.0.0", port=8000) # Run the FastAPI app locally