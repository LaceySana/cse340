// Needed Resources
const utilities = require('../utilities');
const msgModel = require('../models/message-model');
const acctModel = require('../models/account-model');

const msgCont = {};


/* ****************************************
*  Deliver inbox view
* *************************************** */
msgCont.buildInbox = async function (req, res, next) {
    let nav = await utilities.getNav();

    const account_id = res.locals.accountData.account_id;
    const data = await msgModel.getReceivedMessagesByAccountId(account_id);
    console.log(data);
    const list = await utilities.buildReceivedMessageList(data);

    res.render("./messages/inbox", {
        title: "Inbox",
        nav,
        list,
        errors: null
    });
}

/* ****************************************
*  Deliver sent view
* *************************************** */
msgCont.buildSent = async function (req, res, next) {
    let nav = await utilities.getNav();
    const account_id = res.locals.accountData.account_id;
    const data = await msgModel.getSentMessagesByAccountId(account_id);
    console.log(data);
    const list = await utilities.buildSentMessageList(data);

    res.render("./messages/sent", {
        title: "Sent",
        nav,
        list,
        errors: null
    });
}

/* ****************************************
*  Deliver new message view
* *************************************** */
msgCont.buildNewMessage = async function (req, res, next) {
    let nav = await utilities.getNav();

    res.render("./messages/draft", {
        title: "New Message",
        nav,
        errors: null
    });
}

/* ****************************************
*  Send new message 
* *************************************** */
msgCont.sendNewMessage = async function (req, res, next) {
    let nav = await utilities.getNav();
    const sender_id = res.locals.accountData.account_id;
    const { subject, msg_content, account_email } = req.body;

    let msgRecipientResult;

    await acctModel.getAccountByEmail(account_email)
    .then(function (data) {
        return data.account_id;
    })
    .then(async function (account_id) {
        const conversation_id = await msgModel.addNewConversation(subject);
        const msg_id = await msgModel.addNewMessage(msg_content, sender_id, conversation_id);
        msgRecipientResult = msgModel.addMessageRecipients(msg_id, account_id);
    })
    .catch(error => {
        console.error("Error while sending message: " + error);
    });

    if (msgRecipientResult) {
        req.flash("notice-good", "Message sent.");
        return res.redirect("/messages/inbox");
    } else {
        req.flash("notice-bad", "Unable to send message.");
        res.status(501).render("./messages/draft", {
            title: "New Message",
            nav,
            errors: null,
            subject,
            msg_content,
            account_email,
        });
    }
}

/* ****************************************
*  Deliver reply view
* *************************************** */
msgCont.buildReply = async function (req, res, next) {
    let nav = await utilities.getNav();
    const conversation_id = parseInt(req.params.conversation_id);
    const data = await msgModel.getMessagesByConversation(conversation_id);
    const conversation = await utilities.buildConversationList(data);
    const recipient_emails = [data[0].sender_email, ...data[0].list_of_recipient_emails];
    console.log(recipient_emails);
    const index = recipient_emails.indexOf(res.locals.accountData.account_email);
    if (index > -1) {
        recipient_emails.splice(index, 1);
    }
    console.log(recipient_emails);
    const subject = data[0].subject;


    res.render("./messages/reply", {
        title: "Reply",
        nav,
        errors: null,
        conversation,
        recipient_emails: recipient_emails.join(", "),
        subject,
        conversation_id
    });
}

/* ****************************************
*  Send message reply
* *************************************** */
msgCont.sendReply = async function (req, res, next) {
    let nav = await utilities.getNav();
    const sender_id = res.locals.accountData.account_id;
    let { subject, recipient_emails, msg_content, conversation_id } = req.body;
    const data = await msgModel.getMessagesByConversation(conversation_id);
    console.log(data);
    const conversation = await utilities.buildConversationList(data);

    console.log(subject);
    console.log(recipient_emails);
    // console.log(conversation_id);
    recipient_emails = recipient_emails.split(", ");
    console.log(recipient_emails);



    let recipient_ids = [];
    let msgRecipientResult;

    try {
        for (let i=0; i < recipient_emails.length; i++) {
            console.log(recipient_emails);
            console.log(recipient_emails[i]);
            const data = await acctModel.getAccountByEmail(recipient_emails[i]);
            console.log(data);
            recipient_ids.push(data.account_id);   
            console.log(recipient_ids);
        };
        const msg_id = await msgModel.addNewMessage(msg_content, sender_id, conversation_id);
        msgRecipientResult = await msgModel.addMessageRecipients(msg_id, ...recipient_ids);
    } catch (error) {
        console.error("Error while sending message: " + error);
    };

    if (msgRecipientResult) {
        req.flash("notice-good", "Message sent.");
        return res.redirect("/messages/inbox");
    } else {
        req.flash("notice-bad", "Unable to send message.");
        res.status(501).render("./messages/reply", {
            title: "Reply",
            nav,
            errors: null,
            conversation,
            subject,
            msg_content,
            recipient_emails: recipient_emails.join(", "),
            conversation_id
        });
    }
}

msgCont.deleteMessageForAccount = async function (req, res, next) {
    let nav = await utilities.getNav();
    const msg_id = parseInt(req.params.msg_id);
    const account_id = res.locals.accountData.account_id;

    let deleteResults;
    try {
        deleteResults = await msgModel.deleteMessageForAccount(msg_id, account_id)
    } catch (error) {
        console.error("Error removing message: ", error)
    }

    if (!deleteResults){
        req.flash("notice-bad", "Could not delete message at this time.")
    } else {
        req.flash("notice-good", "Message deleted.")
    }
    res.render("./messages/inbox", {
        title: "Inbox",
        nav,
        errors: null
    });
}


msgCont.getMessageJSON = async (req, res, next) => {
    const msg_id = parseInt(req.params.msg_id);
    console.log(msg_id);
    const msgData = await msgModel.getMessageByID(msg_id);
    console.log(msgData);
    if (msgData) {
        return res.json(msgData);
    } else {
        next(new Error("No data returned"));
    }
}




module.exports = msgCont;