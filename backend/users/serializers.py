from django.contrib.auth import get_user_model
from django.contrib.auth.models import update_last_login
from django.db import transaction
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.http import HttpRequest
from django.utils.translation import gettext_lazy as _
from allauth.account import app_settings as allauth_settings
from allauth.account.forms import ResetPasswordForm
from allauth.utils import email_address_exists, generate_unique_username
from allauth.account.adapter import get_adapter
from allauth.account.utils import setup_user_email, send_email_confirmation
from rest_framework import serializers
from rest_auth.serializers import PasswordResetSerializer
from rest_auth.models import TokenModel
from users.models import get_random_str, UserSignupCode
from django.template.loader import render_to_string
from django.core.mail import send_mail
from django.conf import settings
from allauth.account.models import EmailAddress


User = get_user_model()


class SignupSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(required=True)
    username = serializers.CharField(required=True)
    dob = serializers.DateField(required=True)

    class Meta:
        model = User
        fields = (
        "id",  'first_name', 'last_name', 'username', "email", "password",
        "dob", "gender", "image")
        extra_kwargs = {
            "password": {"write_only": True, "style": {"input_type": "password"}},
            "email": {
                "required": True,
                "allow_blank": False,
            }
        }

    def _get_request(self):
        request = self.context.get("request")
        if (
                request
                and not isinstance(request, HttpRequest)
                and hasattr(request, "_request")
        ):
            request = request._request
        return request

    def validate_email(self, email):
        email = get_adapter().clean_email(email)
        if allauth_settings.UNIQUE_EMAIL:
            if email and email_address_exists(email):
                raise serializers.ValidationError(
                    _("A user is already registered with this e-mail address.")
                )
        return email

    @transaction.atomic()
    def create(self, validated_data):
        try:
            user = User(
                username=validated_data.get("username"),
                first_name=validated_data.get("first_name"),
                last_name=validated_data.get("last_name"),
                email=validated_data.get("email"),
                dob=validated_data.get("dob"),
                gender=validated_data.get("gender"),
                name=validated_data.get("username")
            )
            user.set_password(validated_data.get("password"))
            user.save()
            request = self._get_request()
            setup_user_email(request, user, [])
            try:
                self.send_code_email(user)
            except Exception as e:
                raise serializers.ValidationError(
                    _(f"error while sending email {e}")
                )
        except Exception as e:
            raise serializers.ValidationError(
                _(f"error while creating user {e}")
            )
        return user

    def send_code_email(self, user):
        code = get_random_str(6)
        while UserSignupCode.objects.filter(code=code).exists():
            code = get_random_str(6)
        user_code = UserSignupCode.objects.filter(email=user.email).first()
        if user_code:
            user_code.code = code
            user_code.save()
        else:
            user_code = UserSignupCode.objects.create(email=user.email, code=code)

        message = ""
        html_message = render_to_string("account/email/confirmation.html", {"code": code})
        send_mail(
            'Tella confirmation code',
            message,
            settings.DEFAULT_FROM_EMAIL,
            [user.email],
            html_message=html_message,
            fail_silently=False
        )
        print("send email key.")

    def save(self, request=None):
        """rest_auth passes request so we must override to accept it"""
        return super().save()


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "email", 'first_name', 'last_name', "name",
                  "dob", "gender", "image"
                  ]
        extra_kwargs = {
            "email": {
                "read_only": True
            },
        }


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ["id", "email", 'first_name', 'last_name', "name",
                  "dob", "gender", "image"
                  ]
        extra_kwargs = {
            "email": {
                "read_only": True
            },
        }




class CustomTokenSerializer(serializers.ModelSerializer):
    user_detail = UserSerializer(source="user", read_only=True)

    class Meta:
        model = TokenModel
        fields = ('key', "user_detail")


class PasswordSerializer(PasswordResetSerializer):
    """Custom serializer for rest_auth to solve reset password error"""

    password_reset_form_class = ResetPasswordForm


class VerifyUserSignupCodeSerializer(serializers.Serializer):
    code = serializers.CharField(required=True)


class ResendUserSignupEmailSerializer(serializers.Serializer):
    email = serializers.EmailField(required=True)


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):

    def validate(self, attrs):

            data = super().validate(attrs)
            if EmailAddress.objects.filter(email=self.user.email, verified=True).exists():
                refresh = self.get_token(self.user)
                data['refresh'] = str(refresh)
                data['access'] = str(refresh.access_token)
                data["user_detail"] = UserSerializer(self.user, many=False, read_only=True).data
                update_last_login(None, self.user)
                return data
            else:
                return "Please verify your email first!"


class UniqueUsernameSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)