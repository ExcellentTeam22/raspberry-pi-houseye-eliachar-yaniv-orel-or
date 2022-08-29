"use strict";

var uploaded_image = ""

document.addEventListener('DOMContentLoaded', function () {
    myModule.querySelect("#scanbtn").addEventListener("click", myModule.scan);
    myModule.querySelect("#adduser").addEventListener("click", myModule.adduser);
    myModule.querySelect("#cancel").addEventListener("click", myModule.cancel);
    myModule.querySelect("#register").addEventListener("click", myModule.register);
    myModule.querySelect("#identify").addEventListener("click", myModule.identify);
    myModule.querySelect("#send").addEventListener("click", myModule.send_message);

    myModule.querySelect("#show-users-btn").addEventListener("click", myModule.show_users);
    myModule.querySelect("#show-users").addEventListener("click", myModule.show_users);
    myModule.querySelect("#back").addEventListener("click", myModule.back);

    myModule.querySelect("#image").addEventListener("change", function () {
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            uploaded_image = reader.result
            let display = myModule.querySelect('#display-image');
            display.className = "d-block mb-4 center-text-align";
            display.style.backgroundImage = `url(${uploaded_image})`

        });
        reader.readAsDataURL(this.files[0])
    });

}, false);

//-----------------------------------
const myModule = (() => {

    /**
     * Scan your face with raspberry pi camera
     */
    const scan = function () {
        console.log("scan")
    }
//----------------------------
    /**
     * Showing form to add new member.
     */
    const adduser = function () {
        console.log("adduser")
        let form = querySelect('#form')
        form.className = 'd-block'
        querySelect('#open').click();
    }
//----------------------------
    /**
     * Cancel the addition of new member and reset the form.
     */
    const cancel = function () {
        console.log("cancel")
        let form = querySelect('#form')
        form.className = 'd-none';

        querySelect('#instructions').className = "d-none";
        querySelect('#display-image').className = "d-none";
        querySelect('#formPost').reset()
    }
    //------------------------------
    /**
     * Asynchronous function. Get a form action and send it to the server. The form contains a username and
     * an image uploaded by the user.
     * @param event - the event of submission of the form.
     * @returns {Promise<void>}
     */
    const register = async function (event) {
        console.log("register")
        event.preventDefault()
        let form = querySelect('#formPost')

        const resp = await fetch("http://127.0.0.1:5000/form", {
            method: "POST",
            body: new FormData(form)
        });
        const body = await resp.json();
        console.log(body)
        querySelect('#instructions').className = "d-block";
        querySelect('#display-image').className = "d-none";
        form.reset()
    }
    //----------------------------
    /**
     * Asynchronous function. Send a request in order to get all the users saved in the database in the server
     * side. The wait for response from the server in the form of an array of objects which each object
     * has a username attribute, an image path and a status says if the user is in the house or not.
     * The show the results in the dom with a button allowing to chat chat with each user.
     * @returns {Promise<void>}
     */
    const show_users = async function () {
        querySelect('#main-page').className = "d-none";
        querySelect('#users-show').className = "d-block";
        querySelect('#result').className = 'd-block';
        querySelect('#return').className = 'd-none';
        querySelect('#sent-message').innerHTML = ""

        let result_div = querySelect('#result')
        result_div.innerHTML = '';

        const resp = await fetch("http://127.0.0.1:5000/get_all_users", {
            method: "POST",
        });
        const body = await resp.json();

        body.forEach(user => {
            appendCardToHtml(result_div, createDiv(user.username, user.image, user.status))
        });
        addListeners()
    }
    //------------------------------
    /**
     * Asynchronous function. Get a form action in order to identify the sender of the message. If the user
     * doesnt exist the response from the server will be 202 and will ask the user to re-enter a valid
     * existing username, and if the user exist will show the sender a place to enter his message and to send it.
     * @param event - the event of submission of the form.
     * @returns {Promise<void>}
     */
    const identify = async function (event) {
        console.log("identify")
        event.preventDefault()
        let form = querySelect('#formIdentifyPost');
        querySelect('#sent-message').innerHTML = ""

        const resp = await fetch("http://127.0.0.1:5000/identify", {
            method: "POST",
            body: new FormData(form)
        });
        const body = await resp.json();

        if (resp.status === 202) {
            document.getElementsByClassName('text-danger errormessage mb-2')[0].innerHTML = body
        } else {
            console.log(`sender: ${body}`)
            let receiver = querySelect('#receiver').value
            console.log(`receiver: ${receiver}`)
            querySelect('#identify-div').className = 'd-none';
            await doChat(event, body, receiver, form);
        }
    }

    //-----------------------------
    /**
     * Asynchronous function. Get a valid sender and a valid receiver and the form with the message sent by the
     * sender to the user the send the form to the server and wait for response. At that point the server
     * should create a chat between the 2 users if the chat doesnt exist yet. If get in the response the
     * sender and the receiver - saves the values in the dom in hidden inputs.
     * @param event - the event of submission of the form.
     * @param sender - The sender of the message.
     * @param receiver - The receiver of the message.
     * @param form = the form.
     * @returns {Promise<void>}
     */
    const doChat = async function (event, sender, receiver, form) {
        event.preventDefault()

        const resp = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            body: new FormData(form)
        });
        const body = await resp.json();
        console.log(`got: ${body["sender"]},  ${body["receiver"]}`)

        if (body["sender"] === sender && body["receiver"] === receiver) {
            let div_chat = querySelect('#chat')
            div_chat.className = "d-block";
            querySelect('#sender').value = sender
            querySelect('#receiver').value = receiver
        }
    }
    //---------------------------
    /**
     * Asynchronous function. Get a form action in order to send message from a sender to a receiver then
     * send to the server all the info in order to send the message. After getting the results will wait
     * for "load_messages" function.
     * @param event - The event of the form submission.
     * @returns {Promise<void>}
     */
    const send_message = async function (event) {
        console.log("send message...")
        event.preventDefault()
        let sender = querySelect('#sender').value
        let receiver = querySelect('#receiver').value
        let message = querySelect('#message').value

        const resp = await fetch("http://127.0.0.1:5000/message", {
            method: "POST",
            body: `${sender} ${receiver} ${message}`
        });
        const body = await resp.json();
        console.log(body)
        querySelect('#chat').className = "d-none";
        let divSentMsg = querySelect('#sent-message')
        divSentMsg.innerHTML = ""
        appendCardToHtml(divSentMsg,
            `<h3 id="sent-message">You sent: "${body["message"]}" to: ${body["receiver"]}</h3>`)
        await load_messages(event, body["sender"], body["receiver"], divSentMsg)

        clearInput('sender')
        clearInput('receiver')
        clearInput('message')
    }
    //--------------------------
    /**
     * Get the sender, the receiver and an element in the dom to show the messages then send the sender
     * and the receiver to the server in order to load the chat between them, and append each message with
     * its date in the dom element.
     * @param event
     * @param sender
     * @param receiver
     * @param where
     * @returns {Promise<void>}
     */
    const load_messages = async function (event, sender, receiver, where) {
        console.log("load messages...")

        const resp = await fetch("http://127.0.0.1:5000/load_messages", {
            method: "POST",
            body: `${sender} ${receiver}`
        });
        const body = await resp.json();
        console.log(body)

        body.forEach(item => {
            appendCardToHtml(where, `<p><b>${item["sender"]}</b> >> "${item["message"]}"</br>
                                             << <i>${item["date"]}</i></p>`)
        })
    }

    //--------------------------------------
    /**
     * add listeners to the "Chat" button in order to chat with the specific user.
     */
    const addListeners = function () {
        let buttons = document.getElementsByClassName("btn btn-info ml-2 mr-2");
        for (let btn of buttons)
            btn.addEventListener('click', chatWith);
    }
    //----------------------------------
    /**
     * When a "Chat" button is pressed - save the receiver which the sender wishes to send a message.
     * @param btn - The button pressed.
     */
    const chatWith = function (btn) {
        const receiver = btn.target.parentElement.getElementsByTagName('h3')[0].innerHTML;
        querySelect('#receiver').value = receiver
        querySelect('#identify-div').className = 'd-block';
        querySelect('#sent-message').innerHTML = ""
        querySelect('#up').click();
        querySelect('#result').className = 'd-none';
        querySelect('#return').className = 'd-block';
    }
    //---------------------------------

    const createDiv = (username, image_path, status) => {
        if (status === "In") {
            return `
            <div>
               <div class="card border border-5 rounded-3 mb-2 left-text-align" style="width: 27.5rem;">
                 <div class="card-body">
                    <h3 class="card-text">${username}</h3>
                    <h3 class="card-text text-success">${status}</h3>
                    <button id="${username}" class="btn btn-info ml-2 mr-2">Chat</button>
                  </div>
                </div>
            </div>`;
        }
        return `
            <div>
               <div class="card border border-5 rounded-3 mb-2 left-text-align" style="width: 27.5rem;">
                 <div class="card-body">
                    <h3 class="card-text">${username}</h3>
                    <h3 class="card-text text-danger">${status}</h3>
                    <button id="${username}" class="btn btn-info ml-2 mr-2">Chat</button>
                  </div>
                </div>
            </div>`;
    }
    /** @returns {string} - return a div that includes a card with an image and its details */
        //----------------------------------
    const appendCardToHtml = (where, div) => {
            where.insertAdjacentHTML('beforeend', div);
        }
    //----------------------------
    const back = function () {
        querySelect('#main-page').className = "d-block";
        querySelect('#users-show').className = "d-none";
    }


    /** for more readable syntax
     * @param container - get an #id
     * @returns {*} - returns selector with the particular id sent */
    const querySelect = function (container) {
        return document.querySelector(container);
    }
    //---------------------
    /** set attribute to a DOM object
     * @param container - get an #id
     * @param qualName - get a qualified name (class, href, etc)
     * @param val - get the value we want to insert */
    const setAttr = function (container, qualName, val) {
        querySelect(container).setAttribute(qualName, val);
    }
    //--------------------------------
    /** creates a DOM element
     * @param node - a tag
     * @returns {*} - returns a created element with the particular tag sent */
    const createNode = function (node) {
        return document.createElement(node);
    }
    //-----------------
    /** set the child and append him to the parent sent
     * @param parent - get the parent node
     * @param child - get the child node
     * @param nameClass - the class name we want to insert to the child
     * @param inner - the innerHTML we want to insert to the child */
    const appendNode = function (parent, child, nameClass, inner) {
        child.className = nameClass;
        child.innerHTML = inner;
        parent.appendChild(child);
    }
    //---------------------
    /** reset errors to none errors */
    const resetErrors = function () {
        document.querySelectorAll(".is-invalid").forEach((e) => e.classList.remove("is-invalid"));
        document.querySelectorAll(".errormessage").forEach((e) => e.innerHTML = "");
    }
    //-----------------------------
    /** clear the outputs of the DOM */
    const clearInput = function (id) {
        querySelect(`#${id}`).value = '';
    }

    return {
        scan: scan,
        adduser: adduser,
        cancel: cancel,
        show_users: show_users,
        back: back,
        register: register,
        identify: identify,
        send_message: send_message,
        querySelect: querySelect,
        setAttr: setAttr,
        resetErrors: resetErrors,
    }
})();


