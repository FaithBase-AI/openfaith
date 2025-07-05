Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

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

# Organization

[# Example Request](#/apps/publishing/2024-03-25/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2)

[# Example Object](#/apps/publishing/2024-03-25/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "name": "string",
    "subdomain": "string",
    "downloads_used": 1
  },
  "relationships": {}
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`subdomain`

`string`

`downloads_used`

`integer`

Only available when requested with the `?fields` param

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/{id}`

Copy

[# Associations](#/apps/publishing/2024-03-25/vertices/organization#associations)

# channels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels`

Copy

[Channel](channel.md)

# episodes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes`

Copy

[Episode](episode.md)

* `connected_to_services`
* `not_connected_to_services`
* `not_published_live`
* `published_live`
* `published_on_church_center`

# series

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/series`

Copy

[Series](series.md)

* `not_published`
* `published`

# speakers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/speakers`

Copy

[Speaker](speaker.md)