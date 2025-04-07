import torch
from transformers import DistilBertTokenizerFast, DistilBertForSequenceClassification
import pandas as pd
import os

# Load model and tokenizer
model_path = "./bert_fake_news_model"
tokenizer = DistilBertTokenizerFast.from_pretrained(model_path)
model = DistilBertForSequenceClassification.from_pretrained(model_path)

def predict_news(title, text, save_path="user_news_data_bert.csv"):
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model.to(device)

    combined = (title.strip() + " " + text.strip()).strip()
    inputs = tokenizer(combined, return_tensors="pt", truncation=True, padding=True, max_length=512)
    inputs = {key: val.to(device) for key, val in inputs.items()}

    with torch.no_grad():
        outputs = model(**inputs)
        prediction = torch.argmax(outputs.logits, dim=1).item()

    label = "Fake" if prediction == 1 else "Real"
    print(f"\n📢 Prediction: This news is likely → {label}")

    # Save input for future retraining
    new_data = pd.DataFrame({
        "title": [title],
        "text": [text],
        "predicted_label": [prediction]
    })

    if os.path.exists(save_path):
        existing = pd.read_csv(save_path)
        combined = pd.concat([existing, new_data], ignore_index=True)
    else:
        combined = new_data

    combined.to_csv(save_path, index=False)
    print(f"✅ Data stored in {save_path} for future retraining.")

# Example usage
if __name__ == "__main__":
    print("\n🧠 Fake News Detector (BERT)")
    title = input("📝 Enter the news title: ")
    text = input("📰 Enter the news body text: ")
    predict_news(title, text)
