// Client Class: Represents a client
class Client {
    constructor(clientname, number, datetime, spellings) {
        this.clientname = clientname;
        this.number = number;
        this.datetime = datetime;
/*
        if (datetime.includes("T")) {
            // Replace the "T" with "--Time-"
            let formattedStr = datetime.replace("T", "--Time-");
            return formattedStr;
          } else {
            // If the input string does not contain "T", return it as is
            return datetime;
          }
        };


*/



        this.spellings = spellings;

    }
}

// UI Class: Handles UI Tasks
class UI {
    static displayClients() {
      

        const clients = Store.getClients();

        clients.forEach((client) => UI.addClientToList(client));

    }

    static addClientToList(client) {
        const list = document.querySelector('#client-list');

        const row = document.createElement('tr');

        row.innerHTML = `
        <td>${client.clientname}</td>
        <td>${client.number}</td>
        <td>${client.datetime}</td>
        <td>${client.spellings}</td>
        <td><a href="#" class="btn btn-dark btn-sm delete">X</a></td>
        `;

        list.appendChild(row);
    }

    static deleteClient(el) {
        if(el.classList.contains('delete')) {
            el.parentElement.parentElement.remove();
        }
    }

    static showAlert(message, className) {
        const div = document.createElement('div');
        div.className = `alert alert-${className}`;
        div.appendChild(document.createTextNode(message));
        const container = document.querySelector('.container');
        const form = document.querySelector('#book-form');
        container.insertBefore(div, form);
        // Make the alert vanish
        setTimeout(() => document.querySelector('.alert').remove(), 5000);

    }

    static clearFields() {
        document.querySelector('#clientname').value = '';
        document.querySelector('#number').value = '';
        document.querySelector('#datetime').value = '';
        document.querySelector('#spellings').value = '';
    }
}

// Store Class: Storage Local
class Store {
    static getClients() {
        let clients;
        if(localStorage.getItem('clients') === null) {
            clients = [];
        } else {
            clients = JSON.parse(localStorage.getItem('clients'));
        }
        return clients;

    }

    static addClient(client) {
        const clients = Store.getClients();

        clients.push(client);

        localStorage.setItem('clients', JSON.stringify(clients));

    }

    static removeClient(number) {
        const clients = Store.getClients();

        clients.forEach((client, index) => {
            if(client.number === number) {
                clients.splice(index, 1);
            }
        });

        localStorage.setItem('clients', JSON.stringify(clients));

    }
}


// Event: Display Clients 
document.addEventListener('DOMContentLoaded', UI.displayClients);


// Event: Adding a Client
document.querySelector('#book-form').addEventListener('submit', (e) => {

    // Prevent Submit
    e.preventDefault();
// Get Form Values 
const clientname = document.querySelector('#clientname').value;
const number = document.querySelector('#number').value;
const datetime = document.querySelector('#datetime').value.replace("T", " > Time-");
const spellings = document.querySelector('#spellings').value;


// Validate 
if(clientname === '' || number === '') {
    UI.showAlert('Please enter the Name and Contact Number!', 'info');
} else {


    // Instantiate Client
    const client = new Client(clientname, number, datetime, spellings);
    
    // Add Client to UI
    UI.addClientToList(client);

    // Add Client to Store
    Store.addClient(client);


    // Show Thank you message
    UI.showAlert('New Contract Accepted! Thank you!', 'warning');
    
    // Clear the Form Fields
    UI.clearFields();
    
    
}
});


// Event: Remove a Client Both Storage and UI
document.querySelector('#client-list').addEventListener('click', (e) => {
    // Removed from UI
    UI.deleteClient(e.target);

    // Removed from Store
    Store.removeClient
    (e.target.parentElement.previousElementSibling.previousElementSibling.previousElementSibling.textContent);

    // Show Contract Ending Message
    UI.showAlert('Translations are accepted! Thank you!', 'primary');
});