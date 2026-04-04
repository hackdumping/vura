from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/forms/', include('forms.urls')),
    path('api/integrations/', include('integrations.urls')),
]
