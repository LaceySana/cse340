const pool = require('../database/');



/* ***************************
 *  Get message details by msg_id
 * ************************** */
async function getMessageByID(msg_id) {
    try {
        const data = await pool.query(
            `SELECT 
                c.*, 
                m.*, 
                sender.account_firstname as sender_firstname,
                sender.account_lastname as sender_lastname,
                sender.account_email as sender_email, 
                recipient.account_firstname as recipient_firstname,
                recipient.account_lastname as recipient_lastname,
                recipient.account_email as recipient_email  
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.account recipient
            ON m.recipient_id = recipient.account_id 
            WHERE msg_id = $1`,
            [msg_id]
        );
        return data.rows[0];
    } catch (error) {
        console.error("getMessageByID error: " + error);
    }
}

/* ***************************
 *  Get message details by conversation_id
 * ************************** */
async function getMessagesByConversation(conversation_id) {
    try {
        const data = await pool.query(
            `SELECT 
                c.*, 
                m.*, 
                sender.account_firstname as sender_firstname,
                sender.account_lastname as sender_lastname,
                sender.account_email as sender_email, 
                recipient.account_firstname as recipient_firstname,
                recipient.account_lastname as recipient_lastname,
                recipient.account_email as recipient_email  
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.account recipient
            ON m.recipient_id = recipient.account_id 
            WHERE conversation_id = $1`,
            [conversation_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getMessageByID error: " + error);
    }
}

/* ********************************
* get received messages by account id
********************************** */
async function getReceivedMessagesByAccountId(account_id) {
    try {
        const data = await pool.query(
            `SELECT 
                c.*, 
                m.*, 
                sender.account_firstname as sender_firstname,
                sender.account_lastname as sender_lastname,
                sender.account_email as sender_email, 
                recipient.account_firstname as recipient_firstname,
                recipient.account_lastname as recipient_lastname,
                recipient.account_email as recipient_email  
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.account recipient
            ON m.recipient_id = recipient.account_id
            WHERE recipient_id = $1`,
            [account_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getReceivedMessagesByAccountId error: " + error);
    }
}

/* ********************************
* get sent messages by account id
********************************** */
async function getSentMessagesByAccountId(account_id) {
    try {
        const data = await pool.query(
            `SELECT 
                c.*, 
                m.*,  
                sender.account_firstname as sender_firstname,
                sender.account_lastname as sender_lastname,
                sender.account_email as sender_email, 
                recipient.account_firstname as recipient_firstname,
                recipient.account_lastname as recipient_lastname,
                recipient.account_email as recipient_email  
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.account recipient
            ON m.recipient_id = recipient.account_id
            WHERE m.sender_id = $1`,
            [account_id]
        );
        return data.rows;
    } catch (error) {
        console.error("getSentMessagesByAccountId error: " + error);
    }
}

/* ********************************
* create new conversation
********************************** */
async function addNewConversation(subject) {
    try {
        const sql = `
        INSERT INTO public.conversation (subject)
        VALUES ($1) RETURNING *
        `;
        const result = await pool.query(sql, [subject]);
        return result.rows[0].conversation_id;
    } catch (error) {
        console.error("addNewConversation error: " + error);
    }
}

/* ********************************
* create new message
********************************** */
async function addNewMessage(msg_content, sender_id, recipient_id, conversation_id) {
    try {
        const sql = `
        INSERT INTO public.message (msg_content, sender_id, recipient_id, conversation_id)
        VALUES ($1, $2, $3, $4)
        `;
        return await pool.query(sql, [msg_content, sender_id, recipient_id, conversation_id]);
    } catch (error) {
        console.error("addNewMessage error: " + error);
    }
}


/* ********************************
* set message to read
********************************** */
async function setMessageOpened(msg_id, msg_is_opened) {
    try {
        const sql = `
        UPDATE public.message SET msg_is_opened = $1
        WHERE msg_id = $2 RETURNING *;
        `;
        return await pool.query(sql, [msg_is_opened, msg_id]);
    } catch (error) {
        console.error("setMessageOpened error: " + error);
    }
}

/* ********************************
* delete message
********************************** */
async function deleteMessage(msg_id) {
    try {
        const sql = `
        DELETE FROM public.message WHERE msg_id = $1
        `;
        return await pool.query(sql, [msg_id]);
    } catch (error) {
        console.error("deleteMessage error: " + error);
    }
}



module.exports = { getReceivedMessagesByAccountId, getSentMessagesByAccountId, addNewConversation, addNewMessage, setMessageOpened, deleteMessage, getMessageByID, getMessagesByConversation }