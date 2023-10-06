
const axios = require('axios')
require('dotenv').config()
const user = `${process.env.USER}`
const pass = `${process.env.PASS}`

const messageSender = async (phone, body)=>{
    try {
     
      let config = {
        method: 'post',
        url: `http://66.45.237.70/api.php?username=apar_asg&password=5CGQ3AET&number=${phone}&message=${body}`,
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded'
        },
      };
      axios.request(config)
.then((response) => {
  console.log(JSON.stringify(response.data));
})
.catch((error) => {
  console.log(error);
});
} catch (e) { console.log(e)}}

module.exports = messageSender;
