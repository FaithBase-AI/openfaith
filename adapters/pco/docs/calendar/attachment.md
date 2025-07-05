Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](attachment.md)

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

# Attachment

An uploaded file attached to an event.

[# Example Request](#/apps/calendar/2022-07-07/vertices/attachment#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/attachments
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/attachments)

[# Example Object](#/apps/calendar/2022-07-07/vertices/attachment#example-object)

```
{
  "type": "Attachment",
  "id": "1",
  "attributes": {
    "content_type": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "description": "string",
    "file_size": 1,
    "name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "url": "string"
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

[# Attributes](#/apps/calendar/2022-07-07/vertices/attachment#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the attachment

`content_type`

`string`

MIME type of the attachment

`created_at`

`date_time`

UTC time at which the attachment was created

`description`

`string`

Description of the attachment

`file_size`

`integer`

File size in bytes

`name`

`string`

Set to the file name if not provided

`updated_at`

`date_time`

UTC time at which the attachment was updated

`url`

`string`

Path to where the attachment is stored

[# Relationships](#/apps/calendar/2022-07-07/vertices/attachment#relationships)

Name

Type

Association Type

Note

event

Event

to\_one

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/attachment#url-parameters)

# Can Include

Parameter

Value

Description

include

event

include associated event

# Order By

Parameter

Value

Type

Description

order

content\_type

string

prefix with a hyphen (-content\_type) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

description

string

prefix with a hyphen (-description) to reverse the order

order

file\_size

string

prefix with a hyphen (-file\_size) to reverse the order

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

content\_type

where[content\_type]

string

Query on a specific content\_type

`?where[content_type]=string`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

description

where[description]

string

Query on a specific description

`?where[description]=string`

file\_size

where[file\_size]

integer

Query on a specific file\_size

`?where[file_size]=1`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/attachment#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/attachments`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/attachments/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/attachment#associations)

# event

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/attachments/{attachment_id}/event`

Copy

[Event](event.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/attachment#belongs-to)

# Event

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/events/{event_id}/attachments`

Copy

[Event](event.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/attachments`

Copy

[Organization](organization.md)