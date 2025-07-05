Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](channel.md)

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

# Channel

A collection of sermons

[# Example Request](#/apps/publishing/2024-03-25/vertices/channel#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/channels
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/channels)

[# Example Object](#/apps/publishing/2024-03-25/vertices/channel#example-object)

```
{
  "type": "Channel",
  "id": "1",
  "attributes": {
    "art": {},
    "podcast_art": {},
    "podcast_settings": {},
    "activate_episode_minutes_before": 1,
    "can_enable_chat": true,
    "church_center_url": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "default_video_embed_code": "string",
    "description": "string",
    "url": "string",
    "default_video_duration": 1,
    "default_video_url": "string",
    "enable_audio": true,
    "enable_on_demand_video": true,
    "enable_watch_live": true,
    "general_chat_enabled": true,
    "group_chat_enabled": true,
    "name": "string",
    "podcast_feed_url": "string",
    "position": 1,
    "published": true,
    "sermon_notes_enabled": true,
    "services_service_type_remote_identifier": "string",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/channel#attributes)

Name

Type

Description

`id`

`primary_key`

`art`

`hash`

`podcast_art`

`hash`

`podcast_settings`

`hash`

`activate_episode_minutes_before`

`integer`

The activation time for an episode, expressed in minutes before its start

`can_enable_chat`

`boolean`

`church_center_url`

`string`

`created_at`

`date_time`

`default_video_embed_code`

`string`

`description`

`string`

`url`

`string`

`default_video_duration`

`integer`

`default_video_url`

`string`

`enable_audio`

`boolean`

`enable_on_demand_video`

`boolean`

`enable_watch_live`

`boolean`

`general_chat_enabled`

`boolean`

`group_chat_enabled`

`boolean`

`name`

`string`

`podcast_feed_url`

`string`

`position`

`integer`

`published`

`boolean`

`sermon_notes_enabled`

`boolean`

`services_service_type_remote_identifier`

`string`

The id for the associated Services Service Type (https://developer.planning.center/docs/#/apps/services/2018-08-01/vertices/service\_type)

`updated_at`

`date_time`

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/channel#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

channel\_default\_episode\_resources

include associated channel\_default\_episode\_resources

create and update

include

channel\_default\_times

include associated channel\_default\_times

create and update

include

current\_episode

include associated current\_episode

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

order

position

string

prefix with a hyphen (-position) to reverse the order

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/channel#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/channels`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/channels/{id}`

Copy

[# Associations](#/apps/publishing/2024-03-25/vertices/channel#associations)

# channel\_default\_episode\_resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/channel_default_episode_resources`

Copy

[ChannelDefaultEpisodeResource](channel_default_episode_resource.md)

# channel\_default\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/channel_default_times`

Copy

[ChannelDefaultTime](channel_default_time.md)

# current\_episode

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/current_episode`

Copy

[Episode](episode.md)

# episodes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/episodes`

Copy

[Episode](episode.md)

* `connected_to_services`
* `not_connected_to_services`
* `not_published`
* `published`

# next\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/next_times`

Copy

[ChannelNextTime](channel_next_time.md)

# series

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/series`

Copy

[Series](series.md)

# statistics

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/channels/{channel_id}/statistics`

Copy

[EpisodeStatistics](episode_statistics.md)

[# Belongs To](#/apps/publishing/2024-03-25/vertices/channel#belongs-to)

# Episode

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/channel`

Copy

[Episode](episode.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/channels`

Copy

[Organization](organization.md)

# Series

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/series/{series_id}/channel`

Copy

[Series](series.md)