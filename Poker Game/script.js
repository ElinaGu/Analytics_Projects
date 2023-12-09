//Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAZSqurdktOImd6FJwH4_76NjXYG372Z6I",
  authDomain: "insy341f23-6ea9f.firebaseapp.com",
  projectId: "insy341f23-6ea9f",
  storageBucket: "insy341f23-6ea9f.appspot.com",
  messagingSenderId: "496814949273",
  appId: "1:496814949273:web:c79f8dec84c4039a640908"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
let playersRef = collection(db, "players");

// Defining variables 
const urlParams = new URLSearchParams(window.location.search);
const playerName = urlParams.get("playerName");
let cardRemain = 0;
let computerHand = [];
let playerHand = [];
let middleCard = [];
let roundComputerScore = 0;
let roundPlayerScore = 0;
let computerScoreHTML = "";
let playerScoreHTML = "";
let playerSelected = "";
let computerSelected = "";
let winnerHTML = "";
let deckID = "";
let winner = "";

/*
Function start game is used to direct the page to a new URL with the player name
being the name that the user entered
*/
window.startGame = async function startGame() {
  let playerName = document.getElementById("player-name").value;
  let newURL = "game.html?playerName=" + playerName;
  window.location.href = newURL;
};

/*
As the onload for game.html, initilize deck function is used to retrive a new 
deck of cards and call draw card function
*/
window.initializeDeck = async function initializeDeck() {
  document.getElementById("gameEnd").style.display = "none";
  document.getElementById("gameInterface").style.display = "flex";
  const response = await fetch(
    "https://deckofcardsapi.com/api/deck/new/shuffle/?deck_count=1"
  );
  const fulldeck = await response.json();
  deckID = fulldeck.deck_id;
  roundComputerScore = 0;
  roundPlayerScore = 0;
  await drawCard();
};

/*
Transform card function is used to add two new properties to each card: 
the color of the card (based on the suit) and the value of the card in number
*/
window.transformCard = async function transfromCard(data) {
  for (let x = 0; x < data.cards.length; x++) {
    if (data.cards[x].suit == "DIAMONDS" || data.cards[x].suit == "HEARTS") {
      data.cards[x].color = "Red";
    } else {
      data.cards[x].color = "Black";
    }
  }
  for (let x = 0; x < data.cards.length; x++) {
    if (data.cards[x].value == "ACE") {
      data.cards[x].valueNumber = 1;
    } else if (data.cards[x].value == "JACK") {
      data.cards[x].valueNumber = 11;
    } else if (data.cards[x].value == "QUEEN") {
      data.cards[x].valueNumber = 12;
    } else if (data.cards[x].value == "KING") {
      data.cards[x].valueNumber = 13;
    } else {
      data.cards[x].valueNumber = parseInt(data.cards[x].value);
    }
  }
  return data;
};

/*
Draw card function is used to draw 11 cards form the deck of card that was
initially retrived. 

Cards are then being transformed using transform card function

.slice fucntion is being used to split the cards into three piles:
5 for computer hand, 5 for player hand, 1 for the middle card 

I googled and used 3wschools for information on how to use .slice in Javascript
*/
window.drawCard = async function drawCard() {
  const response = await fetch(
    `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=11`
  );
  const data = await response.json();
  await transformCard(data);
  cardRemain = data.remaining;

  computerHand = data.cards.slice(0, 5);
  playerHand = data.cards.slice(5, 10);
  middleCard = data.cards.slice(10);

  await displayCards();
};

/*
Display score counts, and front of the cards for player, and 
the back of the cards for computer and the midlle card

Set every player card to an onlick that calls the round result function while
return that card's information to the round result function
*/
window.displayCards = async function displayCards() {
  document.getElementById("nextCard").style.display = "flex";
  document.getElementById("nextGame").style.display = "none";
  document.getElementById("winner").style.display = "none";
  computerScoreHTML = `
  <div>
    Computer: ${roundComputerScore}
  <div>
  `;
  document.getElementById("computerCount").innerHTML = computerScoreHTML;

  playerScoreHTML = `
  <div>
    ${playerName.charAt(0).toUpperCase() + playerName.slice(1)}: ${roundPlayerScore}
  <div>
  `;
  document.getElementById("playerCount").innerHTML = playerScoreHTML;

  let middleHTML = `
  <div>
    <img src = "https://deckofcardsapi.com/static/img/back.png"/ >
  </div>
    `;
  document.getElementById("middleCard").innerHTML = middleHTML;

  let nextCardColorHTML = "";
  nextCardColorHTML = `
  <div  style = "color: ${middleCard[0].color}; font-size: 24px">
  The Next Card is 
  </div>
  <div style = "font-weight: 900; font-size: 36px;color: ${middleCard[0].color}">
  ${middleCard[0].color}
  </div>
  `;
  document.getElementById("nextCard").innerHTML = nextCardColorHTML;

  let computerHTML = "";
  for (let x = 0; x < computerHand.length; x++) {
    computerHTML += `
    <div>
      <img src = "https://deckofcardsapi.com/static/img/back.png" class="pocker-cards"/>
    </div>
    `;
  }
  document.getElementById("computerCards").innerHTML = computerHTML;
  console.log(computerHand);

  let playerHTML = "";
  for (let x = 0; x < playerHand.length; x++) {
    playerHTML += `
    <div>
      <img src = "${playerHand[x].image}" class="pocker-cards" onclick = "roundResult(${x})"/>
    </div>
    `;
  }
  document.getElementById("playerCards").innerHTML = playerHTML;
};

