from flask import Flask, request, jsonify
import torch
from model import NeuralNet
from nltk_utils import bag_of_words, tokenize
import json
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/chat": {"origins": "http://localhost:3000"}})

# Load model and data
device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
FILE = "data.pth"
intents_file = "intents.json"

# Load model parameters and initialize model
data = torch.load(FILE)
input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data["all_words"]
tags = data["tags"]
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

# Load intents
with open(intents_file, 'r') as f:
    intents = json.load(f)

# Chat route
@app.route('/chat', methods=['POST'])
def chat():
    data = request.get_json()
    message = data['message']
    sentence = tokenize(message)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    # Model prediction
    output = model(X)
    _, predicted = torch.max(output, dim=1)
    tag = tags[predicted.item()]

    # Probability threshold
    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["intent"]:
                return jsonify({"message": intent["response"]})

    return jsonify({"message": "I'm not sure how to respond to that."})

if __name__ == "__main__":
    app.run(debug=True)
