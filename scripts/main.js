var conversationId;
var participantId;
var firest;

var conversationId; // String | conversation ID
var participantId; // String | participant ID

let me, webSocket, conversationsTopic, notificationChannel;
let conversationList = {};
let CONVERSATION_LIST_TEMPLATE = null;

const platformClient = require('platformClient');

const client = platformClient.ApiClient.instance;
const conversationsApi = new platformClient.ConversationsApi();
const notificationsApi = new platformClient.NotificationsApi();
const usersApi = new platformClient.UsersApi();

var s1;
var s2;
var s3;
var s4;
var s5;
var s6;
var d1;
var d2;
var d3;
var d4;
var d5;
var d6;




// Determines if a conversation is disconnected by checking to see if all participants are disconnected
function isConversationDisconnected(conversation) {
	let isConnected = false;
	conversation.participants.some((participant) => {
		if (participant.state !== 'disconnected') {
			isConnected = true;
			return true;
		}
	});

	return !isConnected;
}

function senddigits(digitos)
{
	if (digitos != "")
	{

		    console.log("SendDigits Enviando: " +  digitos );

  let opts = {
     'body': {
       "digits": digitos
       } // Object | Digits
};

conversationsApi.postConversationParticipantDigits(conversationId, participantId, opts)
  .then(() => {
    console.log('postConversationParticipantDigits returned successfully.');
  })
  .catch((err) => {
    console.log('There was a failure calling postConversationParticipantDigits');
    console.error(err);
  });
}
}


function copyCallPropsToParticipant(conversation) {
	conversation.participants.forEach((participant) => {
		if (!participant.calls || participant.calls.length === 0) return;

		participant.ani = participant.calls[0].self.addressNormalized;
		participant.attributes = participant.additionalProperties;
		participant.confined = participant.calls[0].confined;
		participant.direction = participant.calls[0].direction;
		participant.dnis = participant.calls[0].other.addressNormalized;
		participant.held = participant.calls[0].held;
		participant.muted = participant.calls[0].muted;
		participant.provider = participant.calls[0].provider;
		participant.recording = participant.calls[0].recording;
		participant.recordingState = participant.calls[0].recordingState;
		participant.state = participant.calls[0].state;
    console.log (participant.state);

    if (participant.state == "connected")
    {
      if (first)
      {
          first = false;
          console.log (conversation.id);
          console.log (conversation.participants[0].id);

          conversationId = conversation.id;
          participantId = conversation.participants[0].id;

          waiter (s1);
          senddigits (d1);
          waiter (s2);
          senddigits (d2);
          waiter (s3);
          senddigits (d3);
          waiter (s4);
          senddigits (d4);
          waiter (s5);
          senddigits (d5);
          waiter (s6);
          senddigits (d6);

        }
    }


    if (participant.state != "connected")
    {
      first = true;
    }

		if (participant.userId)
			participant.user = { id: participant.userId, selfUri: `/api/v2/users/${participant.userId}` };
		if (participant.calls[0].peerId)
			participant.peer = participant.calls[0].peerId;
	});
}



function handleNotification(message) {
	// Parse notification string to a JSON object
	const notification = JSON.parse(message.data);

	// Discard unwanted notifications
	if (notification.topicName.toLowerCase() === 'channel.metadata') {
		// Heartbeat
		console.info('Ignoring metadata: ', notification);
		return;
	} else if (notification.topicName.toLowerCase() !== conversationsTopic.toLowerCase()) {
		// Unexpected topic
		console.warn('Unknown notification: ', notification);
		return;
	} else {
		console.debug('Conversation notification: ', notification);
	}

	// See function description for explanation
	copyCallPropsToParticipant(notification.eventBody);

	// Update conversation in list or remove it if disconnected
	if (isConversationDisconnected(notification.eventBody))
		delete conversationList[notification.eventBody.id];
	else
		conversationList[notification.eventBody.id] = notification.eventBody;

}


function waiter (ms)
{
	if (ms != "")
	{
	for (let i = ms; i >= 1; i--) {
    console.log("Timer: Quedan " +  i + "segundos");
    wait(1);
  }
	console.log("Timer Finalizado");
}
}




function wait(ms) {

  ms = ms * 1000;
   var start = Date.now(),
      now = start;


   while (now - start < ms) {
      now = Date.now();
			}
   }


function DialNumber(number) {
   let body = {
      "phoneNumber": number
   }; // Object | Call request
   conversationsApi.postConversationsCalls(body)
      .then((data) => {
         conversationId = data.id;
      });
}
// ENVIO DIGITOS.
function ProcessDTMF() {
   var number = document.getElementById("num").value;
   s1 = document.getElementById("s1").value;
   s2 = document.getElementById("s2").value;
   s3 = document.getElementById("s3").value;
   s4 = document.getElementById("s4").value;
   s5 = document.getElementById("s5").value;
   s6 = document.getElementById("s6").value;
   d1 = document.getElementById("d1").value;
   d2 = document.getElementById("d2").value;
   d3 = document.getElementById("d3").value;
   d4 = document.getElementById("d4").value;
   d5 = document.getElementById("d5").value;
   d6 = document.getElementById("d6").value;

   DialNumber(number);
}


function Colgar() {

	let conversationId = "conversationId"; // String | conversation ID
	conversationsApi.postConversationDisconnect(conversationId)
	  .then((data) => {
	    console.log(`postConversationDisconnect success! data: ${JSON.stringify(data, null, 2)}`);
	  })
	  .catch((err) => {
	    console.log('There was a failure calling postConversationDisconnect');
	  });
}


/// LOGIN TO GENESYS CLOUD
$(document).ready(function() {
  // Authenticate with Genesys Cloud
	client.loginImplicitGrant('60feb42b-6ef0-4761-ad7f-95ac491ee688', window.location.href)
		.then(() => {
			console.log('Logged in');

			// Get authenticated user's info
			return usersApi.getUsersMe();
		})
		.then((userMe) => {
			console.log('userMe: ', userMe);
			me = userMe;

			// Create notification channel
			return notificationsApi.postNotificationsChannels();
		})
		.then((channel) => {
			console.log('channel: ', channel);
			notificationChannel = channel;

			// Set up web socket
			webSocket = new WebSocket(notificationChannel.connectUri);
			webSocket.onmessage = handleNotification;

			// Subscribe to authenticated user's conversations
			conversationsTopic = 'v2.users.' + me.id + '.conversations';
			const body = [ { id: conversationsTopic } ];
			return notificationsApi.putNotificationsChannelSubscriptions(notificationChannel.id, body);

		})

		.then((topicSubscriptions) => {
			console.log('topicSubscriptions: ', topicSubscriptions);


			});

});
