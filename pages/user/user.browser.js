var weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

window.getWeekDay = function(timeStamp) {
	var date = new Date(timeStamp * 1000);
	return weekDays[date.getDay()];
};

window.loadAnimeList = function() {
	var animeList = document.getElementById('animeList');

	// Loading animation
	animeList.innerHTML =
		'<div class="sk-folding-cube">' +
			'<div class="sk-cube1 sk-cube"></div>' +
			'<div class="sk-cube2 sk-cube"></div>' +
			'<div class="sk-cube4 sk-cube"></div>' +
			'<div class="sk-cube3 sk-cube"></div>' +
		'</div>';

	var userName = window.location.pathname.substring(2);

	kaze.getJSON('/api/animelist/' + userName).then(function(response) {
		if(response && response.error) {
			animeList.innerText = 'Error loading your anime list: ' + response.error;
			return;
		}

		if(!response.watching) {
			animeList.innerText = 'There are no anime your watching list.';
			return;
		}

		animeList.innerHTML = '';

		var list = document.createElement('ul');
		list.className = 'anime-list';

		var loggedIn = animeList.dataset.logged === 'true';

		response.watching.forEach(function(anime) {
			var item = document.createElement('li');
			item.className = 'anime';

			var link = document.createElement('a');
			link.appendChild(document.createTextNode(anime.title.romaji));

			if(anime.id) {
				link.href = '/anime/' + anime.id;
				link.className = 'anime-title ajax';
			} else {
				link.href = anime.url;
				link.target = '_blank';
				link.className = 'anime-title';
			}

			item.appendChild(link);

			var addIconLink = function(iconName, url, linkClass, tooltip) {
				var link = document.createElement(url ? 'a' : 'div');

				if(url) {
					link.href = url;
					link.target = '_blank';
				}

				link.className = linkClass;
				link.title = tooltip;

				var icon = document.createElement('i');
				icon.className = 'fa fa-' + iconName + ' anime-status-icon';
				link.appendChild(icon);

				item.appendChild(link);
			};

			var addAiringDate = function() {
				if(anime.airingDate.remaining === null)
					return;

				var airingDate = document.createElement('span');
				airingDate.className = 'airing-date';
				airingDate.appendChild(document.createTextNode((anime.airingDate.remaining > 0 ? 'Airing in ' : 'Aired ') + anime.airingDate.remainingString));
				airingDate.title = window.getWeekDay(anime.airingDate.timeStamp);
				item.appendChild(airingDate);
			};

			if(loggedIn) {
				if(anime.episodes.watched > 0 && anime.episodes.watched === anime.episodes.max) {
					addIconLink(
						'check-circle',
						response.listUrl,
						'anime-completed',
						'You completed this anime.'
					);
				} else if(anime.episodes.available >= anime.episodes.next && anime.animeProvider.nextEpisode) {
					var isDownload = (anime.animeProvider.type === undefined || anime.animeProvider.type === 'download');

					addIconLink(
						isDownload ? 'cloud-download' : 'eye',
						anime.animeProvider.nextEpisode.url,
						'anime-download-link',
						(isDownload ? 'Download' : 'Watch') + ' episode ' + anime.episodes.next
					);

					var behind = (anime.episodes.available - anime.episodes.watched);
					var episodes = document.createElement('span');
					episodes.className = 'episodes-behind';
					episodes.appendChild(document.createTextNode(behind + ' new episode' + (behind === 1 ? '' : 's')));
					item.appendChild(episodes);
				} else if(anime.episodes.available > 0 && anime.episodes.available === anime.episodes.watched) {
					addIconLink(
						'check',
						anime.animeProvider.nextEpisode ? anime.animeProvider.nextEpisode.url : anime.animeProvider.url,
						'anime-up-to-date',
						'You watched ' + anime.episodes.watched + ' out of ' + anime.episodes.available + ' available.'
					);

					addAiringDate();
				} else if(anime.episodes.available === 0) {
					addIconLink(
						'exclamation-circle',
						anime.animeProvider.url,
						'anime-warning',
						'Could not find your anime title on the anime provider.'
					);

					addAiringDate();
				}
			}

			list.appendChild(item);
		});

		animeList.appendChild(list);
		kaze.ajaxifyLinks();
	}).catch(function(error) {
		animeList.innerText = 'Error: ' + error;
	});
};

window.loadAnimeList();