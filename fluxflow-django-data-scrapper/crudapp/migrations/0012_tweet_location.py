# Generated by Django 4.1.3 on 2022-11-03 06:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('crudapp', '0011_tweet_sentiment_tweet_sentiment_score'),
    ]

    operations = [
        migrations.AddField(
            model_name='tweet',
            name='location',
            field=models.CharField(max_length=1000, null=True),
        ),
    ]