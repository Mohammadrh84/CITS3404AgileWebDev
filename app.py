from flask import Flask, render_template, jsonify, request
import requests
import random

app = Flask(__name__)

@app.route('/')
def home():
    return render_template('main-game.html')

@app.route('/api/random-song')
def random_song():
    artist_name = request.args.get('artist', 'Frank Ocean')

    # Get artist ID
    search_url = f"https://itunes.apple.com/search?term={artist_name}&entity=musicArtist&limit=1"
    artist_res = requests.get(search_url).json()
    artist_id = artist_res['results'][0]['artistId']

    # Get songs
    songs_url = f"https://itunes.apple.com/lookup?id={artist_id}&entity=song&limit=200"
    songs_res = requests.get(songs_url).json()

    songs = [
        s for s in songs_res['results']
        if s.get('wrapperType') == 'track' and s.get('artistId') == artist_id
    ]

    random_song = random.choice(songs)

    return jsonify({
        "artistName": random_song["artistName"],
        "trackName": random_song["trackName"],
        "albumName": random_song["collectionName"],
        "releaseDate": random_song["releaseDate"],
        "genre": random_song["primaryGenreName"],
        "preview": random_song["previewUrl"],
        "artwork": random_song["artworkUrl100"]
    })

@app.route('/api/artist-image')
def artist_image():
    artist = request.args.get('artist')

    url = f"https://www.theaudiodb.com/api/v1/json/2/search.php?s={artist}"
    res = requests.get(url).json()

    image = ""
    if res.get("artists"):
        image = res["artists"][0].get("strArtistThumb", "")

    return jsonify({"image": image})

if __name__ == '__main__':
    app.run(debug=True)