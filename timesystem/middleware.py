class RequestResponseLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Log the incoming request
        print(f"Request method: {request.method}")
        print(f"Request path: {request.path}")
        print(f"Request headers: {request.headers}")
        print(f"Request body: {request.body}")
        
        # Process the request
        response = self.get_response(request)

        # Log the outgoing response
        print(f"Response status: {response.status_code}")
        print(f"Response headers: {response.headers}")
        print(f"Response body: {response.content}")

        return response
