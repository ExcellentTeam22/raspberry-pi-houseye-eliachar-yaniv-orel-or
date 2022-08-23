import json

import firebase_admin
import flask
from flask import Flask, request
import data as data
from flask_cors import CORS
import pandas as pd
import consts as C
from firebase_admin import credentials
from firebase_admin import firestore
from firebase_admin import storage


cred = credentials.Certificate("./ServiceAccountKey.json")
firebase_admin.initialize_app(cred, {
    'storageBucket': 'gs://houseeye-ea111.appspot.com'
})

db = firestore.client()
bucket = storage.bucket()


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
        from werkzeug.datastructures import ImmutableMultiDict
        received_data = request.get_json
        print(f"received data: {received_data}")
        message = received_data[C.USERNAME]
        return_data = {
            "status": "success",
            "message": f"received: {message}"
        }

        data.my_users["usernames"].append(received_data[C.USERNAME])
        data.my_users["images"].append(received_data[C.IMAGE])

        print(data.my_users)
        print(len(data.df_users.index))

        temp_df = pd.DataFrame(columns=[C.USERNAME, C.IMAGE])
        temp_df.at[len(data.df_users.index), C.USERNAME] = received_data[C.USERNAME]
        temp_df.at[len(data.df_users.index), C.IMAGE] = received_data[C.IMAGE]

        data.df_users = pd.concat([data.df_users, temp_df], ignore_index=True)

        db.collection('Users').add({'username': received_data[C.USERNAME], 'image': received_data[C.IMAGE]})
        blob = bucket.blob(received_data[C.IMAGE])
        blob.upload_from_filename(received_data[C.IMAGE])
        return flask.Response(response=json.dumps(return_data), status=201)


if __name__ == '__main__':
    app.run()
# if __name__ == "__main__":
#     app.run("localhost", 6969)

