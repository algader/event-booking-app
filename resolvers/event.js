const  Event = require('../models/events');
const { transformEvent } = require('./transform');
const { UserInputError } = require('apollo-server-express');
const { isLoggedIn } = require('../middlewares/isLogin');
const { combineResolvers } = require('graphql-resolvers');

const eventResolver = {
        Query: {
        events: async () => {
            try {
                const events = await Event.find({}).populate('creator');
                return events.map(event => 
                    transformEvent(event)
                );
            } catch (err) {
                throw err;
            }
            },
    
              getUserEvents: async (_, { userId }) => {
            try {
                const events = await Event.find({ creator: userId });
                return events.map(event => 
                    transformEvent(event)
                );
            } catch (err) {
                throw err;
            }
             
       
        }, 
     
       }, 
        
        Mutation: {

          createEvent: combineResolvers(isLoggedIn, async (_, args, context) => {
            const existingEvent = await Event.findOne({ title: args.eventInput.title });
            if (existingEvent) {
                throw new UserInputError('حدث بهذا العنوان موجود بالفعل. يرجى اختيار عنوان آخر.', {
                });
             } 
        const event = new Event({
            title: args.eventInput.title,
            description: args.eventInput.description,
            price: args.eventInput.price,
            date: new Date(args.eventInput.date),
            creator: context.user._id
        });
        try{
            await event.save();
            await event.populate('creator');
            return transformEvent(event);
        }catch (err) {
            throw err;
     }
          }),
    
         deleteEvent: async (_, args) => {
        try{
            if (!args.eventId || args.eventId.trim() === '') {
                throw new UserInputError('Event ID is required and cannot be empty.');
            }
            await Event.findByIdAndDelete(args.eventId);
            const events = await Event.find({}).populate('creator');
            return events.map(event => transformEvent(event));
        } catch (err) {
            throw err;
    
       }
           },
    
    
     }
}

module.exports = { eventResolver }

