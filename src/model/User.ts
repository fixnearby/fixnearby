import mongoose ,{Schema, Document} from 'mongoose';

export interface Message extends Document{
    content : string;
    createdAt : Date
}


const MessageSchema : Schema<Message>  = new Schema({
    content : {
        type : String,
        required : true
    },
    createdAt : {
        type : Date,
        required : true,
        default : Date.now
    }
})

export interface User extends Document{
    username : string;
    password : string;
    email : string;
    verifyCode : string;
    verifyCodeExpiry : Date;
    isVerified : boolean;
    isAcceptingMessages : boolean;
    messages : Message[]
}
;

const UserSchema : Schema<User> = new Schema({
    username : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : [true, 'Password is required']
    },
    email : {
        type : String,
        required : true,
        unique : true,
        match : [/.+\@.+\..+/, 'Invalid email format']
    },
    verifyCode : {
        type : String,
        required : [true, 'Verification code is required'],
    },
    verifyCodeExpiry : {
        type : Date,
        required : true
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    isAcceptingMessages : {
        type : Boolean,
        default : true
    },
    messages : [MessageSchema]
});




export const UserModel = (mongoose.models.User as mongoose.Model<User>) || (mongoose.model('User', UserSchema));