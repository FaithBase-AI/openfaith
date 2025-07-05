Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](index.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)

2023-07-10

Info

[Attendance](vertices/attendance.md)

[Campus](vertices/campus.md)

[Enrollment](vertices/enrollment.md)

[Event](vertices/event.md)

[EventNote](vertices/event_note.md)

[Group](vertices/group.md)

[GroupApplication](vertices/group_application.md)

[GroupType](vertices/group_type.md)

[Location](vertices/location.md)

[Membership](vertices/membership.md)

[Organization](vertices/organization.md)

[Owner](vertices/owner.md)

[Person](vertices/person.md)

[Resource](vertices/resource.md)

[Tag](vertices/tag.md)

[TagGroup](vertices/tag_group.md)

[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# 2023-07-10

Removed attributes from `Membership` related to separate resources.

Moved enrollment attributes from `Group` into `Enrollment` resource.

# Changes

Type

Changes to

Notes

breaking

`membership`

Removed person attributes. Use the `Person` association for those attributes.

breaking

`membership`

Removed color identifier. Use the `color` attribute on `GroupType` instead.

breaking

`group`

Removed enrollment attributes. Use the `Enrollment` association for those details.