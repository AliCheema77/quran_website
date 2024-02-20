"""
URL configuration for backend project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from allauth.account.views import confirm_email
from django.conf import settings
from django.contrib import admin
from django.urls import path, include, re_path
from drf_yasg import openapi
from drf_yasg.views import get_schema_view
from rest_framework import permissions


api_info = openapi.Info(
    title="Port Pass API",
    default_version="v1",
    description="API documentation for Port pass App",
)
schema_view = get_schema_view(
    api_info,
    public=True,
    permission_classes=(permissions.AllowAny,),
)

urlpatterns = []
if settings.DEBUG:
    import debug_toolbar
    urlpatterns += [
        path('__debug__/', include(debug_toolbar.urls)),
        path("api-docs/", schema_view.with_ui("swagger", cache_timeout=0), name="api_docs"),

    ]


urlpatterns += [
    path('admin/', admin.site.urls),
    path("accounts/", include("allauth.urls")),
    path("rest-auth/", include("rest_auth.urls")),

    # Override email confirm to use allauth's HTML view instead of rest_auth's API view
    path("rest-auth/registration/account-confirm-email/<str:key>/", confirm_email),
    path("rest-auth/registration/", include("rest_auth.registration.urls")),

    path("users/", include("users.urls")),
]
