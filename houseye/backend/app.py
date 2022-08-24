import json
import flask
from flask import Flask, request
import data as data
from flask_cors import CORS
import pandas as pd
import consts as C
from PIL import Image
# from Database import Database as db

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route('/users', methods=["GET", "POST"])
def users():
    if request.method == C.GET:
        print("users endpoint reached...")
        return flask.jsonify(data.my_users)


@app.route('/form', methods=["GET", "POST"])
def handle_form():
    print("form...")

    if request.method == C.POST:
        username = request.form[C.USERNAME]
        img = Image.open(request.files[C.IMAGE])
        img.save(C.PATH_TO_SAVE_IMAGE)

        received_data = {C.USERNAME: f"{username}", C.IMAGE: f"{img}"}
        return_data = {C.USERNAME: f"{username}", C.IMAGE: f"{img}"}

        data.my_users["usernames"].append(received_data[C.USERNAME])
        data.my_users["images"].append(received_data[C.IMAGE])

        temp_df = pd.DataFrame(columns=[C.USERNAME, C.IMAGE])
        temp_df.at[len(data.df_users.index), C.USERNAME] = received_data[C.USERNAME]
        temp_df.at[len(data.df_users.index), C.IMAGE] = received_data[C.IMAGE]

        data.df_users = pd.concat([data.df_users, temp_df], ignore_index=True)
        print(data.df_users)

        return flask.Response(response=json.dumps(return_data), status=201)


if __name__ == '__main__':
    app.run()
# if __name__ == "__main__":
#     app.run("localhost", 6969)

