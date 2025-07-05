Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](team.md)

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

# Team

A Team within a Service Type.

[# Example Request](#/apps/services/2018-11-01/vertices/team#example-request)

```
curl https://api.planningcenteronline.com/services/v2/teams
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/teams)

[# Example Object](#/apps/services/2018-11-01/vertices/team#example-object)

```
{
  "type": "Team",
  "id": "1",
  "attributes": {
    "name": "string",
    "rehearsal_team": true,
    "sequence": 1,
    "schedule_to": "string",
    "default_status": "string",
    "default_prepare_notifications": true,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "archived_at": "2000-01-01T12:00:00Z",
    "viewers_see": 1,
    "assigned_directly": true,
    "secure_team": true,
    "last_plan_from": "string",
    "stage_color": "string",
    "stage_variant": "string"
  },
  "relationships": {
    "service_type": {
      "data": {
        "type": "ServiceType",
        "id": "1"
      }
    },
    "default_responds_to": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "service_types": {
      "data": {
        "type": "ServiceType",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/team#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`rehearsal_team`

`boolean`

`sequence`

`integer`

`schedule_to`

`string`

This determines whether a team is a split team or not.Accepted values: 1. "plan" (default) 2. "time" (designates as a split team)

`default_status`

`string`

`default_prepare_notifications`

`boolean`

`created_at`

`date_time`

`updated_at`

`date_time`

`archived_at`

`date_time`

`viewers_see`

`integer`

`assigned_directly`

`boolean`

`secure_team`

`boolean`

`last_plan_from`

`string`

`stage_color`

`string`

`stage_variant`

`string`

[# Relationships](#/apps/services/2018-11-01/vertices/team#relationships)

Name

Type

Association Type

Note

service\_type

ServiceType

to\_one

default\_responds\_to

Person

to\_one

A relationship with id 0 will be returned when "All Team Leaders" is the default.

service\_types

ServiceType

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/team#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

people

include associated people

include

person\_team\_position\_assignments

include associated person\_team\_position\_assignments

include

service\_types

include associated service\_types

create and update

include

team\_leaders

include associated team\_leaders

include

team\_positions

include associated team\_positions

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

name

where[name]

string

Query on a specific name

`?where[name]=string`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/team#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/teams`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/teams/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/teams`

Copy

* name
* archived\_at
* assigned\_directly
* rehearsal\_team
* secure\_team
* schedule\_to
* stage\_color
* stage\_variant

[# Associations](#/apps/services/2018-11-01/vertices/team#associations)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/teams/{team_id}/people`

Copy

[Person](person.md)

# person\_team\_position\_assignments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/teams/{team_id}/person_team_position_assignments`

Copy

[PersonTeamPositionAssignment](person_team_position_assignment.md)

# service\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/teams/{team_id}/service_types`

Copy

[ServiceType](service_type.md)

# team\_leaders

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/teams/{team_id}/team_leaders`

Copy

[TeamLeader](team_leader.md)

# team\_positions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/teams/{team_id}/team_positions`

Copy

[TeamPosition](team_position.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/team#belongs-to)

# NeededPosition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/needed_positions/{needed_position_id}/team`

Copy

[NeededPosition](needed_position.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/teams`

Copy

[Organization](organization.md)

# PlanPerson

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/team`

Copy

[PlanPerson](plan_person.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/signup_teams`

Copy

[Plan](plan.md)

# Schedule

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/schedules/{schedule_id}/team`

Copy

[Schedule](schedule.md)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/teams`

Copy

[ServiceType](service_type.md)

# SplitTeamRehearsalAssignment

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_times/{plan_time_id}/split_team_rehearsal_assignments/{split_team_rehearsal_assignment_id}/team`

Copy

[SplitTeamRehearsalAssignment](split_team_rehearsal_assignment.md)

# TeamLeader

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/team_leaders/{team_leader_id}/team`

Copy

[TeamLeader](team_leader.md)

# TeamPosition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/team`

Copy

[TeamPosition](team_position.md)