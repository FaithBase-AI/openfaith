Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](speakership.md)

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

# Speakership

[# Example Request](#/apps/publishing/2024-03-25/vertices/speakership#example-request)

```
curl https://api.planningcenteronline.com/publishing/v2/episodes/{episode_id}/speakerships
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/publishing/v2/episodes/{episode_id}/speakerships)

[# Example Object](#/apps/publishing/2024-03-25/vertices/speakership#example-object)

```
{
  "type": "Speakership",
  "id": "1",
  "attributes": {},
  "relationships": {
    "speaker": {
      "data": {
        "type": "Speaker",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/publishing/2024-03-25/vertices/speakership#attributes)

Name

Type

Description

`id`

`primary_key`

[# Relationships](#/apps/publishing/2024-03-25/vertices/speakership#relationships)

Name

Type

Association Type

Note

speaker

(polymorphic)

to\_one

[# URL Parameters](#/apps/publishing/2024-03-25/vertices/speakership#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

speaker

include associated speaker

create and update

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

[# Endpoints](#/apps/publishing/2024-03-25/vertices/speakership#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/publishing/v2/episodes/{episode_id}/speakerships`

Copy

# Reading

HTTP Method

Endpoint

GET

`/publishing/v2/episodes/{episode_id}/speakerships/{id}`

Copy

[# Associations](#/apps/publishing/2024-03-25/vertices/speakership#associations)

# speaker

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/speakerships/{speakership_id}/speaker`

Copy

[Speaker](speaker.md)

[# Belongs To](#/apps/publishing/2024-03-25/vertices/speakership#belongs-to)

# Episode

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/publishing/v2/episodes/{episode_id}/speakerships`

Copy

[Episode](episode.md)