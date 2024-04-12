# Test model

# import argparse

# from google.cloud import language_v1

# def print_result(annotations):
#     score = annotations.document_sentiment.score
#     magnitude = annotations.document_sentiment.magnitude

#     for index, sentence in enumerate(annotations.sentences):
#         sentence_sentiment = sentence.sentiment.score
#         print(
#             "Sentence {} has a sentiment score of {}".format(index, sentence_sentiment)
#         )

#     print(
#         "Overall Sentiment: score of {} with magnitude of {}".format(score, magnitude)
#     )
#     return 0

# def analyze(movie_review_filename):
#     """Run a sentiment analysis request on text within a passed filename."""
# client = language_v1.LanguageServiceClient()

# content = "thor love and thunder was so bad. it was just so boring and way too goofy. the plot was so uninteresting. korg who was one of my favorites in ragnarok was so damn annoying in this like ??? love you taika but take this l. #thorloveandthunder"

# document = language_v1.Document(
#     content=content, type_=language_v1.Document.Type.PLAIN_TEXT
# )
# annotations = client.analyze_sentiment(request={"document": document})

# # Print the results
# print_result(annotations)

###########################################

# Actual code

###########################################

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
