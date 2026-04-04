from rest_framework import serializers
from .models import Form, FormField, FormResponse, ResponseAnswer

class FormFieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = FormField
        fields = ('id', 'type', 'label', 'required', 'order', 'options')
        
class FormSerializer(serializers.ModelSerializer):
    fields = FormFieldSerializer(many=True, required=False)

    class Meta:
        model = Form
        fields = ('id', 'public_id', 'title', 'description', 'created_at', 'updated_at', 'is_published', 'fields', 
                  'is_specialized', 'offer_title', 'offer_description', 'offer_button_text', 'offer_button_url', 'offer_advantages', 'funnel_config')
        read_only_fields = ('public_id', 'created_at', 'updated_at')

    def create(self, validated_data):
        fields_data = validated_data.pop('fields', [])
        user = self.context['request'].user
        form = Form.objects.create(created_by=user, **validated_data)
        for field_data in fields_data:
            FormField.objects.create(form=form, **field_data)
        return form

    def update(self, instance, validated_data):
        fields_data = validated_data.pop('fields', None)
        
        # Update all fields in validated_data
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if fields_data is not None:
            # For simplicity in MVP, we delete and recreate fields if they are updated
            instance.fields.all().delete()
            for field_data in fields_data:
                FormField.objects.create(form=instance, **field_data)
        return instance

class ResponseAnswerSerializer(serializers.ModelSerializer):
    field_id = serializers.PrimaryKeyRelatedField(queryset=FormField.objects.all(), source='field')
    
    class Meta:
        model = ResponseAnswer
        fields = ('field_id', 'value')

class FormResponseSerializer(serializers.ModelSerializer):
    answers = ResponseAnswerSerializer(many=True)
    
    class Meta:
        model = FormResponse
        fields = ('id', 'form', 'submitted_at', 'answers')
        read_only_fields = ('form', 'submitted_at')

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        form_response = FormResponse.objects.create(form=validated_data['form'])
        for answer_data in answers_data:
            ResponseAnswer.objects.create(response=form_response, field=answer_data['field'], value=answer_data['value'])
        return form_response
