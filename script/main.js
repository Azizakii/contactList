const nameInput = document.querySelector('.js-form-name')
const vacancyInput = document.querySelector('.js-form-vacancy')
const numberInput = document.querySelector('.js-form-number')

const buttonAdd = document.querySelector('.js-button-add')
const buttonClear = document.querySelector('.js-button-clear')
const buttonSearch = document.querySelector('.js-button-search')

const errorMessage = document.querySelector('.js-errorMessage')
const contactList = document.querySelector('.contact-list')


let contacts = loadContactsFromStorage();
//let contacts = {};///{a: [{name: 'aa', vacancy: '..', number: ''}, {name:..., vacancy: ..., number: ...}], c: [name: ..., vacancy: ..., number: ...]}


document.addEventListener('DOMContentLoaded', function() {
    renderContact();

    buttonAdd.addEventListener('click',() => {
        const name = nameInput.value.trim();
        const vacancy = vacancyInput.value.trim();
        const number = numberInput.value.trim();

        if (!checkInput(nameInput, 'Name') || 
        !checkInput(vacancyInput, 'Vacancy') || 
        !checkInput(numberInput, 'Number')) {
        return;}

        const firstLetter = name[0].toLowerCase();

        const contact = {
            name: name,
            vacancy: vacancy,
            number: number
        }
        
        if(isContactExist(firstLetter, contact)) {
            showError(nameInput, 'The contact with this name already exists')
            return;
        }

        addContact(firstLetter, contact);

        saveContactsToStorage();

        renderContact();

        clearForm();
    })
})

//exist contact
function isContactExist(firstLetter, contact) {
    if(!contacts[firstLetter]) return false;

    return contacts[firstLetter].some(oldContact => {
        return oldContact.name.toLowerCase() === contact.name.toLowerCase() && oldContact.number === contact.number
    })
}

//добавляет контакт в объект
function addContact(firstLetter, contact) {

    if(!contacts[firstLetter]) {
        contacts[firstLetter] = [];
    }

    contacts[firstLetter].push(contact);
    console.log(contacts)

    return contacts;

}

//рендер контактов
function renderContact() {
    const letterElements = document.querySelectorAll('.js-element-letter');
    const letterCount = {};

    for(let letter in contacts) {
        if(contacts.hasOwnProperty(letter)) {
            letterCount[letter] = contacts[letter].length;
        }
    }
    console.log(letterCount)
    
    letterElements.forEach(letterElem => {
        const letter = letterElem.dataset.letter;
        const contactsCount = letterCount[letter] || 0;

        // Очищаем элемент один раз
        letterElem.innerHTML = letter.toUpperCase();

        if(contactsCount > 0) {
            const counter = document.createElement('span');
            counter.className = 'contact-list__counter';
            counter.innerText = contactsCount;
            letterElem.append(counter);
        }
    });
}

//проверяет инпуты 
function checkInput(textInput, fieldName = '') {
    let input = textInput.value.trim();

    if (fieldName !== 'Number') {
        input = input.toLowerCase();
    }

    let errorText = "";
    let incorrectValue = false;

    if(input === '') {
        incorrectValue = true;
        errorText = `${fieldName} cannot be empty`;
    } else if (fieldName === 'Number') {
        if(!/^[0-9]+$/.test(input)) {
            incorrectValue = true;
            errorText = `${fieldName} must contain only digits`;
        } else if(input.length > 15) {
            incorrectValue = true;
            errorText = `${fieldName} cannot exceed 15 digits`;
        } else if(input.length < 5) {
            incorrectValue = true;
            errorText = `${fieldName} must be at least 5 digits`;
        } 
    } else {
        if(input.length > 20) {
            incorrectValue = true;
            errorText = `${fieldName} cannot exceed 20 characters`;
        } else if(input.length < 3) {
            incorrectValue = true;
            errorText = `${fieldName} must be at least 3 characters`;
        } else if(!/^[a-zA-Z]+$/.test(input)) {
            incorrectValue = true;
            errorText = `${fieldName} must contain only English letters`;
        }
    }
    
    if(incorrectValue) {
        showError(textInput, errorText);
        return false;
    }

    return true;
}

