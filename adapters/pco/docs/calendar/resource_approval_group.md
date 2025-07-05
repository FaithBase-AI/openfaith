Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource_approval_group.md)

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

# ResourceApprovalGroup

A group of people that can be attached to a room or resource
in order to require their approval for booking.

[# Example Request](#/apps/calendar/2022-07-07/vertices/resource_approval_group#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/resource_approval_groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/resource_approval_groups)

[# Example Object](#/apps/calendar/2022-07-07/vertices/resource_approval_group#example-object)

```
{
  "type": "ResourceApprovalGroup",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "form_count": 1,
    "resource_count": 1,
    "room_count": 1
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/resource_approval_group#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the approval group

`created_at`

`date_time`

UTC time at which the approval group was created

`name`

`string`

Name of the approval group

`updated_at`

`date_time`

UTC time at which the approval group was updated

`form_count`

`integer`

Only available when requested with the `?fields` param

`resource_count`

`integer`

The number of resources in the approval group

Only available when requested with the `?fields` param

`room_count`

`integer`

The number of rooms in the approval group

Only available when requested with the `?fields` param

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/resource_approval_group#url-parameters)

# Can Include

Parameter

Value

Description

include

people

include associated people

include

resources

include associated resources

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

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/resource_approval_group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/resource_approval_groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/resource_approval_groups/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/resource_approval_group#associations)

# event\_resource\_requests

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/event_resource_requests`

Copy

[EventResourceRequest](event_resource_request.md)

* `awaiting_response`
* `future`
* `not_in_conflict`
* `not_overbooked`
* `overbooked`

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/people`

Copy

[Person](person.md)

# required\_approvals

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/required_approvals`

Copy

[RequiredApproval](required_approval.md)

* `resources`
* `rooms`

# resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/resources`

Copy

[Resource](resource.md)

* `resources`
* `rooms`

[# Belongs To](#/apps/calendar/2022-07-07/vertices/resource_approval_group#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_approval_groups`

Copy

[Organization](organization.md)

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_approval_groups`

Copy

[Resource](resource.md)