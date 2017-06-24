import { Application } from "./Application"
import { Diff } from "./Diff"
import { findAll } from "./utils"
import * as actions from "./actions"

export class AnimeNotifier {
	app: Application
	visibilityObserver: IntersectionObserver

	constructor(app: Application) {
		this.app = app

		if("IntersectionObserver" in window) {
			// Enable lazy load
			this.visibilityObserver = new IntersectionObserver(
				entries => {
					for(let entry of entries) {
						if(entry.intersectionRatio > 0) {
							entry.target["became visible"]()
							this.visibilityObserver.unobserve(entry.target)
						}
					}
				},
				{}
			)
		} else {
			// Disable lazy load feature
			this.visibilityObserver = {
				disconnect: () => {},
				observe: (elem: HTMLElement) => {
					elem["became visible"]()
				},
				unobserve: (elem: HTMLElement) => {}
			} as IntersectionObserver
		}
	}

	onReadyStateChange() {
		if(document.readyState !== "interactive") {
			return
		}

		this.run()
	}

	run() {
		this.app.content = this.app.find("content")
		this.app.loading = this.app.find("loading")
		this.app.run()
	}

	onContentLoaded() {
		this.visibilityObserver.disconnect()
		
		// Update each of these asynchronously
		Promise.resolve().then(() => this.updateMountables())
		Promise.resolve().then(() => this.updateActions())
		Promise.resolve().then(() => this.lazyLoadImages())
	}

	reloadContent() {
		return fetch("/_" + this.app.currentPath, {
			credentials: "same-origin"
		})
		.then(response => response.text())
		.then(html => Diff.innerHTML(this.app.content, html))
		.then(() => this.app.emit("DOMContentLoaded"))
	}

	loading(isLoading: boolean) {
		if(isLoading) {
			this.app.loading.classList.remove(this.app.fadeOutClass)
		} else {
			this.app.loading.classList.add(this.app.fadeOutClass)
		}
	}
	
	updateActions() {
		for(let element of findAll("action")) {
			if(element["action assigned"]) {
				continue
			}

			let actionName = element.dataset.action

			element.addEventListener(element.dataset.trigger, e => {
				actions[actionName](this, element, e)
			})

			element["action assigned"] = true
		}
	}

	lazyLoadImages() {
		for(let element of findAll("user-image")) {
			this.lazyLoadImage(element as HTMLImageElement)
		}

		for(let element of findAll("anime-cover-image")) {
			this.lazyLoadImage(element as HTMLImageElement)
		}
	}

	lazyLoadImage(img: HTMLImageElement) {
		// Prevent browser from loading it instantly
		img["original source"] = img.src
		img.src = ""

		// Once the image becomes visible, load it
		img["became visible"] = () => {
			img.src = img["original source"]

			if(img.naturalWidth === 0) {
				img.onload = function() {
					this.classList.add("user-image-found")
				}

				img.onerror = function() {
					this.classList.add("user-image-not-found")
				}
			} else {
				img.classList.add("user-image-found")
			}
		}

		this.visibilityObserver.observe(img)
	}

	updateMountables() {
		const delay = 20
		const maxDelay = 1000
		
		let time = 0

		for(let element of findAll("mountable")) {
			setTimeout(() => {
				window.requestAnimationFrame(() => element.classList.add("mounted"))
			}, time)

			time += delay

			if(time > maxDelay) {
				time = maxDelay
			}
		}
	}

	onPopState(e: PopStateEvent) {
		if(e.state) {
			this.app.load(e.state, {
				addToHistory: false
			})
		} else if(this.app.currentPath !== this.app.originalPath) {
			this.app.load(this.app.originalPath, {
				addToHistory: false
			})
		}
	}

	onKeyDown(e: KeyboardEvent) {
		// F = Search
		if(e.keyCode == 70) {
			let search = this.app.find("search") as HTMLInputElement

			search.focus()
			search.select()

			e.preventDefault()
			e.stopPropagation()
		}
	}

	// onResize(e: UIEvent) {
	// 	let hasScrollbar = this.app.content.clientHeight === this.app.content.scrollHeight

	// 	if(hasScrollbar) {
	// 		this.app.content.classList.add("has-scrollbar")
	// 	} else {
	// 		this.app.content.classList.remove("has-scrollbar")
	// 	}
	// }
}