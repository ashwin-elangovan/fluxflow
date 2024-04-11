# https://github.com/mehranshakarami/AI_Spectrum/blob/main/2022/Twitter_API/twitter_data_search.py
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

# import tweepy

# client = tweepy.Client(bearer_token=bearer_token)

# # Replace with your own search query
# query = '#AvengersEndgame'

# # Replace with time period of your choice
# start_time = '2022-10-03T08:50:00Z'

# # Replace with time period of your choice
# end_time = '2022-10-04T10:40:00Z'

# tweets = client.search_recent_tweets(query=query, tweet_fields=['context_annotations', 'created_at'],
#                                   start_time=start_time,
#                                   end_time=end_time, max_results=1000)
# for tweet in tweets:
#     pdb.set_trace()
#     print(tweet)

# Create your views here.

@api_view(['GET'])
def get_data(request):
    # count = 0
    # hashtag_value = '#' + "AvengersEndgame"
    # hashtag_object, created  = Hashtag.objects.get_or_create(hashtag=hashtag_value)
    # for tweet in tweepy.Cursor(api.search_tweets, q=hashtag_value+'-filter:retweets', lang="en", tweet_mode='extended', max_id='1576415424547196930').items(1000):
    #     count+=1
    #     print("Tweet Count", count)
    #     try:
    #         user_obj = User.objects.get(user_id=tweet.user.id, name=tweet.user.screen_name)
    #     except User.DoesNotExist:
    #         user_obj = User(user_id=tweet.user.id, name=tweet.user.screen_name, followers_count=tweet.user.followers_count, friends_count=tweet.user.friends_count, verified=tweet.user.verified, created_at=tweet.user.created_at,status_count=tweet.user.statuses_count)
    #         user_obj.save()
    #     twitter_content = clean(full_text(tweet).strip().replace('\n', ' '), no_emoji=True)
    #     try:
    #         Tweet.objects.get(tweet_id=tweet.id)
    #     except Tweet.DoesNotExist:
    #         Tweet.objects.create(tweet_id=tweet.id, content=twitter_content, user_mentions_count=len(tweet.entities['user_mentions']), favorite_count=tweet.favorite_count, retweet_count=tweet.retweet_count, hashtag=hashtag_object, user=user_obj)


    # query = "(#Eternals) lang:en -filter:links -filter:replies"
    # tweets = []
    # limit = 1500

    # count = 0

# tweet_list = Tweet.objects.all()
# for tweet in tweet_list:
#     # print(tweet.tweet_id)
#     res = api.get_status(tweet.tweet_id)
#     print(res.coordinates)
#     user_location = res._json['user']['location']
#     print(user_location)
#     if not (user_location == None):
#         tweet.location = clean(res._json['user']['location'].strip().replace('\n', ' '), no_emoji=True)
#         tweet.save()


# import snscrape.modules.twitter as sntwitter
# import pandas

# # Creating list to append tweet data 
# tweets_list1 = []

# Using TwitterSearchScraper to scrape data and append tweets to list
# for i,tweet in enumerate(sntwitter.TwitterSearchScraper('from:jack').get_items()):
#     print(tweet.place)
#     print(tweet.coordinates)
#     print(tweet.user.location)
        



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
    return Response({"hello":111})

import json
  
# Opening JSON file
f = open('/Users/ashwinelangovan/Desktop/cities.json')
  
# returns JSON object as 
# a dictionary
data = json.load(f)

import random

new_hash = {}

for i in range(1, 60, 1):
    current_data = data[i]
    new_hash[current_data['city']] = {'latitude': current_data['latitude'], 'longitude': current_data['longitude']}

for tweet in Tweet.objects.all().iterator():
    val = data[random.randrange(1, 90)]
    tweet.location = val['city']
    tweet.latitude = val['latitude']
    tweet.longitude = val['longitude']
    tweet.save()

from crudapp.keys import *
import tweepy
import pdb
from crudapp.models import *
from crudapp.helpers import *
from cleantext import clean
import datetime
import snscrape.modules.twitter as sntwitter

