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
    myModule.querySelect("#back").addEventListener("click", myModule.back);

    myModule.querySelect("#image").addEventListener("change", function () {
        const reader = new FileReader()
        reader.addEventListener("load", () => {
            uploaded_image = reader.result
            myModule.querySelect('#display-image').style.backgroundImage = `url(${uploaded_image})`

        });
        reader.readAsDataURL(this.files[0])
    });

}, false);

//-----------------------------------
const myModule = (() => {

    const scan = function () {
        console.log("scan")
    }
//----------------------------
    const adduser = function () {
        console.log("adduser")
        let form = querySelect('#form')
        form.className = 'd-block'
        querySelect('#open').click();
    }
//----------------------------
    const cancel = function () {
        console.log("cancel")
        let form = querySelect('#form')
        form.className = 'd-none'
    }
    //------------------------------
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
    }
    //----------------------------
    const show_users = async function () {
        querySelect('#main-page').className = "d-none";
        querySelect('#users-show').className = "d-block";

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
    const identify = async function (event) {
        console.log("identify")
        event.preventDefault()
        let form = querySelect('#formIdentifyPost');

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
            await doChat(event, body, receiver);
        }
    }

    //-----------------------------
    const doChat = async function (event, sender, receiver) {
        event.preventDefault()
        let form = querySelect('#formIdentifyPost')

        const resp = await fetch("http://127.0.0.1:5000/chat", {
            method: "POST",
            body: new FormData(form)
        });
        const body = await resp.json();
        console.log(`got: ${body["sender"]},  ${body["receiver"]}`)

        if (body["sender"] === sender && body["receiver"] === receiver) {
            console.log(`in if..`)
            let div_chat = querySelect('#chat')
            div_chat.className = "d-block";

            querySelect('#sender').value = sender
            querySelect('#receiver').value = receiver
            // appendCardToHtml(div_chat, createDiv(user.username, user.image, user.status))
        }
    }
    //---------------------------
    const send_message = async function (event) {
        console.log("send message...")
        event.preventDefault()
        let form = querySelect('#formMessagePost');

        console.log(querySelect('#sender').value)
        console.log(querySelect('#receiver').value)
        console.log(querySelect('#message').value)

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
        appendCardToHtml(divSentMsg,
            `<h3 id="sent-message">You sent: "${body["message"]}" to: ${body["receiver"]}</h3>`)
        // querySelect('#sent-message').innerHTML = `You sent: "${body["message"]}" to: ${body["receiver"]}`
        await load_messages(event, body["sender"], body["receiver"], divSentMsg)
    }
    //--------------------------
    const load_messages = async function (event, sender, receiver, where) {
        console.log("load messages...")
        console.log(sender)

        const resp = await fetch("http://127.0.0.1:5000/load_messages", {
            method: "POST",
            body: `${sender} ${receiver}`
        });
        const body = await resp.json();
        console.log(body)

        body.forEach(item => {
            console.log(item["message"])
            console.log(item["sender"])
            appendCardToHtml(where, `<p>${item["sender"]} >> "${item["message"]}"</p></br>`)
        })
    }

    //--------------------------------------
    /** add listeners to the save buttons of the DOM inserted photos (every card has a such button) */
    const addListeners = function () {
        let buttons = document.getElementsByClassName("btn btn-info ml-2 mr-2");
        for (let btn of buttons)
            btn.addEventListener('click', chatWith);
    }
    //----------------------------------
    const chatWith = function (btn) {
        const id = btn.target.parentElement.getElementsByTagName('h3')[0].innerHTML;
        console.log(id)

        querySelect('#receiver').value = id
        querySelect('#identify-div').className = 'd-block';
    }

    const createDiv = (username, image_path, status) => {
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
    /** @returns {string} - return a div that includes a card with an image and its details */
        // const createDiv = () => {
        //     return `
        //     <div>
        //        <div class="card  border border-5 rounded-3  mb-2" style="width: 18rem;">
        //         <img src=${this.image_src} class="card-img-top" alt="...">
        //          <div class="card-body">
        //             <p class="card-text">${this.id}</p>
        //             <p class="card-text">Earth date: ${this.date}</p>
        //             <p class="card-text">Sol: ${this.sol}</p>
        //             <p class="card-text">Camera: ${this.camera}</p>
        //             <p class="card-text">Mission: ${this.mission}</p>
        //             <button class="btn btn-info ml-2 mr-2">Save</button>
        //             <a href=${this.image_src} target="_blank">
        //                <button class="btn btn-primary ml-2 mr-2">Full size</button>
        //             </a>
        //           </div>
        //         </div>
        //     </div>`;
        // }
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
    const clearOutput = function () {
        querySelect('#imagesOutput1').innerHTML = '';
        querySelect('#imagesOutput2').innerHTML = '';
        querySelect('#imagesOutput3').innerHTML = '';
        querySelect('#warning').className = "row-fluid d-none";
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
        clearOutput: clearOutput
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
