Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](room_setup.md)

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

# RoomSetup

A diagram and list of suggested resources useful for predefined room setups.

[# Example Request](#/apps/calendar/2022-07-07/vertices/room_setup#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/room_setups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/room_setups)

[# Example Object](#/apps/calendar/2022-07-07/vertices/room_setup#example-object)

```
{
  "type": "RoomSetup",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "diagram": "string",
    "diagram_url": "string",
    "diagram_thumbnail_url": "string"
  },
  "relationships": {
    "room_setup": {
      "data": {
        "type": "RoomSetup",
        "id": "1"
      }
    },
    "resource_suggestions": {
      "data": [
        {
          "type": "ResourceSuggestion",
          "id": "1"
        }
      ]
    },
    "containing_resource": {
      "data": {
        "type": "Resource",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/room_setup#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the room setup

`created_at`

`date_time`

UTC time at which the room setup was created

`name`

`string`

The name of the room setup

`updated_at`

`date_time`

UTC time at which the room setup was updated

`description`

`string`

A description of the room setup

`diagram`

`string`

An object containing `url` and `thumbnail`.

`url` is path to where room setup is stored.
`thumbnail` contains `url` path to where thumbnail is stored.

`diagram_url`

`string`

Path to where room setup is stored

`diagram_thumbnail_url`

`string`

Path to where thumbnail version of room setup is stored

[# Relationships](#/apps/calendar/2022-07-07/vertices/room_setup#relationships)

Name

Type

Association Type

Note

room\_setup

RoomSetup

to\_one

The shared room setup this is linked to

resource\_suggestions

ResourceSuggestion

to\_many

A list of suggested resources for this room setup

containing\_resource

Resource

to\_one

The resource this room setup is attached to

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/room_setup#url-parameters)

# Can Include

Parameter

Value

Description

include

containing\_resource

include associated containing\_resource

include

resource\_suggestions

include associated resource\_suggestions

# Order By

Parameter

Value

Type

Description

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

name

where[name]

string

Query on a specific name

`?where[name]=string`

updated\_at

where[updated\_at]

date\_time

Query on a specific updated\_at

`?where[updated_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/room_setup#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/room_setups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/room_setups/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/room_setup#associations)

# containing\_resource

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/room_setups/{room_setup_id}/containing_resource`

Copy

[Resource](resource.md)

# resource\_suggestions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/room_setups/{room_setup_id}/resource_suggestions`

Copy

[ResourceSuggestion](resource_suggestion.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/room_setup#belongs-to)

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/room_setup`

Copy

[EventResourceRequest](event_resource_request.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/room_setups`

Copy

[Organization](organization.md)

* `shared_room_setups`

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/room_setups`

Copy

[Resource](resource.md)