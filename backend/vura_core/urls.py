from django.contrib import admin
from django.urls import path, include
from django.http import HttpResponse
from django.core.management import call_command

def run_migrations(request):
    try:
        call_command('migrate', interactive=False)
        return HttpResponse("Migrations successfully executed!")
    except Exception as e:
        return HttpResponse(f"Error during migrations: {str(e)}", status=500)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/migrate/', run_migrations), # URL temporaire pour migrer la DB
    path('api/users/', include('users.urls')),
    path('api/forms/', include('forms.urls')),
    path('api/integrations/', include('integrations.urls')),
]
