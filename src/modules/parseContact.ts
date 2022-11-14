import { Contact } from "./contact.h";

export function ParseContact(input:any): Contact | undefined {
    try{
        let thisContact:Contact = {
            'phoneNum':input.phoneNum,
            'name':input.name,
            'email':input.email,
        }
        return thisContact;
    } catch(e:any) {
        throw (new Error(e.toString()));
    }
}  

export function contactToPrettyString(contact:Contact): string {
    return (`${contact.name}\n\tName: ${(contact.name)? contact.name : "Unknown"}\n\tPhone: ${(contact.phoneNum)? contact.phoneNum : "Unknown"}\n\tEmail: ${(contact.email)? contact.email : "Unknown"}`)
}