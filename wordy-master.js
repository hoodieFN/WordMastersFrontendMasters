const letters = document.querySelectorAll('.input')
const loadingDiv = document.querySelector('.spiral')
const ANSWEAR_LENGTH = 5;
const ROUNDS = 6;


async function init() {
    let currentGuess = '';
    let currentRow = 0;
    let isLoading = true;

    const res = await fetch("https://words.dev-apis.com/word-of-the-day")
    const resObj = await res.json();
    const word = resObj.word.toUpperCase();
    const wordParts = word.split("");
    let done = false;
    setLoading(false);
    isLoading = false;

    console.log(word)

    function addLetter (letter){
        if (currentGuess.length < ANSWEAR_LENGTH){
            //add letter to the end
            currentGuess += letter;
        } else{
            //replace the last letter
            currentGuess = currentGuess.substring(0, currentGuess.length -1) + letter
        }
        
        letters[ANSWEAR_LENGTH * currentRow + currentGuess.length - 1].innerText = letter;
    }

    async function commit() {
        if (currentGuess.length != ANSWEAR_LENGTH){
            //do nothing
            return;
        }

        isLoading = true;
        setLoading(true);
        const res = await fetch("https://words.dev-apis.com/validate-word", {
            method: "POST",
            body: JSON.stringify({word: currentGuess})
        });
        
        const resObj = await res.json();
        const validWord = resObj.validWord;
        // const { validWord } = resObj;

        isLoading = false;
        setLoading(false);

        if(!validWord){
            markInvalidWord();
            return;
        }

        const guessParts = currentGuess.split("");
        const map = makeMap(wordParts);
        console.log(map);



        for (let i = 0; i < ANSWEAR_LENGTH; i++) {
            //mark as correct
            if (guessParts[i] === wordParts[i]) {
                letters[currentRow * ANSWEAR_LENGTH + i].classList.add("correct");
                map[guessParts[i]]--;
            }
        }

        for (let i = 0; i < ANSWEAR_LENGTH; i++){
            if (guessParts[i] === wordParts[i]) {
                // do nothing we already did it
            } 
            else if (wordParts.includes(guessParts[i]) && map[guessParts[i]] > 0){
                //mark as close
                letters[currentRow * ANSWEAR_LENGTH + i].classList.add("close");
                map[guessParts[i]]--;
            } 
            else{
                letters[currentRow * ANSWEAR_LENGTH + i].classList.add("wrong");
            }
        }
        
        currentRow++;
        if (currentGuess === word) {
            //win
            alert('you win');
            document.querySelector('.tittle').classList.add("winner");
            done = true;
            return;
        }else if (currentRow === ROUNDS) {
            alert(`you lose the word was ${word}`);
            done = true;
        }
        currentGuess = '';
    }

    function backspace(){
        currentGuess = currentGuess.substring(0, currentGuess.length -1)
        letters[ANSWEAR_LENGTH * currentRow + currentGuess.length].innerText = "";
    }

    function markInvalidWord () {
        //alert('not a valid word')
        for (let i = 0; i < ANSWEAR_LENGTH; i++){
            letters[currentRow * ANSWEAR_LENGTH + i].classList.remove("invalid");
            setTimeout(function(){
                letters[currentRow * ANSWEAR_LENGTH + i].classList.add("invalid");
            },10)
            }
        }
    

    document.addEventListener('keydown', function handleKeyPress(event){
        if (done  || isLoading){
            // do nothing
            return;
        }
       
        const action = event.key;
        
        if (action === 'Enter'){
            commit();
        } else if (action === 'Backspace'){
            backspace();
        } else if (isLetter(action)){
            addLetter(action.toUpperCase());
        } else {
            //do nothing
        }
    });
}

function isLetter(letter) {
    return /^[a-zA-Z]$/.test(letter);
  }

function setLoading(isLoading){
    loadingDiv.classList.toggle('hidden', !isLoading)
}
function makeMap(array){
    const obj = {};
    for (let i = 0; i < array.length; i++) {
        const letter = array[i]
        if (obj[letter]){
            obj[letter]++;
        } else {
            obj[letter] = 1;
        }
    }
    return obj;
}
init();