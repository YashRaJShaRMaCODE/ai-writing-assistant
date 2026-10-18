import os

import requests
from rest_framework.decorators import api_view
from rest_framework.response import Response

GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent"
PROMPTS = {
    "rewrite": "Rewrite the following text so it is clear, correct and natural. Keep the meaning. Return only the rewritten text.",
    "summarise": "Summarize the following text in 2-3 short sentences. Return only the summary.",
}


@api_view(["POST"])
def rewrite_text(request):
    text = (request.data.get("text") or "").strip()
    mode = request.data.get("mode", "rewrite")
    if not text:
        return Response({"error": "Text is required"}, status=400)
    key = os.environ.get("GEMINI_API_KEY")
    if not key:
        return Response({"error": "AI is not configured on the server"}, status=503)
    prompt = f"{PROMPTS.get(mode, PROMPTS['rewrite'])}\n\n{text[:5000]}"
    try:
        r = requests.post(GEMINI_URL, params={"key": key}, timeout=30,
                          json={"contents": [{"parts": [{"text": prompt}]}]})
        if not r.ok:
            msg = r.json().get("error", {}).get("message", "") if "json" in r.headers.get("content-type", "") else ""
            return Response({"error": f"AI service error {r.status_code}: {msg[:200]}"}, status=502)
        output = r.json()["candidates"][0]["content"]["parts"][0]["text"].strip()
    except (requests.RequestException, KeyError, IndexError, ValueError):
        return Response({"error": "AI service failed, try again"}, status=502)
    return Response({"result": output})
