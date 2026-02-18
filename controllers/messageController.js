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

    const data = await acctModel.getAccountByEmail(account_email);
    const recipient_id = data.account_id;
    const conversation_id = await msgModel.addNewConversation(subject);
    const insertResult = await msgModel.addNewMessage(msg_content, sender_id, recipient_id, conversation_id);

    if (insertResult) {
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