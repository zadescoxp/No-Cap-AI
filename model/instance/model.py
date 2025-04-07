import pandas as pd
import torch
from transformers import (
    BertTokenizerFast,
    BertForSequenceClassification,
    Trainer,
    TrainingArguments,
)
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
from datasets import Dataset

# 1. Load and preprocess the data
print("🔹 Loading data...")
df = pd.read_csv("WELFake_Dataset.csv")
df["text"] = (df["title"].fillna("") + " " + df["text"].fillna("")).str.strip()
df = df[["text", "label"]].dropna()

# 2. Split into train and test sets
print("🔹 Splitting dataset...")
train_texts, val_texts, train_labels, val_labels = train_test_split(
    df["text"].tolist(),
    df["label"].tolist(),
    test_size=0.1,
    random_state=42,
    stratify=df["label"],
)

# 3. Tokenize using BERT tokenizer
print("🔹 Tokenizing...")
tokenizer = BertTokenizerFast.from_pretrained("google-bert/bert-base-uncased")

train_encodings = tokenizer(train_texts, truncation=True, padding=True, max_length=512)
val_encodings = tokenizer(val_texts, truncation=True, padding=True, max_length=512)

train_dataset = Dataset.from_dict(
    {
        "input_ids": train_encodings["input_ids"],
        "attention_mask": train_encodings["attention_mask"],
        "labels": train_labels,
    }
)

val_dataset = Dataset.from_dict(
    {
        "input_ids": val_encodings["input_ids"],
        "attention_mask": val_encodings["attention_mask"],
        "labels": val_labels,
    }
)

# 4. Load pre-trained BERT model
print("🔹 Loading BERT model...")
model = BertForSequenceClassification.from_pretrained(
    "google-bert/bert-base-uncased", num_labels=2
)


# 5. Define compute metrics function
def compute_metrics(eval_pred):
    logits, labels = eval_pred
    predictions = torch.argmax(torch.tensor(logits), dim=-1)
    acc = accuracy_score(labels, predictions)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, predictions, average="binary"
    )
    return {"accuracy": acc, "precision": precision, "recall": recall, "f1": f1}


# 6. Set up training arguments
training_args = TrainingArguments(
    output_dir="./results",
    evaluation_strategy="epoch",
    save_strategy="epoch",
    num_train_epochs=3,
    per_device_train_batch_size=8,
    per_device_eval_batch_size=8,
    logging_dir="./logs",
    logging_steps=100,
    save_total_limit=1,
    load_best_model_at_end=True,
    metric_for_best_model="accuracy",
    push_to_hub=False,
)

# 7. Initialize Trainer
trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=train_dataset,
    eval_dataset=val_dataset,
    compute_metrics=compute_metrics,
)

# 8. Train the model
print("🚀 Starting training...")
trainer.train()

# 9. Save the trained model and tokenizer
print("💾 Saving model...")
model.save_pretrained("./bert_fake_news_model")
tokenizer.save_pretrained("./bert_fake_news_model")

print("✅ Model and tokenizer saved to ./bert_fake_news_model")
