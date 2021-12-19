const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendConfirmEmail = async (user) => {
    const msg = {
        to: user.email, // Change to your recipient
        from: 'jana.teaching07@gmail.com', // Change to your verified sender
        subject: 'Confirm your email.',
        html: `
            <p style="color: lightgreen;">Please verify your email by clicking the below link</p>
            <a href="${process.env.DOMAIN}/confirm_account?userid=${user._id}">Confirm</a>
        `,
    }
    
    try{
        await sgMail.send(msg);
        return "Email send successfully!";
    }catch(e){
        return {error: "Unable to send email. Please try again!"}
    }
}   


module.exports = {
    sendConfirmEmail: sendConfirmEmail
};