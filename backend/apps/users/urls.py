from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from . import views

urlpatterns = [
    path('login/',views.LoginView.as_view(),name='login'),
    path('logout/',views.logout_view,name='logout'),
    path('token/refresh/',TokenRefreshView.as_view(),name='token-refresh'),
    path('profile/',views.ProfileView.as_view(),name='profile'),
    path('change-password/',views.change_password_view,name='change-password'),
    path('users/',views.UserListCreateView.as_view(),name='user-list'),
    path('users/<int:pk>/',  views.UserDetailView.as_view(),     name='user-detail'),
]
