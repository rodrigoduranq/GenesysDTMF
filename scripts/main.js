var conversationId;
var participantId;
let me, webSocket, conversationsTopic, notificationChannel;

const platformClient = require('platformClient');

const client = platformClient.ApiClient.instance;
const conversationsApi = new platformClient.ConversationsApi();
const notificationsApi = new platformClient.NotificationsApi();
const usersApi = new platformClient.UsersApi();

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

	// Update UI
	$('#call-table').html(CONVERSATION_LIST_TEMPLATE(Object.values(conversationList)));
}


function wait(ms) {
   var start = Date.now(),
      now = start;
   while (now - start < ms) {
      now = Date.now();
   }
}

function DialNumber(number) {
   let apiInstance = new platformClient.ConversationsApi();
   let body = {
      "phoneNumber": number
   }; // Object | Call request
   apiInstance.postConversationsCalls(body)
      .then((data) => {
         conversationId = data.id;
         apiInstance.getAnalyticsConversationDetails(conversationId)
            .then((data) => {
               console.log(`getAnalyticsConversationDetails success! data: ${JSON.stringify(data, null, 2)}`);
               participantId = data.participants[0].participantId;
               console.log('En DialNumber Conversation ID es' + conversationId);
               console.log('En Dial Number Participant id:' + participantId);
               /////////////////////////////////////////       sendDigits ("1234567890");
               let opts = {
                  'body': {
                     "digits": "123456789"
                  } // Object | Digits
               };
               apiInstance.postConversationParticipantDigits(conversationId, participantId, opts)
                  .then(() => {
                     console.log('postConversationParticipantDigits returned successfully.');
                  })
                  .catch((err) => {
                     console.log('There was a failure calling postConversationParticipantDigits');
                     console.error(err);
                  });
            })
            .catch((err) => {
               console.log('There was a failure calling getAnalyticsConversationDetails');
               console.error(err);
            });
      })
      .catch((err) => {
         console.log('There was a failure calling postConversationsCalls');
         console.error(err);
      });
}
// ENVIO DIGITOS.
function ProcessDTMF() {
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
   DialNumber(number);
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

			CONVERSATION_LIST_TEMPLATE = Handlebars.compile($('#entry-template').html());

			// Handle dial button click
			$('button#dial').click(() => {
				// Create request body
				let body = {
					'phoneNumber':$('input#dialstring').val()
				};

				// Invoke API
				conversationsApi.postConversationsCalls(body).then(() => {
					// Clear dialstring from text box
					$('input#dialstring').val('');
				}).catch((err) => console.error(err));
			});

		})
		.catch((err) => console.error(err));
});