import nltk
from nltk.corpus import stopwords
sw_nltk = stopwords.words('english')
print(sw_nltk)

import re
from nltk.tokenize import WordPunctTokenizer

tweet = "thor love and thunder was so bad. it was just so boring and way too goofy. the plot was so uninteresting. korg who was one of my favorites in ragnarok was so damn annoying in this like ??? love you taika but take this l. #thorloveandthunder"
words = [word for word in tweet.split() if word.lower() not in sw_nltk]
tweet = " ".join(words)
user_removed = re.sub(r'@[A-Za-z0-9]+','',tweet)
link_removed = re.sub('https?://[A-Za-z0-9./]+','',user_removed)
number_removed = re.sub('[^a-zA-Z]',' ',link_removed)
lower_case_tweet = number_removed.lower()
tok = WordPunctTokenizer()
words = tok.tokenize(lower_case_tweet)
clean_tweet = (' '.join(words)).strip()

import re
from nltk.tokenize import WordPunctTokenizer
sw_nltk = stopwords.words('english')

sw_nltk.append(["#ThorLoveandThunder", "#DoctorStrangeInTheMultiverseOfMadness", "#SpiderManNoWayHome", "#Eternals"])

['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', "you're", "you've", "you'll", "you'd", 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', "she's", 'her', 'hers', 'herself', 'it', "it's", 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', "that'll", 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', "don't", 'should', "should've", 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', "aren't", 'couldn', "couldn't", 'didn', "didn't", 'doesn', "doesn't", 'hadn', "hadn't", 'hasn', "hasn't", 'haven', "haven't", 'isn', "isn't", 'ma', 'mightn', "mightn't", 'mustn', "mustn't", 'needn', "needn't", 'shan', "shan't", 'shouldn', "shouldn't", 'wasn', "wasn't", 'weren', "weren't", 'won', "won't", 'wouldn', "wouldn't", '#avengersendgame', '#thorloveandthunder', '#doctorstrangeinthemultiverseofmadness', '#spidermannowayhome', '#eternals']

words = [word for word in text.split() if word.lower() not in sw_nltk]
new_text = " ".join(words)

from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
vader_sentiment = SentimentIntensityAnalyzer()
for tweet in Tweet.objects.all().iterator():
    words = [word for word in clean_tweet.split() if word.lower() not in sw_nltk]
    new_text = " ".join(words)
    score = vader_sentiment.polarity_scores(new_text)
    if score['neu'] >= score ['pos'] and score['neu'] >= score ['neg']:
        tweet.sentiment = 'neutral'
        tweet.sentiment_score = score['neu']
    elif score['pos'] >= score ['neu'] and score['pos'] >= score ['neg']:
        tweet.sentiment = 'positive'
        tweet.sentiment_score = score['pos']
    elif score['neg'] >= score ['neu'] and score['neg'] >= score ['pos']:
        tweet.sentiment = 'negative'
        tweet.sentiment_score = score['neg']
    tweet.save()





def vader_sentiment_scores(text):
  score = vader_sentiment.polarity_scores(tweet.content)
  return score['compound']

pip3 install tweepy nltk google-cloud-language

import tweepy
import re


export GOOGLE_APPLICATION_CREDENTIALS='[/Users/ashwinelangovan/Downloads/auth.json]'



from telegram.ext import Updater, MessageHandler, Filters
from google.cloud import language
from google.cloud.language import enums
from language_v1.types import types
from datetime import datetime, timedelta
from nltk.tokenize import WordPunctTokenizer


ACC_TOKEN = 'YOUR_ACCESS_TOKEN'
ACC_SECRET = 'YOUR_ACCESS_TOKEN_SECRET'
CONS_KEY = 'YOUR_CONSUMER_API_KEY'
CONS_SECRET = 'YOUR_CONSUMER_API_SECRET_KEY'

def authentication(cons_key, cons_secret, acc_token, acc_secret):
    auth = tweepy.OAuthHandler(cons_key, cons_secret)
    auth.set_access_token(acc_token, acc_secret)
    api = tweepy.API(auth)
    return api
    
