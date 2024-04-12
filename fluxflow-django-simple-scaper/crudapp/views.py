from django.shortcuts import render
from rest_framework.response import Response
from rest_framework.decorators import api_view
from crudapp.keys import *
import tweepy
import pdb
from crudapp.models import *
from crudapp.helpers import *
from cleantext import clean
import datetime
import snscrape.modules.twitter as sntwitter

auth = tweepy.OAuthHandler(consumer_key, consumer_secret)
auth.set_access_token(access_token, access_token_secret)
api = tweepy.API(auth,wait_on_rate_limit=True)

@api_view(['GET'])
def get_data(request):
    hashtag_value = '#Eternals'
    hashtag_object, created = Hashtag.objects.get_or_create(hashtag=hashtag_value)

    for tweet in sntwitter.TwitterSearchScraper(query).get_items():
        if len(tweets) == limit:
            break
        else:
            try:
                user_obj = User.objects.get(user_id=tweet.user.id, name=tweet.user.username)
            except User.DoesNotExist:
                user_obj = User(user_id=tweet.user.id, name=tweet.user.username, followers_count=tweet.user.followersCount, friends_count=tweet.user.friendsCount, verified=tweet.user.verified, created_at=tweet.user.created,status_count=tweet.user.statusesCount)
                user_obj.save()
            twitter_content = clean(tweet.content.strip().replace('\n', ' '), no_emoji=True)
            try:
                # pdb.set_trace()
                Tweet.objects.get(tweet_id=tweet.id)
            except Tweet.DoesNotExist:
                if tweet.mentionedUsers is None:
                    tweet.mentionedUsers = []
                Tweet.objects.create(tweet_id=tweet.id, content=twitter_content, user_mentions_count=len(tweet.mentionedUsers), favorite_count=tweet.likeCount, retweet_count=tweet.retweetCount, hashtag=hashtag_object, user=user_obj, created_at=tweet.date)
    return Response({})









