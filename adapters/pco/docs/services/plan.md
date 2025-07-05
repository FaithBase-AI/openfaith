Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](plan.md)

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

# Plan

A single plan within a Service Type.

[# Example Request](#/apps/services/2018-11-01/vertices/plan#example-request)

```
curl https://api.planningcenteronline.com/services/v2/service_types/{service_type_id}/plans
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/services/v2/service_types/{service_type_id}/plans)

[# Example Object](#/apps/services/2018-11-01/vertices/plan#example-object)

```
{
  "type": "Plan",
  "id": "1",
  "attributes": {
    "can_view_order": true,
    "prefers_order_view": true,
    "rehearsable": true,
    "items_count": 1,
    "permissions": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "title": "string",
    "updated_at": "2000-01-01T12:00:00Z",
    "public": true,
    "series_title": "string",
    "plan_notes_count": 1,
    "other_time_count": 1,
    "rehearsal_time_count": 1,
    "service_time_count": 1,
    "plan_people_count": 1,
    "needed_positions_count": 1,
    "total_length": 1,
    "multi_day": true,
    "files_expire_at": "2000-01-01T12:00:00Z",
    "sort_date": "2000-01-01T12:00:00Z",
    "last_time_at": "2000-01-01T12:00:00Z",
    "dates": "string",
    "short_dates": "string",
    "planning_center_url": "string",
    "reminders_disabled": true
  },
  "relationships": {
    "service_type": {
      "data": {
        "type": "ServiceType",
        "id": "1"
      }
    },
    "previous_plan": {
      "data": {
        "type": "Plan",
        "id": "1"
      }
    },
    "next_plan": {
      "data": {
        "type": "Plan",
        "id": "1"
      }
    },
    "series": {
      "data": {
        "type": "Series",
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
    },
    "linked_publishing_episode": {
      "data": {
        "type": "LinkedPublishingEpisode",
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
    }
  }
}
```

[# Attributes](#/apps/services/2018-11-01/vertices/plan#attributes)

Name

Type

Description

`id`

`primary_key`

`can_view_order`

`boolean`

`prefers_order_view`

`boolean`

`rehearsable`

`boolean`

`items_count`

`integer`

The total number of items, including regular items, songs, media, and headers, that the current user can see in the plan.

`permissions`

`string`

The current user's permissions for this plan's Service Type.

`created_at`

`date_time`

`title`

`string`

`updated_at`

`date_time`

`public`

`boolean`

True if Public Access has been enabled.

`series_title`

`string`

`plan_notes_count`

`integer`

`other_time_count`

`integer`

`rehearsal_time_count`

`integer`

`service_time_count`

`integer`

`plan_people_count`

`integer`

`needed_positions_count`

`integer`

`total_length`

`integer`

The total of length of all items, excluding pre-service and post-service items.

`multi_day`

`boolean`

`files_expire_at`

`date_time`

A date 15 days after the last service time.

Returns in the time zone specified in your organization's localization settings

`sort_date`

`date_time`

A time representing the chronological first Service Time, used to sort plan chronologically. If no Service Times exist, it uses Rehearsal Times, then Other Times, then NOW.

Returns in the time zone specified in your organization's localization settings

`last_time_at`

`date_time`

Returns in the time zone specified in your organization's localization settings

`dates`

`string`

The full date string representing all Service Time dates.

`short_dates`

`string`

The shortened date string representing all Service Time dates. Months are abbreviated, and the year is omitted.

`planning_center_url`

`string`

`reminders_disabled`

`boolean`

[# Relationships](#/apps/services/2018-11-01/vertices/plan#relationships)

Name

Type

Association Type

Note

service\_type

ServiceType

to\_one

previous\_plan

Plan

to\_one

next\_plan

Plan

to\_one

series

Series

to\_one

created\_by

Person

to\_one

updated\_by

Person

to\_one

linked\_publishing\_episode

LinkedPublishingEpisode

to\_one

attachment\_types

AttachmentType

to\_many

[# URL Parameters](#/apps/services/2018-11-01/vertices/plan#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

contributors

include associated contributors

include

my\_schedules

include associated my\_schedules

include

plan\_times

include associated plan\_times

include

series

include associated series

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

sort\_date

string

prefix with a hyphen (-sort\_date) to reverse the order

order

title

string

prefix with a hyphen (-title) to reverse the order

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

id

where[id]

primary\_key

Query on a specific id

`?where[id]=primary_key`

series\_title

where[series\_title]

string

Query on a specific series\_title

`?where[series_title]=string`

title

where[title]

string

Query on a specific title

`?where[title]=string`

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

[# Endpoints](#/apps/services/2018-11-01/vertices/plan#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plans`

Copy

# Reading

HTTP Method

Endpoint

GET

`/services/v2/service_types/{service_type_id}/plans/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/services/v2/service_types/{service_type_id}/plans`

Copy

* title
* public
* series\_id
* series\_title

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/services/v2/service_types/{service_type_id}/plans/{id}`

Copy

* title
* public
* series\_id
* series\_title
* reminders\_disabled

# Deleting

HTTP Method

Endpoint

DELETE

`/services/v2/service_types/{service_type_id}/plans/{id}`

Copy

[# Actions](#/apps/services/2018-11-01/vertices/plan#actions)

# autoschedule

HTTP Method

Endpoint

Description

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/autoschedule`

Copy

Auto-schedule for a team. Returns a collection of scheduled `PlanPersonAutoscheduleVertex`

Details:

Auto-schedule for a team. Returns a collection of scheduled `PlanPersonAutoscheduleVertex`.

It expects a `POST` body with a `Team` relationship.

```


```
{
  "data": {
    "type": "Autoschedule",
    "attributes": {},
    "relationship": {
      "team": {
        "data": {
          "id": 1,
          "type": 'Team'
        }
      }
    }
  }
}

```


```

Permissions:

Must be authenticated

# import\_template Deprecated

HTTP Method

Endpoint

Description

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/import_template`

Copy

Import template to plan

Details:

This action allows the importing of a template into a plan.

Accepted attributes:

* `plan_id` (Integer) ID of template to copying from
* `copy_items` (Boolean) Copy Items from another plan. (default false)
* `copy_people` (Boolean) Copy People from another plan. (default false)
* `copy_notes` (Boolean) Copy Notes from another plan. (default false)

Permissions:

Must be authenticated

# item\_reorder

HTTP Method

Endpoint

Description

POST

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/item_reorder`

Copy

Reorder plan items in one request.

Details:

This can be used to reorder all items in a plan in one request.

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

[# Associations](#/apps/services/2018-11-01/vertices/plan#associations)

# all\_attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/all_attachments`

Copy

[Attachment](attachment.md)

* `attachable_type` — filter attachments by their attachable\_type as specified in the `attachable_type` parameter.
  Default: `["ServiceType", "Plan", "Item", "Media", "Song", "Arrangement", "Key"]`.
  e.g. `?filter=attachable_type&attachable_type=Plan,ServiceType`
* `extensions` — filter to attachments with a file extension specified in the `extensions` parameter.
  e.g. `?filter=extensions&extensions=pdf,txt`

# attachments

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/attachments`

Copy

[Attachment](attachment.md)

# attendances

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/attendances`

Copy

[Attendance](attendance.md)

# contributors

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/contributors`

Copy

[Contributor](contributor.md)

# items

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/items`

Copy

[Item](item.md)

# live

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/live`

Copy

[Live](live.md)

# my\_schedules

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/my_schedules`

Copy

[Schedule](schedule.md)

# needed\_positions

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/needed_positions`

Copy

[NeededPosition](needed_position.md)

# next\_plan

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/next_plan`

Copy

[Plan](plan.md)

# notes

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/notes`

Copy

[PlanNote](plan_note.md)

* `team`

# plan\_times

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/plan_times`

Copy

[PlanTime](plan_time.md)

# previous\_plan

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/previous_plan`

Copy

[Plan](plan.md)

# series

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/series`

Copy

[Series](series.md)

# signup\_teams

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/signup_teams`

Copy

[Team](team.md)

# team\_members

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/team_members`

Copy

[PlanPerson](plan_person.md)

* `confirmed`
* `not_archived`
* `not_declined`
* `not_deleted`

[# Belongs To](#/apps/services/2018-11-01/vertices/plan#belongs-to)

# Live

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans/{plan_id}/live/{live_id}/watchable_plans`

Copy

[Live](live.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/next_plan`

Copy

[Plan](plan.md)

# PlanPerson

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/people/{person_id}/plan_people/{plan_person_id}/plan`

Copy

[PlanPerson](plan_person.md)

# Plan

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans/{plan_id}/previous_plan`

Copy

[Plan](plan.md)

# Series

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/series/{series_id}/plans`

Copy

[Series](series.md)

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/plans`

Copy

[ServiceType](service_type.md)

* `after` — filter to plans with a time beginning after the `after` parameter
* `before` — filter to plans with a time beginning before the `before` parameter
* `future`
* `no_dates`
* `past`

# ServiceType

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/services/v2/service_types/{service_type_id}/unscoped_plans`

Copy

[ServiceType](service_type.md)

* `deleted`