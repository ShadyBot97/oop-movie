//the API documentation site https://developers.themoviedb.org/3/

class App {
    static async run() {

        //Get Homepage Movies
        const movies = await APIService.fetchMovies(true)
        HomePage.renderMovies(movies);

        //Get Header Genres
        const HeaderMenuGenreList = await APIService.fetchHeaderGenreList();

    }
}

class APIService {
    static TMDB_BASE_URL = 'https://api.themoviedb.org/3';
    static async fetchMovies(discover = false, genre_id = 0) {

        let url = APIService._constructUrl(`movie/now_playing`)

        if(discover && genre_id !== 0) {
             url = 'https://api.themoviedb.org/3/discover/movie?api_key=542003918769df50083a13c415bbc602&with_genres=' +  genre_id;
        }

        const response = await fetch(url)
        const data = await response.json()
        return data.results.map(movie => new Movie(movie))
    }
    static async fetchMovie(movieId) {
        const url = APIService._constructUrl(`movie/${movieId}`)
        const response = await fetch(url)
        const data = await response.json()
        return new Movie(data)
    }

    static async fetchHeaderGenreList() {
        const url = APIService._constructUrl(`genre/movie/list`);
        const response = await fetch(url);
        const data = await response.json();
        const genre = new Genre();
        return await genre.renderHeaderGenreDropdown(data.genres);
    }
    static async fetchCast(movieId) {
        const url = APIService._constructUrl(`/movie/${movieId}/credits`);
        const response = await fetch(url);
        const data = await response.json();
        return data.cast;
    }

    static _constructUrl(path) {
        return `${this.TMDB_BASE_URL}/${path}?api_key=${atob('NTQyMDAzOTE4NzY5ZGY1MDA4M2ExM2M0MTViYmM2MDI=')}`;
    }
}

class HomePage {
    static container = document.getElementById('container');
    static renderMovies(movies) {
        this.container.innerHTML = "";
        movies.forEach(movie => {
            const movieDiv = document.createElement("div");
            const movieImage = document.createElement("img");
            movieImage.src = `${movie.backdropUrl}`;
            const movieTitle = document.createElement("h3");
            movieTitle.textContent = `${movie.title}`;
            movieImage.addEventListener("click", function() {
                Movies.run(movie);
            });

            movieDiv.appendChild(movieTitle);
            movieDiv.appendChild(movieImage);
            this.container.appendChild(movieDiv);
        })
    }
}


class Movies {
    static async run(movie) {
        const movieData = await APIService.fetchMovie(movie.id)
        movieData.cast = await APIService.fetchCast(movie.id);
        MoviePage.renderMovieSection(movieData);


    }
}

class MoviePage {
    static container = document.getElementById('container');
    static renderMovieSection(movie) {
        MovieSection.renderMovie(movie);
    }
}

class MovieSection {
    static renderMovie(movie) {

        let castHTML = "";

        if(movie.cast.length > 0) {
           let counter = 0;

           for (let i = 0; i <= movie.cast.length; i++) {
               if(counter >= 5) {
                   break;
               }

               if(i === 4) {
                   castHTML = castHTML + movie.cast[i].name;
               } else {
                   castHTML = castHTML + movie.cast[i].name + ', ';
               }

               counter++;
           }

        }

        MoviePage.container.innerHTML = `
      <div class="row">
        <div class="col-md-4">
          <img id="movie-backdrop" src=${movie.backdropUrl}> 
        </div>
        <div class="col-md-8">
          <h2 id="movie-title">${movie.title}</h2>
          <p id="genres">${movie.genres}</p>
          <p id="movie-release-date">${movie.releaseDate}</p>
          <p id="movie-runtime">${movie.runtime}</p>
          <h3>Overview:</h3>
          <p id="movie-overview">${movie.overview}</p>
        </div>
      </div>
      <h3>Actors:</h3>
      <p>${castHTML}</p>
    `;
    }
}

class Movie {
    static BACKDROP_BASE_URL = 'http://image.tmdb.org/t/p/w780';
    constructor(json) {

        this.id = json.id;
        this.title = json.title;
        this.releaseDate = json.release_date;
        this.runtime = json.runtime + " minutes";
        this.overview = json.overview;
        this.backdropPath = json.backdrop_path;
        this.cast = json.cast;
    }


    get backdropUrl() {
        return this.backdropPath ? Movie.BACKDROP_BASE_URL + this.backdropPath : "";
    }
}

class Genre {

    async renderHeaderGenreDropdown(genreList = []) {

        let menuId = document.getElementById('genre-menu');

        genreList.forEach(function (genre) {
            let li = document.createElement('li');
            let a = document.createElement('a');
            a.innerText = genre.name;
            a.classList.add('dropdown-item');
            a.href = '#';
            a.onclick = async function () {


                const movies = await APIService.fetchMovies(true, genre.id)

                HomePage.renderMovies(movies);
            };
            li.append(a);

            menuId.append(li);
        });



    }
}

document.addEventListener("DOMContentLoaded", App.run);