//показывает ошибку
function showError(inputElement, errorText) {

    inputElement.value = errorText;

    errorMessage.textContent = 'Error!!!'
    errorMessage.style.display = 'block';
    inputElement.style.color = 'grey'
    inputElement.style.borderColor = 'red';


    setTimeout(() => {
        errorMessage.style.display = 'none';
        inputElement.value = '';
        inputElement.style.borderColor = '';
        inputElement.style.color = '';
        inputElement.focus()
    }, 2300)

    inputElement.classList.add('input-error');
}

//чистит инпуты
function clearForm() {
    nameInput.value = '';
    vacancyInput.value = '';
    numberInput.value = '';

    nameInput.focus();
}

//клик на букву
contactList.addEventListener('click', (event) => {
    const letterEl = event.target.closest('.js-element-letter');
    if (!letterEl) return;
  
    const letterWrapper = letterEl.closest('.js-contact-list__letter');
    const letter = letterEl.dataset.letter;
    const contactsForLetter = contacts[letter] || [];
  
    if (!contactsForLetter.length) return;

    const existingInfo = letterWrapper.querySelector('.js-letter__info');

    if (existingInfo) {
      existingInfo.remove();
    } else {
      const infoDiv = document.createElement('div');
      infoDiv.className = 'letter__info js-letter__info';
      infoDiv.innerHTML = contactsForLetter.map(c => `
        <div class="contact-item js-contact-item" data-name="${c.name}">
            <p>Name: ${c.name}</p>
            <p>Vacancy: ${c.vacancy}</p>
            <p>Number: ${c.number}</p>
            <button class="deleteContactButton js-deleteContactButton">x</button>
        </div>
    `).join('');
      letterWrapper.append(infoDiv);
    }


});

//delete contact from Letter
contactList.addEventListener('click', (event) => {
    if (!event.target.classList.contains('js-deleteContactButton')) return;
    
    const contactElement = event.target.closest('.js-contact-item');
    if (!contactElement) return;
    
    const contactName = contactElement.dataset.name;
    const firstLetter = contactName[0].toLowerCase();

    contactElement.remove();

    // Удаляем из объекта contacts
    if (contacts[firstLetter]) {
        contacts[firstLetter] = contacts[firstLetter].filter(
            contact => contact.name !== contactName
        );

        // Если массив для этой буквы пуст, удаляем букву
        if (contacts[firstLetter].length === 0) {
            delete contacts[firstLetter];
            
            // Также скрываем блок с контактами, если он открыт
            const letterWrapper = contactElement.closest('.js-contact-list__letter');
            if (letterWrapper) {
                const infoDiv = letterWrapper.querySelector('.letter__info');
                if (infoDiv) infoDiv.remove();
            }
        }
    }

    saveContactsToStorage();
    renderContact();
});

//отчистка списка (button clear)
buttonClear.addEventListener('click', () => {
    document.querySelectorAll('.contact-list__counter').forEach(el => el.remove());

    contacts = {};
    saveContactsToStorage();

    document.querySelectorAll('.letter__info').forEach(info => info.remove());
})

//button search
buttonSearch.addEventListener('click', () => {
    document.querySelector('.js-search-popup').classList.add('active')

    document.querySelector('.js-search-popup__input').focus()
})

//popup search
const searchInput = document.querySelector('.js-search-popup__input')
const searchOutput = document.querySelector('.js-search-popup__output')
let showingAllInPopup = false;

searchInput.addEventListener('input', () => {
    showingAllInPopup = false;
    renderSearchPopup();
});


function renderSearchPopup() {
    const input = searchInput.value.trim().toLowerCase();
    searchOutput.innerHTML = '';

    const matches = [];

    for (let letter in contacts) {
        contacts[letter].forEach((contact, index) => {
            if (showingAllInPopup || contact.name.toLowerCase().startsWith(input)) {
                matches.push({ letter, index, contact });
            }
        });
    }

    if (matches.length === 0) {
        searchOutput.innerHTML = 'Nothing found.';
        return;
    }

    searchOutput.innerHTML = matches.map(({ letter, index, contact }) => `
        <div class="output-contact js-output-contact"
            data-name="${contact.name}" 
            data-number="${contact.number}"
            data-key="${letter}-${index}">
            <p>Name: ${contact.name}</p>
            <p>Vacancy: ${contact.vacancy}</p>
            <p>Number: ${contact.number}</p>
            <button class="editContact js-editContact">Edit</button>
            <button class="deleteContact js-deleteContact">x</button>
        </div>
    `).join('');
}

  

