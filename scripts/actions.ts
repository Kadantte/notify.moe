import { Application } from "./Application"
import { AnimeNotifier } from "./AnimeNotifier"
import { Diff } from "./Diff"

// Search
export function search(arn: AnimeNotifier, search: HTMLInputElement, e: KeyboardEvent) {
	if(e.ctrlKey || e.altKey) {
		return
	}

	let term = search.value

	if(!window.location.pathname.startsWith("/search/")) {
		history.pushState("search", null, "/search/" + term)
	} else {
		history.replaceState("search", null, "/search/" + term)
	}

	if(!term) {
		arn.app.content.innerHTML = "No search term."
		return
	}

	var results = arn.app.find("results")

	if(!results) {
		results = document.createElement("div")
		results.id = "results"
		arn.app.content.innerHTML = ""
		arn.app.content.appendChild(results)
	}

	arn.app.get("/_/search/" + encodeURI(term))
	.then(html => {
		if(!search.value) {
			return
		}

		results.innerHTML = html
		arn.app.emit("DOMContentLoaded")
	})
}

// Add anime to collection
export function addAnimeToCollection(arn: AnimeNotifier, button: HTMLElement) {
	button.innerText = "Adding..."
	arn.loading(true)

	let {animeId, userId, userNick} = button.dataset

	fetch("/api/animelist/" + userId + "/add", {
		method: "POST",
		body: animeId,
		credentials: "same-origin"
	})
	.then(response => response.text())
	.then(body => {
		if(body !== "ok") {
			throw body
		}
		
		return fetch("/_" + arn.app.currentPath, {
			credentials: "same-origin"
		})
		.then(response => response.text())
		.then(html => Diff.update(arn.app.content, html))
	})
	.catch(console.error)
	.then(() => arn.loading(false))
}

// Remove anime from collection
export function removeAnimeFromCollection(arn: AnimeNotifier, button: HTMLElement) {
	button.innerText = "Removing..."
	arn.loading(true)

	let {animeId, userId, userNick} = button.dataset

	fetch("/api/animelist/" + userId + "/remove", {
		method: "POST",
		body: animeId,
		credentials: "same-origin"
	})
	.then(response => response.text())
	.then(body => {
		if(body !== "ok") {
			throw body
		}
		
		return arn.app.load("/+" + userNick + "/animelist")
	})
	.catch(console.error)
	.then(() => arn.loading(false))
}