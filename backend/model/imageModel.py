from transformers import pipeline
from PIL import Image 
import requests

pipe = pipeline("image-classification", model="umm-maybe/AI-image-detector")
# image_url = "https://images.unsplash.com/photo-1506748686214-e9df14d4d9d0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=MnwzNjUyOXwwfDF8c2VhcmNofDJ8fGZha2V8ZW58MHx8fHwxNjg5NTY1NzA3&ixlib=rb-4.0.3&q=80&w=400"

def image_model(image_url):
    image = Image.open(requests.get(image_url, stream=True).raw)
    result = pipe(image)
    # human_label = result[0]['label']
    human_score = result[0]['score']
    # machine_label = result[1]['label']
    machine_score = result[1]['score']
    
    return [human_score, machine_score]