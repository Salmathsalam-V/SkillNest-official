# app/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_otp_email_task(email, otp):
    subject = 'Your OTP Verification Code'
    message = f'Your OTP code is: {otp}'
    send_mail(subject, message, 'no-reply@example.com', [email])
    return "Sent"

@shared_task
def send_admin_reply_email(user_email, user_name, admin_reply):
    subject = "Reply to your message on SkillNest"
    message = f"""
Hi {user_name},

Thanks for contacting us earlier!

Here's our reply:
------------------------------------
{admin_reply}
------------------------------------

Best,
The SkillNest Support Team
"""

    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])

@shared_task
def send_payment_reply_email(user_email, user_name, email_msg):
    subject = "Payment Acknowledgement from SkillNest"
    message = f"""
Hi {user_name},

Thanks for being a part of us.

Your payment has been received successfully.
------------------------------------
{email_msg}
------------------------------------

Best,
The SkillNest Support Team
"""
    send_mail(subject, message, settings.DEFAULT_FROM_EMAIL, [user_email])
