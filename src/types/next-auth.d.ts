import 'next-auth';
import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
    interface User {
        _id?: string;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        username?: string;

    }
    interface Session {
        user :{ 
            id?: string;
            isVerified?: boolean;
            username?: string;
            isAcceptingMessages?: boolean;
        } & DefaultSession['user'];
    }
}

declare module 'next-auth/jwt' {
    interface JWT {
        id?: string;
        isVerified?: boolean;
        isAcceptingMessages?: boolean;
        email?: string;
        username?: string;
    }
    }
