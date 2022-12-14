import json
import flask
from flask import Flask, request
from flask_cors import CORS
import consts as C
from PIL import Image
from Database import Database as db
# from recognition import Recognition as reco
from twilio.rest import Client

app = Flask(__name__)
CORS(app)


def send_whatsapp_alert_message() -> None:
    """
    Pass on all users inthe database and send alert whatsapp message that unauthorized person tries to
    access the house.
    """
    client = Client(C.ACCOUNT_SID, C.AUTH_TOKEN)
    for cellphone in db().get_cellphones():
        client.messages.create(
            from_=C.SERVER_WHATSAPP_NUMBER,
            body=C.UNAUTHORIZED_MESSAGE,
            to=f"whatsapp:{cellphone}")


@app.route('/')
def hello_world():
    return 'Hello World!'


def add_user_to_cloud_db(username: str, cellphone: str, image_path: str) -> None:
    """
     Get the username and the path of the saved image (saved in the project in the form of:
     "backend/resources/<username>.png" and add the user in the firebase cloud database.
     :param username: The username.
     :param cellphone: The cellphone of the username.
     :param image_path: The Path of the saved image.
     """
    db().add_user(username, cellphone, image_path)
    db().add_image(image_path)


@app.route('/form', methods=["POST"])
def handle_form() -> json:
    """
       Get the form as a POST request the save the new username and the image uploaded in the project, then save
       the username and the path of the image in the db firebase cloud.
       :return: Response to the client.
       """
    username = request.form[C.USERNAME]
    cell_number = request.form[C.TEL]
    whole_number = '+972' + cell_number[1:] if cell_number[0] == '0' else '+972' + cell_number
    img = Image.open(request.files[C.IMAGE])
    image_path = C.BASE_PATH_TO_SAVE_IMAGE + username + '.png'
    img.save(image_path)
    return_data = {C.USERNAME: f"{username}", C.IMAGE: f"{img}"}
    add_user_to_cloud_db(username, whole_number, image_path)
    return flask.Response(response=json.dumps(return_data), status=201)


@app.route('/get_all_users', methods=["POST"])
def get_all_users() -> json:
    """
    Get a POST request in order to return all the users saved in the cloud database.
    :return: All the users.
    """
    return flask.jsonify(db().get_all_users())


@app.route('/identify', methods=["POST"])
def identify() -> json:
    """
    Get a POST request in order to identify a user that want to send a message. Check if the user exist, if
    exist return the username, and if not return an error message with a 202 status in response to notify
    the client.
    :return: username/error.
    """
    try:
        username = request.form[C.SENDER]
        found_user = db().get_user(username)

        if found_user:
            return flask.jsonify(username)
        else:
            send_whatsapp_alert_message()
            return flask.Response(response=json.dumps('No such user'), status=202)
    except Exception as e:
        return e.args


@app.route('/chat', methods=["POST"])
def do_chat() -> json:
    """
    Get a POST request in order to create chat between 2 existing users (if the chat isn't already exist).
    :return: sender and receiver.
    """
    sender, receiver = request.form[C.SENDER], request.form[C.RECEIVER]
    return_data = {C.SENDER: sender, C.RECEIVER: receiver}
    db().create_chat(sender, receiver)
    return flask.Response(response=json.dumps(return_data), status=201)


@app.route('/message', methods=["POST"])
def messages() -> json:
    """
     Get a POST request which contains a string which the first word is the sender, the second word is the
     receiver and the rest of the sting is the massage that sender want to send to the receiver. The decompose
     the string and send the message which will be saved in thd db with the time the message is sent.
     :return: The message, the sender and the receiver as json.
     """
    received_data = request.data.decode('ascii').split(' ')
    sender, receiver, message = received_data[0], received_data[1], ' '.join(received_data[2:])
    db().send_message(sender, receiver, message)
    returned_message = {C.MESSAGE: message, C.SENDER: sender, C.RECEIVER: receiver}
    return flask.Response(response=json.dumps(returned_message), status=201)


@app.route('/load_messages', methods=["POST"])
def load_messages() -> json:
    """
    Get a POSt request in order to return all the messages between 2 users sorted by the time they were
    saved.
    :return: List of dictionary e.g: [{ 'message': "Hello David",
                                       'sender': "John",
                                       'receiver': "David"
                                      },
                                      { 'message': "Hi John",
                                       'sender': "John",
                                       'receiver': "David"
                                      },
                                      { ... }, { ... }, ...
                                      ]
    """
    received_data = request.data.decode('ascii').split(' ')
    sender, receiver = received_data[0], received_data[1]
    list_of_dict_of_messages = db().load_chat(sender, receiver)
    list_of_dict_of_messages = sorted(list_of_dict_of_messages, key=lambda x: x[C.DATE], reverse=True)
    returned_data = [{C.MESSAGE: dict_item[C.MESSAGE], C.SENDER: dict_item[C.SENDER], C.DATE: dict_item[C.DATE]}
                     for dict_item in list_of_dict_of_messages]
    return flask.Response(response=json.dumps(returned_data), status=201)


if __name__ == '__main__':
    app.run()
