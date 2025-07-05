Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](organization.md)

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

# Organization

The root level `Organization` record which serves as a link to `Signup`s.

[# Example Request](#/apps/registrations/2025-05-01/vertices/organization#example-request)

```
curl https://api.planningcenteronline.com/registrations/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/registrations/v2)

[# Example Object](#/apps/registrations/2025-05-01/vertices/organization#example-object)

```
{
  "type": "Organization",
  "id": "1",
  "attributes": {
    "name": "string",
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/registrations/2025-05-01/vertices/organization#attributes)

Name

Type

Description

`id`

`primary_key`

`name`

`string`

Name of the Organization.

`created_at`

`date_time`

`updated_at`

`date_time`

[# URL Parameters](#/apps/registrations/2025-05-01/vertices/organization#url-parameters)

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

[# Endpoints](#/apps/registrations/2025-05-01/vertices/organization#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/registrations/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/registrations/v2/{id}`

Copy

[# Associations](#/apps/registrations/2025-05-01/vertices/organization#associations)

# campuses

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/campuses`

Copy

[Campus](campus.md)

# categories

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/categories`

Copy

[Category](category.md)

# signups

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/registrations/v2/signups`

Copy

[Signup](signup.md)

* `archived`
* `unarchived`