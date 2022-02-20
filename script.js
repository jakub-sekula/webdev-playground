// Output object (gets converted to JSON)
let cardsList = {
    "included-features-with-descriptions": [],
    "additional-features-with-descriptions": [],
    "feature-highlights": []
}

// DOM templates
const cardPreviewTemplate = document.getElementById("full-card-template");
const listItemTemplate = document.getElementById("list-item-template");

// DOM element selections
const generatorPreviewContainer = document.getElementById("json-generator-preview");
const addListItemBtn = document.getElementById("add-list-item");
const addCardBtn = document.getElementById("add-card");
const copyOutputBtn = document.getElementById("copy-output-button");
const outputField = document.querySelector("code")
let cardTitleField = document.getElementById("option-title");
let cardDescriptionField = document.getElementById("option-description");
let listItemInput = document.getElementById("list-item-input");

let cardCount = generatorPreviewContainer.children.length;
let tempCard

class Card {
    constructor(title, description, listItems, id) {
        let template = cardPreviewTemplate.content.cloneNode(true);
        this.id = id
        this.focused = false //will be used later to edit cards after adding
        this.title = title;
        this.body = description;
        this.cardContent = template.querySelector("div")
        this.bullets = listItems

        if (this.id != "temp") { cardsList["included-features-with-descriptions"].push(this) }

        this.populateCard()
    }
    populateCard() {

        this.cardContent.id = "card-" + this.id;
        this.cardContent.querySelectorAll("div")[0].innerText = this.title
        this.cardContent.querySelector("p").innerText = this.body
        this.cardContent.dataset.focused = this.focused
        this.bullets.forEach(item => {
            let listItemContainer = this.cardContent.querySelectorAll("div")[1].querySelector("ul")
            let listItem = listItemTemplate.content.cloneNode(true).querySelector("li")
            listItem.querySelector("span").innerText = item
            listItemContainer.appendChild(listItem)
        })
    }
}

function addCard() {
    let title = cardTitleField.value;
    let description = cardDescriptionField.value;
    let listItems = getListItems()

    generatorPreviewContainer.removeChild(tempCard.cardContent)
    createTempCard()

    let card = new Card(title, description, listItems, cardCount);

    card.cardContent.style.animation = "enter 200ms ease-in-out"
    card.cardContent.style.zIndex = "-"+card.id
    generatorPreviewContainer.appendChild(card.cardContent)
    cardCount++

    cardTitleField.value = null;
    cardDescriptionField.value = null;
    listItemInput.value = null;

    attachButtonListenersToCard(card)
    unfocusCard()
}

function attachButtonListenersToCard(card){
    card.cardContent.getElementsByClassName("remove-card-btn")[0].addEventListener("click", () => {
        removeCard(card.id)
    })

    card.cardContent.getElementsByClassName("edit-card-btn")[0].addEventListener("click", ()=>{focusCard(card)})
}

function hideAllCards(){
    Array.from(generatorPreviewContainer.childNodes).forEach(element => {if(element.id=="card-temp"){return}generatorPreviewContainer.removeChild(element)})
}

function renderCardsFromObject(list){
        list["included-features-with-descriptions"].forEach(element => {
        let card = new Card(element.title, element.body, element.bullets, element.id)
        generatorPreviewContainer.appendChild(card.cardContent)
        attachButtonListenersToCard(card)
    })
}

function focusCard(object) {
    if(object.focused == true) {return}

    unfocusCard()
    detachInputListeners()

    addCardBtn.addEventListener("click", unfocusCard, false)
    addCardBtn.innerText = "Apply changes"
    
    object.cardContent.classList.add("ba-focused-card")
    object.focused = true
    object.cardContent.dataset.focused = object.focused

    let listItemString 
    cardTitleField.value = object.title
    cardDescriptionField.value = object.body
    listItemInput.value = object.bullets.join("\n")

    cardTitleField.addEventListener("input", gowno, false)
    cardDescriptionField.addEventListener("input", gowno, false)
    listItemInput.addEventListener("input", gowno, false)

    updateOutputField()
}

function gowno() {
    let focusedCard = document.querySelector("[data-focused='true']")
    updateCardDetails(focusedCard)
}

function updateCardDetails(card) {
    let cardTitle = card.querySelector("[data-name='card-left']");
    let cardDescription = card.querySelector("[data-name='card-description']")
    let cardList = card.querySelector("[data-name='card-list']")

    let cardsListSubset = cardsList["included-features-with-descriptions"]

    let cardId = parseInt(card.id.split("-")[1]);
    let idxInGlobalList = cardsListSubset.findIndex(item => {return item.id == cardId})

    Array.from(cardList.childNodes).forEach(child => { cardList.removeChild(child) })

    getListItems().forEach(item => {
        let listItem = listItemTemplate.content.querySelector("li").cloneNode(true);
        listItem.querySelector("span").innerText = item;
        cardList.appendChild(listItem);
    })

    cardsListSubset[idxInGlobalList].title = cardTitleField.value
    cardsListSubset[idxInGlobalList].body = cardDescriptionField.value
    cardsListSubset[idxInGlobalList].bullets = getListItems()
    
    cardTitle.innerText = cardTitleField.value;
    cardDescription.innerText = cardDescriptionField.value;

    updateOutputField()

}

