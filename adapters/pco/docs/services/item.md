Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](item.md)

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

# Item

An item in a plan.

[# Example Request](#/apps/services/2018-11-01/vertices/item#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/plans/{plan_id}/items
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/plans/{plan_id}/items)

[# Example Object](#/apps/services/2018-11-01/vertices/item#example-object)

```
{
  "type": "Item",
  "id": "1",
  "attributes": {
    "title": "string",
    "sequence": 1,
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "length": 1,
    "item_type": "string",
    "html_details": "string",
    "service_position": "string",
    "description": "string",
    "key_name": "string",
    "custom_arrangement_sequence": [],
    "custom_arrangement_sequence_short": [],
    "custom_arrangement_sequence_full": []
  },
  "relationships": {
    "plan": {
      "data": {
        "type": "Plan",
        "id": "1"
      }
    },
    "song": {
      "data": {
        "type": "Song",
        "id": "1"
      }
    },
    "arrangement": {
      "data": {
        "type": "Arrangement",
        "id": "1"
      }
    },
    "key": {
      "data": {
        "type": "Key",
        "id": "1"
      }
    },
    "selected_layout": {
      "data": {
        "type": "Layout",
        "id": "1"
      }
    },
    "selected_background": {
      "data": {
        "type": "Attachment",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/item#attributes)

Name

Type

Description

`id`

`primary_key`

`title`

`string`

`sequence`

`integer`

`created_at`

`date_time`

`updated_at`

`date_time`

`length`

`integer`

`item_type`

`string`

There are 4 possible values:

* `song`: The item is a song
* `header`: The item is a header
* `media`: The item is a piece of media
* `item`: The default item type

This value can only be set when an item is created. The only value that you can pass is `header`. If no value is passed then `item` will be used. To create a media item you'll attach a video media to the item, and to create a song item, you'll attach a song.

`html_details`

`string`

`service_position`

`string`

There are 3 possible values:

* `pre`: the item happens before the service starts
* `post`: the item happens after the service ends
* `during`: the item happens during the service

`description`

`string`

`key_name`

`string`

`custom_arrangement_sequence`

`array`

An array of strings containing a label and a number describing the section:

['Verse 1', 'Chorus 1', 'Verse 2']

`custom_arrangement_sequence_short`

`array`

`custom_arrangement_sequence_full`

`array`

[# Relationships](#/apps/services/2018-11-01/vertices/item#relationships)

Name

Type

Association Type

Note

plan

Plan

to\_one

song

Song

to\_one

arrangement

Arrangement

to\_one

key

Key

to\_one

selected\_layout

Layout

to\_one

selected\_background

Attachment

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/item#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

arrangement

include associated arrangement

create and update

include

item\_notes

include associated item\_notes

include

item\_times

include associated item\_times

include

key

include associated key

create and update

include

media

include associated media

create and update

include

selected\_attachment

include associated selected\_attachment

create and update

include

song

include associated song

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

[# Endpoints](#/apps/services/2018-11-01/vertices/item#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items`

Copy

* arrangement\_id
* custom\_arrangement\_sequence
* description
* html\_details
* key\_id
* length
* selected\_layout\_id
* service\_position
* song\_id
* title
* item\_type
* sequence

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{id}`

Copy

* arrangement\_id
* custom\_arrangement\_sequence
* description
* html\_details
* key\_id
* length
* selected\_layout\_id
* service\_position
* song\_id
* title

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{id}`

Copy

[# Associations](#/apps/services/2018-11-01/vertices/item#associations)

# arrangement

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/arrangement`

Copy

[Arrangement](arrangement.md)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/attachments`

Copy

[Attachment](attachment.md)

# custom\_slides

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/custom_slides`

Copy

[CustomSlide](custom_slide.md)

# item\_notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/item_notes`

Copy

[ItemNote](item_note.md)

# item\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/item_times`

Copy

[ItemTime](item_time.md)

# key

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/key`

Copy

[Key](key.md)

# media

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/media`

Copy

[Media](media.md)

# selected\_attachment

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/selected_attachment`

Copy

[Attachment](attachment.md)

# selected\_background

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/selected_background`

Copy

[Attachment](attachment.md)

# song

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/song`

Copy

[Song](song.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/item#belongs-to)

# Live

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/items`

Copy

[Live](live.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items`

Copy

[Plan](plan.md)

# PlanTemplate

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates/{plan_template_id}/items`

Copy

[PlanTemplate](plan_template.md)

# Song

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs/{song_id}/last_scheduled_item`

Copy

[Song](song.md)

The Song's most recently scheduled Item in a given Service Type.
Requires a `service_type` query parameter.
e.g. `?service_type=789`