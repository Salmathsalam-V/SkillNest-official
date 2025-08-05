# app/tasks.py
from celery import shared_task
from django.core.mail import send_mail

@shared_task
def send_otp_email_task(email, otp):
    subject = 'Your OTP Verification Code'
    message = f'Your OTP code is: {otp}'
    send_mail(subject, message, 'no-reply@example.com', [email])
    return "Sent"
