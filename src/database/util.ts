import {randomBytes} from 'crypto';

export const generateId = () =>{    
    return randomBytes(48).toString('base64');
}