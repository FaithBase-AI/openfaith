Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](folder.md)

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

# Folder

A folder is a container used to organize multiple Service Types or other Folders.

[# Example Request](#/apps/services/2018-11-01/vertices/folder#example-request)

```
curl https://api.planningcenteronline.com/services/v2/folders
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/folders)

[# Example Object](#/apps/services/2018-11-01/vertices/folder#example-object)

```
{
  "type": "Folder",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "container": "string"
  },
  "relationships": {
    "ancestors": {
      "data": {
        "type": "Folder",
        "id": "1"
      }
    },
    "parent": {
      "data": {
        "type": "Folder",
        "id": "1"
      }
    },
    "campus": {
      "data": {
        "type": "Campus",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/folder#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`name`

`string`

`updated_at`

`date_time`

`container`

`string`

[# Relationships](#/apps/services/2018-11-01/vertices/folder#relationships)

Name

Type

Association Type

Note

ancestors

Folder

to\_one

parent

Folder

to\_one

campus

Campus

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/folder#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

service\_types

include associated service\_types

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

parent\_id

where[parent\_id]

integer

Query on a related parent

`?where[parent_id]=1`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/folder#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/folders`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/folders/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/folders`

Copy

* name
* parent\_id
* campus\_id

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/folders/{id}`

Copy

* name
* parent\_id
* campus\_id

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/folders/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/folder#associations)

# folders

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/folders/{folder_id}/folders`

Copy

[Folder](folder.md)

# service\_types

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/folders/{folder_id}/service_types`

Copy

[ServiceType](service_type.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/folder#belongs-to)

# Folder

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/folders/{folder_id}/folders`

Copy

[Folder](folder.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/folders`

Copy

[Organization](organization.md)

# TagGroup

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/tag_groups/{tag_group_id}/folder`

Copy

[TagGroup](tag_group.md)