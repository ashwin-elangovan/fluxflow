# Generated by Django 4.1.2 on 2022-10-10 06:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crudapp', '0007_rename_hastag_hashtag_hashtag'),
    ]

    operations = [
        migrations.AlterField(
            model_name='tweet',
            name='tweet_id',
            field=models.BigIntegerField(unique=True),
        ),
        migrations.AlterField(
            model_name='user',
            name='user_id',
            field=models.BigIntegerField(unique=True),
        ),
    ]