import json
import flask
from flask import Flask, request
from flask_cors import CORS
import consts as C
from PIL import Image
from Database import Database as db

app = Flask(__name__)
CORS(app)


def add_user_to_cloud_db(username: str, image_path: str):
    db().add_user(username, image_path)
    db().add_image(image_path)


@app.route('/')
def hello_world():
    return 'Hello World!'


@app.route('/form', methods=["GET", "POST"])
def handle_form():
    print("form...")
    if request.method == C.POST:
        username = request.form[C.USERNAME]
        img = Image.open(request.files[C.IMAGE])
        image_path = C.BASE_PATH_TO_SAVE_IMAGE + username + '.png'
        img.save(image_path)
        return_data = {C.USERNAME: f"{username}", C.IMAGE: f"{img}"}
        add_user_to_cloud_db(username, image_path)
        return flask.Response(response=json.dumps(return_data), status=201)


@app.route('/get_all_users', methods=["GET", "POST"])
def get_all_users():
    if request.method == C.POST:
        print(db().get_all_users())
        return flask.jsonify(db().get_all_users())


@app.route('/identify', methods=["GET", "POST"])
def identify():
    if request.method == C.POST:
        print("identify...")
        try:
            username = request.form[C.SENDER]
            user = db().get_user(username)
            return flask.jsonify(username) if user \
                else flask.Response(response=json.dumps('No such user'), status=202)
        except Exception as e:
            return e.args


@app.route('/chat', methods=["GET", "POST"])
def do_chat():
    if request.method == C.POST:
        print("let's chat...")
        sender, receiver = request.form[C.SENDER], request.form[C.RECEIVER]
        return_data = {C.SENDER: sender, C.RECEIVER: receiver}
        db().create_chat(sender, receiver)
        return flask.Response(response=json.dumps(return_data), status=201)


@app.route('/message', methods=["GET", "POST"])
def messages():
    if request.method == C.POST:
        print("message...")
        received_data = request.data.decode('ascii').split(' ')
        sender, receiver, message = received_data[0], received_data[1], ' '.join(received_data[2:])
        db().send_message(sender, receiver, message)
        returned_message = {C.MESSAGE: message, C.SENDER: sender, C.RECEIVER: receiver}
        return flask.Response(response=json.dumps(returned_message), status=201)


@app.route('/load_messages', methods=["GET", "POST"])
def load_messages():
    if request.method == C.POST:
        print("load message...")
        received_data = request.data.decode('ascii').split(' ')
        sender, receiver = received_data[0], received_data[1]
        list_of_dict_of_messages = db().load_chat(sender, receiver)
        print(list_of_dict_of_messages)
        list_of_dict_of_messages = sorted(list_of_dict_of_messages, key=lambda x: x[C.DATE], reverse=True)
        print(list_of_dict_of_messages)
        returned_data = [{C.MESSAGE: dict_item[C.MESSAGE], C.SENDER: dict_item[C.SENDER], C.DATE: dict_item[C.DATE]}
                         for dict_item in list_of_dict_of_messages]
        return flask.Response(response=json.dumps(returned_data), status=201)


if __name__ == '__main__':
    app.run()
# if __name__ == "__main__":
#     app.run("localhost", 6969)
