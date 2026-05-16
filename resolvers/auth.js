const User = require('../models/user');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { UserInputError } = require('apollo-server-express'); 

const authResolver = {
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
//     createEvent: combineResolvers(isLoggedIn, async (_, args, context) => { 
//          const existingEvent = await Event.findOne({ title: args.eventInput.title });
//                   if (existingEvent) {
//                       throw new UserInputError('حدث بهذا العنوان موجود بالفعل. يرجى اختيار عنوان آخر.', {
//                       });
//                    } 
//         const event = new Event({
//             title: args.eventInput.title,
//             description: args.eventInput.description,
//             price: args.eventInput.price,
//             date: new Date(args.eventInput.date),
//             creator: context.user._id
//         });
//         try{
//             await event.save();
//             await event.populate('creator');
//             return transformEvent(event);
//         }catch (err) {
//             throw err;
//      }
//    }),
}
}
module.exports = { authResolver }