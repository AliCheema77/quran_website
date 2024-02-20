import csv
import tempfile
from allauth.account.models import EmailAddress
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.sites.shortcuts import get_current_site
from django.core.files import File
from django.core.mail import send_mail
from django.http import HttpResponse
from django.template.loader import render_to_string
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.authtoken.serializers import AuthTokenSerializer
from rest_framework.decorators import action
from rest_framework.generics import ListCreateAPIView
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import ModelViewSet, ViewSet, ReadOnlyModelViewSet
from rest_framework_simplejwt.views import TokenObtainPairView

from users.serializers import (
    SignupSerializer,
    UserSerializer,
    UserProfileSerializer,
    VerifyUserSignupCodeSerializer,
    CustomTokenObtainPairSerializer,
    ResendUserSignupEmailSerializer, UniqueUsernameSerializer
)
# from users.api.v2.serializers import SignupSerializerV2
from users.models import get_random_str, UserSignupCode


User = get_user_model()


class SignupViewSet(ModelViewSet):
    serializer_class = SignupSerializer
    queryset = User.objects.none()
    http_method_names = ["post",]


class VerifyUserSignupCodeViewSet(ListCreateAPIView):
    serializer_class = VerifyUserSignupCodeSerializer
    queryset = UserSignupCode.objects.none()
    permission_classes = [permissions.AllowAny]

    def get(self, request, *args, **kwargs):
        return Response()

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        code = serializer.data.get("code")
        user_code = UserSignupCode.objects.filter(code=code)
        if user_code:
            email = user_code.first().email
            EmailAddress.objects.filter(email__exact=email).update(verified=True)
            user_code.delete()
            user = get_user_model().objects.filter(email__exact=email).first()
            token, created = Token.objects.get_or_create(user=user)
            user_serializer = UserSerializer(user)
            response = {"key": token.key, "user_detail": user_serializer.data, "message": "Email is verified."}
            return Response(response, status=status.HTTP_200_OK)
        return Response({"response": "Invalid code."}, status=status.HTTP_400_BAD_REQUEST)


class ResendSignupUserEmailViewSet(ListCreateAPIView):
    serializer_class = ResendUserSignupEmailSerializer
    queryset = UserSignupCode.objects.none()

    def get(self, request, *args, **kwargs):
        return Response()

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.data.get('email')
        user_email = EmailAddress.objects.filter(email__exact=email).first()
        if user_email:
            if user_email.verified == False:
                code = get_random_str(6)
                while UserSignupCode.objects.filter(code=code).first():
                    code = get_random_str(6)
                instance = UserSignupCode.objects.filter(email=email).first()
                if instance:
                    instance.code = code
                    instance.save()
                message = ""
                # try:
                #     port = get_pre_signed_s3_url(
                #          f"https://{settings.AWS_STORAGE_BUCKET_NAME}.s3.amazonaws.com/static/img/port.png")
                # except:
                #     port = ""
                html_message = render_to_string("account/email/confirmation.html", {
                    "code": code})
                send_mail(
                    "django backend",
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    html_message=html_message,
                    fail_silently=False
                )
                return Response({"response": "Confirmation email sent."}, status=status.HTTP_200_OK)
            return Response({"response": "User already verified."}, status=status.HTTP_400_BAD_REQUEST)
        return Response({"response": "Email does not exist."}, status=status.HTTP_400_BAD_REQUEST)


# class SignupViewSetV2(ModelViewSet):
#     serializer_class = SignupSerializerV2
#     queryset = User.objects.none()
#     http_method_names = ["post",]



class LoginViewSet(ViewSet):
    """Based on rest_framework.authtoken.views.ObtainAuthToken"""

    serializer_class = AuthTokenSerializer

    def create(self, request):
        serializer = self.serializer_class(
            data=request.data, context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data["user"]
        token, created = Token.objects.get_or_create(user=user)
        user_serializer = UserSerializer(user)
        # Notification.objects.create(send_to=user, title="Passport email verification",
        #                             message="Passport email verification")
        # Notification.objects.create(send_to=user, title="Portpass Passport created",
        #                             message="Portpass Passport created")
        return Response({"token": token.key, "user": user_serializer.data})


class UserProfileViewSet(ModelViewSet):
    serializer_class = UserProfileSerializer
    http_method_names = ["get", "patch", "post"]
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = User.objects.filter(id=self.request.user.id)
        return queryset

    def create(self, request, *args, **kwargs):
        return Response()

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        instance = self.get_object()
        if instance.id == self.request.user.pk:
            return self.update(request, *args, **kwargs)
        else:
            return Response({"error": "Only owner can update the details."}, status=status.HTTP_403_FORBIDDEN)

    @action(methods=['post'], detail=True, url_path='delete-account', url_name='delete-account')
    def delete_account(self, request, pk):
        if request.user.pk == int(pk):
            user = self.get_object()
            try:
                if user.image:
                    if "default_profile.png" not in user.image.name:
                        user.image.storage.delete(user.image.name)
                if user.id_card_image:
                    user.id_card_image.storage.delete(user.id_card_image.name)
            except Exception as e:
                print(e)
            user.delete()
            return Response({"response": "Account deleted successfully."}, status=status.HTTP_200_OK)
        return Response({"response": "You are not allowed to perform this action."}, status=status.HTTP_400_BAD_REQUEST)


class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer


class UniqueUsername(APIView):

    def post(self, request):
        serializer = UniqueUsernameSerializer(data=request.data)
        if serializer.is_valid():
            user = User.objects.filter(username=serializer.validated_data['username']).exists()
            if user:
                return Response({"response": "username already taken!"}, status=status.HTTP_400_BAD_REQUEST)
            return Response(status=status.HTTP_200_OK)
        return Response({"response": "chose a valid username!"}, status=status.HTTP_400_BAD_REQUEST)

