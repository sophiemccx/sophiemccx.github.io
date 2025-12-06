import json
from typing import Union
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*']
)

# gets stock price for ticker based on elapsed time and amount of "divisions"
@app.get("/stocks/{stock}/{index}/{divisions}")
async def stock_price(stock, index, divisions):
    file = open("api/" + stock + ".json", "r")
    data = file.read()
    json_object = json.loads(data)
    prices = json_object["values"]
    percentage = (int(index) / int(divisions))
    if percentage == 1.0:
        price = prices[0]["close"]
    else:
        price = prices[int((len(prices) - 1) - percentage * len(prices) - 1)]["close"]
    return {"price": price}

# updates score for user
@app.get("/scores/save/{user}/{score}")
async def save_score(user, score):
    scores_file = open("api/scores.json", "r")
    data = scores_file.read()
    json_object = json.loads(data)
    json_object[user] = score
    with open("api/scores.json", "w") as scores_file:
        json.dump(json_object, scores_file)
    return {"status": "success"}

# retrieves score for user
@app.get("/scores/get/{user}")
async def get_score(user):
    scores_file = open("api/scores.json", "r")
    data = scores_file.read()
    json_object = json.loads(data)
    score = json_object.get(user, 0)
    return {"score": score}

# gets top 10 scores
@app.get("/scores/top")
async def top_scores():
    scores_file = open("api/scores.json", "r")
    data = scores_file.read()
    json_object = json.loads(data)
    sorted_scores = sorted(json_object.items(), key=lambda item: float(item[1][1:]), reverse=True)
    top_10 = sorted_scores[:10]
    return {"scores": top_10}