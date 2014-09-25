Call Me Maybe
===========

(aka "Game of Tones")

This repository stores the server code for the Android app, which can be found at https://github.com/themichaellai/CallMeMaybeApp.

Hate talking to robots when you're trying to connect to customer service? Call Me Maybe is an app that allows an easy way to skip through automated message systems and get connected directly to real human beings. We present you the menu on you screen, so you can easily tap through it, and then we even place the call and enter the touch tones for you -- directly from the app.

How does it work? We took advantage of a powerful Twilio calling API. It allows us to programmatically place phone calls, record automated message systems, and transcribe the audio to text. We can then process this raw text into a recursive menu structure with submenus. To exhaustively scrape all of the submenus, we recursively keep calling the same company after entering the possible sequences of touch tones found so far. In the end, we are left with a large nested JSON object that represents the entire menu with all the touch tone options available. We save this object on MongoDB, through which it is available to our Android app.
