// Import the array equals override code
import './arrayequals';

// Set global variables -------------

// Used to store the randomised keys that are selected during the memory game
var memoryKeys = [];

// Used later to store the keys pressed by the user during the memory game
var pressedKeys = [];

// Used to identify if the user currently playing
var isPlaying = false;

// Used to identify if the user is allowed to freely press the drum sounds
var canPress = true;

// Set the lives limit
var gameLives = 3;

// If a game has started, set to true until fully finished
var inGame = false;

var score = 0;

// Remove the transition class of transforming entities
const removeTransition = (e) => {

	if (e.propertyName !== 'transform') 
		return;

	e.target.classList.remove('playing');
}

const playSound = (e) => {
	// Prevent any keys doing anything other functions than what we intend them to do
	e.preventDefault();

	// If the game is running a memory sequence, we should disallow the user from interrupting by pressing the keys themselves
	if (!canPress) 
		return;

	const audio = document.querySelector('audio[data-key="' + e.keyCode + '"]');
	const button = document.querySelector('div[data-key="' + e.keyCode + '"]');
	if (!audio) 
		return;

	audio.currentTime = 0;
	audio.play();

	button.classList.toggle('playing');

	// If the memory game is running then we will check if the keys pressed matched the keys stored in memory
	if (isPlaying) {
		// Push the key code that has just been pressed into the 'pressedKeys' array
		pressedKeys.push(e.keyCode);

		// Once the number of pressed keys match the number of keys in memory, we will compare the arrays to see if the user was successful
		if (pressedKeys.length == memoryKeys.length) {
			canPress = false;
			setTimeout(function() {
				if (memoryKeys.equals(pressedKeys)) {
					alert('congrats!');
					let newLevel = parseInt(playBtn.getAttribute('data-level'))+1;
					playBtn.setAttribute('data-level', newLevel);
					playBtn.textContent = "Play level " + newLevel;

					score += (3+pressedKeys.length) * 100;
				} else {
					alert('failure');

					// If the user has is unsucessful, remove one of their lives
					removeLife();

					score -= (pressedKeys.length*20);

					// If the user has no lives left, reset their level to 1
					if (gameLives == 0) {
						playBtn.setAttribute('data-level', 1);
						playBtn.textContent = "Play level " + 1;
						inGame = false;
						gameLives = 3;
						document.getElementById('lives').innerHTML = '';
					}
				}

				document.getElementById('point-score').innerHTML = score;

				// Once the game has ended, reset the pressed keys array and set is playing to false
				pressedKeys = [];
				isPlaying = false;
				canPress = true;

			}, 200);
		}
	}
}

// Based on the passed key, this function will play the sound and create the associated animation for an item on the sound card
const autoplaySound = (key) => {
	const audio = document.querySelector('audio[data-key="' + key + '"]');
	const button = document.querySelector('div[data-key="' + key + '"]');
	if (!audio) 
		return;

	// Reset the audio to 0 seconds in case it is pressed again before it finishes
	audio.currentTime = 0;
	audio.play();

	// Toggle the playing class. (using add may cause a sticky class)
	button.classList.toggle('playing');
}

const playMemoryKey = (length, offset) => {
	// We need to create a timeout of 1 second that calls itself while the offset is less than the length
	setTimeout(function() {
		if (offset < length) {

			// Call the autplay sound function which will play the passed sound
			autoplaySound(memoryKeys[offset]);
			offset++;

			// Call the same function we are in to make this recursive. This will be called one extra time than needed 
			// (we can use this to do some extra logic at the end, like a callback function)
			playMemoryKey(memoryKeys.length, offset);
		} else {
			alert('Go!');
			canPress = true;
		}
	}, 1000);
}


// This function will add the visuals for the game lives that have been given once the game begins.
const addLives = () => {
	let i = 1;
	let lifeHolder = document.getElementById('lives');
	while (i <= gameLives) {
		let lifeImage = document.createElement('img');
		lifeImage.src = 'images/like.png';
		lifeImage.id = 'life-'+i;
		lifeHolder.appendChild(lifeImage);
		i++;
	}

	inGame = true;
}


// Tjos function will remove a life visually and programatically from the gameLives variable.
const removeLife = () => {
	let life = document.getElementById('life-'+gameLives);
	let nolife = document.createElement('img');
	nolife.src = 'images/life-lost.png';
	document.getElementById('lives').replaceChild(nolife, life);
	gameLives--;
}

// When a key is pressed, run the given function.
window.addEventListener('keydown', playSound);

document.addEventListener('DOMContentLoaded', () => {

	// get the 'play' button, this will hold an attribute which will decide the level the user is on
	const playBtn = document.getElementById('playBtn');

	// Get all keys that are available on the sound board
	var soundKeys = [];
	document.querySelectorAll('.key').forEach((key) => {

		// Add the data key attribute of all keys to the soundKeys array
		soundKeys.push(key.getAttribute('data-key'));

		// Add a transitionend event listerner to all keys
		key.addEventListener(
			'transitionend',
			removeTransition
		);
	});

	// Define the levels of the game and the associated number of sounds the user will need to remember
	const levels = {}

	let lev = 1;
	while (lev <= 100) {
		// level 1 will start at 3 memory blocks, each level will add another sound to the pattern
		levels[lev] = lev + 2;
		lev++;
	}

	// when someone clicks the play button...
	playBtn.addEventListener('click', function(e) {
		// If the game has already started, do not run anything in this function.
		if (isPlaying) 
			return; 

		// Add the lives to the top of the board if the game is just beginning.
		if (!inGame) addLives();

		isPlaying = true;
		canPress = false;
		memoryKeys = [];

		let i = 0;

		// only play the number of sounds specified for the given level passed on the play button
		while (i < levels[e.target.getAttribute('data-level')]) {
			// randomise the sound that will be played
			let key = soundKeys[Math.floor(Math.random() * 8)];

			// push that sound into an array so we can access it later
			memoryKeys[i] = key;

			i++;
		}

		// call the play memory key function which will play the sound associated with the key in the memoryKeys array
		playMemoryKey(memoryKeys.length, 0)
	});
});


