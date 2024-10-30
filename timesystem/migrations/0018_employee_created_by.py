# Generated by Django 4.2.2 on 2024-10-29 20:27

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("timesystem", "0017_alter_task_project"),
    ]

    operations = [
        migrations.AddField(
            model_name="employee",
            name="created_by",
            field=models.ForeignKey(
                default=1,
                on_delete=django.db.models.deletion.CASCADE,
                related_name="created_employees",
                to=settings.AUTH_USER_MODEL,
            ),
            preserve_default=False,
        ),
    ]