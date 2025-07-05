Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person_team_position_assignment.md)

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

# PersonTeamPositionAssignment

A person's assignment to a position within a team.

[# Example Request](#/apps/services/2018-11-01/vertices/person_team_position_assignment#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments)

[# Example Object](#/apps/services/2018-11-01/vertices/person_team_position_assignment#example-object)

```
{
  "type": "PersonTeamPositionAssignment",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "schedule_preference": "string",
    "preferred_weeks": []
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "team_position": {
      "data": {
        "type": "TeamPosition",
        "id": "1"
      }
    },
    "time_preference_options": {
      "data": [
        {
          "type": "TimePreferenceOption",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/person_team_position_assignment#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`schedule_preference`

`string`

Possible Values:
"Every week"
"Every other week"
"Every 3rd week"
"Every 4th week"
"Every 5th week"
"Every 6th week"
"Once a month"
"Twice a month"
"Three times a month"
"Choose Weeks"

`preferred_weeks`

`array`

When `schedule_preference` is set to "Choose Weeks" then this
indicates which weeks are preferred (checked).

e.g. ['1', '3', '5'] to prefer odd numbered weeks.

[# Relationships](#/apps/services/2018-11-01/vertices/person_team_position_assignment#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

team\_position

TeamPosition

to\_one

time\_preference\_options

TimePreferenceOption

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/person_team_position_assignment#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

person

include associated person

create and update

include

team\_position

include associated team\_position

create and update

# Order By

Parameter

Value

Type

Description

order

first\_name

string

prefix with a hyphen (-first\_name) to reverse the order

order

last\_name

string

prefix with a hyphen (-last\_name) to reverse the order

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

[# Endpoints](#/apps/services/2018-11-01/vertices/person_team_position_assignment#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments`

Copy

* schedule\_preference
* preferred\_weeks
* time\_preference\_option\_ids
* person\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{id}`

Copy

* schedule\_preference
* preferred\_weeks
* time\_preference\_option\_ids

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/person_team_position_assignment#associations)

# person

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{person_team_position_assignment_id}/person`

Copy

[Person](person.md)

# team\_position

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{person_team_position_assignment_id}/team_position`

Copy

[TeamPosition](team_position.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/person_team_position_assignment#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/person_team_position_assignments`

Copy

[Person](person.md)

* `not_archived`
* `not_deleted`

# Team

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/teams/{team_id}/person_team_position_assignments`

Copy

[Team](team.md)

# TeamPosition

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments`

Copy

[TeamPosition](team_position.md)

* `time_preference_options` — pass an additonal array of `time_preference_option_ids` as a param to filter to people who prefer those times.use id 'none' to filter people who have no preferred times