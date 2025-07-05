Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

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

# Person

The people in your organization with access to Calendar.

[# Example Request](#/apps/calendar/2022-07-07/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/people
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/people)

[# Example Object](#/apps/calendar/2022-07-07/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "first_name": "string",
    "last_name": "string",
    "middle_name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "avatar_url": "string",
    "child": true,
    "contact_data": "string",
    "gender": "string",
    "has_access": true,
    "name_prefix": "string",
    "name_suffix": "string",
    "pending_request_count": 1,
    "permissions": 1,
    "resolves_conflicts": true,
    "site_administrator": true,
    "status": "value",
    "can_edit_people": true,
    "can_edit_resources": true,
    "can_edit_rooms": true,
    "event_permissions_type": "string",
    "member_of_approval_groups": true,
    "name": "string",
    "people_permissions_type": "string",
    "room_permissions_type": "string",
    "resources_permissions_type": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the person

`created_at`

`date_time`

UTC time at which the person was created

`first_name`

`string`

The person's first name

`last_name`

`string`

The person's last name

`middle_name`

`string`

The person's middle name

`updated_at`

`date_time`

UTC time at which the person was updated

`avatar_url`

`string`

Path to where the avatar image is stored

`child`

`boolean`

Indicates whether the person is a child

`contact_data`

`string`

An object containing the person's contact data.

This can include an array of `email_addresses`, `addresses` and `phone_numbers`

`gender`

`string`

`M` indicates male, `F` indicates female

`has_access`

`boolean`

Indicates whether the person has access to Calendar

`name_prefix`

`string`

Possible values:

* `Mr.`
* `Mrs.`
* `Ms.`
* `Miss`
* `Dr.`
* `Rev.`

`name_suffix`

`string`

Possible values:

* `Jr.`
* `Sr.`
* `Ph.D.`
* `II`
* `III`

`pending_request_count`

`integer`

If the person is a member of an approval group, the number of EventResourceRequests needing resolution.

If `resolves_conflicts` is `true`, the count will also include the number of Conflicts needing resolution.

`permissions`

`integer`

Integer that corresponds to the person's permissions in Calendar

`resolves_conflicts`

`boolean`

Indicates whether the person is able to resolve Conflicts

`site_administrator`

`boolean`

Indicates whether the person is a Organization Administrator

`status`

`string`

Possible values:

* `active`: The person is marked "active" in People
* `inactive`: The person is marked "inactive" in People

Possible values: `active`, `pending`, or `inactive`

`can_edit_people`

`boolean`

Indicates whether the person can edit other people

`can_edit_resources`

`boolean`

Indicates whether the person can edit resources

`can_edit_rooms`

`boolean`

Indicates whether the person can edit rooms

`event_permissions_type`

`string`

Event permissions for the person

`member_of_approval_groups`

`boolean`

Indicates whether the person is a member of at least one approval group

Only available when requested with the `?fields` param

`name`

`string`

The person's first name, last name, and name suffix

`people_permissions_type`

`string`

People permissions for the person

`room_permissions_type`

`string`

Room permissions for the person

`resources_permissions_type`

`string`

Resource permissions for the person

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/person#url-parameters)

# Can Include

Parameter

Value

Description

include

organization

include associated organization

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

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

order

resolves\_conflicts

string

prefix with a hyphen (-resolves\_conflicts) to reverse the order

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

first\_name

where[first\_name]

string

Query on a specific first\_name

`?where[first_name]=string`

last\_name

where[last\_name]

string

Query on a specific last\_name

`?where[last_name]=string`

middle\_name

where[middle\_name]

string

Query on a specific middle\_name

`?where[middle_name]=string`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/people`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/people/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/person#associations)

# event\_resource\_requests

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/people/{person_id}/event_resource_requests`

Copy

[EventResourceRequest](event_resource_request.md)

* `awaiting_response`
* `future`
* `not_in_conflict`
* `not_overbooked`
* `overbooked`

# organization

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/people/{person_id}/organization`

Copy

[Organization](organization.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/person#belongs-to)

# Conflict

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/conflicts/{conflict_id}/resolved_by`

Copy

[Conflict](conflict.md)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/owner`

Copy

[Event](event.md)

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/created_by`

Copy

[EventResourceRequest](event_resource_request.md)

# EventResourceRequest

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_resource_requests/{event_resource_request_id}/updated_by`

Copy

[EventResourceRequest](event_resource_request.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/people`

Copy

[Organization](organization.md)

* `active`
* `event_owners`

# ResourceApprovalGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_approval_groups/{resource_approval_group_id}/people`

Copy

[ResourceApprovalGroup](resource_approval_group.md)