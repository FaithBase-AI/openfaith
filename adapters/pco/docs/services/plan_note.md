Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](plan_note.md)

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

# PlanNote

A specific plan note within a single plan.

[# Example Request](#/apps/services/2018-11-01/vertices/plan_note#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes)

[# Example Object](#/apps/services/2018-11-01/vertices/plan_note#example-object)

```
{
  "type": "PlanNote",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "category_name": "string",
    "content": "string"
  },
  "relationships": {
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "plan_note_category": {
      "data": {
        "type": "PlanNoteCategory",
        "id": "1"
      }
    },
    "teams": {
      "data": {
        "type": "Team",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/plan_note#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`updated_at`

`date_time`

`category_name`

`string`

`content`

`string`

[# Relationships](#/apps/services/2018-11-01/vertices/plan_note#relationships)

Name

Type

Association Type

Note

created\_by

Person

to\_one

plan\_note\_category

PlanNoteCategory

to\_one

Required

teams

Team

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/plan_note#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

plan\_note\_category

include associated plan\_note\_category

create and update

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

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/plan_note#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/notes`

Copy

* content

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes/{id}`

Copy

* content

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/plan_note#associations)

# plan\_note\_category

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes/{plan_note_id}/plan_note_category`

Copy

[PlanNoteCategory](plan_note_category.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/plan_note#belongs-to)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/notes`

Copy

[Plan](plan.md)

* `team`

# PlanTemplate

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes`

Copy

[PlanTemplate](plan_template.md)