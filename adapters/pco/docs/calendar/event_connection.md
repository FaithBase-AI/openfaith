Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](event_connection.md)

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

# EventConnection

A connection between a Calendar event and a record in another product

[# Example Request](#/apps/calendar/2022-07-07/vertices/event_connection#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/events/{event_id}/event_connections
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/events/{event_id}/event_connections)

[# Example Object](#/apps/calendar/2022-07-07/vertices/event_connection#example-object)

```
{
  "type": "EventConnection",
  "id": "1",
  "attributes": {
    "connected_to_id": "primary_key",
    "connected_to_name": "string",
    "connected_to_type": "string",
    "product_name": "string",
    "connected_to_url": "string"
  },
  "relationships": {
    "event": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/event_connection#attributes)

Name

Type

Description

`id`

`primary_key`

`connected_to_id`

`primary_key`

Unique identifier for the connected record

`connected_to_name`

`string`

Name of the record that the event is connected to

`connected_to_type`

`string`

Currently we support `signup`, `group`, `event`, and `service_type`

`product_name`

`string`

Currently we support `registrations`, `groups`, `check-ins`, and `services`

`connected_to_url`

`string`

A link to the connected record

[# Relationships](#/apps/calendar/2022-07-07/vertices/event_connection#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/event_connection#url-parameters)

# Query By

Name

Parameter

Type

Description

Example

product\_name

where[product\_name]

string

Query on a specific product\_name

`?where[product_name]=string`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/event_connection#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/events/{event_id}/event_connections`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/events/{event_id}/event_connections/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/events/{event_id}/event_connections`

Copy

* connected\_to\_id
* connected\_to\_name
* connected\_to\_type
* product\_name

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/events/{event_id}/event_connections/{id}`

Copy

* connected\_to\_id
* connected\_to\_name
* connected\_to\_type
* product\_name

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/events/{event_id}/event_connections/{id}`

Copy

[# Belongs To](#/apps/calendar/2022-07-07/vertices/event_connection#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/event_connections`

Copy

[Event](event.md)