import uuid
from django.db import models
from django.conf import settings

class Form(models.Model):
    public_id = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, db_index=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='forms')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_published = models.BooleanField(default=False)
    
    # Specialized Form (Premium)
    is_specialized = models.BooleanField(default=False)
    offer_title = models.CharField(max_length=255, blank=True)
    offer_description = models.TextField(blank=True)
    offer_button_text = models.CharField(max_length=100, blank=True)
    offer_button_url = models.URLField(blank=True)
    offer_advantages = models.JSONField(default=list, blank=True, help_text="List of advantages/bullets")
    
    # Advanced Funnel Config (Premium)
    funnel_config = models.JSONField(default=dict, blank=True, help_text="Metadata for multi-screen specialized funnels")
    
    def __str__(self):
        return self.title

class FormField(models.Model):
    FIELD_TYPES = [
        ('text', 'Texte court'),
        ('textarea', 'Texte long'),
        ('email', 'Email'),
        ('single_choice', 'Choix unique'),
        ('multiple_choice', 'Choix multiple'),
        ('date', 'Date'),
        ('file', 'Fichier'),
    ]

    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='fields')
    type = models.CharField(max_length=50, choices=FIELD_TYPES)
    label = models.CharField(max_length=255)
    required = models.BooleanField(default=True)
    order = models.PositiveIntegerField(default=0)
    options = models.JSONField(blank=True, null=True, help_text="Liste des choix pour les champs multiples (e.g. ['Choix 1', 'Choix 2'])")

    class Meta:
        ordering = ['order']

    def __str__(self):
        return f"{self.form.title} - {self.label}"

class FormResponse(models.Model):
    form = models.ForeignKey(Form, on_delete=models.CASCADE, related_name='responses')
    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Response to {self.form.title} at {self.submitted_at}"

class ResponseAnswer(models.Model):
    response = models.ForeignKey(FormResponse, on_delete=models.CASCADE, related_name='answers')
    field = models.ForeignKey(FormField, on_delete=models.CASCADE, related_name='answers')
    value = models.JSONField(blank=True, null=True)

    def __str__(self):
        return str(self.value)
