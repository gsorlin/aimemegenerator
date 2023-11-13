let favorites = []; // Array to store favorite memes
console.log("Initialized favorites array");

document.getElementById('generateButton').addEventListener('click', function() {
    console.log("Generate button clicked");
    const userInput = document.getElementById('memeInput').value;
    console.log("User input:", userInput);
    this.disabled = true;

    console.log("Making POST request to /generate-meme");
    fetch('/generate-meme', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ input: userInput })
    })
    .then(response => {
        console.log("Received response");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log("Data received:", data);
        try {
            displayMemes(data);
        } catch (error) {
            console.error('Error displaying memes:', error);
            alert('Error occurred while displaying memes. Please check the console for more details.');
        }
        document.getElementById('generateButton').disabled = false;
    })
    .catch(error => {
        console.error('Error during fetch operation:', error);
        alert('Failed to generate meme. Please try again.');
        document.getElementById('generateButton').disabled = false;
    });
});

document.getElementById('goToFavorites').addEventListener('click', function() {
    console.log("Navigating to favorites page");
    document.getElementById('generatorPage').style.display = 'none';
    document.getElementById('favoritesPage').style.display = 'block';
    viewFavorites(); // Refresh the favorites view
});

document.getElementById('goToGenerator').addEventListener('click', function() {
    console.log("Navigating to generator page");
    document.getElementById('favoritesPage').style.display = 'none';
    document.getElementById('generatorPage').style.display = 'block';
});

function displayMemes(memeData) {
    const memeSelectionContainer = document.getElementById('memeSelectionContainer');
    memeSelectionContainer.innerHTML = '';

    if (!memeData || !Array.isArray(memeData.memes) || memeData.memes.length === 0) {
        console.error('Invalid meme data:', memeData);
        alert('Error occurred while processing memes. Please check the console for more details.');
        return;
    }

    memeData.memes.forEach((meme) => {
        // Check if the meme has a blank field which is the image URL
        if (!meme.blank) {
            console.error('Meme does not have a blank field:', meme);
            return; // Skip this meme
        }

        const memeContainer = document.createElement('div');
        memeContainer.className = 'meme-container';
        memeContainer.innerHTML = `
            <img src="${meme.blank}" class="meme-image" alt="Meme Image">
            <div class="meme-caption top">${meme.topCaption || ''}</div>
            <div class="meme-caption bottom">${meme.bottomCaption || ''}</div>
        `;

        // Append the meme container to the selection container
        memeSelectionContainer.appendChild(memeContainer);
    });
}

function addToFavorites(selectedMeme) {
    console.log("Adding meme to favorites:", selectedMeme);
    favorites.push(selectedMeme);
    alert('Added to favorites!');
    resetMemeDisplay();
}

document.getElementById('startOverButton').addEventListener('click', function() {
    console.log("Start over button clicked");
    document.getElementById('memeInput').value = '';
    resetMemeDisplay();
});

function resetMemeDisplay() {
    console.log("Resetting meme display");
    const memeSelectionContainer = document.getElementById('memeSelectionContainer');
    memeSelectionContainer.innerHTML = '';
    memeSelectionContainer.style.display = 'flex';
    document.getElementById('startOverButton').style.display = 'none';
}

document.getElementById('viewFavoritesButton').addEventListener('click', function() {
    console.log("View favorites button clicked");
    viewFavorites();
});

function viewFavorites() {
    console.log("Viewing favorites");
    const favoritesContainer = document.getElementById('favoritesContainer');
    favoritesContainer.innerHTML = '';

    favorites.forEach(meme => {
        console.log("Displaying favorite meme:", meme);
        const memeContainer = document.createElement('div');
        memeContainer.className = 'meme-container';
        memeContainer.innerHTML = `
            <img src="${meme.template.blank}" class="meme-image">
            <div class="meme-caption top">${meme.topCaption || ''}</div>
            <div class="meme-caption bottom">${meme.bottomCaption || ''}</div>
        `;
        favoritesContainer.appendChild(memeContainer);
    });
}

document.getElementById('startOverButton').style.display = 'none';