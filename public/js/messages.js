'use strict'

const msgList = document.querySelector("#msg-list");
const msgDetails = document.querySelector("#msg-details");
const msgOptions = document.querySelector("#msg-options");

msgList.addEventListener("click", (e) => {
    for(let i=0; i < msgList.children.length; i++) {
        const li = msgList.children[i];
        if (li === e.target.closest("li") && li.classList.contains("active")) {
            continue;
        } else {
            li.classList.remove("active");
        }
    };

    let msg = e.target.closest("li");
    msg.classList.toggle("active");

    if (msg.classList.contains("active")) {
        const msg_id = e.target.closest("li").lastElementChild.value;
        const msgIdUrl = `/messages/getMessage/${msg_id}`;
        fetch(msgIdUrl) 
        .then(function (response) { 
            if (response.ok) { 
                return response.json(); 
            } 
                throw Error("Network response was not OK"); 
        })
        .then(function (data) { 
            console.log(data); 
            displayMessageOptions(msg, data);
            displayMessageDetails(data); 
        })
        .catch(function (error) { 
            console.log('There was a problem: ', error.message);
        });
    } else {
        msgDetails.innerHTML = "";
        msgOptions.innerHTML = "";
    }
});

function displayMessageOptions(msg, data) {
    msgOptions.innerHTML = "";
    msgOptions.innerHTML += `
    <button id="reply-msg"><a href="./reply/${data.conversation_id}">Reply</a></button>
    <button id="close-msg">X</button>
    `;
    // <button id="delete-msg"><a href="./delete/${data.msg_id}">Delete</a></button>

    document.querySelector("#close-msg").addEventListener("click", (e) => {
        msg.classList.toggle("active");
        msgDetails.innerHTML = "";
        msgOptions.innerHTML = "";
    });
}

function displayMessageDetails(data) {
    const dtFormat = new Intl.DateTimeFormat("en-US", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",});
    msgDetails.innerHTML = "";
    msgDetails.innerHTML += `
    <p>${dtFormat.format(new Date(data.msg_timestamp))}</p>
    <h2>${data.subject}</h2>
    <h3>${data.sender_firstname} ${data.sender_lastname}</h3>
    <h4>To: ${data.list_of_recipient_emails.map(email => email).join(", ")}</h4>
    <div>${data.msg_content}</div>
    `;

}