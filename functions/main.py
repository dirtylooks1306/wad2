import functions_framework
import os
import requests
from flask import jsonify, request
from firebase_functions import functions

# Retrieve API key from Firebase environment config
OPENAI_API_KEY = functions.config().openai.key

@functions_framework.http
# def call_openai(request):
#     # Use the API key here
