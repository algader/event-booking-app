const User = require('../models/user');
const { UserInputError, AuthenticationError } = require('apollo-server-express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Event = require('../models/events');
const Booking = require('../models/booking'); 


const resolvers = {
    Query: {
    events: async () => {
        try {
            const events = await Event.find({}).populate('creator');
            return events.map(event => 
                ({ ...event.toObject(), date: event.date.toDateString() })
            );
        } catch (err) {
            throw err;
        }
        },

          getUserEvents: async (_, { userId }) => {
        try {
            const events = await Event.find({ creator: userId });
            return events.map(event => 
                ({ ...event.toObject(), date: event.date.toDateString() })
            );
        } catch (err) {
            throw err;
        }
         
    },
    bookings: async (_, __, context) => {
        if(!context.user){
            throw new AuthenticationError('يجب تسجيل الدخول  .');
        } 
        try {
            const bookings = await Booking.find({ user: context.user._id })
                .populate('event')
                .populate('user');
            return bookings.map(booking => ({
                ...booking._doc,
                createdAt: booking.createdAt.toDateString(),
                updatedAt: booking.updatedAt.toDateString()
            }));
        } catch (err) {
            throw err;

        }
    }
}, 
    
    Mutation: {
        createUser: async (_, args) => {
            try{
                const existingUser = await User.findOne({ email: args.userInput.email });
            if (existingUser) {
                throw new UserInputError(' هذا البريد الإلكتروني مستخدم بالفعل. يرجى اختيار بريد إلكتروني آخر.', {
                    invalidArgs: args.userInput.email
                });
            }
            const hashedPassword = await bcrypt.hash(args.userInput.password, 12);
            const user = new User({ 
                username: args.userInput.username,
                email: args.userInput.email,
                password: hashedPassword
            });
             const result = await user.save();
             const userForToken = {
                email: result.email,
                id: result.id
             };
             return {
                userId: result.id,
                token: jwt.sign(userForToken, process.env.JWT_SECRET),
                username: result.username,
             };
        } catch (err) {
            throw err;
        } 
    },
    login: async (_, { email, password }) => { 
        const user = await User.findOne({ email });
        if (!user) {
            throw new UserInputError('البريد الإلكتروني غير موجود. يرجى تسجيل حساب جديد.');
        } 
        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            throw new UserInputError(' خطأ في البريد الالكتروني او كلمة المرور  ');
        }  
           const userForToken = {
            email: user.email,
            id: user.id  
        }   
        return{
            userId: user.id,
            token: jwt.sign(userForToken, process.env.JWT_SECRET),
            username: user.username,
         }           
    },
    createEvent: async (_, args, context) => { 
        if (!context.user) { 
            throw new AuthenticationError('يجب تسجيل الدخول  .');

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
            return event.toObject({ virtuals: true });
        }catch (err) {
            throw err;
     }
   },
   deleteEvent: async (_, args) => {
    try{
        if (!args.eventId || args.eventId.trim() === '') {
            throw new UserInputError('Event ID is required and cannot be empty.');
        }
        await Event.findByIdAndDelete(args.eventId);
        const events = await Event.find({}).populate('creator');
        return events.map(event => event.toObject());
    } catch (err) {
        throw err;

   }
 },
  bookEvent: async (_, args, context) => {
    if (!context.user) { 
        throw new AuthenticationError('يجب تسجيل الدخول  .');
    } 
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
        return {
            ...booking._doc,
            createdAt: booking.createdAt.toDateString(),
            updatedAt: booking.updatedAt.toDateString()

        }
    } catch (err) {
        throw err;
    }
 },
    cancelBooking: async (_, args, context) => {
    if (!context.user) {
        throw new AuthenticationError('يجب تسجيل الدخول  .');
    }
    try {
        const booking = await Booking.findById(args.bookingId).populate('event');
        const event = { ...booking.event._doc, date: booking.event.date.toDateString() }
        await Booking.deleteOne({ _id: args.bookingId });
        return event;
    } catch (err) {
        throw err;
    }
  }

 }
}
module.exports = { resolvers };