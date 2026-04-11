# App name
**App name** is your go to app for college students looking for a ride. Whether it's a quick grocery run, a party, or a flight, feel secure knowing that only fellow students can use the app. So start riding today!


## Quick Start

```bash
git clone <repo-url>
cd <project-folder>
docker compose up --build
```

## How to Use
### Set Up
Like many rideshare apps, as a passenger, we ask for a couple identifiers before you can start using the app:
1. College/University Name
2. School Email
3. Name
4. Date of Birth
5. Phone number
6. Sex
7. Pronouns
You also select whether or not your registering as a passenger or driver. If you want register as both, you have to create two accounts. You will get a sent an email confirming your account and will be prompted to create your password. 

If you clicked driver, you will be brought to another page after creating your password. There, you will be asked to take a picture of your driver's license. You image isn't saved, the only information that is logged is the expiration date and the fact it's a valid license.

### Requesting/Providing Rides
Once you're on the main feed, click the plus button on the bottom right to fill our your request/offer for a ride!
For passengers:
Say where you're headed, what days and times you're available (the bigger the time frame, the higher the chance of getting a ride!),where you want to get picked up, how much luggage you're carrying with you, and, if you're a woman, if you would prefer the driver be a woman.

For drivers:
Say where you're headed, when and where you're going, how many people you can take, and how far you're willing to travel to pick up a passenger (pick-up radius), and, if you're a woman, if you would prefer your passengers be women.

Once all that information is filled out, hit post!

### Getting/Accepting a Ride
The home page has two parts, which can be toggled between at the top of the screen. The 'For You' page and the 'Feed' page. The 'For You' page is where you'll see posts from people near you. If you're a passenger, you'll only see posts from drivers, and vice versa. 

In your 'For You' page you can see people's posts, whether you're a driver or a passenger you can see posts, and if interested in riding/giving a ride to a given person based on their post, click the 'Interested' button on the bottom right of the post.

On your profile page, you can see your own posts, and can see who and how many people  are interested in your post. As a passenger, your post will be matched with the first driver who says they're interested.
As a driver, you'll see how many and who is interested in getting a ride from you. From there you cna click either the '✓' to accept or 'X' to reject the passenger. 

### Connecting with Rider/Driver
Once a driver says they're interested in driving a passenger or when a driver accepts a passenger, a groupchat will be created for them to talk.



for you (all posts nearyou)
feed (repeat pass./drivers)

---
## Access

* Frontend: http://localhost:5173
* Backend: http://localhost:8000
* API Docs: http://localhost:8000/docs

---

## Stop the App

```bash
docker compose down
```

---

## Restart

```bash
docker compose down
docker compose up
```

---

## Rebuild (only if dependencies change)

```bash
docker compose up --build
```

---
## logs

```bash
docker compose logs backend
docker compose logs frontend
```

---
## Notes

* No local setup required (no Python/Node install needed)
* Everything runs in Docker
* Code changes auto-reload (no rebuild needed)