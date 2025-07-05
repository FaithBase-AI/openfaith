Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](needed_position.md)

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

# NeededPosition

An amount of unfilled positions needed within a team in a plan.

[# Example Request](#/apps/services/2018-11-01/vertices/needed_position#example-request)

```
curl https://api.planningcenteronline.com/services/v2/series/{series_id}/plans/{plan_id}/needed_positions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/series/{series_id}/plans/{plan_id}/needed_positions)

[# Example Object](#/apps/services/2018-11-01/vertices/needed_position#example-object)

```
{
  "type": "NeededPosition",
  "id": "1",
  "attributes": {
    "quantity": 1,
    "team_position_name": "string",
    "scheduled_to": "string"
  },
  "relationships": {
    "team": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    },
    "plan": {
      "data": {
        "type": "Plan",
        "id": "1"
      }
    },
    "time": {
      "data": {
        "type": "PlanTime",
        "id": "1"
      }
    },
    "time_preference_option": {
      "data": {
        "type": "TimePreferenceOption",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/needed_position#attributes)

Name

Type

Description

`id`

`primary_key`

`quantity`

`integer`

`team_position_name`

`string`

`scheduled_to`

`string`

[# Relationships](#/apps/services/2018-11-01/vertices/needed_position#relationships)

Name

Type

Association Type

Note

team

Team

to\_one

plan

Plan

to\_one

time

PlanTime

to\_one

time\_preference\_option

TimePreferenceOption

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/needed_position#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

team

include associated team

create and update

include

time

include associated time

create and update

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

[# Endpoints](#/apps/services/2018-11-01/vertices/needed_position#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/needed_positions`

Copy

* quantity
* time\_id
* time\_preference\_option\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{id}`

Copy

* quantity

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/needed_position#associations)

# team

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{needed_position_id}/team`

Copy

[Team](team.md)

# time

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{needed_position_id}/time`

Copy

[PlanTime](plan_time.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/needed_position#belongs-to)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/needed_positions`

Copy

[Plan](plan.md)