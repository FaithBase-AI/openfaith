Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](emergency_contact.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)

2025-05-01

Info

[Attendee](attendee.md)

[Campus](campus.md)

[Category](category.md)

[EmergencyContact](emergency_contact.md)

[Organization](organization.md)

[Person](person.md)

[Registration](registration.md)

[SelectionType](selection_type.md)

[Signup](signup.md)

[SignupLocation](signup_location.md)

[SignupTime](signup_time.md)

[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# EmergencyContact

`Emergency_Contact` is the person assigned as the emergency contact for an attendee.

[# Example Request](#/apps/registrations/2025-05-01/vertices/emergency_contact#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/emergency_contact
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/emergency_contact)

[# Example Object](#/apps/registrations/2025-05-01/vertices/emergency_contact#example-object)

```
{
  "type": "EmergencyContact",
  "id": "1",
  "attributes": {
    "name": "string",
    "phone_number": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/emergency_contact#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

`phone_number`

`string`

Phone number of the emergency contact person.

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/emergency_contact#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/emergency_contact#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/emergency_contact`

Copy

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/emergency_contact/{id}`

Copy

[# Belongs To](#/apps/registrations/2025-05-01/vertices/emergency_contact#belongs-to)

# Attendee

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/registrations/v2/signups/{signup_id}/attendees/{attendee_id}/emergency_contact`

Copy

[Attendee](attendee.md)