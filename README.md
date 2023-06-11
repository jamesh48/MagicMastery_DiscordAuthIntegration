# MagicMastery_DiscordAuthIntegration

### Env Variables

- For deployment, create a file called `.env.prd` in the root of this repository with the following variables, it should be gitignored.
- To test locally, create a file called `.env` in the root of this repository with the same variables, it should also be gitignored. You can have both files present- when running locally, it will source from `.env` and when deploying it will source from `.env.prd`.

###### AWS Env Variables

`ACM_CERTIFICATE_ARN=<AWS ARN for Certificate>`

###### Active Campaign Env Variables

`ACTIVE_CAMPAIGN_API_TOKEN=<Find in Active Campaign Settings Panel>`
`ACTIVE_CAMPAIGN_BASEURL=<Active Campaign api url, ending with /api/3>`

###### Discord Env Variables- James owns the Bot.

`DISCORD_BOT_TOKEN=<Bot Token in https://discord.com/developers/applications/1105977548342571008/bot>`

###### App Specific Environment Variables

`MM_AUTH_URL=https://magicmastery-auth.com`
`EXPRESS_SERVER_PORT=3000`
