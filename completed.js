//Imports
var builder = require('botbuilder'); //Microsoft BotFramework SDK for building chatbots
var restify = require('restify'); //Framework for RESTful services

//The ChatConnector enables communication between bot and user via various channels
//such as Web, Slack, Facebook, Skype, etc.
var connector = new builder.ChatConnector({
    appId: '',
    appPassword: ''
});

//Create a restify server and set it to listen to port 3978
var server = restify.createServer();
server.listen(3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});

//Create URI that listens for new messages via the connector
server.post('/api/messages', connector.listen());

//Create a new 'bot' variable that is type UniversalBot with MemoryBotStorage
//MemoryBotStorage saves the session state
var inMemoryStorage = new builder.MemoryBotStorage();
var bot = new builder.UniversalBot(connector).set('storage', inMemoryStorage);

bot.dialog('/', function(session) {
	session.send('I\’m not sure how to answer that.');
	session.endDialog();
 });

 bot.dialog('Greeting', function(session) {
	session.send('Hello, I can help you book a train ticket. Just say `book` to get started!');
    session.endDialog();
 }).triggerAction({
	matches: /^hello*$|^hi*$/i,
});

bot.dialog('Book', [
    function (session) {
        session.beginDialog('Depart');
    },
    function (session, results) {
        if(results.response){
            session.conversationData.depart = results.response;
        }
        session.beginDialog('Arrive');
    },
    function (session, results) {
        if(results.response){
            session.conversationData.arrive = results.response;
        } 
        session.beginDialog('DateDeparture');
    },
    function (session, results) {
        if(results.response){
            session.conversationData.date = results.response;
        } 
        session.beginDialog('TicketType');
    },
    function (session, results) {
        if(results.response){
            session.conversationData.type = results.response.entity;
        }
        session.beginDialog('TicketQuantity');
    },
    function(session, results){
        if(results.response){
            session.conversationData.quantity = results.response;
        }
        session.beginDialog('Confirm');
    },
    function(session, results){
        if(results.response){
            if(results.response === 'yes'){
                session.endConversation("Your ticket has been booked!");
            } else if(results.response === 'no') {
                session.endConversation("You can start again by typing `book`.")
            }
        }
    }
]).triggerAction({
    matches: /^book*$/i,
});


//----------------------------------------------------
//Waterfall steps
//----------------------------------------------------
 bot.dialog('Depart', [
    function (session) {
        builder.Prompts.text(session, "Where are you departing from?"); 
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('Arrive', [
    function (session) {
        builder.Prompts.text(session, "Where are you going to?"); 
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('DateDeparture', [
    function (session) {
        builder.Prompts.text(session, "What date would you like to depart?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('TicketType', [
    function (session) {
        builder.Prompts.choice(session, "What type of ticket do you need?", "Child|Adult");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('TicketQuantity', [
    function (session) {
        builder.Prompts.text(session, "How many tickets do you need?");
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);

bot.dialog('Confirm', [
    function (session) {
        var confirmation = 'Are these details correct?' +
                        '\r\rDepart From: ' + session.conversationData.depart + 
                        '\r\rArrive At: ' + session.conversationData.arrive + 
                        '\r\rDate: ' + session.conversationData.date + 
                        '\r\rType: ' + session.conversationData.type + 
                        '\r\rQuantity: ' + session.conversationData.quantity + 
                        '\r\rReply with `yes` or `no`.';
        builder.Prompts.text(session, confirmation);
    },
    function (session, results) {
        session.endDialogWithResult(results);
    }
]);
