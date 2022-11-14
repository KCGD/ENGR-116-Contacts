import * as fs from "fs";
import * as os from 'os';
import * as path from "path";
import * as process from "process";
import { Contact } from './src/modules/contact.h';
import { ParseContact, contactToPrettyString } from "./src/modules/parseContact";
import { createInterface, Interface} from 'readline';
import { vcfToContacts, contactsToVcf } from './src/modules/parseVcf';

//create template for user argument parsing
//only flags that require aditional arguments will be assigned here
let knownFlags:string[] = ["--help", "-h", "export", "import", "add", "delete", "--db"];

//store process arguments
let args = {
    "command":"",
    "commandPath":"",
    "searchTerm":"",
    "db": path.join(os.homedir(), "./.contactsdir")
}

//create readline inteface
const rl:Interface = createInterface({
    'input':process.stdin,
    'output':process.stdout
})

//working variables
    //contacts stored in memory
    let mem_contacts:Contact[] = [];

//main function                mem_contacts.push()
Main();
function Main(): void {
    //parse process arguments
    for(let i:number = 0; i < process.argv.length; i++) {
        if(process.argv[i].startsWith("-") && !knownFlags.includes(process.argv[i])) {
            console.log(`[WARNING]: Unknown option "${process.argv[i]}"`);
        }
        switch(process.argv[i]) {
            case "--help":
            case "-h":
                console.log(fs.readFileSync(path.join(__dirname, "./src/HelpFile")).toString());
                process.exit(0);
            break;
        }
    }

    //verify command
    switch(process.argv[2]) {
        case "import":
            args.command = "import";
            args.commandPath = process.argv[3];
        break;
        case "export":
            args.command = "export";
            args.commandPath = process.argv[3];
        break;
        case "search":
            args.command = "search";
            args.searchTerm = process.argv[3];
        break;
        case "list":
            args.command = "list";
        break;
        case "add":
            args.command = "add";
        break;
        case "delete":
            args.command = "delete";
        break;
        default:
            console.log(`Unknown command "${process.argv[2]}"`);
            process.exit(1);
        break;
    }
    
    s_confirmDbPath();

    //sequential functions (allows for blocking)
    function s_confirmDbPath(): void {
        //make sure the contacts directory exists (if not, make it)
        if(!fs.existsSync(args.db)) {
            rl.question(`DB Path "${args.db}" does not exist. Create it now? [y/n]: `, function(a:string): void {
                if(a.toLocaleLowerCase() === "y") {
                    fs.mkdirSync(args.db);
                    s_loadContacts();
                } else {
                    console.log("Abort!");
                    process.exit(1);
                }
            })
        } else {
            s_loadContacts();
        }
    }

    //import known contacts
    function s_loadContacts(): void {
        let contactFileList:string[] = fs.readdirSync(args.db);
        
        for(let i = 0; i < contactFileList.length; i++) {
            let thisContact:Contact|undefined = ParseContact(
                JSON.parse(
                    fs.readFileSync(
                        path.join(args.db, 
                            contactFileList[i]
                        )
                    ).toString()
                )
            );

            if(thisContact !== undefined) {
                mem_contacts.push(thisContact);
            }
        }

        s_runCommand();
    }

    //apply the given command
    function s_runCommand(): void {
        switch (args.command) {
            case "import":
                let contactFile:string = fs.readFileSync(args.commandPath).toString();
                let generatedContacts:Contact[] = vcfToContacts(contactFile);

                for(let i = 0; i < generatedContacts.length; i++) {
                    let thisContact:Contact = generatedContacts[i];
                    fs.writeFileSync(path.join(args.db, thisContact.phoneNum), JSON.stringify(thisContact));
                }
    
                console.log(`Successfully imported ${generatedContacts.length} contacts.`);
                process.exit(0);
            break;
            case "export":
                fs.writeFileSync(args.commandPath, contactsToVcf(mem_contacts));
                console.log(`Successfully exported ${mem_contacts.length} contacts.`);
                process.exit(0);
            break;
            case "search":
                rl.question("Please enter a name, phone number or email to search for: ", function(query:string): void {
                    for(let i = 0; i < mem_contacts.length; i++) {
                        let thisContact = mem_contacts[i];
    
                        if(thisContact.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) || thisContact.phoneNum.includes(query) || ((thisContact.email)? thisContact.email : false)) {
                            console.log(contactToPrettyString(thisContact));
                        }
                    }
                    process.exit(0);
                })
            break;
            case "list":
                for(let i = 0; i < mem_contacts.length; i++) {
                    console.log(contactToPrettyString(mem_contacts[i]));
                }
                process.exit(0);
            break;
            case "add":
                rl.question("Please add a phone number: ", function(_phone:string): void {
                    rl.question("Please add a name: ", function(_name): void {
                        rl.question("Please add an email (leave blank if not applicable): ", function(_email): void {
    
                            let thisContact:Contact = {
                                'phoneNum':_phone,
                                'name':_name,
                                'email':(_email !== "")? _email : undefined
                            }
    
                            fs.writeFileSync(path.join(args.db, _phone), JSON.stringify(thisContact));
                            console.log("Contact added successfully!");
                            process.exit(0);
                        })
                    })
                })
            break;
            case "delete":
                rl.question("Please enter a name, phone number or email to delete: ", function(query:string): void {
                    let deletionCandidates:Contact[] = [];
                    console.log("Found the following contacts: ");
                    for(let i = 0; i < mem_contacts.length; i++) {
                        let thisContact = mem_contacts[i];
    
                        if(thisContact.name.toLocaleLowerCase().includes(query.toLocaleLowerCase()) || thisContact.phoneNum.includes(query) || ((thisContact.email)? thisContact.email : false)) {
                            console.log(`${i+1}: ` + contactToPrettyString(thisContact));
                            deletionCandidates.push(thisContact);
                        }
    
                        rl.question("Please enter a number to delete: ", function(selectionAsString:string): void {
                            let selection:number = parseInt(selectionAsString) - 1;
                            console.log(`Deleting "${deletionCandidates[selection].phoneNum}"...`);
                            fs.unlinkSync(path.join(args.db, deletionCandidates[selection].phoneNum));
                            console.log("Deletion successful.");
                            process.exit();
                        })
                    }
                })
            break;
        }
    }   
}