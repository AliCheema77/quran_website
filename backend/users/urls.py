from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_auth.views import LoginView, PasswordChangeView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView, TokenVerifyView
from users.views import (
    SignupViewSet,
    UserProfileViewSet,
    VerifyUserSignupCodeViewSet,
    ResendSignupUserEmailViewSet,
    CustomTokenObtainPairView,
    UniqueUsername,
)

router = DefaultRouter()
router.register("signup", SignupViewSet, basename="signup")

urlpatterns = [
    path("", include(router.urls)),
    # path('login/', LoginView.as_view(), name='token_obtain_pair'),
    path('jwt-login/', CustomTokenObtainPairView.as_view()),
    path('jwt/refresh/', TokenRefreshView.as_view()),
    path('jwt/verify/', TokenVerifyView.as_view()),
    path('verify-email/', VerifyUserSignupCodeViewSet.as_view(), name='verify_email_code'),
    path('resend-email/', ResendSignupUserEmailViewSet.as_view(), name='resend-email'),
    path('forgot-password/', include('django_rest_passwordreset.urls', namespace='password_reset')),
    path('password/change/', PasswordChangeView.as_view(), name='rest_password_change'),
    path('unique_username/', UniqueUsername.as_view(), name='unique_username'),

]
