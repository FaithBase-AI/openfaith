Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](person.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)

2019-02-13

Info

[ConnectedApplication](connected_application.md)

[ConnectedApplicationPerson](connected_application_person.md)

[OauthApplication](oauth_application.md)

[OauthApplicationMau](oauth_application_mau.md)

[Organization](organization.md)

[Person](person.md)

[PersonalAccessToken](personal_access_token.md)

[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Person

[# Example Request](#/apps/api/2019-02-13/vertices/person#example-request)

```
curl https://api.planningcenteronline.com/api/v2
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/api/v2)

[# Example Object](#/apps/api/2019-02-13/vertices/person#example-object)

```
{
  "type": "Person",
  "id": "1",
  "attributes": {
    "first_name": "string",
    "last_name": "string"
  },
  "relationships": {}
}
```

[# Attributes](#/apps/api/2019-02-13/vertices/person#attributes)

Name

Type

Description

`id`

`primary_key`

`first_name`

`string`

`last_name`

`string`

[# URL Parameters](#/apps/api/2019-02-13/vertices/person#url-parameters)

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

[# Endpoints](#/apps/api/2019-02-13/vertices/person#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/api/v2`

Copy

# Reading

HTTP Method

Endpoint

GET

`/api/v2/{id}`

Copy