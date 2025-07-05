Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](plan_time.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)

2018-11-01

Info

[Arrangement](arrangement.md)

[ArrangementSections](arrangement_sections.md)

[Attachment](attachment.md)

[AttachmentActivity](attachment_activity.md)

[AttachmentType](attachment_type.md)

[AttachmentTypeGroup](attachment_type_group.md)

[Attendance](attendance.md)

[AvailableSignup](available_signup.md)

[Blockout](blockout.md)

[BlockoutDate](blockout_date.md)

[BlockoutException](blockout_exception.md)

[BlockoutScheduleConflict](blockout_schedule_conflict.md)

[Chat](chat.md)

[Contributor](contributor.md)

[CustomSlide](custom_slide.md)

[Email](email.md)

[EmailTemplate](email_template.md)

[EmailTemplateRenderedResponse](email_template_rendered_response.md)

[Folder](folder.md)

[FolderPath](folder_path.md)

[Item](item.md)

[ItemNote](item_note.md)

[ItemNoteCategory](item_note_category.md)

[ItemTime](item_time.md)

[Key](key.md)

[Layout](layout.md)

[Live](live.md)

[LiveController](live_controller.md)

[Media](media.md)

[MediaSchedule](media_schedule.md)

[NeededPosition](needed_position.md)

[Organization](organization.md)

[Person](person.md)

[PersonTeamPositionAssignment](person_team_position_assignment.md)

[Plan](plan.md)

[PlanNote](plan_note.md)

[PlanNoteCategory](plan_note_category.md)

[PlanPerson](plan_person.md)

[PlanPersonTime](plan_person_time.md)

[PlanTemplate](plan_template.md)

[PlanTime](plan_time.md)

[PublicView](public_view.md)

[ReportTemplate](report_template.md)

[Schedule](schedule.md)

[ScheduledPerson](scheduled_person.md)

[SchedulingPreference](scheduling_preference.md)

[Series](series.md)

[ServiceType](service_type.md)

[ServiceTypePath](service_type_path.md)

[SignupSheet](signup_sheet.md)

[SignupSheetMetadata](signup_sheet_metadata.md)

[SkippedAttachment](skipped_attachment.md)

[Song](song.md)

[SongSchedule](song_schedule.md)

[SongbookStatus](songbook_status.md)

[SplitTeamRehearsalAssignment](split_team_rehearsal_assignment.md)

[Tag](tag.md)

[TagGroup](tag_group.md)

[Team](team.md)

[TeamLeader](team_leader.md)

[TeamPosition](team_position.md)

[TextSetting](text_setting.md)

[TimePreferenceOption](time_preference_option.md)

[Zoom](zoom.md)

[Webhooks](#/apps/webhooks)

# PlanTime

A time in a plan.

[# Example Request](#/apps/services/2018-11-01/vertices/plan_time#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/plan_times
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/plan_times)

[# Example Object](#/apps/services/2018-11-01/vertices/plan_time#example-object)

```
{
  "type": "PlanTime",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "time_type": "string",
    "recorded": true,
    "team_reminders": [],
    "starts_at": "2000-01-01T12:00:00Z",
    "ends_at": "2000-01-01T12:00:00Z",
    "live_starts_at": "2000-01-01T12:00:00Z",
    "live_ends_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "assigned_teams": {
      "data": [
        {
          "type": "Team",
          "id": "1"
        }
      ]
    },
    "assigned_positions": {
      "data": [
        {
          "type": "TeamPosition",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/plan_time#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`name`

`string`

`time_type`

`string`

Possible values are:

* rehearsal
* service
* other

`recorded`

`boolean`

`team_reminders`

`array`

A Hash that maps a Team ID to a reminder value. If nothing is specified, no reminder is set for that team. A reminder value is an integer (0-7) equal to the number of days before the selected time a reminder should be sent.

`starts_at`

`date_time`

Planned start time.

`ends_at`

`date_time`

Planned end time.

`live_starts_at`

`date_time`

Start time as recorded by Services LIVE.

`live_ends_at`

`date_time`

End time as recorded by Services LIVE.

[# Relationships](#/apps/services/2018-11-01/vertices/plan_time#relationships)

Name

Type

Association Type

Note

assigned\_teams

Team

to\_many

assigned\_positions

TeamPosition

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/plan_time#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

split\_team\_rehearsal\_assignments

include associated split\_team\_rehearsal\_assignments

# Order By

Parameter

Value

Type

Description

order

starts\_at

string

prefix with a hyphen (-starts\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

time\_type

where[time\_type]

string

Query on a specific time\_type

`?where[time_type]=string`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/plan_time#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_times`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_times/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/plan_times`

Copy

* starts\_at
* ends\_at
* name
* time\_type
* team\_reminders

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{service_type_id}/plan_times/{id}`

Copy

* starts\_at
* ends\_at
* name
* time\_type
* team\_reminders

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{service_type_id}/plan_times/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/plan_time#associations)

# split\_team\_rehearsal\_assignments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments`

Copy

[SplitTeamRehearsalAssignment](split_team_rehearsal_assignment.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/plan_time#belongs-to)

# NeededPosition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{needed_position_id}/time`

Copy

[NeededPosition](needed_position.md)

# PlanPerson

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/declined_plan_times`

Copy

[PlanPerson](plan_person.md)

# PlanPerson

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/plan_times`

Copy

[PlanPerson](plan_person.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/plan_times`

Copy

[Plan](plan.md)

# Schedule

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/declined_plan_times`

Copy

[Schedule](schedule.md)

# Schedule

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/plan_times`

Copy

[Schedule](schedule.md)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_times`

Copy

[ServiceType](service_type.md)

* `future`
* `named`
* `past`