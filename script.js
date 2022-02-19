const generatorPreviewContainer = document.getElementById("json-generator-preview");
let cardCount = generatorPreviewContainer.children.length;

let cardTitleField = document.getElementById("option-title");
let cardDescriptionField = document.getElementById("option-description");
let listItemInput = document.getElementById("list-item-input");
const addListItemBtn = document.getElementById("add-list-item");
const addCardBtn = document.getElementById("add-card");
const copyOutputBtn = document.getElementById("copy-output-button");
const cardPreviewTemplate = document.getElementById("full-card-template");
const listItemTemplate = document.getElementById("list-item-template");

const outputField = document.querySelector("code")

let tempCard

let cardsList = {
    "included-features-with-descriptions": [],
    "additional-features-with-descriptions": [],
    "feature-highlights": []
}

class Card {
    constructor(title, description, listItems, id){
        this.id = id
        this.title = title;
        this.body = description;
        let template = cardPreviewTemplate.content.cloneNode(true);

        this.cardContent = template.querySelector("div")
        
        this.bullets = listItems

        if(this.id!="temp"){cardsList["included-features-with-descriptions"].push(this)}

        this.populateCard()
    }
    populateCard(){
        
        this.cardContent.id = "card-"+this.id;
        this.cardContent.querySelectorAll("div")[0].innerText = this.title
        this.cardContent.querySelector("p").innerText = this.body
        
        this.bullets.forEach(item =>{
            let listItemContainer = this.cardContent.querySelectorAll("div")[1].querySelector("ul")
            let listItem = listItemTemplate.content.cloneNode(true).querySelector("li")
            listItem.querySelector("span").innerText = item
            listItemContainer.appendChild(listItem)
        })
    }
}

function addCard(){
    let title = cardTitleField.value;
    let description = cardDescriptionField.value;
    let listItems = getListItems()

    generatorPreviewContainer.removeChild(tempCard.cardContent)
    createTempCard()

    let card = new Card(title, description, listItems, cardCount);
    generatorPreviewContainer.appendChild(card.cardContent)
    cardCount++

    cardTitleField.value = null;
    cardDescriptionField.value = null;
    listItemInput.value = null;
    card.cardContent.querySelector("button").addEventListener("click", ()=>{
        removeCard(card.id)
    })


}

function updateOutputField(){
    outputField.innerText = JSON.stringify(cardsList, false, 2)
}

function removeCard(id) {
    let cardToRemove = document.getElementById("card-"+id)
    let container = cardsList["included-features-with-descriptions"]

    let idx = container.findIndex(item => item.id === id)
    document.getElementById("json-generator-preview").removeChild(cardToRemove)
    delete container[idx].id

    cardsList["included-features-with-descriptions"] = container.filter(e=>{return e.id!=undefined})  
    updateOutputField()
}

function createTempCard() {
  tempCard = new Card("Card title","Card description",["Item 1","Item 2", "Item 3"], "temp")
  generatorPreviewContainer.prepend(tempCard.cardContent);

  // Hide the upper right button from preview card
  let howManyBtns = tempCard.cardContent.querySelectorAll("button").length;
  tempCard.cardContent.querySelectorAll("button")[howManyBtns - 1].style.display = "none";
}

function updateCardDescription() {
  let tempCardDescription = document.getElementById("preview-card-description");

  if (!cardDescriptionField.value) {
    return;
  }
  tempCardDescription.innerText = cardDescriptionField.value;
}

function updateCardTitle() {
  let tempCardTitle = document.getElementById("preview-card-left");
  if (!cardTitleField.value) {
    return;
  }
  tempCardTitle.innerText = cardTitleField.value;
}

function updateListItems(){
    let listItems = getListItems()
    if (listItems[0]=="" || listItems.length == 0){return}
    let listItemContainer = document.getElementById("card-temp").querySelector("ul");

    console.log(listItemContainer.childNodes)
    Array.from(listItemContainer.childNodes).forEach(child => {listItemContainer.removeChild(child)})

    listItems.forEach(item =>{
        let listItem = listItemTemplate.content.querySelector("li").cloneNode(true);
        listItem.querySelector("span").innerText = item;
        listItemContainer.appendChild(listItem);
    })
}

function getListItems(){
    return listItemInput.value.split("\n").filter(item => {return item != ""});
}

function copyOutput(){
    let output = outputField.innerText
    navigator.clipboard.writeText(output)
}

document.addEventListener("DOMContentLoaded", createTempCard, false);
cardDescriptionField.addEventListener("input", updateCardDescription);
cardTitleField.addEventListener("input", updateCardTitle);
listItemInput.addEventListener("input", updateListItems)
addCardBtn.addEventListener("click", addCard);
addCardBtn.addEventListener("click", updateOutputField);
addCardBtn.addEventListener("click", updateListItems);
addCardBtn.addEventListener("click", updateCardTitle);
addCardBtn.addEventListener("click", updateCardDescription);
copyOutputBtn.addEventListener("click", copyOutput)