// console.log("Sending data: " + username + " + " + image);
// xhr = getXmlHttpRequestObject();
// xhr.onreadystatechange = sendDataCallback;
// xhr.open("POST", "http://127.0.0.1:5000/form", true);
// xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
// xhr.send(JSON.stringify({
//     "username": username,
//     "image": image
// }));


// function sendDataCallback() {
//     // Check response is ready or not
//     if (xhr.readyState == 4 && xhr.status == 201) {
//         console.log("Data creation response received!");
//         let dataDiv = document.getElementById('sent-data-container');
//         // Set current data text
//         dataDiv.innerHTML = xhr.responseText;
//     }
// }

//
// var xhr = null;
// const getXmlHttpRequestObject = function () {
//     if (!xhr) {
//         // Create a new XMLHttpRequest object
//         xhr = new XMLHttpRequest();
//     }
//     return xhr;
// };
//
// function dataCallback() {
//     if (xhr.readyState == 4 && xhr.status == 200) {
//         console.log("User data received!");
//         let dataDiv = document.getElementById('result-container');
//         dataDiv.innerHTML = xhr.responseText;
//         console.log(xhr.responseText)
//     }
// }
//
// function getUsers() {
//     console.log("Get users...");
//     xhr = getXmlHttpRequestObject();
//     xhr.onreadystatechange = dataCallback;
//     xhr.open("GET", "http://127.0.0.1:5000/users", true);
//     xhr.send(null);
// }
