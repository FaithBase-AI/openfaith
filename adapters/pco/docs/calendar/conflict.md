Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](conflict.md)

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

# Conflict

A conflict between two events caused by overlapping event resource
requests.

If the conflict has been resolved, `resolved_at` will be present.

[# Example Request](#/apps/calendar/2022-07-07/vertices/conflict#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/conflicts
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/conflicts)

[# Example Object](#/apps/calendar/2022-07-07/vertices/conflict#example-object)

```
{
  "type": "Conflict",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "note": "string",
    "resolved_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "resource": {
      "data": {
        "type": "Resource",
        "id": "1"
      }
    },
    "resolved_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "winner": {
      "data": {
        "type": "Event",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/conflict#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the conflict

`created_at`

`date_time`

UTC time at which the conflict was created

`note`

`string`

Additional information about the conflict or resolution

`resolved_at`

`date_time`

UTC time at which the conflict was resolved

`updated_at`

`date_time`

UTC time at which the conflict was updated

[# Relationships](#/apps/calendar/2022-07-07/vertices/conflict#relationships)

Name

Type

Association Type

Note

resource

Resource

to\_one

resolved\_by

Person

to\_one

winner

Event

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/conflict#url-parameters)

# Can Include

Parameter

Value

Description

include

resolved\_by

include associated resolved\_by

include

resource

include associated resource

include

winner

include associated winner

# Order By

Parameter

Value

Type

Description

order

resolved\_at

string

prefix with a hyphen (-resolved\_at) to reverse the order

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/conflict#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/conflicts`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/conflicts/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/conflict#associations)

# resolved\_by

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/conflicts/{conflict_id}/resolved_by`

Copy

[Person](person.md)

# resource

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/conflicts/{conflict_id}/resource`

Copy

[Resource](resource.md)

# winner

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/conflicts/{conflict_id}/winner`

Copy

[Event](event.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/conflict#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/conflicts`

Copy

[Event](event.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/conflicts`

Copy

[Organization](organization.md)

* `future`
* `resolved`
* `unresolved`

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/conflicts`

Copy

[Resource](resource.md)