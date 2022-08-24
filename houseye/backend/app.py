import io
import json

import flask
from flask import Flask, request
import data as data
from flask_cors import CORS
import pandas as pd
import consts as C
from PIL import Image
from  io import StringIO
from Database import Database as db


db().update_user(username='YanivSonino', status='out')

app = Flask(__name__)
CORS(app)


@app.route('/')
def hello_world():  # put application's code here
    return 'Hello World!'


@app.route('/users', methods=["GET", "POST"])
def users():
    if request.method == "GET":
        print("users endpoint reached...")
        return flask.jsonify(data.my_users)


@app.route('/form', methods=["GET", "POST"])
def handle_form():
    print("form...")

    if request.method == "POST":
        received_data = request.get_json()
        print(f"received data: {received_data}")
        user = received_data[C.USERNAME]
        img = received_data[C.IMAGE]
        return_data = {
            "user": f"{user}",
            # "image": f"{img}"
        }

        data.my_users["usernames"].append(received_data[C.USERNAME])
        data.my_users["images"].append(received_data[C.IMAGE])

        print(data.my_users)
        print(len(data.df_users.index))

        temp_df = pd.DataFrame(columns=[C.USERNAME, C.IMAGE])
        temp_df.at[len(data.df_users.index), C.USERNAME] = received_data[C.USERNAME]
        temp_df.at[len(data.df_users.index), C.IMAGE] = received_data[C.IMAGE]

        # picture = Image.open(io.BytesIO(img))
        # picture = picture.save("/resources/d.jpg")
        # picture.show()

        data.df_users = pd.concat([data.df_users, temp_df], ignore_index=True)

        return flask.Response(response=json.dumps(return_data), status=201)


if __name__ == '__main__':
    app.run()
# if __name__ == "__main__":
#     app.run("localhost", 6969)

