Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](series.md)

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

# Series

[# Example Request](#/apps/publishing/2024-03-25/vertices/series#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/series
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/series)

[# Example Object](#/apps/publishing/2024-03-25/vertices/series#example-object)

```
{
  "type": "Series",
  "id": "1",
  "attributes": {
    "art": {},
    "church_center_url": "string",
    "description": "string",
    "ended_at": "2000-01-01T12:00:00Z",
    "episodes_count": 1,
    "published": true,
    "started_at": "2000-01-01T12:00:00Z",
    "title": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/series#attributes)

Name

Type

Description

`id`

`primary_key`

`art`

`hash`

`church_center_url`

`string`

`description`

`string`

`ended_at`

`date_time`

`episodes_count`

`integer`

`published`

`boolean`

`started_at`

`date_time`

`title`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/series#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

channel

include associated channel

# Order By

Parameter

Value

Type

Description

order

ended\_at

string

prefix with a hyphen (-ended\_at) to reverse the order

order

episodes\_count

string

prefix with a hyphen (-episodes\_count) to reverse the order

order

started\_at

string

prefix with a hyphen (-started\_at) to reverse the order

order

title

string

prefix with a hyphen (-title) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/series#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/series`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/series/{id}`

Copy

[# Associations](#/apps/publishing/2024-03-25/vertices/series#associations)

# channel

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/series/{series_id}/channel`

Copy

[Channel](channel.md)

[# Belongs To](#/apps/publishing/2024-03-25/vertices/series#belongs-to)

# Channel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/series`

Copy

[Channel](channel.md)

# Episode

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/series`

Copy

[Episode](episode.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/series`

Copy

[Organization](organization.md)

* `not_published`
* `published`