//search-popup delete contact
searchOutput.addEventListener('click', (event) => {
    if (event.target.classList.contains('js-deleteContact')) {
        const contactElement = event.target.closest('.js-output-contact');
        if (!contactElement) return;
        
        const [letter, index] = contactElement.dataset.key.split('-');
        
        if (contacts[letter] && contacts[letter][index]) {
            contacts[letter].splice(index, 1);
            
            if (contacts[letter].length === 0) {
                delete contacts[letter];
            }
        }
    
        contactElement.remove();
        
        saveContactsToStorage();

        renderContact();
        
        if (searchOutput.querySelectorAll('.js-output-contact').length === 0) {
            searchOutput.innerHTML = 'Nothing found.';
        }
    }
});

const showAllButton = document.querySelector('.js-search-popup__showAllBtn');

if (showAllButton) {
    showAllButton.addEventListener('click', () => {
        showingAllInPopup = true;
        renderSearchPopup();
    });
}



//close-button (search)
const searchCloseButton = document.querySelector('.js-search-popup__closeBtn')

searchCloseButton.addEventListener('click', () => {
    const searchPopup = document.querySelector('.js-search-popup');
    searchPopup.classList.remove('active')
})


//edit-popup open
searchOutput.addEventListener('click', (event) => {
    if (!event.target.classList.contains('js-editContact')) return;
  
    const popup = document.querySelector('.js-edit-popup');
    popup.classList.add('active');
  
    const inputNameEdit = document.querySelector('.js-edit-popup__name');
    const inputVacancyEdit = document.querySelector('.js-edit-popup__vacancy');
    const inputNumberEdit = document.querySelector('.js-edit-popup__number');
  
    const contactElement = event.target.closest('.js-output-contact');
    const name = contactElement.dataset.name;
    const number = contactElement.dataset.number;
  
    // ищем контакт по имени и номеру
    let foundContact = null;
    let foundLetter = '';
    let foundIndex = -1;
  
    for (const letter in contacts) {
      const index = contacts[letter].findIndex(c =>
        c.name === name && c.number === number
      );
      if (index !== -1) {
        foundContact = contacts[letter][index];
        foundLetter = letter;
        foundIndex = index;
        break;
      }
    }
  
    if (!foundContact) {
      alert('Контакт не найден. Возможно, он был удалён.');
      return;
    }
  
    // сохраняем данные и заполняем поля
    popup.dataset.letter = foundLetter;
    popup.dataset.index = foundIndex;
  
    inputNameEdit.value = foundContact.name;
    inputVacancyEdit.value = foundContact.vacancy;
    inputNumberEdit.value = foundContact.number;
});
  

//edit-popup editButton
const editPopupButtonEdit = document.querySelector('.js-edit-popup__editBtn')

editPopupButtonEdit.addEventListener('click', () => {
    const inputNameEdit = document.querySelector('.js-edit-popup__name');
    const inputVacancyEdit = document.querySelector('.js-edit-popup__vacancy');
    const inputNumberEdit = document.querySelector('.js-edit-popup__number');
    const editPopup = document.querySelector('.js-edit-popup');

    const letter = editPopup.dataset.letter;     
    const index = +editPopup.dataset.index; 

    if (!inputNameEdit.value.trim() || !inputVacancyEdit.value.trim() || !inputNumberEdit.value.trim()) {
        alert('Все поля должны быть заполнены');
        return;
    }

    contacts[letter][index] = {
        name: inputNameEdit.value.trim(),
        vacancy: inputVacancyEdit.value.trim(),
        number: inputNumberEdit.value.trim()
    };

    editPopup.classList.remove('active');

    saveContactsToStorage();

    renderContact();

    if (document.querySelector('.js-search-popup').classList.contains('active')) {
        renderSearchPopup();
    }

    delete editPopup.dataset.letter;
    delete editPopup.dataset.index;
})

//edit-popup close
const editPopupButtonClose = document.querySelector('.js-edit-popup__closeBtn')

editPopupButtonClose.addEventListener('click', () => {
    const editPopup = document.querySelector('.js-edit-popup');
    editPopup.classList.remove('active');
})


//localstorage
function saveContactsToStorage() {
    localStorage.setItem('contacts', JSON.stringify(contacts));
}

function loadContactsFromStorage() {
    const data = localStorage.getItem('contacts');
    return data ? JSON.parse(data) : {};
}



