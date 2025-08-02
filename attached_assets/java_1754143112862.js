const movies = [
    {
        title: "Avatar",
        description: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.",
        poster_path: "/jRXYjXNq0Cs2TcJjLkki24MLp7u.jpg"
    },
    {
        title: "Joker",
        description: "During the 1980s, a failed stand-up comedian is driven insane and turns to a life of crime and chaos in Gotham City while becoming an infamous psychopathic crime figure.",
        poster_path: "/udDclJoHjfjb8Ekgsd4FDteOkCU.jpg"
    },
    {
        title: "Fight Club",
        description: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy. Their concept catches on, with underground 'fight clubs' forming in every town, until an eccentric gets in the way and ignites an out-of-control spiral toward oblivion.",
        poster_path: "/a26cQPRhJPX6GbWfQbvZdrrp9j9.jpg"
    },
    {
        title: "F1",
        description: "Racing legend Sonny Hayes is coaxed out of retirement to lead a struggling Formula 1 team—and mentor a young hotshot driver—while chasing one more chance at glory.",
        poster_path: "/9PXZIUsSDh4alB80jheWX4fhZmy.jpg"
    },
    {
        title: "Megan 2.0",
        description: "After the underlying tech for M3GAN is stolen and misused by a powerful defense contractor to create a military-grade weapon known as Amelia, M3GAN's creator Gemma realizes that the only option is to resurrect M3GAN and give her a few upgrades, making her faster, stronger, and more lethal.",
        poster_path: "/oekamLQrwlJjRNmfaBE4llIvkir.jpg"
    },
    {
        title: "Avengers: Endgame",
        description: "After the devastating events of Avengers: Infinity War, the universe is in ruins due to the efforts of the Mad Titan, Thanos. With the help of remaining allies, the Avengers must assemble once more in order to undo Thanos' actions and restore order to the universe once and for all, no matter what consequences may be in store.",
        poster_path: "/bR8ISy1O9XQxqiy0fQFw2BX72RQ.jpg"
    }
];

function getSavedReview(index) {
    return JSON.parse(localStorage.getItem('review_' + index)) || {rating: 0, text: ""};
}

function renderMovies() {
    const row = document.querySelector('.row');
    row.innerHTML = "";
    movies.forEach((movie, i) => {
        row.innerHTML += `
            <div class="col-md-3 mb-4">
                <div class="poster-card">
                    <img src="https://image.tmdb.org/t/p/w500${movie.poster_path}" 
                         class="img-fluid movie-poster" 
                         alt="Movie poster"
                         data-index="${i}">
                </div>
            </div>
        `;
    });

    document.querySelectorAll('.movie-poster').forEach(img => {
        img.onclick = function() {
            const index = this.getAttribute('data-index');
            const movie = movies[index];
            // Pretvori naslov u ime fajla (npr. "Joker" -> "joker.html")
            const fileName = movie.title.toLowerCase().replace(/[^a-z0-9]+/g, "_") + ".html";
            window.location.href = fileName;
        };
    });
}
renderMovies();


