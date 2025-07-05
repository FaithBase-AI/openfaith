Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](resource_folder.md)

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

# ResourceFolder

An organizational folder containing rooms or resources.

[# Example Request](#/apps/calendar/2022-07-07/vertices/resource_folder#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/resource_folders
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/resource_folders)

[# Example Object](#/apps/calendar/2022-07-07/vertices/resource_folder#example-object)

```
{
  "type": "ResourceFolder",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "ancestry": "string",
    "kind": "string",
    "path_name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/resource_folder#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the folder

`created_at`

`date_time`

UTC time at which the folder was created

`name`

`string`

The folder name

`updated_at`

`date_time`

UTC time at which the folder was updated

`ancestry`

`string`

`kind`

`string`

The type of folder, can either be `Room` or `Resource`

`path_name`

`string`

A string representing the location of the folder if it is nested.

Each parent folder is separated by `/`

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/resource_folder#url-parameters)

# Can Include

Parameter

Value

Description

include

resources

include associated resources

# Order By

Parameter

Value

Type

Description

order

ancestry

string

prefix with a hyphen (-ancestry) to reverse the order

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

ancestry

where[ancestry]

string

Query on a specific ancestry

`?where[ancestry]=string`

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

path\_name

where[path\_name]

string

Query on a specific path\_name

`?where[path_name]=string`

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/resource_folder#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/resource_folders`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/resource_folders/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/resource_folders`

Copy

* kind
* name

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/resource_folders/{id}`

Copy

* name

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/resource_folders/{id}`

Copy

[# Associations](#/apps/calendar/2022-07-07/vertices/resource_folder#associations)

# resources

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/calendar/v2/resource_folders/{resource_folder_id}/resources`

Copy

[Resource](resource.md)

[# Belongs To](#/apps/calendar/2022-07-07/vertices/resource_folder#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resource_folders`

Copy

[Organization](organization.md)

* `resources`
* `rooms`

# Resource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/resources/{resource_id}/resource_folder`

Copy

[Resource](resource.md)