/*
After the player select a card, round results should be displayed. 
Call computer selection function to let computer select a card

Use margin-top: -12px to move the selected cards upward, and display the computer
selected card and the middle card

Call game winner function to calculate the scores for each side to 
determine the round winner

Set a onlick to move on to the next round
*/
window.roundResult = async function roundResult(playerSelect) {
  playerSelected = playerHand[playerSelect];
  
  let playerHTML = "";
  for (let x = 0; x < playerHand.length; x++) {
    if (playerHand[x] == playerSelected) {
      playerHTML += `
    <div>
      <img src = "${playerHand[x].image}" class="pocker-cards"; style="margin-top: -12px";/>
    </div>
    `;
    } else {
      playerHTML += `
    <div>
      <img src = "${playerHand[x].image}" class="pocker-cards";/>
    </div>
    `;
    }
  }
  document.getElementById("playerCards").innerHTML = playerHTML;

  computerSelected = await computerSelection();
  
  let computerHTML = "";
  for (let x = 0; x < computerHand.length; x++) {
    if (computerHand[x] == computerSelected) {
      computerHTML += `
    <div>
      <img src = "${computerHand[x].image}" class="pocker-cards"; style="margin-top: -12px";/>
    </div>
    `;
    } else {
      computerHTML += `
    <div>
      <img src = "https://deckofcardsapi.com/static/img/back.png" class="pocker-cards"/>
    </div>
    `;
    }
  }
  document.getElementById("computerCards").innerHTML = computerHTML;

  let revealHTML = `
  <div>
    <img src = "${middleCard[0].image}"/ >
  </div>
    `;
  document.getElementById("middleCard").innerHTML = revealHTML;

  await gameWinner();

  document.getElementById("nextGame").style.display = "flex";
  document.getElementById("winner").style.display = "flex";
  document.getElementById("nextCard").style.display = "none";

  let nextRoundHTML = "";
  nextRoundHTML += `
  <div class = "next-round" onclick = "nextRound()">
    Next Round
  </div>
  `;
  document.getElementById("nextGame").innerHTML = nextRoundHTML;
};

/*
Computer selection function is used to help the computer side select a card based
on limited information i.e. only knowing the color of the next card. 

Ask the computer to select the smallest card (in terms of value number) 
in the same color as the next card
If there is no card in the same color as the next card, select the smallest card 
in the five cards
*/
window.computerSelection = async function computerSelection() {
  let chosenNumber = 13;
  let cardSelected = "";
  for (let x = 0; x < computerHand.length; x++) {
    if (
      computerHand[x].color == middleCard[0].color &&
      computerHand[x].valueNumber < chosenNumber
    ) {
      chosenNumber = computerHand[x].valueNumber;
      cardSelected = computerHand[x];
    }
  }
  if (cardSelected == "") {
    let minNumber = computerHand[0].valueNumber;
    cardSelected = computerHand[0];
    for (let y = 0; y < computerHand.length; y++) {
      if (computerHand[y].valueNumber < minNumber) {
        cardSelected = computerHand[y];
      }
    }
  }
  return cardSelected;
};

/*
Game winner function is used to determine the winner for each round. 
Based on the rules given, the points (current score) for each side is calculated
Then compare the current score to determine the winner. 

To be a winner, there are two situations, take player as the winner as an example: 

1. player's card value is smaller or equal to the center card while the computer's
card value is larger then the center card; In this case, the player automaticly win

2. Both player's card and computer's card value is smaller or equal to the center
card, in this case, player needs to have a current score smaller than the computer

After the winner is determined, add all card values to the score count
 */
