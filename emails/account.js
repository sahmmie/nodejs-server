const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'konnect@gmail.com',
        subject: 'Thanks for signing up',
        text: `Welcome to Gbagbos,${name}. Enjoy your time`
    }).catch((err) => {
        console.log(err)
    })
}

const sendCancelationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'riki@gmail.com',
        subject: 'Sorry to leave',
        text: `goodbye to Gbagbos,${name}. Enjoy your time`
    })
}

module.exports = {
    sendWelcomeEmail
}