"use strict";

var obj_res = require('./response');
var nodemailer = require('nodemailer');

var system_footer = `
    <br/>
    <br/>
    Best Regards,
    <br/>
    <b>QBOS Team</b>
`;

exports.sendEmail = function(sendee_address, subject, content) {
    // temporarily using dummy email account
    let transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || '<smtp-host>',
        port: process.env.SMTP_PORT || '<smtp-port>',
        auth: {
            user: process.env.SMTP_USERNAME || '<smtp-username>',
            pass: process.env.SMTP_PASSWORD || '<smtp-password>'
        }
    });

    let mailOptions = {
        from: process.env.SMTP_USERNAME || '<smtp-username>',
        to: sendee_address,
        subject: subject,
        html: content + system_footer
    };

    return new Promise((resolve, reject)=>{
        transporter.sendMail(mailOptions, (error, info) => {
            if(error) {
                reject(obj_res.Error(error, 'Failed to send email.', 500));
            } else {
                resolve(obj_res.Success(null, 'Email successfully send', 200));
            }
        });        
    });
};