def search_tweets(keyword, total_tweets):
    today_datetime = datetime.today().now()
    yesterday_datetime = today_datetime - timedelta(days=1)
    today_date = today_datetime.strftime('%Y-%m-%d')
    yesterday_date = yesterday_datetime.strftime('%Y-%m-%d')
    api = authentication(CONS_KEY,CONS_SECRET,ACC_TOKEN,ACC_SECRET)
    search_result = tweepy.Cursor(api.search, 
                                  q=keyword, 
                                  since=yesterday_date, 
                                  result_type='recent', 
                                  lang='en').items(total_tweets)
    return search_result

def clean_tweets(tweet):
    user_removed = re.sub(r'@[A-Za-z0-9]+','',tweet.decode('utf-8'))
    link_removed = re.sub('https?://[A-Za-z0-9./]+','',user_removed)
    number_removed = re.sub('[^a-zA-Z]', ' ', link_removed)
    lower_case_tweet= number_removed.lower()
    tok = WordPunctTokenizer()
    words = tok.tokenize(lower_case_tweet)
    clean_tweet = (' '.join(words)).strip()
    return clean_tweet

def get_sentiment_score(tweet):
    client = language.LanguageServiceClient()
    document = types\
               .Document(content=tweet,
                         type=enums.Document.Type.PLAIN_TEXT)
    sentiment_score = client\
                      .analyze_sentiment(document=document)\
                      .document_sentiment\
                      .score
    return sentiment_score

def analyze_tweets(keyword, total_tweets):
    score = 0
    tweets = search_tweets(keyword,total_tweets)
    for tweet in tweets:
        cleaned_tweet = clean_tweets(tweet.text.encode('utf-8'))
        sentiment_score = get_sentiment_score(cleaned_tweet)
        score += sentiment_score
        print('Tweet: {}'.format(cleaned_tweet))
        print('Score: {}\n'.format(sentiment_score))
    final_score = round((score / float(total_tweets)),2)
    return final_score

def send_the_result(bot, update):
    keyword = update.message.text
    final_score = analyze_tweets(keyword, 50)
    if final_score <= -0.25:
        status = 'NEGATIVE ❌'
    elif final_score <= 0.25:
        status = 'NEUTRAL ?'
    else:
        status = 'POSITIVE ✅'
    bot.send_message(chat_id=update.message.chat_id,
                     text='Average score for '
                           + str(keyword) 
                           + ' is ' 
                           + str(final_score) 
                           + ' ' 
                           + status)

def main():
    updater = Updater('YOUR_TOKEN')
    dp = updater.dispatcher
    dp.add_handler(MessageHandler(Filters.text, send_the_result))
    updater.start_polling()
    updater.idle()
    
if __name__ == '__main__':
    main()



import argparse

from google.cloud import language_v1


def print_result(annotations):
    score = annotations.document_sentiment.score
    magnitude = annotations.document_sentiment.magnitude

    for index, sentence in enumerate(annotations.sentences):
        sentence_sentiment = sentence.sentiment.score
        print(
            "Sentence {} has a sentiment score of {}".format(index, sentence_sentiment)
        )

    print(
        "Overall Sentiment: score of {} with magnitude of {}".format(score, magnitude)
    )
    return 0

def analyze(movie_review_filename):
    """Run a sentiment analysis request on text within a passed filename."""
client = language_v1.LanguageServiceClient()

content = "thor love and thunder was so bad. it was just so boring and way too goofy. the plot was so uninteresting. korg who was one of my favorites in ragnarok was so damn annoying in this like ??? love you taika but take this l. #thorloveandthunder"

document = language_v1.Document(
    content=content, type_=language_v1.Document.Type.PLAIN_TEXT
)
annotations = client.analyze_sentiment(request={"document": document})

# Print the results
print_result(annotations)







###############


import re
import time
import nltk
from nltk.corpus import stopwords
from nltk.tokenize import WordPunctTokenizer
from crudapp.keys import *
import tweepy
import pdb
from crudapp.models import *
from crudapp.helpers import *
from cleantext import clean
import datetime
import snscrape.modules.twitter as sntwitter

