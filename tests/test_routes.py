import unittest
from app.routes import (
    FALLBACK_ARTIST_IMAGE,
    MAX_SELECTED_ARTISTS,
    filter_song_name,
    get_itunes_artist_id,
    clean_selected_artist,
    parse_selected_artists,
    is_valid_song,
)
import json
from unittest.mock import patch


class TestRoutes(unittest.TestCase):

    def test_filter_song_name(self):
        # test different formats of song names and ensure they are filtered properly
        self.assertEqual(
            filter_song_name("Song Name (Remix)"),
            "Song Name"
        )
        self.assertEqual(
            filter_song_name("Hello [Live]"),
            "Hello"
        )

        self.assertEqual(
            filter_song_name("Song {Demo}"),
            "Song"
        )
    # test that it can filter multiple types of brackets in an input
    def test_multiple_brackets(self):
        self.assertEqual(
            filter_song_name("Song Name (Live) [Acoustic] {Demo}"),
            "Song Name"
        )

    def test_normal_name(self):
        self.assertEqual(
            filter_song_name("Normal Song"),
            "Normal Song"
        )

    # make sure it removes whitespace (if any) in song name
    def test_remove_whitespace(self):
        self.assertEqual(
            filter_song_name("Song   Name   (Remix)"),
            "Song Name"
        )

    @patch("app.routes.requests.get")
    # make sure it returns the correct artist id value using a mock
    def test_correct_id(self, mock_get):
        mock_get.return_value.json.return_value = {
            "results": [
                {"artistId": 909253}
            ]
        }

        result = get_itunes_artist_id("Test Artist")

        self.assertEqual(result, 909253)

    # make sure if results is empty none is returned for artist
    @patch("app.routes.requests.get")
    def test_empty_results(self, mock_get):
        mock_get.return_value.json.return_value = {
            "results": []
        }

        result = get_itunes_artist_id("Test Artist")

        self.assertIsNone(result)

    @patch("app.routes.requests.get")
    # test that it can retrieve artist ID without an api call if inputted
    def test_input_id(self, mock_get):
        result = get_itunes_artist_id("Test Artist", artist_id="12345")

        self.assertEqual(result, "12345")
        mock_get.assert_not_called()

    @patch("app.routes.requests.get")
    # make sure it returns none if no artist is specified
    def test_empty_artist(self, mock_get):
        result = get_itunes_artist_id("")

        self.assertIsNone(result)
        mock_get.assert_not_called()

    # make sure the clean artist function removes whitespace from information
    def test_clean_remove_whitespace(self):
        artist = {
            "id": " 123 ",
            "name": " Test Artist ",
            "image": " img.jpg "
        }

        expected_artist = {
            "id": "123",
            "name": "Test Artist",
            "image": "img.jpg"
        }

        result = clean_selected_artist(artist)

        self.assertEqual(expected_artist, result)
    # make sure cleaning an empty artist returns none
    def test_clean_empty_artist(self):
        result = clean_selected_artist({})

        self.assertIsNone(result)

    # make sure trying to clean a non dictionary returns none
    def test_clean_non_dict(self):
        result = clean_selected_artist("not an artist dictionary")

        self.assertIsNone(result)

    # make sure trying to clean an artist without an ID returns none
    def test_clean_no_id(self):
        artist = {
            "name": "Test Artist",
            "image": "img.jpg"
        }

        result = clean_selected_artist(artist)

        self.assertIsNone(result)

    # make sure trying to clean an artist without a name returns none
    def test_clean_no_name(self):
        artist = {
            "id": "123",
            "image": "img.jpg"
        }

        result = clean_selected_artist(artist)

        self.assertIsNone(result)

    # make sure cleaning an artist uses fallback image when image is empty
    def test_clean_fallback(self):
        artist = {
            "id": "123",
            "name": "Test Artist",
            "image": ""
        }

        result = clean_selected_artist(artist)

        self.assertEqual(result["image"], FALLBACK_ARTIST_IMAGE)

    # make sure parsing valid selected artists works
    def test_parse_valid_artists(self):
        selected_artists = json.dumps([
            {"id": "1", "name": "Test Artist 1"},
            {"id": "2", "name": "Test Artist 2"}
        ])

        result = parse_selected_artists(selected_artists)

        self.assertEqual(len(result), 2)
        self.assertEqual(result[0]["id"], "1")
        self.assertEqual(result[1]["id"], "2")

    # make sure parsing artists removes invalid entries
    def test_parse_remove_invalid(self):
        selected_artists = json.dumps([
            {"id": "", "name": "Missing ID"},
            {"id": "2", "name": "Valid Artist"},
            {"id": "3", "name": ""}
        ])

        result = parse_selected_artists(selected_artists)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "2")
        self.assertEqual(result[0]["name"], "Valid Artist")

    # test parse selected artists removes duplicate artists
    def test_parse_remove_duplicates(self):
        selected_artists = json.dumps([
            {"id": "2", "name": "Test Artist 2"},
            {"id": "2", "name": "Duplicate Artist"}
        ])

        result = parse_selected_artists(selected_artists)

        self.assertEqual(len(result), 1)
        self.assertEqual(result[0]["id"], "2")

    # make sure parsing artists returns an empty list if there is invalid json
    def test_parse_invalid_json(self):
        result = parse_selected_artists("not json")

        self.assertEqual(result, [])

    # make sure parsing selected artists returns an empty list if non list json is given
    def test_parse_non_list_json(self):
        selected_artists = json.dumps({
            "id": "1",
            "name": "Test Artist"
        })

        result = parse_selected_artists(selected_artists)

        self.assertEqual(result, [])

    # make sure parsing artists limits the number of artists in the list to the maximum
    def test_parse_limits_number(self):
        selected_artists = json.dumps([
            {"id": str(i), "name": f"Artist {i}"}
            for i in range(20)
        ])

        result = parse_selected_artists(selected_artists)

        self.assertEqual(len(result), MAX_SELECTED_ARTISTS)

    # make sure the is valid song function recognises valid songs
    def test_valid_song(self):
        song = {
            "wrapperType": "track",
            "artistId": 123,
            "trackName": "Normal Song"
        }

        self.assertTrue(is_valid_song(song, 123))

    # make sure the is valid song function rejects albums 
    def test_is_valid_invalid_album(self):
        song = {
            "wrapperType": "album",
            "albumId": 123,
            "albumName": "Random Album"
        }

        self.assertFalse(is_valid_song(song, 123))

    # make sure it catches mismatches in id's 
    def test_is_valid_incorrect_id(self):
        song = {
            "wrapperType": "track",
            "artistId": 124,
            "trackName": "Bad Song"
        }

        self.assertFalse(is_valid_song(song, 123))

    # make sure that is valid song rejects remixes, case insensitive
    def test_is_valid_rejects_remix(self):
        song = {
            "wrapperType": "track",
            "artistId": 123,
            "trackName": "Normal Song REMIX"
        }

        self.assertFalse(is_valid_song(song, 123))

    # make sure is valid song accepts multiple valid data types for id (int and string)
    def test_is_valid_accepts_types(self):
        song = {
            "wrapperType": "track",
            "artistId": "123",
            "trackName": "Normal Song"
        }

        self.assertTrue(is_valid_song(song, 123))


if __name__ == "__main__":
    unittest.main()