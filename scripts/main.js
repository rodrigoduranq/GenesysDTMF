var conversationId;
var participantId;

const platformClient = require('platformClient');

function wait(ms) {
    var start = Date.now(),
        now = start;
    while (now - start < ms) {
      now = Date.now();
    }
}


function sendDigits (digitos){

  let apiInstance = new platformClient.ConversationsApi();

  let opts = {
    'body': {"digits": digitos} // Object | Digits
  };

  console.log ('En Send Digits participant id:' + participantId);
  console.log ('En Send Digits conversationId id:' + conversationId);

  apiInstance.postConversationParticipantDigits(conversationId, participantId, opts)
    .then(() => {
      console.log('postConversationParticipantDigits returned successfully.');
    })
    .catch((err) => {
      console.log('There was a failure calling postConversationParticipantDigits');
      console.error(err);
    });

}



function getAnalyticsConversationDetails(conversationId){
  let apiInstance = new platformClient.ConversationsApi();


apiInstance.getAnalyticsConversationDetails(conversationId)
  .then((data) => {
    console.log(`getAnalyticsConversationDetails success! data: ${JSON.stringify(data, null, 2)}`);

    participantId = data.participants[0].participantId


  })
  .catch((err) => {
    console.log('There was a failure calling getAnalyticsConversationDetails');
    console.error(err);
  });
}





function DialNumber(number){
  let apiInstance = new platformClient.ConversationsApi();

  let body = {
     "phoneNumber": number
  }; // Object | Call request

  apiInstance.postConversationsCalls(body)
    .then((data) => {
      console.log(`postConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
      console.log('ESPERANDO 10 SEGUNDOS ANTES DE GETCONVERSATIONDETAILS');

      wait (10000);
      conversationId = data.id;

      getAnalyticsConversationDetails (conversationId);
      console.log('ESPERANDO 15 SEGUNDOS ANTES DE  SEND DIGIT');
      console.log('Conversation ID es' + conversationId);
      wait (15000);

      sendDigits ("1234567890");

    })
    .catch((err) => {
      console.log('There was a failure calling postConversationsCalls');
      console.error(err);
    });
}



// ENVIO DIGITOS.
function ProcessDTMF(){
    var number = document.getElementById("num").value;
    var s1 = document.getElementById("s1").value;
    var s2 = document.getElementById("s2").value;
    var s3 = document.getElementById("s3").value;
    var s4 = document.getElementById("s4").value;
    var s5 = document.getElementById("s5").value;
    var s6 = document.getElementById("s6").value;

    var d1 = document.getElementById("d1").value;
    var d2 = document.getElementById("d2").value;
    var d3 = document.getElementById("d3").value;
    var d4 = document.getElementById("d4").value;
    var d5 = document.getElementById("d5").value;
    var d6 = document.getElementById("d6").value;

    DialNumber (number);
}


/// LOGIN TO GENESYS CLOUD
$(document).ready(function() {
    const client = platformClient.ApiClient.instance;
    client.loginImplicitGrant('60feb42b-6ef0-4761-ad7f-95ac491ee688', window.location.href)
        .then((data) => {
            console.log(data);
            //use that session to interface with the API
            var users = new platformClient.UsersApi();
            users.getUsersMe().then(function(userObject) {
                console.log("got me");
                console.log(userObject);
            });
            // Do authenticated things
        })
        .catch((err) => {
            // Handle failure responseS
            console.log(err);
        });
});
