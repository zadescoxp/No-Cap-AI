from transformers import pipeline

pipe = pipeline("text-classification", model="XSY/albert-base-v2-fakenews-discriminator")

def text_model(text):
    result = pipe(text)
    label = result[0]['label']
    score = result[0]['score']
    return [label, score]