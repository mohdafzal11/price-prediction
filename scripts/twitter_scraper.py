import asyncio
from twikit import Client
import os
import json
import re
import requests

from dotenv import load_dotenv
load_dotenv()
import redis

# get from env
USERNAME = os.getenv('TWITTER_USERNAME')
EMAIL = os.getenv('TWITTER_EMAIL')
PASSWORD = os.getenv('TWITTER_PASSWORD')

r = redis.Redis.from_url(os.getenv('REDIS_URL'))

DROOMDROOMUSERID = 1561780787346714624

# Initialize client
client = Client('en-US')

async def login():
    # check if cookies.json exists and load it
    if os.path.exists('cookies.json'):
        client.load_cookies("cookies.json")
        tweets = await client.get_user_tweets(DROOMDROOMUSERID,"Tweets", count=10)
        data_to_push = [];
        for i in tweets:
            # Unshorten t.co links in tweet text
            tweet_text = unshorten_tco_links(i.text)
            
            data = {
                'text': tweet_text,
                "time": i.created_at,
                "profile_link": i.user.url,
                "profile_image": i.user.profile_image_url,
                "likes": i.favorite_count,
                "retweets": i.retweet_count,
                "quotes": i.quote_count,
                "replies": i.reply_count,
                "bookmark_count": i.bookmark_count,
                "tweet_id": i.id,
            }
            data_to_push.append(data)
            # delete the tweet from redis
        # print(data_to_push)
        # exit();
        r.lpop('twitter_tweets');
        # set it into redis
        r.lpush('twitter_tweets', json.dumps(data_to_push))
        return
    await client.login(
        auth_info_1=USERNAME,
        auth_info_2=EMAIL,
        password=PASSWORD,
        totp_secret="MM6NYNIBKU3XK6T7",
        cookies_file='cookies.json'
    )

def unshorten_tco_links(text):
    """Find t.co links in text and replace them with their actual destination URLs"""
    # Regular expression to find t.co links
    tco_pattern = r'https?://t\.co/[a-zA-Z0-9]+'  
    tco_links = re.findall(tco_pattern, text)
    
    # Replace each t.co link with its actual destination
    for tco_link in tco_links:
        try:
            # Follow redirects to get the final URL
            response = requests.head(tco_link, allow_redirects=True, timeout=5)
            actual_url = response.url
            
            # Only replace if we got a different URL
            if actual_url != tco_link:
                text = text.replace(tco_link, actual_url)
        except Exception as e:
            print(f"Error unshortening {tco_link}: {e}")
            # Keep the original link if there's an error
            continue
    
    return text

asyncio.run(login())