Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](channel_next_time.md)

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

# ChannelNextTime

The next default time for a channel

[# Example Request](#/apps/publishing/2024-03-25/vertices/channel_next_time#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/channels/{channel_id}/next_times
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/channels/{channel_id}/next_times)

[# Example Object](#/apps/publishing/2024-03-25/vertices/channel_next_time#example-object)

```
{
  "type": "ChannelNextTime",
  "id": "1",
  "attributes": {
    "starts_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/channel_next_time#attributes)

Name

Type

Description

`id`

`primary_key`

`starts_at`

`date_time`

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/channel_next_time#url-parameters)

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/channel_next_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/channels/{channel_id}/next_times`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/channels/{channel_id}/next_times/{id}`

Copy

[# Belongs To](#/apps/publishing/2024-03-25/vertices/channel_next_time#belongs-to)

# Channel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/next_times`

Copy

[Channel](channel.md)