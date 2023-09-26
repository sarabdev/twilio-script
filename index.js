const express=require('express')
const twilio = require('twilio');
const cors=require('cors')
const { urlencoded } = require('body-parser');
const accountSid = process.env.ACCOUNT_SID;
const authToken = process.env.AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const app=express()

app.use(cors())
app.use(express.json())
app.use(urlencoded({ extended: false }));

app.post('/call',(req,res)=>{
    console.log("I am here")
    try{
    const {from,to}=req.body;
    client.calls
      .create({
            record: true,
         method: 'GET',
         statusCallback: '/callback',
         statusCallbackEvent: ['initiated', 'in-progress','ringing','answered','completed'],
         statusCallbackMethod: 'POST',
         twiml:`<Response>
         <Pause/>
         <Say>HI</Say>
     </Response>`,
  from, 
  to
       })
      .then(call => console.log(call.sid));
      
      res.json({message:"success"})
    }
    catch(e){
        res.json({message:"call failure"})
    }
})

app.post('/callback',(req,res)=>{
    console.log(req.body)
    if(req.body.CallStatus=='in-progress'){
           client.calls(req.body.CallSid).update({
            twiml:`<Response>
            <Gather input="speech" action="/gather" enhanced="true" actionOnEmptyResult="true" speechTimeout="1"  speechModel="phone_call">
            </Gather>
        </Response>`
           }).then((call)=>console.log(call))
    }
})



app.post('/gather',(req,res)=>{
    console.log("Hi")
    console.log(req.body)
    const twiml = new twilio.twiml.VoiceResponse();
    twiml.play('https://samodrei.s3.amazonaws.com/Prescribed+Bella+VO+Soaanz.mp3');
  
    res.type('text/xml');
    console.log("Hi2")
    res.send(twiml.toString());
})

app.listen(3000,()=>{
    console.log('server running')
})