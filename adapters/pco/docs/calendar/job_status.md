Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](job_status.md)

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

# JobStatus

[# Example Request](#/apps/calendar/2022-07-07/vertices/job_status#example-request)

```
curl https://api.planningcenteronline.com/calendar/v2/job_statuses
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/calendar/v2/job_statuses)

[# Example Object](#/apps/calendar/2022-07-07/vertices/job_status#example-object)

```
{
  "type": "JobStatus",
  "id": "1",
  "attributes": {
    "retries": 1,
    "errors": {},
    "message": "string",
    "started_at": "2000-01-01T12:00:00Z",
    "status": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/calendar/2022-07-07/vertices/job_status#attributes)

Name

Type

Description

`id`

`primary_key`

`retries`

`integer`

`errors`

`json`

`message`

`string`

`started_at`

`date_time`

`status`

`string`

[# URL Parameters](#/apps/calendar/2022-07-07/vertices/job_status#url-parameters)

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

[# Endpoints](#/apps/calendar/2022-07-07/vertices/job_status#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/calendar/v2/job_statuses`

Copy

# Reading

HTTP Method

Endpoint

GET

`/calendar/v2/job_statuses/{id}`

Copy

[# Belongs To](#/apps/calendar/2022-07-07/vertices/job_status#belongs-to)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/calendar/v2/job_statuses`

Copy

[Organization](organization.md)