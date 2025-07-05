Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](channel_default_episode_resource.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)

2024-03-25

Info

[Channel](channel.md)

[ChannelDefaultEpisodeResource](channel_default_episode_resource.md)

[ChannelDefaultTime](channel_default_time.md)

[ChannelNextTime](channel_next_time.md)

[Episode](episode.md)

[EpisodeResource](episode_resource.md)

[EpisodeStatistics](episode_statistics.md)

[EpisodeTime](episode_time.md)

[NoteTemplate](note_template.md)

[Organization](organization.md)

[Series](series.md)

[Speaker](speaker.md)

[Speakership](speakership.md)

[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# ChannelDefaultEpisodeResource

The default EpisodeResources for a Channel

[# Example Request](#/apps/publishing/2024-03-25/vertices/channel_default_episode_resource#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/channels/{channel_id}/channel_default_episode_resources
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/channels/{channel_id}/channel_default_episode_resources)

[# Example Object](#/apps/publishing/2024-03-25/vertices/channel_default_episode_resource#example-object)

```
{
  "type": "ChannelDefaultEpisodeResource",
  "id": "1",
  "attributes": {
    "featured": true,
    "icon": "string",
    "kind": "string",
    "position": 1,
    "title": "string",
    "type": "string",
    "url": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/channel_default_episode_resource#attributes)

Name

Type

Description

`id`

`primary_key`

`featured`

`boolean`

`icon`

`string`

`kind`

`string`

Possible values: `giving_fund`, `people_form`, `generic_url`, `services_public_page`

`position`

`integer`

`title`

`string`

`type`

`string`

`url`

`string`

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/channel_default_episode_resource#url-parameters)

# Pagination

Name

Parameter

Type

Description

per\_page

per\_page

integer

how many records to return per page (min=1, max=100, default=25)

offset

offset

integer

get results from given offset

[# Endpoints](#/apps/publishing/2024-03-25/vertices/channel_default_episode_resource#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/channels/{channel_id}/channel_default_episode_resources`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/channels/{channel_id}/channel_default_episode_resources/{id}`

Copy

[# Belongs To](#/apps/publishing/2024-03-25/vertices/channel_default_episode_resource#belongs-to)

# Channel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/channel_default_episode_resources`

Copy

[Channel](channel.md)