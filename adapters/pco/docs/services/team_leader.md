Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](team_leader.md)

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

# TeamLeader

A leader of a specific Team in a Service Type.

[# Example Request](#/apps/services/2018-11-01/vertices/team_leader#example-request)

```
curl https://api.planningcenteronline.com/services/v2/people/{person_id}/team_leaders
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/people/{person_id}/team_leaders)

[# Example Object](#/apps/services/2018-11-01/vertices/team_leader#example-object)

```
{
  "type": "TeamLeader",
  "id": "1",
  "attributes": {
    "send_responses_for_accepts": true,
    "send_responses_for_declines": true,
    "send_responses_for_blockouts": true
  },
  "relationships": {
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "team": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/team_leader#attributes)

Name

Type

Description

`id`

`primary_key`

`send_responses_for_accepts`

`boolean`

`send_responses_for_declines`

`boolean`

`send_responses_for_blockouts`

`boolean`

[# Relationships](#/apps/services/2018-11-01/vertices/team_leader#relationships)

Name

Type

Association Type

Note

person

Person

to\_one

team

Team

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/team_leader#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

people

include associated people

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

[# Endpoints](#/apps/services/2018-11-01/vertices/team_leader#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/people/{person_id}/team_leaders`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/people/{person_id}/team_leaders/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/team_leader#associations)

# people

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/team_leaders/{team_leader_id}/people`

Copy

[Person](person.md)

# team

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/people/{person_id}/team_leaders/{team_leader_id}/team`

Copy

[Team](team.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/team_leader#belongs-to)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/team_leaders`

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

`/services/v2/teams/{team_id}/team_leaders`

Copy

[Team](team.md)