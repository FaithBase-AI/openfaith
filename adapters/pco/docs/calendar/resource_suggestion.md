Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource_suggestion.md)

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

# ResourceSuggestion

A resource and quantity suggested by a room setup.

[# Example Request](#/apps/calendar/2022-07-07/vertices/resource_suggestion#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/room_setups/{room_setup_id}/resource_suggestions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/room_setups/{room_setup_id}/resource_suggestions)

[# Example Object](#/apps/calendar/2022-07-07/vertices/resource_suggestion#example-object)

```
{
  "type": "ResourceSuggestion",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "quantity": 1,
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "resource": {
      "data": {
        "type": "Resource",
        "id": "1"
      }
    },
    "room_setup": {
      "data": {
        "type": "RoomSetup",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/resource_suggestion#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the suggestion

`created_at`

`date_time`

UTC time at which the suggestion was created

`quantity`

`integer`

How many resources should be requested

`updated_at`

`date_time`

UTC time at which the suggestion was updated

[# Relationships](#/apps/calendar/2022-07-07/vertices/resource_suggestion#relationships)

Name

Type

Association Type

Note

resource

Resource

to\_one

room\_setup

RoomSetup

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/resource_suggestion#url-parameters)

# Can Include

Parameter

Value

Description

include

resource

include associated resource

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/resource_suggestion#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/room_setups/{room_setup_id}/resource_suggestions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/room_setups/{room_setup_id}/resource_suggestions/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/resource_suggestion#associations)

# resource

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/room_setups/{room_setup_id}/resource_suggestions/{resource_suggestion_id}/resource`

Copy

[Resource](resource.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/resource_suggestion#belongs-to)

# RoomSetup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/room_setups/{room_setup_id}/resource_suggestions`

Copy

[RoomSetup](room_setup.md)