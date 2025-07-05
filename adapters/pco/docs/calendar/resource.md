Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource.md)

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

# Resource

A room or resource that can be requested for use as part of
an event.

[# Example Request](#/apps/calendar/2022-07-07/vertices/resource#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/resources
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/resources)

[# Example Object](#/apps/calendar/2022-07-07/vertices/resource#example-object)

```
{
  "type": "Resource",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "kind": "string",
    "name": "string",
    "serial_number": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "expires_at": "2000-01-01T12:00:00Z",
    "home_location": "string",
    "image": "string",
    "quantity": 1,
    "path_name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/resource#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the room or resource

`created_at`

`date_time`

UTC time at which the room or resource was created

`kind`

`string`

The type of resource, can either be `Room` or `Resource`

`name`

`string`

The name of the room or resource

`serial_number`

`string`

The serial number of the resource

`updated_at`

`date_time`

UTC time at which the room or resource was updated

`description`

`string`

Description of the room or resource

`expires_at`

`date_time`

UTC time at which the resource expires

`home_location`

`string`

Where the resource is normally kept

`image`

`string`

Path to where resource image is stored

`quantity`

`integer`

The quantity of the resource

`path_name`

`string`

A string representing the location of the resource if it is nested within a folder.

Each parent folder is separated by `/`

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/resource#url-parameters)

# Can Include

Parameter

Value

Description

include

resource\_approval\_groups

include associated resource\_approval\_groups

include

resource\_folder

include associated resource\_folder

include

resource\_questions

include associated resource\_questions

include

room\_setups

include associated room\_setups

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

expires\_at

string

prefix with a hyphen (-expires\_at) to reverse the order

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

kind

where[kind]

string

Query on a specific kind

`?where[kind]=string`

name

where[name]

string

Query on a specific name

`?where[name]=string`

path\_name

where[path\_name]

string

Query on a specific path\_name

`?where[path_name]=string`

serial\_number

where[serial\_number]

string

Query on a specific serial\_number

`?where[serial_number]=string`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/resource#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/resources`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/resources/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/resources`

Copy

* kind
* description
* expires\_at
* home\_location
* name
* quantity
* serial\_number

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/resources/{id}`

Copy

* description
* expires\_at
* home\_location
* name
* quantity
* serial\_number

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/resources/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/resource#associations)

# conflicts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/conflicts`

Copy

[Conflict](conflict.md)

# event\_resource\_requests

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/event_resource_requests`

Copy

[EventResourceRequest](event_resource_request.md)

# required\_approvals

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/required_approvals`

Copy

[RequiredApproval](required_approval.md)

# resource\_approval\_groups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_approval_groups`

Copy

[ResourceApprovalGroup](resource_approval_group.md)

# resource\_bookings

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_bookings`

Copy

[ResourceBooking](resource_booking.md)

* `approved`
* `approved_pending`
* `approved_pending_rejected`
* `approved_rejected`
* `future`
* `pending`
* `pending_rejected`
* `rejected`

# resource\_folder

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_folder`

Copy

[ResourceFolder](resource_folder.md)

# resource\_questions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_questions`

Copy

[ResourceQuestion](resource_question.md)

# room\_setups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/room_setups`

Copy

[RoomSetup](room_setup.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/resource#belongs-to)

# Conflict

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/conflicts/{conflict_id}/resource`

Copy

[Conflict](conflict.md)

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/resource`

Copy

[EventResourceRequest](event_resource_request.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources`

Copy

[Organization](organization.md)

* `resources`
* `rooms`

# RequiredApproval

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals/{required_approval_id}/resource`

Copy

[RequiredApproval](required_approval.md)

# ResourceApprovalGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/resources`

Copy

[ResourceApprovalGroup](resource_approval_group.md)

* `resources`
* `rooms`

# ResourceBooking

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_bookings/{resource_booking_id}/resource`

Copy

[ResourceBooking](resource_booking.md)

# ResourceFolder

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_folders/{resource_folder_id}/resources`

Copy

[ResourceFolder](resource_folder.md)

# ResourceSuggestion

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/room_setups/{room_setup_id}/resource_suggestions/{resource_suggestion_id}/resource`

Copy

[ResourceSuggestion](resource_suggestion.md)

# RoomSetup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/room_setups/{room_setup_id}/containing_resource`

Copy

[RoomSetup](room_setup.md)