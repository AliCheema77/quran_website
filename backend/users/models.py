import random
import string
import uuid
from datetime import date

from django.conf import settings
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.urls import reverse
from django.core.mail import EmailMultiAlternatives
from django.dispatch import receiver
from django.template.loader import render_to_string
from django_rest_passwordreset.signals import reset_password_token_created


def get_random_str(l):
    ran = ''.join(random.choices("{0}{1}".format(string.ascii_uppercase, string.digits), k=l))
    return ran


class User(AbstractUser):
    name = models.CharField(
        null=True,
        blank=True,
        max_length=255,
    )
    email = models.EmailField(unique=True, max_length=100)
    dob = models.DateField(null=True, blank=True)
    gender = models.CharField(choices=(("male", "Male"), ("female", "Female"), ("other", "Other")), max_length=20)
    image = models.ImageField(upload_to="profile/", default="default_profile.png", null=True, blank=True)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ["username"]

    def get_absolute_url(self):
        return reverse("users:detail", kwargs={"username": self.username})

    def save(self, *args, **kwargs):
        if not self.image:
            self.image.name = "default_profile.png"
        super(User, self).save(*args, **kwargs)

    class Meta:
        verbose_name_plural = "7- Users"

    def delete(self, using=None, keep_parents=False):
        try:
            if self.image:
                if "default_profile.png" not in self.image.name:
                    self.image.storage.delete(self.image.name)
        except Exception as e:
            print(e)
        super(User, self).delete(using=using, keep_parents=keep_parents)

    def __str__(self):
        return self.email


@receiver(reset_password_token_created)
def password_reset_token_created(sender, instance, reset_password_token, *args, **kwargs):
    # send an e-mail to the user
    context = {
        'username': reset_password_token.user.get_full_name,
        'reset_password_token': reset_password_token.key
    }
    # render email text
    email_html_message = render_to_string('email/user_reset_password.html', context)
    email_plaintext_message = render_to_string('email/user_reset_password.txt', context)
    msg = EmailMultiAlternatives(
        # title:
        "Password Reset for {title}".format(title="Port Pass App"),
        # message:
        email_plaintext_message,
        # from:
        settings.DEFAULT_FROM_EMAIL,
        # to:
        [reset_password_token.user.email]
    )
    msg.attach_alternative(email_html_message, "text/html")
    msg.send()


class UserSignupCode(models.Model):
    email = models.EmailField()
    code = models.CharField(max_length=6)

    created = models.DateTimeField(auto_now_add=True, editable=False)

    class Meta:
        verbose_name_plural = "9- User Code"
