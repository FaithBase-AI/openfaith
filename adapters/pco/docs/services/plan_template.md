Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](plan_template.md)

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

# PlanTemplate

A PlanTemplate Resource

[# Example Request](#/apps/services/2018-11-01/vertices/plan_template#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/plan_templates
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/plan_templates)

[# Example Object](#/apps/services/2018-11-01/vertices/plan_template#example-object)

```
{
  "type": "PlanTemplate",
  "id": "1",
  "attributes": {
    "name": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "item_count": 1,
    "team_count": 1,
    "note_count": 1,
    "can_view_order": true,
    "multi_day": true,
    "rehearsable": true,
    "prefers_order_view": true
  },
  "relationships": {
    "service_type": {
      "data": {
        "type": "ServiceType",
        "id": "1"
      }
    },
    "created_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "updated_by": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/plan_template#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`created_at`

`date_time`

`updated_at`

`date_time`

`item_count`

`integer`

`team_count`

`integer`

`note_count`

`integer`

`can_view_order`

`boolean`

`multi_day`

`boolean`

`rehearsable`

`boolean`

`prefers_order_view`

`boolean`

[# Relationships](#/apps/services/2018-11-01/vertices/plan_template#relationships)

Name

Type

Association Type

Note

service\_type

ServiceType

to\_one

created\_by

Person

to\_one

updated\_by

Person

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/plan_template#url-parameters)

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

item\_count

string

prefix with a hyphen (-item\_count) to reverse the order

order

name

string

prefix with a hyphen (-name) to reverse the order

order

note\_count

string

prefix with a hyphen (-note\_count) to reverse the order

order

team\_count

string

prefix with a hyphen (-team\_count) to reverse the order

order

updated\_at

string

prefix with a hyphen (-updated\_at) to reverse the order

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

[# Endpoints](#/apps/services/2018-11-01/vertices/plan_template#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_templates`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/plan_template#actions)

# item\_reorder

HTTP Method

Endpoint

Description

POST

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/item_reorder`

Copy

Reorder plan template items in one request.

Details:

This can be used to reorder all items in a plan template in one request.

It expects a `POST` body with a `sequence` of `Item` ids in order. E.G.

```


```
{
  "data": {
    "type": "PlanItemReorder",
    "attributes": {
      "sequence": [
        "5",
        "1",
        "3"
      ]
    }
  }
}

```


```

On success you will get back a `204 No Content`.

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/plan_template#associations)

# items

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/items`

Copy

[Item](item.md)

# notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/notes`

Copy

[PlanNote](plan_note.md)

# team\_members

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/team_members`

Copy

[PlanPerson](plan_person.md)

* `confirmed`
* `not_archived`
* `not_declined`
* `not_deleted`

[# Belongs To](#/apps/services/2018-11-01/vertices/plan_template#belongs-to)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates`

Copy

[ServiceType](service_type.md)