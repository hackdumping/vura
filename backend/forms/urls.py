from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FormViewSet, get_public_form, submit_form

router = DefaultRouter()
router.register(r'builder', FormViewSet, basename='form')

urlpatterns = [
    path('', include(router.urls)),
    path('p/<uuid:public_id>/', get_public_form, name='public_form'),
    path('p/<uuid:public_id>/submit/', submit_form, name='submit_form'),
]
