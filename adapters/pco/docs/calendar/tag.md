Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](tag.md)

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

# Tag

An organizational tag that can be applied to events.

Applied tags can be used to filter events on the calendar or
filter events for reports, iCal feeds, kiosk, and the widget.

[# Example Request](#/apps/calendar/2022-07-07/vertices/tag#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/tags
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/tags)

[# Example Object](#/apps/calendar/2022-07-07/vertices/tag#example-object)

```
{
  "type": "Tag",
  "id": "1",
  "attributes": {
    "church_center_category": true,
    "color": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "position": 1.42,
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/tag#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the tag

`church_center_category`

`boolean`

`true` indicates that this tag is used as a category on Church Center

`color`

`string`

Hex color code of the tag

`created_at`

`date_time`

UTC time at which the tag was created

`name`

`string`

The tag name

`position`

`float`

If the tag belongs to a TagGroup,
position indicates place in list within TagGroup in the UI.

If the tag does not belong to a TagGroup,
position indicates place in list under "Individual Tags" in the UI.

`updated_at`

`date_time`

UTC time at which the tag was updated

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/tag#url-parameters)

# Can Include

Parameter

Value

Description

include

tag\_group

include associated tag\_group

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

order

position

string

prefix with a hyphen (-position) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

church\_center\_category

where[church\_center\_category]

boolean

Query on a specific church\_center\_category

`?where[church_center_category]=true`

color

where[color]

string

Query on a specific color

`?where[color]=string`

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

position

where[position]

float

Query on a specific position

`?where[position]=1.42`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/tag#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/tags`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/tags/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/tags`

Copy

* church\_center\_category
* color
* name
* position

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/tags/{id}`

Copy

* church\_center\_category
* color
* name
* position

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/tags/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/tag#associations)

# event\_instances

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tags/{tag_id}/event_instances`

Copy

[EventInstance](event_instance.md)

# events

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tags/{tag_id}/events`

Copy

[Event](event.md)

# tag\_group

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/tags/{tag_id}/tag_group`

Copy

[TagGroup](tag_group.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/tag#belongs-to)

# EventInstance

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/event_instances/{event_instance_id}/tags`

Copy

[EventInstance](event_instance.md)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/tags`

Copy

[Event](event.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tags`

Copy

[Organization](organization.md)

* `individual`

# TagGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/tag_groups/{tag_group_id}/tags`

Copy

[TagGroup](tag_group.md)