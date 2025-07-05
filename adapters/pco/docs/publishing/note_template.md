Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](note_template.md)

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

# NoteTemplate

[# Example Request](#/apps/publishing/2024-03-25/vertices/note_template#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/episodes/{episode_id}/note_template
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/episodes/{episode_id}/note_template)

[# Example Object](#/apps/publishing/2024-03-25/vertices/note_template#example-object)

```
{
  "type": "NoteTemplate",
  "id": "1",
  "attributes": {
    "enabled": true,
    "template": "string",
    "auto_create_free_form_notes": true,
    "published_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/note_template#attributes)

Name

Type

Description

`id`

`primary_key`

`enabled`

`boolean`

`template`

`string`

`auto_create_free_form_notes`

`boolean`

`published_at`

`date_time`

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/note_template#url-parameters)

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/note_template#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/episodes/{episode_id}/note_template`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/episodes/{episode_id}/note_template/{id}`

Copy

[# Belongs To](#/apps/publishing/2024-03-25/vertices/note_template#belongs-to)

# Episode

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/note_template`

Copy

[Episode](episode.md)