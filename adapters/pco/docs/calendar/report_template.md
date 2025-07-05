Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](report_template.md)

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

# ReportTemplate

A template for generating a report.

[# Example Request](#/apps/calendar/2022-07-07/vertices/report_template#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/report_templates
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/report_templates)

[# Example Object](#/apps/calendar/2022-07-07/vertices/report_template#example-object)

```
{
  "type": "ReportTemplate",
  "id": "1",
  "attributes": {
    "body": "string",
    "created_at": "string",
    "description": "string",
    "title": "string",
    "updated_at": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/report_template#attributes)

Name

Type

Description

`id`

`primary_key`

Unique identifier for the report

`body`

`string`

The contents of the report template

`created_at`

`string`

UTC time at which the report was created

`description`

`string`

A summarization of the report

`title`

`string`

The title of the report

`updated_at`

`string`

UTC time at which the report was updated

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/report_template#url-parameters)

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/report_template#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/report_templates`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/report_templates/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/calendar/v2/report_templates`

Copy

* body
* description
* title

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/calendar/v2/report_templates/{id}`

Copy

* body
* description
* title

# Deleting

HTTP Method

Endpoint

DELETE

`/calendar/v2/report_templates/{id}`

Copy

[# Belongs To](#/apps/calendar/2022-07-07/vertices/report_template#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/report_templates`

Copy

[Organization](organization.md)