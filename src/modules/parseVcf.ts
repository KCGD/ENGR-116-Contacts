import { Contact } from './contact.h';

//this parser is pretty basic
//i could expand it to the full vcf standard if nessicary
export function vcfToContacts(input:string): Contact[] {
    let contacts:Contact[] = [];
    let split = input.split("BEGIN:VCARD");
    for(let entree = 0; entree < split.length; entree++) {
        let lines = split[entree].split("\n");
        let thisContact:Contact = {
            'phoneNum':"",
            'email':"",
            'name':""
        };

        for(let line = 0; line < lines.length; line++) {
            let type:string = lines[line].split(":")[0];
            let value:string = lines[line].split(":")[1];

            switch (type) {
                case "FN":
                    thisContact.name = value;
                break;
                case "TEL;TYPE=CELL":
                case "TEL;TYPE=HOME":
                    thisContact.phoneNum = value;
                break;
                case "EMAIL;TYPE=HOME":
                case "EMAIL;TYPE=WORK":
                case "EMAIL;TYPE=OTHER":
                    thisContact.email = value;
                break;
            }
        }

        if(thisContact.phoneNum && thisContact.name) {
            contacts.push(thisContact);
        }
    }

    return contacts;
}

export function contactsToVcf(contacts:Contact[]): string {
    let stringsum:string = "";

    for (let i = 0; i < contacts.length; i++) {
        let thisContact:Contact = contacts[i];
        stringsum += `BEGIN:VCARD\nTEL;TYPE=CELL:${thisContact.phoneNum}\nFN:${thisContact.name}\nN:;${thisContact.name};;;${(thisContact.email)? "\nEMAIL;TYPE=OTHER:" + thisContact.email : ""}\nEND:VCARD\n`
    }

    return stringsum;
}