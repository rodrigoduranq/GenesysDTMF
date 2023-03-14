const platformClient = require('platformClient');

const rod = "a"
// ENVIO DIGITOS.
function ProcessDTMF(){

  let apiInstance = new platformClient.ConversationsApi();

  let body = {
     "phoneNumber": "5555037757"
  }; // Object | Call request

  apiInstance.postConversationsCalls(body)
    .then((data) => {
      console.log(`postConversationsCalls success! data: ${JSON.stringify(data, null, 2)}`);
    })
    .catch((err) => {
      console.log('There was a failure calling postConversationsCalls');
      console.error(err);
    });
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
