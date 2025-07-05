Planning Center API DocumentationYou need to enable JavaScript to run this app.

Menu

[Overview](#/overview/)

[Reference](donation.md)

[My Developer Account](https://api.planningcenteronline.com/oauth/applications)

OverviewReference

Close

[API](#/apps/api)[Calendar](#/apps/calendar)[Check-Ins](#/apps/check-ins)[Giving](#/apps/giving)

2019-10-18

Info

[Batch](batch.md)

[BatchGroup](batch_group.md)

[Campus](campus.md)

[Designation](designation.md)

[DesignationRefund](designation_refund.md)

[Donation](donation.md)

[Fund](fund.md)

[InKindDonation](in_kind_donation.md)

[Label](label.md)

[Note](note.md)

[Organization](organization.md)

[PaymentMethod](payment_method.md)

[PaymentSource](payment_source.md)

[Person](person.md)

[Pledge](pledge.md)

[PledgeCampaign](pledge_campaign.md)

[RecurringDonation](recurring_donation.md)

[RecurringDonationDesignation](recurring_donation_designation.md)

[Refund](refund.md)

[Groups](#/apps/groups)[People](#/apps/people)[Publishing](#/apps/publishing)[Registrations](#/apps/registrations)[Services](#/apps/services)[Webhooks](#/apps/webhooks)

# Donation

A `Donation` record corresponds to a gift given to an `Organization` at a particular point in time.

`Donation`s are added by first associating them to a `Batch` of donations, and then committing the `Batch`. When adding a `Donation` to an already-committed `Batch`, the `Donation` will automatically be committed as well, and immediately added to the donor's online history.

[# Example Request](#/apps/giving/2019-10-18/vertices/donation#example-request)

```
curl https://api.planningcenteronline.com/giving/v2/donations
```

[View in API Explorer](https://api.planningcenteronline.com/explorer/giving/v2/donations)

[# Example Object](#/apps/giving/2019-10-18/vertices/donation#example-object)

```
{
  "type": "Donation",
  "id": "1",
  "attributes": {
    "created_at": "2000-01-01T12:00:00Z",
    "updated_at": "2000-01-01T12:00:00Z",
    "payment_method_sub": "value",
    "payment_last4": "string",
    "payment_brand": "string",
    "payment_check_number": 1,
    "payment_check_dated_at": "2000-01-01",
    "fee_cents": 1,
    "payment_method": "value",
    "received_at": "2000-01-01T12:00:00Z",
    "amount_cents": 1,
    "payment_status": "value",
    "completed_at": "2000-01-01T12:00:00Z",
    "fee_covered": true,
    "amount_currency": "USD",
    "fee_currency": "USD",
    "refunded": true,
    "refundable": true
  },
  "relationships": {
    "batch": {
      "data": {
        "type": "Batch",
        "id": "1"
      }
    },
    "campus": {
      "data": {
        "type": "Campus",
        "id": "1"
      }
    },
    "person": {
      "data": {
        "type": "Person",
        "id": "1"
      }
    },
    "payment_source": {
      "data": {
        "type": "PaymentSource",
        "id": "1"
      }
    },
    "labels": {
      "data": [
        {
          "type": "Labels",
          "id": "1"
        }
      ]
    },
    "recurring_donation": {
      "data": {
        "type": "RecurringDonation",
        "id": "1"
      }
    }
  }
}
```

[# Attributes](#/apps/giving/2019-10-18/vertices/donation#attributes)

Name

Type

Description

`id`

`primary_key`

The unique identifier for a donation.

`created_at`

`date_time`

The date and time at which a donation was created. Example: `2000-01-01T12:00:00Z`

`updated_at`

`date_time`

The date and time at which a donation was last updated. Example: `2000-01-01T12:00:00Z`

`payment_method_sub`

`string`

For cards, this will be the card subtype. Will be `null` for other payment method types.

Possible values: `credit`, `debit`, `prepaid`, or `unknown`

`payment_last4`

`string`

The last 4 digits of a donation's payment method number. For cards, this is the last 4 digits of the card number. For bank accounts, this is the last 4 digits of the bank account number. For cash and check donations, this should be `null`. Note: In cases where we don't have all 4 digits on file, a `*` will be used to pad the number. For example: `*321`

`payment_brand`

`string`

For cards, this is the card brand (eg Visa, Mastercard, etc). For checks and bank accounts, this is the bank name. For cash donations, this should be `null`.

`payment_check_number`

`integer`

The check number for donations made by check.

`payment_check_dated_at`

`date`

The check date for donations made by check. Example: `2000-01-01`

`fee_cents`

`integer`

The fee to process a donation. This should either be 0 or a negative integer. For a donation processed by Giving via Stripe, this is the amount the associated organization paid Stripe to process it. For donations not processed by Stripe, this can be used to record fees from other systems. Note: while `amount_cents` is assigned via a donation's designations, `fee_cents` is set here, and used by Giving to distribute fees across all designations in proportion to the amount of each designation.

`payment_method`

`string`

Required. The payment method used to make a donation.

Possible values: `ach`, `cash`, `check`, or `card`

`received_at`

`date_time`

The date and time at which a donation was received. For card and ACH donations processed by Stripe, this is the moment when the donation was created in Giving. For batch donations, this is a customizable value that can be set via the Giving UI or API to any date. This allows for batch donations recieved on a previous day to be dated in the past, as well as for postdated checks to have a date in the future. It is important to ensure that this attribute is set accurately, as this is the date used to filter donations in the Giving admin UI. When creating new donations via the API, this attribute will default to the current date and time. Example: `2000-01-01T12:00:00Z`

`amount_cents`

`integer`

The number of cents being donated. Derived from the total of all of a donation's associated designation's `amount_cents` values.

`payment_status`

`string`

For Stripe donations, this is the payment status. For batch donations, `pending` means that the donation has not yet been committed, whereas `succeeded` refers to a committed donation.

Possible values: `pending`, `succeeded`, or `failed`

`completed_at`

`date_time`

The date and time at which a donation was completely processed. For card and ACH donations processed by Stripe, this is the moment when the donation was marked as fully processed by Stripe. For committed batch donations, this is the moment that the batch was committed. For uncommitted batch donations, this should return `null`. Example: `2000-01-01T12:00:00Z`

`fee_covered`

`boolean`

A boolean indicating whether the donor chose to cover the Stripe processing fee for this donation.Note that `fee_covered` can only be true for donations processed through Stripe.

`amount_currency`

`currency_abbreviation`

The currency of `amount_cents`. Based on the organization's currency.

`fee_currency`

`currency_abbreviation`

The currency of `fee_cents`. Based on the organization's currency.

`refunded`

`boolean`

Returns `true` if a donation has been refunded, or `false` if it hasn't.

`refundable`

`boolean`

A boolean indicating whether this donation can be refunded via the API. Note that for some donations, this may be false, even though the donation

can

be refunded in the UI.

[# Relationships](#/apps/giving/2019-10-18/vertices/donation#relationships)

Name

Type

Association Type

Note

batch

Batch

to\_one

campus

Campus

to\_one

`Campus` is automatically assigned based on the donor's primary campus. If you pass an explicit value (a relationship reference or `null`), it will override the default.

person

Person

to\_one

`Person` is

not

required. If it is not present, the donation will show up in the web interface as having an "Anonymous Donor," and the `person` relationship in the API will be `null`.

payment\_source

PaymentSource

to\_one

`PaymentSource` is required, but cannot be `planning_center`, as that is reserved for Donations created in the Planning Center Giving Web UI.

labels

Labels

to\_many

recurring\_donation

RecurringDonation

to\_one

[# URL Parameters](#/apps/giving/2019-10-18/vertices/donation#url-parameters)

# Can Include

Parameter

Value

Description

Assignable

include

designations

include associated designations

create and update

include

labels

include associated labels

create and update

include

note

include associated note

include

refund

include associated refund

# Order By

Parameter

Value

Type

Description

order

completed\_at

string

prefix with a hyphen (-completed\_at) to reverse the order

order

created\_at

string

prefix with a hyphen (-created\_at) to reverse the order

order

received\_at

string

prefix with a hyphen (-received\_at) to reverse the order

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

completed\_at

where[completed\_at]

date\_time

Query on a specific completed\_at

`?where[completed_at]=2000-01-01T12:00:00Z`

created\_at

where[created\_at]

date\_time

Query on a specific created\_at

`?where[created_at]=2000-01-01T12:00:00Z`

payment\_method

where[payment\_method]

string

Query on a specific payment\_method

Possible values: `ach`, `cash`, `check`, or `card`

`?where[payment_method]=value`

received\_at

where[received\_at]

date\_time

Query on a specific received\_at

`?where[received_at]=2000-01-01T12:00:00Z`

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

[# Endpoints](#/apps/giving/2019-10-18/vertices/donation#endpoints)

# Listing

HTTP Method

Endpoint

GET

`/giving/v2/donations`

Copy

# Reading

HTTP Method

Endpoint

GET

`/giving/v2/donations/{id}`

Copy

# Creating

HTTP Method

Endpoint

Assignable Attributes

POST

`/giving/v2/batches/{batch_id}/donations`

Copy

* payment\_method\_sub
* payment\_last4
* payment\_brand
* payment\_check\_number
* payment\_check\_dated\_at
* fee\_cents
* payment\_method
* received\_at
* person\_id
* payment\_source\_id
* campus\_id

Notes:

A full json example of creating a Donation

```


```
{
  "data": {
    "type": "Donation",
    "attributes": {
      "payment_method": "cash",
      "received_at": "2017-10-10"
    },
    "relationships": {
      "person": {
        "data": { "type": "Person", "id": "123" }
      },
      "payment_source": {
        "data": { "type": "PaymentSource", "id": "123" }
      },
      "labels": {
        "data": [
          { "type": "Label", "id": "123" }
        ]
      }
    }
  },
  "included": [
    {
      "type": "Designation",
      "attributes": { "amount_cents": 2000 },
      "relationships": {
        "fund": {
          "data": { "type": "Fund", "id": "123" }
        }
      }
    }
  ]
}

```


```

When creating a Donation, you

must

include at least one Designation,
and each Designation

must

have `amount_cents` and a Fund relationship

# Updating

HTTP Method

Endpoint

Assignable Attributes

PATCH

`/giving/v2/donations/{id}`

Copy

* payment\_method\_sub
* payment\_last4
* payment\_brand
* payment\_check\_number
* payment\_check\_dated\_at
* fee\_cents
* payment\_method
* received\_at
* person\_id
* payment\_source\_id
* campus\_id

Notes:

##### Designations

When updating a Donation, if you specify an `id` attribute for each Designation,
those Designations can be updated.

However, if you have Designations in the `included` array

without

`id`s,
all Designations will be removed and replaced with the Designations in your `PATCH`
request.

##### Labels

Passing a `labels` key in the `relationships` object will have the effect of replacing
any existing associated `Label`s with those in the request. Including a `null` or empty
`{}` value will remove all `Label` relationships, but omitting the `labels` key
altogether will leave existing relationships in tact.

# Deleting

HTTP Method

Endpoint

DELETE

`/giving/v2/donations/{id}`

Copy

[# Actions](#/apps/giving/2019-10-18/vertices/donation#actions)

# issue\_refund

HTTP Method

Endpoint

Description

POST

`/giving/v2/donations/{donation_id}/issue_refund`

Copy

Used to refund a batch donation

Details:

This action refunds a batch donation.
It will respond with `unprocessable_entity` if the donation cannot be refunded, or if the donation is not part of a batch.

`refunded_at` is optional, but recommended for data accuracy.

```


```
{
  "data": {
    "attributes": {
      "refunded_at": "1959-02-03"
    }
  }
}

```


```

Permissions:

Must be authenticated

[# Associations](#/apps/giving/2019-10-18/vertices/donation#associations)

# campus

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/campus`

Copy

[Campus](campus.md)

# designations

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/designations`

Copy

[Designation](designation.md)

# labels

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/labels`

Copy

[Label](label.md)

# note

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/note`

Copy

[Note](note.md)

# refund

HTTP Method

Endpoint

Returns

Details

Filter By

GET

`/giving/v2/donations/{donation_id}/refund`

Copy

[Refund](refund.md)

[# Belongs To](#/apps/giving/2019-10-18/vertices/donation#belongs-to)

# Batch

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/batches/{batch_id}/donations`

Copy

[Batch](batch.md)

# Campus

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/campuses/{campus_id}/donations`

Copy

[Campus](campus.md)

# Organization

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/donations`

Copy

[Organization](organization.md)

* `succeeded`

# PaymentSource

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/payment_sources/{payment_source_id}/donations`

Copy

[PaymentSource](payment_source.md)

# Person

HTTP Method

Endpoint

Association

Details

Filter By

GET

`/giving/v2/people/{person_id}/donations`

Copy

[Person](person.md)