sw_nltk = stopwords.words('english')
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = '/Users/ashwinelangovan/Downloads/auth.json'
client = language_v1.LanguageServiceClient()
count = 0
err_ids = []

for tweet in Tweet.objects.filter(sentiment__isnull=True).iterator():
    try:
        count +=1
        content = tweet.content
        words = [word for word in content.lower().split() if word.lower() not in sw_nltk]
        new_tweet = " ".join(words)
        user_removed = re.sub(r'@[A-Za-z0-9]+','',new_tweet)
        link_removed = re.sub('https?://[A-Za-z0-9./]+','',user_removed)
        number_removed = re.sub('[^a-zA-Z]',' ',link_removed)
        lower_case_tweet = number_removed.lower()
        tok = WordPunctTokenizer()
        words = tok.tokenize(lower_case_tweet)
        clean_tweet = (' '.join(words)).strip()
        document = language_v1.Document(content=content, type_=language_v1.Document.Type.PLAIN_TEXT)
        annotations = client.analyze_sentiment(request={"document": document})
        score = annotations.document_sentiment.score
        if -0.09 <= score <= 0.09:
            tweet.sentiment = 'neutral'
        elif score > 0:
            tweet.sentiment = 'positive' 
        elif score < 0:
            tweet.sentiment = 'negative'
        tweet.sentiment_score = score
        tweet.save()
        if(count % 100 == 0):
            time.sleep(1)
    except:
        err_ids.append(tweet.tweet_id)



Tweet.objects.filter(hashtag_id=1).count()

1.5 -> 1000
1.5 -> 2500
2 -> 1500


from random import randrange
from datetime import timedelta
from datetime import datetime


def random_date(start, end):
    """
    This function will return a random datetime between two datetime 
    objects.
    """
    delta = end - start
    int_delta = (delta.days * 24 * 60 * 60) + delta.seconds
    random_second = randrange(int_delta)
    return start + timedelta(seconds=random_second, microseconds=randrange(int_delta))

def updatedb(hashtag_id, start, end, start_i, end_i):
    d1 = datetime.strptime(start, '%m/%d/%Y %I:%M %p')
    d2 = datetime.strptime(end, '%m/%d/%Y %I:%M %p')
    for tweet in Tweet.objects.filter(hashtag_id=hashtag_id)[start_i:end_i].iterator():
        tweet.created_at = random_date(d1, d2)
        tweet.save()

updatedb(6, '10/10/2022 9:00 AM', '10/10/2022 10:30 AM', 0, 1000)
updatedb(6, '10/10/2022 10:31 AM', '10/10/2022 12:00 PM', 0, 1000)
updatedb(6, '10/10/2022 12:01 PM', '10/10/2022 2:00 PM', 0, 1000)



############

true_results = ['Nothing Bundt Cakes', 'Olive Creations', 'Olive Creations', 'P.croissants', 'The Seafood Market', 'The Seafood Market']
try: 
FindBusinessBasedOnLocation(['Food', 'Specialty Food'], [33.3482589, -111.9088346], 10, 'output_loc.txt', data) 
except NameError as e: 
print ('The FindBusinessBasedOnLocation function is not defined! You must run the cell containing the function before running this evaluation cell.') 
except TypeError as e: 
print ("The FindBusinessBasedOnLocation function is supposed to accept five arguments. Yours does not!")
try: 
opf = open('output_loc.txt','r') 
except FileNotFoundError as e: 
print ("The FindBusinessBasedOnLocation function does not write data to the correct location.")
lines = opf.readlines()
if len(lines) != 6: 
print ("The FindBusinessBasedOnLocation function does not find the correct number of results, should be only 1.")
lines = [line.strip() for line in lines]
if sorted(lines) == sorted(true_results): 
print ("Correct! Your FindBusinessBasedOnLocation function passes these test cases. This does not cover all possible edge cases, so make sure your function does before submitting.")


