Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](attachment.md)

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

# Attachment

A file, whether it's stored on Planning Center or linked from another location.

[# Example Request](#/apps/services/2018-11-01/vertices/attachment#example-request)

```
curl https://api.planningcenteronline.com/services/v2/attachments
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/attachments)

[# Example Object](#/apps/services/2018-11-01/vertices/attachment#example-object)

```
{
  "type": "Attachment",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "page_order": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "filename": "string",
    "file_size": 1,
    "licenses_purchased": 1,
    "licenses_remaining": 1,
    "licenses_used": 1,
    "content": "string",
    "content_type": "string",
    "display_name": "string",
    "filetype": "string",
    "linked_url": "string",
    "pco_type": "string",
    "remote_link": "string",
    "thumbnail_url": "string",
    "url": "string",
    "allow_mp3_download": true,
    "web_streamable": true,
    "downloadable": true,
    "transposable": true,
    "import_to_item_details": true,
    "streamable": true,
    "has_preview": true,
    "file_upload_identifier": "string",
    "deleted_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {
    "attachable": {
      "data": {
        "type": "Plan",
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
    },
    "administrator": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/attachment#attributes)

Name

Type

Description

`id`

`primary_key`

`created_at`

`date_time`

`page_order`

`string`

`updated_at`

`date_time`

`filename`

`string`

`file_size`

`integer`

`licenses_purchased`

`integer`

`licenses_remaining`

`integer`

`licenses_used`

`integer`

`content`

`string`

`content_type`

`string`

`display_name`

`string`

`filetype`

`string`

`linked_url`

`string`

`pco_type`

`string`

`remote_link`

`string`

`thumbnail_url`

`string`

`url`

`string`

`allow_mp3_download`

`boolean`

`web_streamable`

`boolean`

`downloadable`

`boolean`

`transposable`

`boolean`

`import_to_item_details`

`boolean`

`streamable`

`boolean`

`has_preview`

`boolean`

`file_upload_identifier`

`string`

Planning Center File UUID. Required only when creating a file attachment. See the "File Uploads" section of the API documentation for more information.

Only available when requested with the `?fields` param

`deleted_at`

`date_time`

[# Relationships](#/apps/services/2018-11-01/vertices/attachment#relationships)

Name

Type

Association Type

Note

attachable

(polymorphic)

to\_one

Type will be the type of resource to which it is attached.

attachment\_types

AttachmentType

to\_many

created\_by

Person

to\_one

updated\_by

Person

to\_one

administrator

Person

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/attachment#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

zooms

include associated zooms

# Order By

Parameter

Value

Type

Description

order

attachable\_type

string

prefix with a hyphen (-attachable\_type) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

deleted\_at

string

prefix with a hyphen (-deleted\_at) to reverse the order

order

filename

string

prefix with a hyphen (-filename) to reverse the order

order

filetype

string

prefix with a hyphen (-filetype) to reverse the order

order

size

string

prefix with a hyphen (-size) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

administrator\_id

where[administrator\_id]

integer

Query on a related administrator

`?where[administrator_id]=1`

licenses\_purchased

where[licenses\_purchased]

integer

Query on a specific licenses\_purchased

`?where[licenses_purchased]=1`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/attachment#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/attachments`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/attachments/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/attachments`

Copy

* attachment\_type\_ids
* content
* file\_upload\_identifier
* filename
* import\_to\_item\_details
* remote\_link
* page\_order

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/attachments/{id}`

Copy

* attachment\_type\_ids
* content
* file\_upload\_identifier
* filename
* import\_to\_item\_details
* remote\_link
* page\_order

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/attachments/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/attachment#actions)

# open

HTTP Method

Endpoint

Description

POST

`/services/v2/attachments/{attachment_id}/open`

Copy

This action is used to get the attachment file URL. It is accessed by `POST`ing to `.../attachments/1/open`

This will generate the URL and return it in the `attachment_url` attribute of the `AttachmentActivity`.

Permissions:

Must be authenticated

# preview

HTTP Method

Endpoint

Description

POST

`/services/v2/attachments/{attachment_id}/preview`

Copy

This action is used to get a reduced resolution (preview) version of the attachment. It is accessed by `POST`ing to `.../attachments/1/preview`

This will generate the URL and return it in the `attachment_url` attribute of the `AttachmentActivity`.

The `has_preview` attribute of an `Attachment` indicates if a preview is available. When a preview is not available this action will return a `Not Found` error with a status code of `404`.

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/attachment#associations)

# zooms

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/attachments/{attachment_id}/zooms`

Copy

[Zoom](zoom.md)

[# Belongs To](#/apps/services/2018-11-01/vertices/attachment#belongs-to)

# Arrangement

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/attachments`

Copy

[Arrangement](arrangement.md)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/attachments`

Copy

[Item](item.md)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/selected_attachment`

Copy

[Item](item.md)

# Item

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items/{item_id}/selected_background`

Copy

[Item](item.md)

# Key

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs/{song_id}/arrangements/{arrangement_id}/keys/{key_id}/attachments`

Copy

[Key](key.md)

# Media

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/media/{media_id}/attachments`

Copy

[Media](media.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/all_attachments`

Copy

[Plan](plan.md)

* `attachable_type` — filter attachments by their attachable\_type as specified in the `attachable_type` parameter.
  Default: `["ServiceType", "Plan", "Item", "Media", "Song", "Arrangement", "Key"]`.
  e.g. `?filter=attachable_type&attachable_type=Plan,ServiceType`
* `extensions` — filter to attachments with a file extension specified in the `extensions` parameter.
  e.g. `?filter=extensions&extensions=pdf,txt`

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/attachments`

Copy

[Plan](plan.md)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/attachments`

Copy

[ServiceType](service_type.md)

# Song

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/songs/{song_id}/attachments`

Copy

[Song](song.md)