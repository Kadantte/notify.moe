package commands

import (
	"github.com/bwmarrin/discordgo"
)

// Source shows the link for the Discord bot's source code.
func Source(s *discordgo.Session, msg *discordgo.MessageCreate) bool {
	if msg.Content != "!source" {
		return false
	}

	s.ChannelMessageSend(msg.ChannelID, msg.Author.Mention()+" B-baaaaaaaka! Y..you...you want to...TOUCH MY CODE?!\n\nhttps://github.com/animenotifier/notify.moe/tree/go/bots/discord")
	return true
}
