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
                ARRAY_AGG(recipient.account_email) as list_of_recipient_emails
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.message_recipient mr
            ON m.msg_id = mr.msg_id 
            JOIN public.account recipient
            ON mr.account_id = recipient.account_id
            WHERE m.msg_id = $1
            GROUP BY c.conversation_id, m.msg_id, sender.account_firstname, sender.account_lastname, sender.account_email`,
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
                ARRAY_AGG(recipient.account_email) as list_of_recipient_emails
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.message_recipient mr
            ON m.msg_id = mr.msg_id 
            JOIN public.account recipient
            ON mr.account_id = recipient.account_id
            WHERE c.conversation_id = $1
            GROUP BY c.conversation_id, m.msg_id, sender.account_firstname, sender.account_lastname, sender.account_email`,
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
                ARRAY_AGG(recipient.account_email) as list_of_recipient_emails
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.message_recipient mr
            ON m.msg_id = mr.msg_id 
            JOIN public.account recipient
            ON mr.account_id = recipient.account_id
            WHERE mr.account_id = $1
            GROUP BY c.conversation_id, m.msg_id, sender.account_firstname, sender.account_lastname, sender.account_email`,
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
                ARRAY_AGG(recipient.account_email) as list_of_recipient_emails
            FROM public.conversation c 
            JOIN public.message m 
            ON c.conversation_id = m.conversation_id
            JOIN public.account sender
            ON m.sender_id = sender.account_id
            JOIN public.message_recipient mr
            ON m.msg_id = mr.msg_id 
            JOIN public.account recipient
            ON mr.account_id = recipient.account_id
            WHERE m.sender_id = $1
            GROUP BY c.conversation_id, m.msg_id, sender.account_firstname, sender.account_lastname, sender.account_email`,
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
async function addNewMessage(msg_content, sender_id, conversation_id) {
    try {
        const sql = `
        INSERT INTO public.message (msg_content, sender_id, conversation_id)
        VALUES ($1, $2, $3) RETURNING *
        `;
        const data = await pool.query(sql, [msg_content, sender_id, conversation_id]);
        return data.rows[0].msg_id;
    } catch (error) {
        console.error("addNewMessage error: " + error);
    }
}

/* ********************************
* add message recipients
********************************** */
async function addMessageRecipients(msg_id, ...account_ids) {
    try {
        const sql = `
        INSERT INTO public.message_recipient (msg_id, account_id)
        VALUES ($1, $2) RETURNING *
        `;
        let data = [];
        for (let account_id of account_ids) {
            const result = await pool.query(sql, [msg_id, account_id]);
            data.push(result.rows[0]);
        }
        console.log(data);
        return data;
    } catch (error) {
        console.error("addMessageRecipients error: " + error);
    }
}


/* ********************************
* set message to read
********************************** */
async function setMessageRead(msg_id, account_id, was_read = true) {
    try {
        const sql = `
        UPDATE public.message_recipient SET was_read = $1
        WHERE msg_id = $2 AND account_id = $3 RETURNING *;
        `;
        return await pool.query(sql, [was_read, msg_id, account_id]);
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

/* ********************************
* delete message for account
********************************** */
async function deleteMessageForAccount(msg_id, account_id) {
    try {
        const sql = `
        UPDATE public.message_recipient
        SET deleted_at = CURRENT_TIMESTAMP 
        WHERE msg_id = $1 AND account_id = $2
        `;
        return await pool.query(sql, [msg_id, account_id]);
    } catch (error) {
        console.error("deleteMessage error: " + error);
    }
}



module.exports = { getReceivedMessagesByAccountId, getSentMessagesByAccountId, addNewConversation, addNewMessage, addMessageRecipients, setMessageRead, deleteMessage, getMessageByID, getMessagesByConversation, deleteMessageForAccount }