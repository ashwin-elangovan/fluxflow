from email.policy import default
from django.db import models

# Create your models here.
class Hashtag(models.Model):
    hashtag = models.CharField(max_length=255)

    class Meta:
        db_table = "hashtags"

    @classmethod
    def get_accessibile_objects(cls):
        return cls.objects

class User(models.Model):
    name = models.CharField(max_length=255, unique=True)
    user_id = models.BigIntegerField(unique=True)
    followers_count = models.IntegerField()
    friends_count = models.IntegerField()
    status_count = models.IntegerField(default=0)
    verified = models.BooleanField()
    created_at = models.DateTimeField()
    
    class Meta:
        db_table = "users"

class Tweet(models.Model):
    tweet_id = models.BigIntegerField(unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    hashtag = models.ForeignKey(Hashtag, on_delete=models.CASCADE)
    content = models.CharField(max_length=1000)
    user_mentions_count = models.IntegerField()
    favorite_count = models.IntegerField()
    retweet_count = models.IntegerField()
    created_at = models.DateTimeField(auto_now_add=True, null=True, blank=True)
    latitude = models.DecimalField(null=True, max_digits=10, decimal_places=7)
    longitude = models.DecimalField(null=True, max_digits=10, decimal_places=7)
    location = models.CharField(max_length=1000, null=True)
    sentiment_score = models.FloatField(null=True)
    sentiment = models.CharField(max_length=1000, null=True)

    class Meta:
        db_table = 'tweets'





    
