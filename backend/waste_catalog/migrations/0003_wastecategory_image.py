# Generated by Django 5.1.7 on 2025-03-10 20:58

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('waste_catalog', '0002_alter_resourcedocument_options_and_more'),
    ]

    operations = [
        migrations.AddField(
            model_name='wastecategory',
            name='image',
            field=models.ImageField(blank=True, null=True, upload_to='waste_categories/'),
        ),
    ]
