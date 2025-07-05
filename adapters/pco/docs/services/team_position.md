Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](team_position.md)

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

# TeamPosition

A position within a team.

[# Example Request](#/apps/services/2018-11-01/vertices/team_position#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/team_positions
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/team_positions)

[# Example Object](#/apps/services/2018-11-01/vertices/team_position#example-object)

```
{
  "type": "TeamPosition",
  "id": "1",
  "attributes": {
    "name": "string",
    "sequence": 1,
    "tags": [],
    "negative_tag_groups": [],
    "tag_groups": []
  },
  "relationships": {
    "team": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    },
    "attachment_types": {
      "data": [
        {
          "type": "AttachmentType",
          "id": "1"
        }
      ]
    },
    "tags": {
      "data": [
        {
          "type": "Tag",
          "id": "1"
        }
      ]
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/team_position#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`sequence`

`integer`

`tags`

`array`

If the Team is assigned via tags, these are specific Tags that are specified.

`negative_tag_groups`

`array`

If the Team is assigned via tags, these are Tags where the option "None" is specified.

`tag_groups`

`array`

If the Team is assigned via tags, these are Tags where the option "Any" is specified.

[# Relationships](#/apps/services/2018-11-01/vertices/team_position#relationships)

Name

Type

Association Type

Note

team

Team

to\_one

attachment\_types

AttachmentType

to\_many

tags

Tag

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/team_position#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

tags

include associated tags

create and update

include

team

include associated team

create and update

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

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

[# Endpoints](#/apps/services/2018-11-01/vertices/team_position#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/team_positions`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/team_positions/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/team_position#associations)

# person\_team\_position\_assignments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments`

Copy

[PersonTeamPositionAssignment](person_team_position_assignment.md)

* `time_preference_options` — pass an additonal array of `time_preference_option_ids` as a param to filter to people who prefer those times.use id 'none' to filter people who have no preferred times

# tags

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/tags`

Copy

[Tag](tag.md)

# team

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/team`

Copy

[Team](team.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/team_position#belongs-to)

# PersonTeamPositionAssignment

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions/{team_position_id}/person_team_position_assignments/{person_team_position_assignment_id}/team_position`

Copy

[PersonTeamPositionAssignment](person_team_position_assignment.md)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions`

Copy

[ServiceType](service_type.md)

# Team

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/teams/{team_id}/team_positions`

Copy

[Team](team.md)