function unfocusCard() {
    let focusedCards = Array.from(cardsList["included-features-with-descriptions"]).filter(e=>{return e.focused == true})
    focusedCards.forEach(e => {
    e.focused = false
    e.cardContent.classList.remove("ba-focused-card")
    e.cardContent.dataset.focused = false

    cardTitleField.removeEventListener("input", gowno, false)
    cardDescriptionField.removeEventListener("input", gowno, false)
    listItemInput.removeEventListener("input", gowno, false)
    addCardBtn.innerText = "Add card"
    clearInputFields()
    attachInputListeners()
    updateOutputField()
})
}

function clearInputFields() {
    cardTitleField.value = null
    cardDescriptionField.value = null
    listItemInput.value = null
}

function updateOutputField() {
    outputField.innerText = JSON.stringify(cardsList, false, 2)
}

function removeCard(id) {
    let cardToRemove = document.getElementById("card-" + id)
    let json_container = cardsList["included-features-with-descriptions"]

    let idx = json_container.findIndex(item => item.id === id)
    cardToRemove.style.animation = "";
    cardToRemove.classList.add("leaving")

    let cardHeight = cardToRemove.getBoundingClientRect().height 
    let cardGap = window.getComputedStyle(generatorPreviewContainer).gap
    // let animationDelay = window.getComputedStyle(generatorPreviewContainer.getElementsByClassName("ba-feature-card")[0]).animationDelay
    
    let cardOffset = parseInt(cardHeight) + parseInt(cardGap)

    let moveUp = () => {Array.from(generatorPreviewContainer.getElementsByClassName("ba-feature-card")).forEach(e => {

        if ( e.id != "card-temp" && e.id.split("-")[1] >= cardToRemove.id.split("-")[1] ){
            e.style.transform = "translateY(-"+cardOffset+"px)"
            e.style.animation = null
            e.style.transition = null
            }
        })
    }

    let clear = () => {Array.from(generatorPreviewContainer.getElementsByClassName("ba-feature-card")).forEach(e => {
        e.style.transform = null
        e.style.transition = "none"
    })}

    let del = () => {
        document.getElementById("json-generator-preview").removeChild(cardToRemove)
        clear()
    }

    moveUp()
    setTimeout(del,200);

   

    delete json_container[idx].id

    cardsList["included-features-with-descriptions"] = json_container.filter(e => { return e.id != undefined })
    updateOutputField()
}

function createTempCard() {
    tempCard = new Card("Card title", "Card description", ["Item 1", "Item 2", "Item 3"], "temp")
    generatorPreviewContainer.prepend(tempCard.cardContent);

    // Hide the upper right button from preview card
    let howManyBtns = tempCard.cardContent.querySelectorAll("button").length;
    tempCard.cardContent.querySelectorAll("button").forEach(btn => {btn.style.display = "none"});
}

function updateTempCardDescription() {
    let tempCardDescription = document.getElementById("card-temp").querySelector("[data-name='card-description']");

    if (!cardDescriptionField.value) {
        return;
    }
    tempCardDescription.innerText = cardDescriptionField.value;
}

function updateTempCardTitle() {
    let tempCardTitle = document.getElementById("card-temp").querySelector("[data-name='card-left']");
    if (!cardTitleField.value) {
        return;
    }
    tempCardTitle.innerText = cardTitleField.value;
}


function updateTempListItems() {
    let listItems = getListItems()
    if (listItems[0] == "" || listItems.length == 0) { return }
    let listItemContainer = document.getElementById("card-temp").querySelector("ul");

    Array.from(listItemContainer.childNodes).forEach(child => { listItemContainer.removeChild(child) })

    listItems.forEach(item => {
        let listItem = listItemTemplate.content.querySelector("li").cloneNode(true);
        listItem.querySelector("span").innerText = item;
        listItemContainer.appendChild(listItem);
    })
}

function getListItems() {
    return listItemInput.value.split("\n").filter(item => { return item != "" });
}

function copyOutput() {
    let output = outputField.innerText
    navigator.clipboard.writeText(output)
}

function attachInputListeners() {
    cardDescriptionField.addEventListener("input", updateTempCardDescription);
    cardTitleField.addEventListener("input", updateTempCardTitle);
    listItemInput.addEventListener("input", updateTempListItems)
    addCardBtn.addEventListener("click", addCard);
    addCardBtn.addEventListener("click", updateOutputField);
    addCardBtn.addEventListener("click", updateTempListItems);
    addCardBtn.addEventListener("click", updateTempCardTitle);
    addCardBtn.addEventListener("click", updateTempCardDescription);
}

function detachInputListeners() {
    cardDescriptionField.removeEventListener("input", updateTempCardDescription);
    cardTitleField.removeEventListener("input", updateTempCardTitle);
    listItemInput.removeEventListener("input", updateTempListItems);
    addCardBtn.removeEventListener("click", addCard);
    addCardBtn.removeEventListener("click", updateOutputField);
    addCardBtn.removeEventListener("click", updateTempListItems);
    addCardBtn.removeEventListener("click", updateTempCardTitle);
    addCardBtn.removeEventListener("click", updateTempCardDescription);
}


document.addEventListener("DOMContentLoaded", createTempCard, false);
document.addEventListener("DOMContentLoaded", updateOutputField, false);
document.addEventListener("DOMContentLoaded", attachInputListeners, false);

copyOutputBtn.addEventListener("click", copyOutput)

document.querySelector("pre").addEventListener("click", unfocusCard)
