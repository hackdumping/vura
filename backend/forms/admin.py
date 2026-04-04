from django.contrib import admin
from .models import Form, FormField, FormResponse, ResponseAnswer

class FormFieldInline(admin.TabularInline):
    model = FormField
    extra = 1

@admin.register(Form)
class FormAdmin(admin.ModelAdmin):
    list_display = ('title', 'created_by', 'is_published', 'created_at')
    inlines = [FormFieldInline]

@admin.register(FormResponse)
class FormResponseAdmin(admin.ModelAdmin):
    list_display = ('form', 'submitted_at')

admin.site.register(FormField)
admin.site.register(ResponseAnswer)
