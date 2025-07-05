Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](feed.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)

2022-07-07

Info

[Attachment](attachment.md)

[Conflict](conflict.md)

[Event](event.md)

[EventConnection](event_connection.md)

[EventInstance](event_instance.md)

[EventResourceAnswer](event_resource_answer.md)

[EventResourceRequest](event_resource_request.md)

[EventTime](event_time.md)

[Feed](feed.md)

[JobStatus](job_status.md)

[Organization](organization.md)

[Person](person.md)

[ReportTemplate](report_template.md)

[RequiredApproval](required_approval.md)

[Resource](resource.md)

[ResourceApprovalGroup](resource_approval_group.md)

[ResourceBooking](resource_booking.md)

[ResourceFolder](resource_folder.md)

[ResourceQuestion](resource_question.md)

[ResourceSuggestion](resource_suggestion.md)

[RoomSetup](room_setup.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Feed

A feed belonging to an organization.

[# Example Request](#/apps/calendar/2022-07-07/vertices/feed#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/feeds
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/feeds)

[# Example Object](#/apps/calendar/2022-07-07/vertices/feed#example-object)

```
{
  "type": "Feed",
  "id": "1",
  "attributes": {
    "can_delete": true,
    "default_church_center_visibility": "value",
    "feed_type": "value",
    "imported_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "deleting": true,
    "sync_campus_tags": true,
    "source_id": "primary_key"
  },
  "relationships": {
    "event_owner": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/feed#attributes)

Name

Type

Description

`id`

`primary_key`

`can_delete`

`boolean`

`default_church_center_visibility`

`string`

Possible values: `hidden` or `published`

`feed_type`

`string`

Possible values: `registrations`, `groups`, `ical`, or `form`

`imported_at`

`date_time`

`name`

`string`

`deleting`

`boolean`

`sync_campus_tags`

`boolean`

Only available when requested with the `?fields` param

`source_id`

`primary_key`

[# Relationships](#/apps/calendar/2022-07-07/vertices/feed#relationships)

Name

Type

Association Type

Note

event\_owner

Person

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/feed#url-parameters)

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

feed\_type

where[feed\_type]

string

Query on a specific feed\_type

Possible values: `registrations`, `groups`, `ical`, or `form`

`?where[feed_type]=value`

source\_id

where[source\_id]

primary\_key

Query on a specific source\_id

`?where[source_id]=primary_key`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/feed#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/feeds`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/feeds/{id}`

Copy

[# Belongs To](#/apps/calendar/2022-07-07/vertices/feed#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/feed`

Copy

[Event](event.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/feeds`

Copy

[Organization](organization.md)