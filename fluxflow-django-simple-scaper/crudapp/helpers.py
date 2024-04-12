import pdb
import re

def full_text(tweet):
    if hasattr(tweet, "retweeted_status"):  # Check if Retweet
        try:
            full_text = tweet.retweeted_status.extended_tweet["full_text"]
        except AttributeError:
            full_text = tweet.retweeted_status.full_text
    else:
        try:
            full_text = tweet.extended_tweet["full_text"]
        except AttributeError:
            full_text = tweet.full_text

    emoji_pattern = re.compile("["
            u"\U0001F600-\U0001F64F"  # emoticons
            u"\U0001F300-\U0001F5FF"  # symbols & pictographs
            u"\U0001F680-\U0001F6FF"  # transport & map symbols
            u"\U0001F1E0-\U0001F1FF"  # flags (iOS)
                            "]+", flags=re.UNICODE)
    # print()
    return emoji_pattern.sub(r'', full_text)