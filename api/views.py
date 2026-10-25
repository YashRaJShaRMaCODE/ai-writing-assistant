import os
import logging

import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
PROMPTS = {
    "rewrite": "Rewrite the following text so it is clear, correct and natural. Keep the meaning. Return only the rewritten text.",
    "summarise": "Summarize the following text in 2-3 short sentences. Return only the summary.",
}
MAX_TEXT_LENGTH = 5000
logger = logging.getLogger(__name__)


@api_view(["POST"])
def rewrite_text(request):
    text = request.data.get("text")
    mode = request.data.get("mode", "rewrite")
    if not isinstance(text, str) or not text.strip():
        return Response({"error": "Text is required"}, status=400)
    text = text.strip()
    if len(text) > MAX_TEXT_LENGTH:
        return Response({"error": f"Text must be {MAX_TEXT_LENGTH} characters or fewer"}, status=400)
    if not isinstance(mode, str) or mode not in PROMPTS:
        return Response({"error": "Mode must be rewrite or summarise"}, status=400)
    if request.data.get("adult_confirmed") is not True or request.data.get("external_processing_confirmed") is not True:
        return Response({"error": "Confirm you are 18+ and agree to send text to Google Gemini"}, status=400)

    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return Response({"error": "AI is not configured on the server"}, status=503)

    prompt = f"{PROMPTS[mode]}\n\n{text}"
    try:
        r = requests.post(
            GEMINI_URL,
            headers={"x-goog-api-key": key},
            timeout=(5, 30),
            json={
                "contents": [{"parts": [{"text": prompt}]}],
                "generationConfig": {"maxOutputTokens": 2048},
            },
        )
        if not r.ok:
            logger.warning("Gemini request failed with status %s", r.status_code)
            return Response({"error": "AI service is temporarily unavailable"}, status=502)
        output = r.json()["candidates"][0]["content"]["parts"][0]["text"]
        if not isinstance(output, str):
            raise ValueError("Gemini returned a non-text response")
        output = output.strip()
    except (requests.RequestException, KeyError, IndexError, TypeError, ValueError) as exc:
        logger.warning("Gemini request failed (%s)", type(exc).__name__)
        return Response({"error": "AI service failed, try again"}, status=502)
    if not output:
        return Response({"error": "AI service returned no text"}, status=502)
    return Response({"result": output})