window.gameWinner = async function gameWinner() {
  let currentComputerScore = 0;
  let currentPlayerScore = 0;

  if (computerSelected.valueNumber < middleCard[0].valueNumber) {
    currentComputerScore +=
      middleCard[0].valueNumber - computerSelected.valueNumber;
    if (computerSelected.suit != middleCard[0].suit) {
      if (computerSelected.color != middleCard[0].color) {
        currentComputerScore += 4;
      } else {
        currentComputerScore += 2;
      }
    }
  }

  if (playerSelected.valueNumber < middleCard[0].valueNumber) {
    currentPlayerScore +=
      middleCard[0].valueNumber - playerSelected.valueNumber;
    if (playerSelected.suit != middleCard[0].suit) {
      if (playerSelected.color != middleCard[0].color) {
        currentPlayerScore += 4;
      } else {
        currentPlayerScore += 2;
      }
    }
  }
  while (true) {
    if (
      (playerSelected.valueNumber <= middleCard[0].valueNumber &&
        computerSelected.valueNumber > middleCard[0].valueNumber) ||
      (currentPlayerScore < currentComputerScore &&
        playerSelected.valueNumber <= middleCard[0].valueNumber &&
        computerSelected.valueNumber <= middleCard[0].valueNumber)
    ) {
      winner = playerName.charAt(0).toUpperCase() + playerName.slice(1);
      roundPlayerScore += computerSelected.valueNumber + 
        playerSelected.valueNumber +
        middleCard[0].valueNumber;
      
      playerScoreHTML = `
    <div>
      ${
        playerName.charAt(0).toUpperCase() + playerName.slice(1)
      }: ${roundPlayerScore}
    <div>
    `;
      document.getElementById("playerCount").innerHTML = playerScoreHTML;
      break;
    }
    if (
      (playerSelected.valueNumber > middleCard[0].valueNumber &&
        computerSelected.valueNumber <= middleCard[0].valueNumber) ||
      (currentPlayerScore > currentComputerScore &&
        computerSelected.valueNumber <= middleCard[0].valueNumber &&
        playerSelected.valueNumber <= middleCard[0].valueNumber)
    ) {
      winner = "Computer";
      roundComputerScore += computerSelected.valueNumber + 
        playerSelected.valueNumber +
        middleCard[0].valueNumber;
      computerScoreHTML = `
    <div>
      Computer: ${roundComputerScore}
    <div>
    `;
      document.getElementById("computerCount").innerHTML = computerScoreHTML;
      break;
    } else {
      winner = "No One";
      break;
    }
  }
  winnerHTML = `
  <div class="winner">
    ${winner} Wins! 
  </div>
  `;
  document.getElementById("winner").innerHTML = winnerHTML;
};

/*
Function next round is called everytime the player clicked on the next round
button on the interface.

If the card remaining is larger or equal to 3, draw another three cards. 
use .splice to remove the selected card on the computer hand and player hand and then
push a new card into the hands
Set the middle card to a new card as well
Then, call display card function to display cards again and continue the game

If the remaining card is less then 3 cards, call the game End function to display
the game end page
*/
window.nextRound = async function nextRound() {
  if (cardRemain >= 3) {
    let newThreeCards = [];
    const response = await fetch(
      `https://deckofcardsapi.com/api/deck/${deckID}/draw/?count=3`
    );
    newThreeCards = await response.json();
    cardRemain = newThreeCards.remaining;
    await transformCard(newThreeCards);

  for (let x = 0; x < computerHand.length; x++) {
    if (computerHand[x] == computerSelected) {
      computerHand.splice(x, 1);
    }
  }
  computerHand.push(newThreeCards.cards[0]);
  console.log(computerHand);

  for (let x = 0; x < playerHand.length; x++) {
    if (playerHand[x] == playerSelected) {
      playerHand.splice(x, 1);
    }
  }
  playerHand.push(newThreeCards.cards[1]);

  middleCard = newThreeCards.cards.slice(2);
  console.log(middleCard);

  await displayCards();
  }
  else{
    await gameEnd()
  }
};

/*
Set the display of the game interface to be none and the display of the game end
div to be flex to show the final results of a game

Compare the score counts for both sides to determine the winner of the game and
display the scores and the winner on the screen 

Use firebase to retrive and display all the past game history that belongs to the player
Add the current game information to the firebase
*/
window.gameEnd = async function gameEnd(){
  document.getElementById("gameInterface").style.display = "none";
  document.getElementById("gameEnd").style.display = "flex";

  let roundWinner = "";
  if (roundPlayerScore > roundComputerScore){
    roundWinner = playerName.charAt(0).toUpperCase() + playerName.slice(1);
  } else if (roundPlayerScore == roundComputerScore){
    roundWinner = "No One";
  }else{
    roundWinner = "Computer";
  };
  let gameWinnerTitleHTML =`
  ${roundWinner} Wins!
  `;
  document.getElementById("gameWinnerTitle").innerHTML = gameWinnerTitleHTML;
  let playerOverviewHTML = `
  ${playerName.charAt(0).toUpperCase() + playerName.slice(1)}:${roundPlayerScore} 
  `
  document.getElementById("playerOverview").innerHTML = playerOverviewHTML;
  let computerOverviewHTML = `
  Computer:${roundComputerScore} 
  `
  document.getElementById("computerOverview").innerHTML =  computerOverviewHTML;

  let matchName = playerName.charAt(0).toUpperCase() + playerName.slice(1);
  let unsubscribe = onSnapshot(playersRef, function (players) {
    let htmlBuilder = "";
    players.forEach(function (player) {
      if ((player.data().player == matchName)){
        htmlBuilder +=`
        <div style="margin-top:16px">
        ${matchName}:${player.data().score}
        </div>
        <div style="margin-bottom:16px">
        Computer:${player.data().computer}
        </div>
        <hr style="width: 200px" />
        `
      }
    });
    document.getElementById("histories").innerHTML = htmlBuilder;
  });
 
  let newDoc = await addDoc(playersRef, {
    player:playerName.charAt(0).toUpperCase() + playerName.slice(1),
    score: roundPlayerScore,
    computer:roundComputerScore,
  });
}


