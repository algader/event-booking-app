const  Event = require('../models/events');
const Booking = require('../models/booking');
const { transformEvent, transformBooking } = require('./transform');
const { UserInputError } = require('apollo-server-express');
const { isLoggedIn } = require('../middlewares/isLogin');
const { combineResolvers } = require('graphql-resolvers');

const bookingResolver = {
    Query: {
       bookings: combineResolvers(isLoggedIn, async (_, __, context) => {
             
             try {
                 const bookings = await Booking.find({ user: context.user._id })
                     .populate('event')
                     .populate('user');
                 return bookings.map(booking => transformBooking(booking));
             } catch (err) {
                 throw err;
     
             }
         } ) 
    },
    Mutation: {
       bookEvent: combineResolvers(isLoggedIn,  async (_, args, context) => {
        
          const existingBooking = await Booking.findOne({
              event: args.eventId,
              user: context.user._id,
          });
          if (existingBooking) {
              throw new UserInputError('لقد قمت بحجز هذا الحدث بالفعل.');
          }
      
          const fetchedEvent = await Event.findOne({ _id: args.eventId });
          const booking = new Booking({
              user: context.user._id,
              event: fetchedEvent._id
          });
          try {
              await booking.save();
              return transformBooking(booking);
          } catch (err) {
              throw err;
          }
       } ),
      
          cancelBooking:  async (_, args, context) => {
          
          try {
              const booking = await Booking.findById(args.bookingId).populate('event');
              const event = transformEvent(booking.event);
              await Booking.deleteOne({ _id: args.bookingId });
              return event;
          } catch (err) {
              throw err;
          }
        }
      
    }
}
module.exports = { bookingResolver }
