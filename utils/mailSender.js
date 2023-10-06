const qs = require('qs')
const axios = require('axios')
require('dotenv').config()


const mailSender = async (email, name, title, body)=>{
    try {
      let data = qs.stringify({
        'to_name': `${name}`,
        'to_email': `${email}`,
        'from_name': 'Apars Authentication Department',
        'from_email': 'otp@aparsclassroom.com',
        'subject': `${title}`,
        'body': `${body}`,
        'reply_to_email': 'support@aparsclassroom.com',
        'reply_to_name': 'Apars Auth Support Team' 
      });

      let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://api.probaho.com.bd/transact/create',
        headers: { 
          'PUBLIC-KEY': `${process.env.EMAIL_KEY}`, // Keep this in env variable
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        data : data
      };
      axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
} catch (e) { console.log(e)}}

module.exports = mailSender;
