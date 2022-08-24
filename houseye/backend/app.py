import json
import flask
from flask import Flask, request
import data as data
from flask_cors import CORS
import pandas as pd
import consts as C
from PIL import Image
from Database import Database as db

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


def add_user_to_cloud_db(username: str, image_path: str):
    db().add_user(username, image_path)


def insert_to_dataframe(received_data, PATH_TO_SAVE_IMAGE):
    temp_df = pd.DataFrame(columns=[C.USERNAME, C.IMAGE_PATH, C.IMAGE])
    temp_df.at[len(data.df_users.index), C.USERNAME] = received_data[C.USERNAME]
    temp_df.at[len(data.df_users.index), C.IMAGE_PATH] = PATH_TO_SAVE_IMAGE
    temp_df.at[len(data.df_users.index), C.IMAGE] = received_data[C.IMAGE]

    data.df_users = pd.concat([data.df_users, temp_df], ignore_index=True)
    print(data.df_users)


@app.route('/form', methods=["GET", "POST"])
def handle_form():
    print("form...")

    if request.method == C.POST:
        username = request.form[C.USERNAME]
        img = Image.open(request.files[C.IMAGE])
        image_path = C.BASE_PATH_TO_SAVE_IMAGE + username + '.png'
        img.save(image_path)

        received_data = {C.USERNAME: f"{username}", C.IMAGE: f"{img}"}
        return_data = {C.USERNAME: f"{username}", C.IMAGE: f"{img}"}

        db().delete_user('yanivson', 'url()')

        add_user_to_cloud_db(username, image_path)
        insert_to_dataframe(received_data, image_path)

        return flask.Response(response=json.dumps(return_data), status=201)


@app.route('/get_all_users', methods=["GET", "POST"])
def get_all_users():
    if request.method == C.POST:
        print("get all users route...")
        print(db().get_all_users())
        return flask.jsonify(db().get_all_users())


if __name__ == '__main__':
    app.run()
# if __name__ == "__main__":
#     app.run("localhost", 6969)

