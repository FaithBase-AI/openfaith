Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](service_type.md)

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

# ServiceType

A Service Type is a container for plans.

[# Example Request](#/apps/services/2018-11-01/vertices/service_type#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types)

[# Example Object](#/apps/services/2018-11-01/vertices/service_type#example-object)

```
{
  "type": "ServiceType",
  "id": "1",
  "attributes": {
    "archived_at": "2000-01-01T12:00:00Z",
    "created_at": "2000-01-01T12:00:00Z",
    "deleted_at": "2000-01-01T12:00:00Z",
    "name": "string",
    "sequence": 1,
    "updated_at": "2000-01-01T12:00:00Z",
    "permissions": "string",
    "attachment_types_enabled": true,
    "scheduled_publish": true,
    "custom_item_types": [],
    "standard_item_types": [],
    "background_check_permissions": "string",
    "comment_permissions": "string",
    "frequency": "string",
    "last_plan_from": "string"
  },
  "relationships": {
    "parent": {
      "data": {
        "type": "Folder",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/service_type#attributes)

Name

Type

Description

`id`

`primary_key`

`archived_at`

`date_time`

`created_at`

`date_time`

`deleted_at`

`date_time`

`name`

`string`

`sequence`

`integer`

`updated_at`

`date_time`

`permissions`

`string`

`attachment_types_enabled`

`boolean`

`scheduled_publish`

`boolean`

`custom_item_types`

`array`

A array of hashes that maps an item title substring matcher to a color:

[{ name: "Announcements", color: "#FFFFFF" }]

Valid substring matchers are any string that could be used as an item title.

A color is the hexadecimal value of a valid color e.g. #FFFFFF
Valid colors values are #e8f6df, #e0f7ff, #e6e2fd, #ffe0e8, #ffedd1, #cfcfcf, #eaebeb, and #ffffff

`standard_item_types`

`array`

An array of hashes that maps an item type to a color:

[{ name: "Header", color: "#FFFFFF" }]

Valid names are Header, Song, and Media.

A color is the hexadecimal value of a valid color e.g. #FFFFFF
Valid colors values are #e8f6df, #e0f7ff, #e6e2fd, #ffe0e8, #ffedd1, #cfcfcf, #eaebeb, and #ffffff

`background_check_permissions`

`string`

`comment_permissions`

`string`

`frequency`

`string`

`last_plan_from`

`string`

[# Relationships](#/apps/services/2018-11-01/vertices/service_type#relationships)

Name

Type

Association Type

Note

parent

Folder

to\_one

[# URL Parameters](#/apps/services/2018-11-01/vertices/service_type#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

time\_preference\_options

include associated time\_preference\_options

# Order By

Parameter

Value

Type

Description

order

name

string

prefix with a hyphen (-name) to reverse the order

order

sequence

string

prefix with a hyphen (-sequence) to reverse the order

# Query By

Name

Parameter

Type

Description

Example

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

name

where[name]

string

Query on a specific name

`?where[name]=string`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/service_type#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types`

Copy

* attachment\_types\_enabled
* background\_check\_permissions
* comment\_permissions
* custom\_item\_types
* frequency
* last\_plan\_from
* name
* parent\_id
* scheduled\_publish
* sequence
* standard\_item\_types

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{id}`

Copy

* attachment\_types\_enabled
* background\_check\_permissions
* comment\_permissions
* custom\_item\_types
* frequency
* last\_plan\_from
* name
* parent\_id
* scheduled\_publish
* sequence
* standard\_item\_types

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/service_type#actions)

# create\_plans

HTTP Method

Endpoint

Description

POST

`/services/v2/service_types/{service_type_id}/create_plans`

Copy

Create multiple plans

Details:

This action provides the abillity to create multiple plans with a single API request.

Accepted attributes:

* `count` (Integer) The number of plans to create. (max 12, default 1)
* `copy_items` (Boolean) Copy Items from another plan. (default false)
* `copy_people` (Boolean) Copy People from another plan. (default false)
* `team_ids` (Array[Integer]) IDs of teams to copy people from when `copy_people` is set to true.
  If nil, `copy_people` copies from all teams. (default nil)
* `copy_notes` (Boolean) Copy Notes from another plan. (default false)
* `as_template` (Boolean) Create the new plans as templates (default false)
* `base_date` (ISO 8601 Date) The date from which to start building the plans. (default false)

Accepted Relationships

* `plan` (optional) The plan from which to copy times, items, people, and notes
* `template` (optional) Collection of templates from which to copy items, people, and notes (not times) for each new plan.
  Order dependant. Takes precedence over `plan`.

Permissions:

Must be authenticated

[# Associations](#/apps/services/2018-11-01/vertices/service_type#associations)

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/attachments`

Copy

[Attachment](attachment.md)

# item\_note\_categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/item_note_categories`

Copy

[ItemNoteCategory](item_note_category.md)

# layouts

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/layouts`

Copy

[Layout](layout.md)

# live\_controllers

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/live_controllers`

Copy

[LiveController](live_controller.md)

# plan\_note\_categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_note_categories`

Copy

[PlanNoteCategory](plan_note_category.md)

# plan\_templates

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_templates`

Copy

[PlanTemplate](plan_template.md)

# plan\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plan_times`

Copy

[PlanTime](plan_time.md)

* `future`
* `named`
* `past`

# plans

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans`

Copy

[Plan](plan.md)

* `after` — filter to plans with a time beginning after the `after` parameter
* `before` — filter to plans with a time beginning before the `before` parameter
* `future`
* `no_dates`
* `past`

# public\_view

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/public_view`

Copy

[PublicView](public_view.md)

# team\_positions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/team_positions`

Copy

[TeamPosition](team_position.md)

# teams

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/teams`

Copy

[Team](team.md)

# time\_preference\_options

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/time_preference_options`

Copy

[TimePreferenceOption](time_preference_option.md)

# unscoped\_plans

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/unscoped_plans`

Copy

[Plan](plan.md)

* `deleted`

[# Belongs To](#/apps/services/2018-11-01/vertices/service_type#belongs-to)

# Folder

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/folders/{folder_id}/service_types`

Copy

[Folder](folder.md)

# Live

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/service_type`

Copy

[Live](live.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types`

Copy

[Organization](organization.md)

* `no_parent`

# Team

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/teams/{team_id}/service_types`

Copy

[Team](team.md)