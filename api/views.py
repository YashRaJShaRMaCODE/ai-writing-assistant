from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(["POST"])
def rewrite_text(request):

    text = request.data.get("text")
    mode = request.data.get("mode")

    if mode == "rewrite":
        output = f"Rewritten: {text}"
    else:
        output = f"Summary: {text[:50]}"

    return Response({
        "result": output
    })