"use strict";

var uploaded_image = ""

document.addEventListener('DOMContentLoaded', function () {
    myModule.querySelect("#scanbtn").addEventListener("click", myModule.scan);
    myModule.querySelect("#adduser").addEventListener("click", myModule.adduser);
    myModule.querySelect("#cancel").addEventListener("click", myModule.cancel);
    myModule.querySelect("#register").addEventListener("click", myModule.register);

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
    //--------------------------------------
    /** add listeners to the save buttons of the DOM inserted photos (every card has a such button) */
    const addListeners = function () {
        // let buttons = document.getElementsByClassName("btn btn-info ml-2 mr-2");
        // for (let btn of buttons)
        //     btn.addEventListener('click', saveImageToList);
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


    var xhr = null;
    const getXmlHttpRequestObject = function () {
        if (!xhr) {
            // Create a new XMLHttpRequest object
            xhr = new XMLHttpRequest();
        }
        return xhr;
    };

    function dataCallback() {
        if (xhr.readyState == 4 && xhr.status == 200) {
            console.log("User data received!");
            let dataDiv = document.getElementById('result-container');
            dataDiv.innerHTML = xhr.responseText;
            console.log(xhr.responseText)
        }
    }

    function getUsers() {
        console.log("Get users...");
        xhr = getXmlHttpRequestObject();
        xhr.onreadystatechange = dataCallback;
        xhr.open("GET", "http://127.0.0.1:5000/users", true);
        xhr.send(null);
    }


    return {
        scan: scan,
        adduser: adduser,
        cancel: cancel,
        getUsers: getUsers,
        register: register,
        querySelect: querySelect,
        setAttr: setAttr,
        resetErrors: resetErrors,
        clearOutput: clearOutput
    }
})();


/**
 * Classes Module
 * @type {{Image: Image, ImagesList: ImagesList}}
 */
const classesModule = (() => {
    const Image = class Image { // single image class
        /** create new object according to mars photo got at the fetch
         * @param image_src - the image source
         * @param date - the date of the image
         * @param id - the image's ID
         * @param mission - the rover
         * @param camera - the camera
         * @param earth_date - the image's earth date
         * @param sol - the image's sol */
        constructor(image_src, date, id, mission, camera, earth_date, sol) {
            this.image_src = image_src;
            this.date = date;
            this.id = id;
            this.mission = mission;
            this.camera = camera;
            this.earth_date = earth_date;
            this.sol = sol;
        }

        /** @returns {string} - return a div that includes a card with an image and its details */
        createDiv() {
            return `
            <div>
               <div class="card  border border-5 rounded-3  mb-2" style="width: 18rem;">
                <img src=${this.image_src} class="card-img-top" alt="...">
                 <div class="card-body">
                    <p class="card-text">${this.id}</p>
                    <p class="card-text">Earth date: ${this.date}</p>
                    <p class="card-text">Sol: ${this.sol}</p>
                    <p class="card-text">Camera: ${this.camera}</p>
                    <p class="card-text">Mission: ${this.mission}</p>
                    <button class="btn btn-info ml-2 mr-2">Save</button>
                    <a href=${this.image_src} target="_blank">
                       <button class="btn btn-primary ml-2 mr-2">Full size</button>
                    </a>
                  </div>
                </div>
            </div>`;
        }

        //----------------------------------
        /** append a card to the dom
         * @param where - which div output to append the card
         * @param element - the element at the list */
        appendCardToHtml = (where, element) => {
            where.insertAdjacentHTML('beforeend', element.createDiv());
        }
    }
    //-------------------
    //---------------------
    const ImagesList = class { // list of images class
        constructor() {
            this.list = [];
        }

        //----------
        add(img) {
            this.list.push(img);
        }

        //------------
        indexOf(i) {
            return this.list.indexOf(i);
        }

        //----------------
        /** implementation of the known js loop "forEach" (doing that because the data structure is protected
         * to the "outside world" and generic)
         * @param callback - return the element of the data structure */
        foreach = function (callback) {
            if (callback && typeof callback === 'function') {
                for (let i = 0; i < this.list.length; i++) {
                    callback(this.list[i], i, this.list);
                }
            }
        };

        //------------
        empty() {
            this.list = []
        }

        //----------------------------------
        /** displays the photos at the DOM */
        generateHTML() {
            myModule.querySelect('#loading').style.display = "none";
            let col1 = myModule.querySelect("#imagesOutput1");
            let col2 = myModule.querySelect("#imagesOutput2");
            let col3 = myModule.querySelect("#imagesOutput3");
            myModule.clearOutput();// clear output divs

            this.list.forEach(img => {
                if (this.list.indexOf(img) % 3 === 0)
                    img.appendCardToHtml(col1, img);
                else if (this.list.indexOf(img) % 3 === 1)
                    img.appendCardToHtml(col2, img);
                else if (this.list.indexOf(img) % 3 === 2)
                    img.appendCardToHtml(col3, img);
            });
            if (!this.list.length) // if there are no images ==> notify the user
                myModule.querySelect('#warning').className = "row-fluid d-block";
        }
    }
    return {
        Image: Image,
        ImagesList: ImagesList
    }
})();


// bs[bs.length - 1].addEventListener('click', saveImageToList);

// return `https://api.nasa.gov/mars-photos/api/v1/rovers/${mission}/photos?earth_date=${dateInp}&camera=${cam}&api_key=${APIKEY}`

//---------------------------
/*    const isCameraExistToMission = function (cam) {
        let mission = myModule.querySelect('#mission').value;

        if ((isCuriosity(mission) && (cam === "PANCAM" || cam === "MINITES"))
            || ((isOpportunity(mission) || isSpirit(mission)) && (cam === "MAST" || cam === "CHEMCAM" || cam === "MAHLI" || cam === "MARDI")))
            return {
                isValid: false,
                message: `${mission} has no ${cam} camera`
            }
        return {isValid: true, message: ''}
    }*/

/*if (v3 && !validateInput(cam, isCameraExistToMission))
    v = false;*/


        // image = image.value

        // image = `url(${uploaded_image})`
        // image = uploaded_image

        // console.log("Sending data: " + username + " + " + image);
        // xhr = getXmlHttpRequestObject();
        // xhr.onreadystatechange = sendDataCallback;
        // xhr.open("POST", "http://127.0.0.1:5000/form", true);
        // xhr.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
        // xhr.send(JSON.stringify({
        //     "username": username,
        //     "image": image
        // }));
