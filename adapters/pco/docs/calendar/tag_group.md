Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](tag_group.md)

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

# TagGroup

A grouping of tags for organizational purposes.

[# Example Request](#/apps/calendar/2022-07-07/vertices/tag_group#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/tag_groups
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/tag_groups)

[# Example Object](#/apps/calendar/2022-07-07/vertices/tag_group#example-object)

```
{
  "type": "TagGroup",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "required": true
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/tag_group#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the tag group

`created_at`

`date_time`

UTC time at which the tag group was created

`name`

`string`

The name of the tag group

`updated_at`

`date_time`

UTC time at which the tag group was updated

`required`

`boolean`

* `true` indicates tag from this tag group must be applied when creating an event

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/tag_group#url-parameters)

# Can Include

Parameter

Value

Description

include

events

include associated events

include

tags

include associated tags

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/tag_group#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/tag_groups`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/tag_groups/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/tag_groups`

Copy

* name
* required

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/tag_groups/{id}`

Copy

* name
* required

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/tag_groups/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/tag_group#associations)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tag_groups/{tag_group_id}/events`

Copy

[Event](event.md)

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tag_groups/{tag_group_id}/tags`

Copy

[Tag](tag.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/tag_group#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tag_groups`

Copy

[Organization](organization.md)

* `required`

# Tag

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tags/{tag_id}/tag_group`

Copy

[Tag](tag.md)