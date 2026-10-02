# app/tasks.py
from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings

@shared_task
def send_otp_email_task(email, otp):
    subject = "Your OTP Verification Code"

    plain_message = f"Your OTP code is: {otp}"

    html_message = f"""
    <div style="font-family: Arial, sans-serif; background-color: #f6f6f6; padding: 20px;">
        <div style="max-width: 480px; margin: auto; background: white; padding: 30px; border-radius: 10px;">
            <h2 style="text-align: center; color: #333;">🔐 Email Verification</h2>

            <p style="font-size: 16px; color: #555;">
                Hello,<br><br>
                Please use the following One-Time Password (OTP) to verify your email:
            </p>

            <div style="
                background: #f0f4ff;
                padding: 15px;
                border-radius: 8px;
                text-align: center;
                font-size: 28px;
                font-weight: bold;
                color: #1a56db;
                letter-spacing: 4px;
                border: 1px solid #d0d7ff;
                margin: 20px 0;
            ">
                {otp}
            </div>

            <p style="font-size: 14px; color: #777;">
                This code is valid for 5 minutes. Do not share it with anyone for security reasons.
            </p>

            <hr style="margin: 25px 0; border: none; border-top: 1px solid #eee;" />

            <p style="font-size: 12px; text-align: center; color: #999;">
                If you did not request this, please ignore this email.
            </p>
        </div>
    </div>
    """

    send_mail(
        subject,
        plain_message,
        "no-reply@example.com",
        [email],
        html_message=html_message,
    )

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
