'use strict'

let chalk = require('chalk')

const animePageCacheTime = 120 * 60 * 1000

let updateAllAnimePages = () => {
	console.log(chalk.yellow('✖'), 'Updating all anime pages...')

	let now = new Date()

	return arn.forEach('Anime', anime => {
		if(anime.pageGenerated && now.getTime() - (new Date(anime.pageGenerated)).getTime() < animePageCacheTime)
			return

		arn.cacheLimiter.removeTokens(1, () => {
			arn.updateAnimePage(anime)
		})
	})
}

arn.repeatedly(3 * 60 * 60, updateAllAnimePages)