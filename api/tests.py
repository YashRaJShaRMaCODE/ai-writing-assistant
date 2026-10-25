import os
from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework.test import APIClient


class RewriteApiTests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.url = "/api/rewrite/"
        self.payload = {"text": "A short note.", "mode": "rewrite"}

    def test_requires_text_and_valid_mode(self):
        self.assertEqual(self.client.post(self.url, {}, format="json").status_code, 400)
        response = self.client.post(self.url, {**self.payload, "mode": "translate"}, format="json")
        self.assertEqual(response.status_code, 400)

    def test_rejects_non_text_and_oversized_input(self):
        self.assertEqual(
            self.client.post(self.url, {"text": ["not", "text"]}, format="json").status_code,
            400,
        )
        response = self.client.post(self.url, {"text": "a" * 5001}, format="json")
        self.assertEqual(response.status_code, 400)

    @patch.dict(os.environ, {"GEMINI_API_KEY": "server-secret"})
    @patch("api.views.requests.post")
    def test_sends_api_key_in_header_and_returns_text(self, post):
        upstream = Mock(ok=True)
        upstream.json.return_value = {
            "candidates": [{"content": {"parts": [{"text": "A clearer note."}]}}]
        }
        post.return_value = upstream

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"result": "A clearer note."})
        self.assertEqual(post.call_args.kwargs["headers"]["x-goog-api-key"], "server-secret")
        self.assertNotIn("key", post.call_args.kwargs.get("params", {}))

    @patch.dict(os.environ, {"GEMINI_API_KEY": "server-secret"})
    @patch("api.views.requests.post")
    def test_hides_upstream_error_details(self, post):
        upstream = Mock(ok=False, status_code=403)
        post.return_value = upstream

        response = self.client.post(self.url, self.payload, format="json")

        self.assertEqual(response.status_code, 502)
        self.assertNotIn("server-secret", response.content.decode())
