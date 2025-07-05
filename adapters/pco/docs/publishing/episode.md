Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](episode.md)

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

# Episode

[# Example Request](#/apps/publishing/2024-03-25/vertices/episode#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/episodes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/episodes)

[# Example Object](#/apps/publishing/2024-03-25/vertices/episode#example-object)

```
{
  "type": "Episode",
  "id": "1",
  "attributes": {
    "art": {},
    "church_center_url": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "library_audio_url": "string",
    "library_streaming_service": "value",
    "library_video_embed_code": "unknown",
    "library_video_thumbnail_url": "string",
    "library_video_url": "string",
    "needs_library_audio_or_video_url": true,
    "needs_video_url": true,
    "page_actions": [],
    "published_live_at": "2000-01-01T12:00:00Z",
    "published_to_library_at": "2000-01-01T12:00:00Z",
    "sermon_audio": {},
    "stream_type": "value",
    "streaming_service": "value",
    "title": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "video_thumbnail_url": "string",
    "video_embed_code": "unknown",
    "video_url": "string",
    "services_plan_remote_identifier": "string",
    "services_service_type_remote_identifier": "string"
  },
  "relationships": {
    "series": {
      "data": {
        "type": "Series",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/episode#attributes)

Name

Type

Description

`id`

`primary_key`

`art`

`hash`

`church_center_url`

`string`

`created_at`

`date_time`

`description`

`string`

`library_audio_url`

`string`

`library_streaming_service`

`string`

Possible values: `vimeo`, `youtube`, `livestream_com`, `resi`, `facebook`, or `boxcast`

`library_video_embed_code`

`unknown`

`library_video_thumbnail_url`

`string`

`library_video_url`

`string`

`needs_library_audio_or_video_url`

`boolean`

`needs_video_url`

`boolean`

`page_actions`

`array`

`published_live_at`

`date_time`

`published_to_library_at`

`date_time`

`sermon_audio`

`hash`

`stream_type`

`string`

Possible values: `channel_default_livestream`, `livestream`, or `prerecorded`

`streaming_service`

`string`

Possible values: `vimeo`, `youtube`, `livestream_com`, `resi`, `facebook`, or `boxcast`

`title`

`string`

`updated_at`

`date_time`

`video_thumbnail_url`

`string`

`video_embed_code`

`unknown`

`video_url`

`string`

`services_plan_remote_identifier`

`string`

The id for the associated Services Plan
(https://developer.planning.center/docs/#/apps/services/2018-08-01/vertices/plan)

`services_service_type_remote_identifier`

`string`

The id for the associated Services Service Type
(https://developer.planning.center/docs/#/apps/services/2018-08-01/vertices/service\_type)

[# Relationships](#/apps/publishing/2024-03-25/vertices/episode#relationships)

Name

Type

Association Type

Note

series

Series

to\_one

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/episode#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

channel

include associated channel

create and update

include

episode\_resources

include associated episode\_resources

create and update

include

episode\_times

include associated episode\_times

create and update

include

series

include associated series

create and update

include

speakerships

include associated speakerships

create and update

# Order By

Parameter

Value

Type

Description

order

published\_live\_at

string

prefix with a hyphen (-published\_live\_at) to reverse the order

order

published\_to\_library\_at

string

prefix with a hyphen (-published\_to\_library\_at) to reverse the order

order

stream\_type

string

prefix with a hyphen (-stream\_type) to reverse the order

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

series\_id

where[series\_id]

integer

Query on a related series

`?where[series_id]=1`

services\_plan\_remote\_identifier

where[services\_plan\_remote\_identifier]

string

Query on a specific services\_plan\_remote\_identifier

`?where[services_plan_remote_identifier]=string`

services\_service\_type\_remote\_identifier

where[services\_service\_type\_remote\_identifier]

string

Query on a specific services\_service\_type\_remote\_identifier

`?where[services_service_type_remote_identifier]=string`

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/episode#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/episodes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/episodes/{id}`

Copy

[# Associations](#/apps/publishing/2024-03-25/vertices/episode#associations)

# channel

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/channel`

Copy

[Channel](channel.md)

# episode\_resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/episode_resources`

Copy

[EpisodeResource](episode_resource.md)

# episode\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/episode_times`

Copy

[EpisodeTime](episode_time.md)

# note\_template

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/note_template`

Copy

[NoteTemplate](note_template.md)

# series

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/series`

Copy

[Series](series.md)

# speakerships

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/speakerships`

Copy

[Speakership](speakership.md)

[# Belongs To](#/apps/publishing/2024-03-25/vertices/episode#belongs-to)

# Channel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/current_episode`

Copy

[Channel](channel.md)

# Channel

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/episodes`

Copy

[Channel](channel.md)

* `connected_to_services`
* `not_connected_to_services`
* `not_published`
* `published`

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/episodes`

Copy

[Organization](organization.md)

* `connected_to_services`
* `not_connected_to_services`
* `not_published_live`
* `published_live`
* `published_on_church_center`