// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

const { ActivityHandler, MessageFactory } = require('botbuilder');

const { QnAMaker, CustomQuestionAnswering } = require('botbuilder-ai');
const DentistScheduler = require('./dentistscheduler');
const IntentRecognizer = require("./intentrecognizer")

class DentaBot extends ActivityHandler {
    constructor(configuration, qnaOptions) {
        // call the parent constructor
        super();
        if (!configuration) throw new Error('[QnaMakerBot]: Missing parameter. configuration is required');

        // create a QnAMaker connector
        try {
            this.qnAMaker = new CustomQuestionAnswering(configuration.QnAConfiguration);
        }  catch (err) {
            console.warn(`QnAMaker Exception: ${ err } Check your QnAMaker configuration in .env`);
        }
       
        // create a DentistScheduler connector

        this.dentistScheduler = new DentistScheduler(configuration.SchedulerConfiguration);
      
        // create a IntentRecognizer connector

        this.intentRecognizer = new IntentRecognizer(configuration.LuisConfiguration);


        this.onMessage(async (context, next) => {
            // send user input to QnA Maker and collect the response in a variable
            // don't forget to use the 'await' keyword
            const qnaResults = await this.qnAMaker.getAnswers(context);

            const luisResult =  await this.intentRecognizer.executeLuisQuery(context);

            console.log(luisResult.entities.time[0])
          
            if (luisResult.luisResult.prediction.topIntent == "GetAvailability" && 
                luisResult.intents &&
                luisResult.intents.GetAvailability &&
                luisResult.intents.GetAvailability.score &&
                luisResult.intents.GetAvailability.score > .7) {

                const availabilityResults = await this.dentistScheduler.getAvailability();
                await context.sendActivity(availabilityResults);
                await next();
                return;
            }

            if (luisResult.luisResult.prediction.topIntent == "ScheduleAppointment" && 
                luisResult.intents &&
                luisResult.intents.ScheduleAppointment &&
                luisResult.intents.ScheduleAppointment.score &&
                luisResult.intents.ScheduleAppointment.score > .7 && 
                luisResult.entities && 
                luisResult.entities.time ) {

                const availabilityResults = await this.dentistScheduler.scheduleAppointment(luisResult.entities.time[0]);
                await context.sendActivity(availabilityResults);
                await next();
                return;
            }
            console.log(luisResult)

            if (qnaResults[0]) {
                console.log(qnaResults[0])
                await context.sendActivity(`${qnaResults[0].answer}`);
            } else {
                await context.sendActivity(`I am not able to find a answer for you`)
            }

            await next();
        });

        this.onMembersAdded(async (context, next) => {
        const membersAdded = context.activity.membersAdded;
        //write a custom greeting
        const welcomeText = 'welcome to the dental office virtual assistance. This chatbot can be used to schedule an dental appointment';
        for (let cnt = 0; cnt < membersAdded.length; ++cnt) {
            if (membersAdded[cnt].id !== context.activity.recipient.id) {
                await context.sendActivity(MessageFactory.text(welcomeText, welcomeText));
            }
        }
        // by calling next() you ensure that the next BotHandler is run.
        await next();
    });
    }
}

module.exports.DentaBot = DentaBot;
